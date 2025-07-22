// pages/api/services.ts
import type { NextApiRequest, NextApiResponse } from "next";
import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  vehicle_type: string;
  is_popular: boolean;
  is_active: boolean;
  image_url: string | null;
  warranty: string | null;
  created_at?: Date;
  updated_at?: Date;
}

const db = {
  host: "localhost",
  user: "root",
  password: "",
  database: "wash_corner",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const conn = await mysql.createConnection(db);

    if (req.method === "GET") {
      const [rows] = await conn.execute<RowDataPacket[]>(
        "SELECT * FROM services ORDER BY id DESC"
      );
      await conn.end();
      return res.status(200).json(rows as Service[]);
    }

    if (req.method === "POST") {
      const {
        name,
        description,
        price,
        duration,
        vehicleType,
        isPopular,
        isActive,
        imageUrl,
        warranty,
      } = req.body;

      const [result] = await conn.execute<ResultSetHeader>(
        `INSERT INTO services
          (name, description, price, duration, vehicle_type, is_popular, is_active, image_url, warranty)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          description,
          price,
          duration,
          vehicleType,
          isPopular,
          isActive,
          imageUrl,
          warranty,
        ]
      );

      await conn.end();
      return res.status(201).json({ id: result.insertId });
    }

    await conn.end();
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
