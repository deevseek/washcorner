// pages/api/role-permissions/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "@/lib/db"; // Pastikan path ini benar
import {
  roles,
  permissions,
  rolePermissions,
  users,
} from "@shared/schema-mysql"; // Pastikan path ini benar
import { eq, and, inArray } from "drizzle-orm";
import { getSession } from "next-auth/react"; // Ganti dengan mekanisme sesi Anda jika bukan next-auth

// --- Placeholder untuk Fungsi Otorisasi ---
// Anda HARUS mengimplementasikan ini di file terpisah, misal /lib/auth-utils.ts
async function checkUserPermission(
  db: Awaited<ReturnType<typeof getDb>>, // Tipe db dari Drizzle
  userId: number, // ID user dari sesi
  requiredPermissionName: string
): Promise<boolean> {
  // 1. Dapatkan role_id dari user
  const userResult = await db
    .select({ roleName: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!userResult.length || !userResult[0].roleName) {
    console.warn(`User with id ${userId} not found or has no role name.`);
    return false;
  }
  const userRoleName = userResult[0].roleName;

  // 2. Dapatkan role_id dari nama role
  const roleResult = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, userRoleName))
    .limit(1);
  if (!roleResult.length) {
    console.warn(`Role with name ${userRoleName} not found.`);
    return false;
  }
  const userRoleId = roleResult[0].id;

  // 3. Dapatkan permission_id dari nama permission yang dibutuhkan
  const permResult = await db
    .select({ id: permissions.id })
    .from(permissions)
    .where(eq(permissions.name, requiredPermissionName))
    .limit(1);
  if (!permResult.length) {
    console.warn(
      `Permission ${requiredPermissionName} not found in permissions table.`
    );
    return false; // Atau throw error jika permission harus selalu ada
  }
  const requiredPermissionId = permResult[0].id;

  // 4. Cek apakah ada mapping di role_permissions
  const mapping = await db
    .select()
    .from(rolePermissions)
    .where(
      and(
        eq(rolePermissions.roleId, userRoleId),
        eq(rolePermissions.permissionId, requiredPermissionId)
      )
    )
    .limit(1);

  return mapping.length > 0;
}
// --- Akhir Placeholder Fungsi Otorisasi ---

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = await getDb();

  // --- Otorisasi ---
  const session = await getSession({ req }); // Untuk next-auth
  // Jika Anda tidak menggunakan next-auth, ganti dengan cara Anda mendapatkan user ID dari sesi/token
  // Contoh: const userId = getUserIdFromToken(req.headers.authorization);

  if (
    !session ||
    !session.user ||
    typeof (session.user as any).id !== "number"
  ) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Not logged in or user ID missing." });
  }
  const userId = (session.user as any).id as number; // Ambil user ID dari sesi

  // Ganti 'permissions.manage' dengan nama permission yang sesuai untuk aksi ini
  const canManage = await checkUserPermission(db, userId, "permissions.manage");

  if (!canManage) {
    return res
      .status(403)
      .json({ message: "Forbidden: Insufficient permissions." });
  }
  // --- Akhir Otorisasi ---

  if (req.method === "POST") {
    try {
      const { roleId, permissionIds } = req.body;

      if (typeof roleId !== "number") {
        return res
          .status(400)
          .json({ message: "Invalid roleId: must be a number." });
      }
      if (
        !Array.isArray(permissionIds) ||
        !permissionIds.every((id) => typeof id === "number")
      ) {
        return res
          .status(400)
          .json({
            message: "Invalid permissionIds: must be an array of numbers.",
          });
      }

      // Gunakan transaksi untuk memastikan konsistensi data
      await db.transaction(async (tx) => {
        // Hapus semua permission lama untuk role tersebut
        await tx
          .delete(rolePermissions)
          .where(eq(rolePermissions.roleId, roleId));

        // Masukkan permission baru jika ada yang dikirim
        if (permissionIds.length > 0) {
          // Validasi apakah semua permissionId ada di tabel permissions (Opsional tapi bagus)
          const existingPermissions = await tx
            .select({ id: permissions.id })
            .from(permissions)
            .where(inArray(permissions.id, permissionIds));
          if (existingPermissions.length !== permissionIds.length) {
            const missingIds = permissionIds.filter(
              (pid) => !existingPermissions.some((ep) => ep.id === pid)
            );
            console.error(
              "Attempt to assign non-existent permission IDs:",
              missingIds
            );
            throw new Error(
              `One or more permission IDs do not exist: ${missingIds.join(
                ", "
              )}`
            );
          }

          await tx.insert(rolePermissions).values(
            permissionIds.map((pid: number) => ({
              roleId: roleId,
              permissionId: pid,
            }))
          );
        }
      });

      return res
        .status(200)
        .json({ message: "Permissions updated successfully." });
    } catch (err: any) {
      console.error("Error in POST /api/role-permissions:", err);
      // Kirim pesan error yang lebih spesifik jika aman
      const errorMessage = err.message || "Internal server error occurred.";
      if (errorMessage.includes("permission IDs do not exist")) {
        return res.status(400).json({ message: errorMessage });
      }
      return res.status(500).json({ message: errorMessage });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed` });
  }
}
