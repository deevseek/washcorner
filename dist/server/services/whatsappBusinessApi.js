"use strict";
/**
 * WhatsApp Business API Service
 * Integrasi dengan WhatsApp Business API untuk mengirim notifikasi
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendStatusNotification = sendStatusNotification;
const barcode_1 = require("./barcode");
const notification_settings_1 = require("./notification-settings");
const node_fetch_1 = __importDefault(require("node-fetch"));
/**
 * Validasi apakah semua kredensial WhatsApp Business tersedia
 */
function validateCredentials() {
    const requiredEnvVars = [
        'WHATSAPP_BUSINESS_PHONE_NUMBER_ID',
        'WHATSAPP_BUSINESS_TOKEN',
        'WHATSAPP_BUSINESS_ACCOUNT_ID'
    ];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        console.error(`[WhatsApp API] Missing required environment variables: ${missingVars.join(', ')}`);
        return false;
    }
    return true;
}
/**
 * Kirim pesan teks melalui WhatsApp Business API
 */
async function sendWhatsAppMessage(phoneNumber, message) {
    if (!validateCredentials()) {
        throw new Error('WhatsApp Business API credentials are missing');
    }
    const phoneNumberId = process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID;
    const token = process.env.WHATSAPP_BUSINESS_TOKEN;
    // Hapus karakter '+' dan pastikan format nomor telepon dimulai dengan kode negara
    const formattedPhone = phoneNumber.startsWith('+')
        ? phoneNumber.substring(1)
        : phoneNumber;
    try {
        const response = await (0, node_fetch_1.default)(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: formattedPhone,
                type: 'text',
                text: {
                    preview_url: true,
                    body: message
                }
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error(`[WhatsApp API] Error sending message:`, errorData);
            throw new Error(`WhatsApp API responded with status ${response.status}: ${JSON.stringify(errorData)}`);
        }
        return await response.json();
    }
    catch (error) {
        console.error(`[WhatsApp API] Error in sendWhatsAppMessage:`, error);
        throw error;
    }
}
/**
 * Kirim notifikasi status untuk transaksi menggunakan WhatsApp Business API
 */
async function sendStatusNotification(transaction, customer, services, status) {
    try {
        console.log(`\n[WhatsApp API] Starting notification process...`);
        console.log(`[WhatsApp API] Transaction ID: ${transaction.id}`);
        console.log(`[WhatsApp API] Transaction status: ${transaction.status}`);
        console.log(`[WhatsApp API] Requested status: ${status || 'using transaction status'}`);
        // Validasi kredensial WhatsApp Business API
        if (!validateCredentials()) {
            return {
                success: false,
                message: "Kredensial WhatsApp Business API tidak lengkap. Periksa variabel lingkungan."
            };
        }
        // Validasi customer
        if (!customer) {
            console.log(`[WhatsApp API] Customer is null or undefined`);
            return {
                success: false,
                message: "Data pelanggan tidak ditemukan"
            };
        }
        console.log(`[WhatsApp API] Customer name: ${customer.name}`);
        console.log(`[WhatsApp API] Customer phone: ${customer.phone || 'TIDAK ADA'}`);
        // Jika tidak ada customer atau nomor telepon, tidak dapat mengirim notifikasi
        if (!customer.phone) {
            return {
                success: false,
                message: "Tidak ada nomor telepon pelanggan"
            };
        }
        // Cek apakah notifikasi diaktifkan
        if (!(0, notification_settings_1.isNotificationsEnabled)()) {
            console.log(`[WhatsApp API] Notifications are disabled in settings`);
            return {
                success: false,
                message: "Notifikasi WhatsApp dinonaktifkan di pengaturan"
            };
        }
        const notificationStatus = status || transaction.status;
        const trackingCode = transaction.trackingCode || (0, barcode_1.generateTrackingCode)();
        // Validasi services
        console.log(`[WhatsApp API] Services:`, JSON.stringify(services));
        const serviceNames = services.filter(s => s && s.name).map(s => s.name);
        console.log(`[WhatsApp API] Service names:`, serviceNames);
        if (serviceNames.length === 0) {
            console.log(`[WhatsApp API] Warning: No service names found`);
        }
        // Format servicesList untuk template
        const servicesList = serviceNames.map(name => `- ${name}`).join('\n');
        // Ambil template berdasarkan status
        const template = (0, notification_settings_1.getTemplateForStatus)(notificationStatus);
        // Siapkan data untuk mengisi template
        const templateData = {
            customerName: customer.name,
            licensePlate: customer.licensePlate || 'Unknown',
            servicesList: servicesList,
            trackingCode: trackingCode,
            trackingUrl: `https://washcorner.replit.app/tracking/${trackingCode}`
        };
        // Terapkan template dengan data
        const messageContent = (0, notification_settings_1.applyTemplateVariables)(template, templateData);
        // Kirim pesan WhatsApp menggunakan API
        console.log(`[WhatsApp API] Sending WhatsApp message to ${customer.phone}...`);
        // Kirim pesan melalui WhatsApp Business API
        const apiResponse = await sendWhatsAppMessage(customer.phone, messageContent);
        console.log(`[WhatsApp API] WhatsApp message sent successfully:`, apiResponse);
        return {
            success: true,
            message: `Notifikasi status "${notificationStatus}" berhasil dikirim ke ${customer.phone}`
        };
    }
    catch (error) {
        console.error(`[WhatsApp API] Error in sendStatusNotification:`, error);
        return {
            success: false,
            message: `Error: ${error.message}`
        };
    }
}
