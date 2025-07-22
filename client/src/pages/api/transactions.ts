import type { NextApiRequest, NextApiResponse } from "next";
import mysql from "mysql2/promise";

// Konfigurasi koneksi database
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "", // sesuaikan jika ada password
  database: "wash_corner",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Ambil semua transaksi
    const [transactions] = await connection.execute<any[]>(
      `SELECT * FROM transactions ORDER BY id DESC`
    );

    // Untuk setiap transaksi, ambil data customer dan item
    const enrichedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        // Ambil data customer
        const [customerRows] = await connection.execute<any[]>(
          `SELECT id, name, phone, email, vehicle_type, vehicle_brand, vehicle_model, license_plate FROM customers WHERE id = ?`,
          [transaction.customer_id]
        );

        const customer = customerRows[0] || null;

        // Gabungkan detail kendaraan ke dalam satu string (optional)
        const customerData = customer
          ? {
              ...customer,
              vehicleDetails: `${customer.vehicle_brand ?? ""} ${
                customer.vehicle_model ?? ""
              }`.trim(),
            }
          : null;

        // Ambil item layanan dalam transaksi
        const [itemRows] = await connection.execute<any[]>(
          `SELECT ti.*, s.name AS serviceName, s.vehicle_type AS vehicleType
           FROM transaction_items ti
           LEFT JOIN services s ON ti.service_id = s.id
           WHERE ti.transaction_id = ?`,
          [transaction.id]
        );

        return {
          id: transaction.id,
          customerId: transaction.customer_id,
          employeeId: transaction.employee_id,
          date: transaction.date,
          total: transaction.total,
          paymentMethod: transaction.payment_method,
          status: transaction.status,
          notes: transaction.notes,
          customer: customerData,
          items: itemRows.map((item) => ({
            id: item.id,
            transactionId: item.transaction_id,
            serviceId: item.service_id,
            serviceName: item.serviceName,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount,
          })),
        };
      })
    );

    await connection.end();
    res.status(200).json(enrichedTransactions);
  } catch (error: any) {
    console.error("Error loading transactions:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
}
