"use strict";
/**
 * Notification Service Factory
 * Memilih implementasi notifikasi yang sesuai berdasarkan konfigurasi
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendStatusNotification = sendStatusNotification;
exports.generateTrackingCode = generateTrackingCode;
exports.hasRecentNotification = hasRecentNotification;
exports.getLastNotification = getLastNotification;
const simpleNotification = __importStar(require("./simpleNotification"));
const whatsappBusinessApi = __importStar(require("./whatsappBusinessApi"));
const notification_settings_1 = require("./notification-settings");
// Tentukan apakah menggunakan WhatsApp Business API
const useWhatsAppBusinessApi = () => {
    // Jika variabel lingkungan USE_WHATSAPP_API diatur ke true dan kredensial WhatsApp Business API tersedia
    const useApi = process.env.USE_WHATSAPP_API === 'true';
    if (useApi) {
        const requiredEnvVars = [
            'WHATSAPP_BUSINESS_PHONE_NUMBER_ID',
            'WHATSAPP_BUSINESS_TOKEN',
            'WHATSAPP_BUSINESS_ACCOUNT_ID'
        ];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
            console.warn(`[NOTIFICATION] Missing WhatsApp Business API credentials: ${missingVars.join(', ')}`);
            console.warn(`[NOTIFICATION] Falling back to simple notification service.`);
            return false;
        }
        return true;
    }
    return false;
};
/**
 * Send notification based on chosen implementation
 */
async function sendStatusNotification(transaction, customer, services, status) {
    // Periksa jika notifikasi diaktifkan
    if (!(0, notification_settings_1.isNotificationsEnabled)()) {
        console.log(`[NOTIFICATION] Notifications are disabled in settings`);
        return {
            success: false,
            message: "Notifikasi dinonaktifkan di pengaturan"
        };
    }
    try {
        // Tentukan apakah menggunakan WhatsApp Business API atau implementasi sederhana
        if (useWhatsAppBusinessApi()) {
            console.log(`[NOTIFICATION] Using WhatsApp Business API implementation`);
            return await whatsappBusinessApi.sendStatusNotification(transaction, customer, services, status);
        }
        else {
            console.log(`[NOTIFICATION] Using simple notification implementation`);
            return await simpleNotification.sendStatusNotification(transaction, customer, services, status);
        }
    }
    catch (error) {
        console.error(`[NOTIFICATION] Error sending notification:`, error);
        return {
            success: false,
            message: `Error: ${error.message}`
        };
    }
}
/**
 * Generate a new tracking code
 */
function generateTrackingCode() {
    return simpleNotification.generateUniqueTrackingCode();
}
/**
 * Check if a notification was recently sent to a phone number
 */
function hasRecentNotification(phone, status, timeWindowMs = 5 * 60 * 1000) {
    // Hanya simpleNotification yang menyimpan riwayat status
    return simpleNotification.hasRecentNotification(phone, status, timeWindowMs);
}
/**
 * Get the last notification for a phone number
 */
function getLastNotification(phone) {
    // Hanya simpleNotification yang menyimpan riwayat status
    return simpleNotification.getLastNotification(phone);
}
