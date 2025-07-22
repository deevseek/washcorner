"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePasswords = comparePasswords;
exports.setupAuth = setupAuth;
exports.requireRole = requireRole;
exports.requirePermission = requirePermission;
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const express_session_1 = __importDefault(require("express-session"));
const crypto_1 = require("crypto");
const util_1 = require("util");
const storage_1 = require("./storage");
const schema_1 = require("@shared/schema");
const scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
async function hashPassword(password) {
    const salt = (0, crypto_1.randomBytes)(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64));
    return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64));
    return (0, crypto_1.timingSafeEqual)(hashedBuf, suppliedBuf);
}
async function setupAuth(app) {
    const sessionSettings = {
        secret: process.env.SESSION_SECRET || "wash-corner-secret-key",
        resave: false,
        saveUninitialized: false,
        store: storage_1.storage.sessionStore,
        cookie: {
            secure: false, // Set to false for development
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'lax'
        }
    };
    app.set("trust proxy", 1);
    app.use((0, express_session_1.default)(sessionSettings));
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    passport_1.default.use(new passport_local_1.Strategy(async (username, password, done) => {
        try {
            const user = await storage_1.storage.getUserByUsername(username);
            if (!user || !(await comparePasswords(password, user.password))) {
                return done(null, false);
            }
            else {
                return done(null, user);
            }
        }
        catch (error) {
            return done(error);
        }
    }));
    passport_1.default.serializeUser((user, done) => done(null, user.id));
    passport_1.default.deserializeUser(async (id, done) => {
        try {
            const user = await storage_1.storage.getUser(id);
            done(null, user);
        }
        catch (error) {
            done(error);
        }
    });
    app.post("/api/register", async (req, res, next) => {
        try {
            const userData = schema_1.insertUserSchema.parse(req.body);
            const existingUser = await storage_1.storage.getUserByUsername(userData.username);
            if (existingUser) {
                return res.status(400).json({ message: "Username already exists" });
            }
            const user = await storage_1.storage.createUser({
                ...userData,
                password: await hashPassword(userData.password),
            });
            // Remove password from response
            const { password, ...userWithoutPassword } = user;
            req.login(user, (err) => {
                if (err)
                    return next(err);
                res.status(201).json(userWithoutPassword);
            });
        }
        catch (error) {
            res.status(400).json({ message: "Invalid registration data" });
        }
    });
    app.post("/api/login", (req, res, next) => {
        passport_1.default.authenticate("local", (err, user, info) => {
            if (err)
                return next(err);
            if (!user) {
                return res.status(401).json({ message: "Invalid username or password" });
            }
            req.login(user, (loginErr) => {
                if (loginErr)
                    return next(loginErr);
                // Remove password from response
                const { password, ...userWithoutPassword } = user;
                res.status(200).json(userWithoutPassword);
            });
        })(req, res, next);
    });
    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err)
                return next(err);
            res.sendStatus(200);
        });
    });
    app.get("/api/user", (req, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        // Remove password from response
        const { password, ...userWithoutPassword } = req.user;
        res.json(userWithoutPassword);
    });
    // Middleware untuk cek autentikasi
    app.use("/api/auth-check", (req, res) => {
        if (req.isAuthenticated()) {
            return res.status(200).json({
                authenticated: true,
                user: {
                    id: req.user.id,
                    username: req.user.username,
                    role: req.user.role,
                    name: req.user.name
                }
            });
        }
        return res.status(401).json({ authenticated: false });
    });
    // Middleware untuk cek roles dan permissions (untuk digunakan di frontend)
    app.get("/api/current-user-permissions", async (req, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        try {
            // Dapatkan role ID dari user
            const role = await storage_1.storage.getRoleByName(req.user.role);
            if (!role) {
                return res.status(403).json({ message: "Role not found" });
            }
            // Dapatkan semua permission untuk role tersebut
            const permissions = await storage_1.storage.getPermissionsByRole(role.id);
            // Kirim data pengguna dengan permissionnya
            res.json({
                user: {
                    id: req.user.id,
                    username: req.user.username,
                    role: req.user.role,
                    name: req.user.name
                },
                permissions: permissions
            });
        }
        catch (error) {
            console.error("Error fetching permissions:", error);
            res.status(500).json({ message: "Error fetching permissions" });
        }
    });
}
// Middleware untuk proteksi route berdasarkan role
function requireRole(role) {
    const roles = Array.isArray(role) ? role : [role];
    return (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Unauthorized: Insufficient privileges" });
        }
        next();
    };
}
// Middleware untuk proteksi route berdasarkan permission
function requirePermission(permissionName) {
    return async (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        try {
            // Dapatkan role ID dari user
            const role = await storage_1.storage.getRoleByName(req.user.role);
            if (!role) {
                return res.status(403).json({ message: "Role not found" });
            }
            // Dapatkan semua permission untuk role tersebut
            const permissions = await storage_1.storage.getPermissionsByRole(role.id);
            // Cek apakah user memiliki permission yang dibutuhkan
            const hasPermission = permissions.some(p => p.name === permissionName);
            if (!hasPermission) {
                return res.status(403).json({ message: "Unauthorized: Insufficient permissions" });
            }
            next();
        }
        catch (error) {
            console.error("Error checking permissions:", error);
            res.status(500).json({ message: "Error checking permissions" });
        }
    };
}
