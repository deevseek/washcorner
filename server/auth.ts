// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage"; // Path ke storage.ts
import {
  User as SelectUser,
  insertUserSchema,
  Permission as SelectPermission,
} from "@shared/schema-mysql";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(
  supplied: string,
  stored: string
): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) return false; // Handle kasus stored password tidak valid
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  if (hashedBuf.length !== suppliedBuf.length) return false; // Handle kasus panjang buffer tidak sama
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "wash-corner-secret-key-default", // Ganti dengan secret yang kuat
    resave: false,
    saveUninitialized: false,
    // Pastikan storage.sessionStore adalah instance yang valid dari session store (misal, connect-pg-simple)
    // Jika storage.sessionStore adalah null atau tidak dikonfigurasi, session tidak akan persisten.
    store: storage.sessionStore, // Ini perlu diinisialisasi di storage.ts
    cookie: {
      secure: process.env.NODE_ENV === "production", // true di produksi
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 jam
      sameSite: "lax",
    },
  };

  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1); // Percayai proxy jika di belakang reverse proxy (misal Nginx, Heroku)
  }
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, {
            message: "Invalid username or password.",
          });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, (user as SelectUser).id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || null); // Kembalikan null jika user tidak ditemukan
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const parsedData = insertUserSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          message: "Invalid registration data",
          errors: parsedData.error.flatten(),
        });
      }
      const userData = parsedData.data;

      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const userToCreate = {
        username: userData.username,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role || "staff", // default role jika tidak disediakan
        password: await hashPassword(userData.password),
      };

      const user = await storage.createUser(userToCreate);
      const { password, ...userWithoutPassword } = user;

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res
        .status(500)
        .json({ message: error.message || "Error during registration" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate(
      "local",
      (err: Error | null, user: SelectUser | false | null, info: any) => {
        if (err) return next(err);
        if (!user) {
          return res
            .status(401)
            .json({ message: info?.message || "Invalid username or password" });
        }

        req.login(user, (loginErr) => {
          if (loginErr) return next(loginErr);
          const { password, ...userWithoutPassword } = user;
          res.status(200).json(userWithoutPassword);
        });
      }
    )(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((destroyErr) => {
        // Hancurkan sesi juga
        if (destroyErr) return next(destroyErr);
        res.clearCookie("connect.sid"); // Nama cookie default, sesuaikan jika berbeda
        res.status(200).json({ message: "Logged out successfully" });
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      // Tambahkan cek req.user
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  app.get("/api/current-user-permissions", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const role = await storage.getRoleByName(req.user.role);
      if (!role) {
        return res
          .status(403)
          .json({ message: `Role '${req.user.role}' not found` });
      }

      const permissions = await storage.getPermissionsByRole(role.id);

      res.json({
        user: {
          id: req.user.id,
          username: req.user.username,
          role: req.user.role,
          name: req.user.name,
        },
        permissions: permissions.map((p) => p.name), // Kirim nama permission saja, lebih ringkas
      });
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ message: "Error fetching permissions" });
    }
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

export function requireRole(roleOrRoles: string | string[]) {
  const targetRoles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];

  return (req: Request, res: Response, next: NextFunction) => {
    requireAuth(req, res, () => {
      // Pastikan terautentikasi dulu
      if (!targetRoles.includes(req.user!.role)) {
        // req.user pasti ada setelah requireAuth
        return res
          .status(403)
          .json({ message: "Forbidden: Insufficient role privileges" });
      }
      next();
    });
  };
}

// Ini adalah fungsi BARU yang harus Anda tempelkan di server/auth.ts
// untuk menggantikan fungsi requirePermission yang lama
export function requirePermission(permissionName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Panggil requireAuth dulu untuk memastikan user terautentikasi dan req.user ada
    requireAuth(req, res, async () => {
      // <-- Mulai dari sini
      // Pada titik ini, kita tahu req.isAuthenticated() adalah true dan req.user ada
      const userFromRequest = req.user as any; // Tipenya bisa lebih spesifik jika Anda tahu strukturnya

      // ===== LOGGING DETAIL DIMULAI =====
      console.log("-----------------------------------------------------");
      console.log(
        "[requirePermission] Check initiated inside requireAuth callback."
      );
      console.log(
        "[requirePermission] User from req.user:",
        JSON.stringify(userFromRequest, null, 2)
      );
      console.log(
        "[requirePermission] Required permission string:",
        permissionName
      );
      // ===== LOGGING DETAIL SELESAI =====

      try {
        const userRoleName = userFromRequest.role;
        if (!userRoleName || typeof userRoleName !== "string") {
          console.warn(
            "[requirePermission] User has no role property or it's not a string. User data:",
            JSON.stringify(userFromRequest)
          );
          console.log("-----------------------------------------------------");
          return res
            .status(403)
            .json({ message: "Forbidden: User role is missing or invalid." });
        }

        console.log(
          `[requirePermission] User role name from req.user: '${userRoleName}'`
        );

        const role = await storage.getRoleByName(userRoleName);
        if (!role || typeof role.id !== "number") {
          console.warn(
            `[requirePermission] Role '${userRoleName}' not found in database or lacks a valid ID. Role from DB:`,
            JSON.stringify(role)
          );
          console.log("-----------------------------------------------------");
          return res.status(403).json({
            message: `Forbidden: Role '${userRoleName}' configuration error.`,
          });
        }

        console.log(
          `[requirePermission] Role object from DB for '${userRoleName}':`,
          JSON.stringify(role, null, 2)
        );

        const permissionsForThisRole = await storage.getPermissionsByRole(
          role.id
        );
        const permissionNamesForThisRole = permissionsForThisRole.map(
          (p) => p.name
        );

        console.log(
          `[requirePermission] Permissions retrieved for role '${userRoleName}' (ID: ${role.id}):`,
          JSON.stringify(permissionNamesForThisRole, null, 2)
        );

        const hasRequiredPermission =
          permissionNamesForThisRole.includes(permissionName);

        if (hasRequiredPermission) {
          console.log(
            `[requirePermission] SUCCESS: User HAS required permission '${permissionName}'. Proceeding.`
          );
          console.log("-----------------------------------------------------");
          return next();
        } else {
          console.warn(
            `[requirePermission] FORBIDDEN: User MISSING required permission '${permissionName}'.`
          );
          console.warn(
            `[requirePermission] User (Role: ${userRoleName}) has these permissions: [${permissionNamesForThisRole.join(
              ", "
            )}]`
          );
          console.log("-----------------------------------------------------");
          return res.status(403).json({
            message: `Forbidden: Missing required permission '${permissionName}'`,
          });
        }
      } catch (error) {
        console.error(
          "[requirePermission] CRITICAL ERROR during permission check:",
          error
        );
        console.log("-----------------------------------------------------");
        res
          .status(500)
          .json({ message: "Internal server error during permission check" });
      }
    }); // <-- Sampai sini
  };
}
