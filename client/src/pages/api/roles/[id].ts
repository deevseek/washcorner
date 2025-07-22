import type { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "@/lib/db";
import { roles } from "@shared/schema-mysql";
import { eq } from "drizzle-orm";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = await getDb();
  const id = Number(req.query.id);

  if (isNaN(id)) return res.status(400).json({ message: "Invalid role ID" });

  try {
    if (req.method === "PUT") {
      const { name, description } = req.body;

      await db.update(roles).set({ name, description }).where(eq(roles.id, id));

      const [updatedRole] = await db
        .select()
        .from(roles)
        .where(eq(roles.id, id));

      if (!updatedRole) {
        return res.status(404).json({ message: "Role not found" });
      }

      return res.status(200).json(updatedRole);
    }

    if (req.method === "DELETE") {
      await db.delete(roles).where(eq(roles.id, id));
      return res.status(204).end();
    }

    return res
      .status(405)
      .json({ message: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
