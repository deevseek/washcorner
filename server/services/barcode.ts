import { customAlphabet } from 'nanoid';
import QRCode from 'qrcode';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

/**
 * Generate a unique tracking code for a transaction
 */
export function generateTrackingCode(): string {
  return `WC-${nanoid()}`;
}

/**
 * Generate a QR code for the tracking page URL
 */
export async function generateTrackingQRCode(trackingCode: string): Promise<string> {
  try {
    const baseUrl = process.env.VITE_APP_URL || 'https://washcorner.replit.app';
    const trackingUrl = `${baseUrl}/tracking/${trackingCode}`;
    const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000', // Black dots
        light: '#FFFFFF' // White background
      }
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    // Return a placeholder for error cases
    return '';
  }
}