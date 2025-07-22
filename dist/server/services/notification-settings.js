"use strict";
/**
 * Notification settings service
 * Untuk menyimpan dan mendapatkan pengaturan notifikasi
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationSettings = getNotificationSettings;
exports.saveNotificationSettings = saveNotificationSettings;
exports.getTemplateForStatus = getTemplateForStatus;
exports.applyTemplateVariables = applyTemplateVariables;
exports.getDefaultPhone = getDefaultPhone;
exports.isNotificationsEnabled = isNotificationsEnabled;
const fs_1 = require("fs");
const path_1 = require("path");
const defaultTemplates = {
    pending: `*Wash Corner - Status Cucian* ⏳\n\nHalo {customerName},\n\nKendaraan Anda dengan plat nomor *{licensePlate}* saat ini sedang menunggu untuk dicuci.\n\n*Layanan:*\n{servicesList}\n\n*Kode Tracking:* {trackingCode}\n\nAnda dapat mengecek status cucian Anda melalui link berikut:\n{trackingUrl}\n\nTerima kasih telah menggunakan jasa Wash Corner!`,
    in_progress: `*Wash Corner - Status Cucian* 🔧\n\nHalo {customerName},\n\nKendaraan Anda dengan plat nomor *{licensePlate}* saat ini sedang dikerjakan.\n\n*Layanan:*\n{servicesList}\n\n*Kode Tracking:* {trackingCode}\n\nAnda dapat mengecek status cucian Anda melalui link berikut:\n{trackingUrl}\n\nTerima kasih telah menggunakan jasa Wash Corner!`,
    completed: `*Wash Corner - Status Cucian* ✅\n\nHalo {customerName},\n\nKendaraan Anda dengan plat nomor *{licensePlate}* telah selesai dikerjakan dan siap untuk diambil.\n\n*Layanan:*\n{servicesList}\n\n*Kode Tracking:* {trackingCode}\n\nAnda dapat mengecek status cucian Anda melalui link berikut:\n{trackingUrl}\n\nTerima kasih telah menggunakan jasa Wash Corner!`,
    cancelled: `*Wash Corner - Status Cucian* ❌\n\nHalo {customerName},\n\nKami informasikan bahwa cucian untuk kendaraan Anda dengan plat nomor *{licensePlate}* telah dibatalkan.\n\n*Layanan:*\n{servicesList}\n\n*Kode Tracking:* {trackingCode}\n\nJika Anda memiliki pertanyaan, silakan hubungi kami.\n\nTerima kasih telah menggunakan jasa Wash Corner!`
};
// Default settings
const defaultSettings = {
    defaultPhone: "",
    enableWhatsapp: true,
    templates: defaultTemplates
};
// Path to settings file
const SETTINGS_FILE = (0, path_1.join)(process.cwd(), 'notification-settings.json');
/**
 * Get notification settings
 */
function getNotificationSettings() {
    try {
        if ((0, fs_1.existsSync)(SETTINGS_FILE)) {
            const fileContent = (0, fs_1.readFileSync)(SETTINGS_FILE, 'utf-8');
            return JSON.parse(fileContent);
        }
        // Create default settings file if it doesn't exist
        saveNotificationSettings(defaultSettings);
        return defaultSettings;
    }
    catch (error) {
        console.error('Error reading notification settings:', error);
        return defaultSettings;
    }
}
/**
 * Save notification settings
 */
function saveNotificationSettings(settings) {
    try {
        (0, fs_1.writeFileSync)(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
        return true;
    }
    catch (error) {
        console.error('Error saving notification settings:', error);
        return false;
    }
}
/**
 * Get template for a specific status
 */
function getTemplateForStatus(status) {
    const settings = getNotificationSettings();
    switch (status.toLowerCase()) {
        case 'pending':
            return settings.templates.pending;
        case 'in_progress':
            return settings.templates.in_progress;
        case 'completed':
            return settings.templates.completed;
        case 'cancelled':
            return settings.templates.cancelled;
        default:
            return settings.templates.pending;
    }
}
/**
 * Apply template variables
 */
function applyTemplateVariables(template, variables) {
    let result = template;
    // Replace all variables
    for (const [key, value] of Object.entries(variables)) {
        if (value !== undefined) {
            result = result.replace(new RegExp(`{${key}}`, 'g'), value);
        }
    }
    return result;
}
/**
 * Get default phone number
 */
function getDefaultPhone() {
    const settings = getNotificationSettings();
    return settings.defaultPhone;
}
/**
 * Check if notifications are enabled
 */
function isNotificationsEnabled() {
    const settings = getNotificationSettings();
    return settings.enableWhatsapp;
}
