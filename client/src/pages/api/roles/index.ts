// pages/api/roles/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "@/lib/db";
import { roles } from "@shared/schema-mysql";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = await getDb();

  try {
    if (req.method === "GET") {
      const result = await db.select().from(roles);
      return res.status(200).json(result);
    }

    if (req.method === "POST") {
      const { name, description } = req.body;
      const [newRole] = await db
        .insert(roles)
        .values({ name, description })
        .$returningId();
      return res.status(201).json(newRole);
    }

    return res
      .status(405)
      .json({ message: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
