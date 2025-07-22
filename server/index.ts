import "dotenv/config"; // Pastikan environment variables dimuat
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabaseConnection } from "./db"; // Pastikan path ini benar dan fungsi ini melakukan koneksi DB

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware logging Anda (ini sudah bagus)
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (this: Response, body?: any) {
    // Definisikan 'this' dan body opsional
    capturedJsonResponse = body;
    return originalResJson.call(this, body); // Gunakan .call dengan konteks 'this' dan satu argumen 'body'
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        // Batasi panjang JSON yang di-log agar tidak terlalu besar
        const jsonResponseString = JSON.stringify(capturedJsonResponse);
        const maxJsonLength = 200; // Sesuaikan batas panjang JSON
        logLine += ` :: ${
          jsonResponseString.length > maxJsonLength
            ? jsonResponseString.substring(0, maxJsonLength - 1) + "…"
            : jsonResponseString
        }`;
      }

      // Logika pembatasan panjang logLine sudah ada, tapi pastikan efektif
      if (logLine.length > 300) {
        // Sesuaikan total panjang log maksimal
        logLine = logLine.slice(0, 299) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// Fungsi utama async untuk memulai server
async function startServer() {
  try {
    console.log("🚀 Server starting...");

    // 1. INISIALISASI KONEKSI DATABASE TERLEBIH DAHULU
    console.log("🔄 Initializing database connection...");
    await initializeDatabaseConnection(); // Tunggu sampai koneksi database dan instance 'db' Drizzle siap
    console.log("✅ Database connection established and ready.");

    // 2. SETELAH DATABASE SIAP, BARU REGISTER ROUTES (yang akan menjalankan inisialisasi role/permission)
    console.log(
      "🔄 Registering application routes (this will initialize roles, permissions, and default users)..."
    );
    const server = await registerRoutes(app);
    console.log(
      "✅ Application routes, roles, permissions, and default users initialized."
    );

    // Middleware error handling Express (sebaiknya diletakkan setelah semua rute biasa)
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error("❌ Server-level Error Caught by Express Middleware:", {
        status,
        message,
        path: _req.path,
        method: _req.method,
        // Anda bisa menambahkan err.stack di sini jika ingin detail lebih lanjut,
        // tapi hati-hati jangan sampai terekspos ke klien di produksi.
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });

      // Hanya kirim pesan error umum ke klien untuk keamanan
      res.status(status).json({
        message: "An unexpected error occurred. Please try again later.",
      });
    });

    // Setup Vite atau serve static files (setelah semua rute API dan error handler)
    if (app.get("env") === "development") {
      console.log("🔧 Setting up Vite for development...");
      await setupVite(app, server);
      console.log("✅ Vite setup complete.");
    } else {
      console.log("Serving static files for production...");
      serveStatic(app);
      console.log("✅ Static files served.");
    }

    const port = process.env.PORT || 5000; // Ambil port dari env variable atau default ke 5000
    server.listen(
      {
        port: Number(port), // Pastikan port adalah angka
        host: "0.0.0.0",
        // reusePort: true, // Sebaiknya dihindari kecuali Anda tahu persis dampaknya
      },
      () => {
        log(`🚀 Server is majestically soaring on port ${port}`);
        log(`👉 API available at http://localhost:${port}/api`);
        // Tambahkan URL frontend jika berbeda
        if (app.get("env") === "development") {
          log(
            `🔗 Vite HMR client likely at http://localhost:${port} (proxied) or your Vite dev port (e.g., 5173)`
          );
        }
      }
    );
  } catch (error) {
    console.error("❌❌❌ FATAL ERROR: Failed to start server:", error);
    process.exit(1); // Keluar dari proses jika ada error fatal saat startup
  }
}

// Panggil fungsi untuk memulai server
startServer();
