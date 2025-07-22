"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTrackingCode = generateTrackingCode;
exports.generateTrackingQRCode = generateTrackingQRCode;
const nanoid_1 = require("nanoid");
const qrcode_1 = __importDefault(require("qrcode"));
const nanoid = (0, nanoid_1.customAlphabet)('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
/**
 * Generate a unique tracking code for a transaction
 */
function generateTrackingCode() {
    return `WC-${nanoid()}`;
}
/**
 * Generate a QR code for the tracking page URL
 */
async function generateTrackingQRCode(trackingCode) {
    try {
        const baseUrl = process.env.VITE_APP_URL || 'https://washcorner.replit.app';
        const trackingUrl = `${baseUrl}/tracking/${trackingCode}`;
        const qrCodeDataUrl = await qrcode_1.default.toDataURL(trackingUrl, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000', // Black dots
                light: '#FFFFFF' // White background
            }
        });
        return qrCodeDataUrl;
    }
    catch (error) {
        console.error('Error generating QR code:', error);
        // Return a placeholder for error cases
        return '';
    }
}
