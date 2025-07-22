// pages/api/role-permissions/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "@/lib/db";
import { rolePermissions } from "@shared/schema-mysql";
import { eq } from "drizzle-orm";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = await getDb();
  const roleId = Number(req.query.id);

  if (isNaN(roleId))
    return res.status(400).json({ message: "Invalid role ID" });

  try {
    if (req.method === "GET") {
      const result = await db
        .select()
        .from(rolePermissions)
        .where(eq(rolePermissions.roleId, roleId));
      return res.status(200).json(result);
    }

    return res
      .status(405)
      .json({ message: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
