// pages/api/permissions/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const db = await getDb(); // Pool dari mysql2/promise

    if (req.method === "GET") {
      const [rows] = await db.query("SELECT * FROM permissions");
      return res.status(200).json(rows);
    }

    return res
      .status(405)
      .json({ message: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error("Error in /api/permissions:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
