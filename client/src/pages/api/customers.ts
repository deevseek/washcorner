import type { NextApiRequest, NextApiResponse } from "next";
import mysql from "mysql2/promise";

const db = {
  host: "localhost",
  user: "root",
  password: "", // ganti kalau pakai password
  database: "wash_corner",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const conn = await mysql.createConnection(db);

  if (req.method === "GET") {
    const [rows] = await conn.execute(
      "SELECT * FROM customers ORDER BY id DESC"
    );

    const data = (rows as any[]).map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      vehicleType: c.vehicle_type, // ✅ kendaraan
      vehicleBrand: c.vehicle_brand, // ✅ merek
      vehicleModel: c.vehicle_model, // ✅ model
      licensePlate: c.license_plate, // ✅ plat nomor
      createdAt: c.created_at ? new Date(c.created_at).toISOString() : null,
    }));

    await conn.end();
    return res.status(200).json(data);
  }

  await conn.end();
  return res.status(405).json({ message: "Method Not Allowed" });
}
