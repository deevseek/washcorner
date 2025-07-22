import { Client } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Pastikan folder untuk auth data ada
const AUTH_FOLDER = join(process.cwd(), '.wwebjs_auth');
if (!existsSync(AUTH_FOLDER)) {
  mkdirSync(AUTH_FOLDER, { recursive: true });
}

// Tracking status WhatsApp client
let isReady = false;
let qrCodeDataURL: string | null = null;
let isInitializing = false;
let wasReady = false;
let client: Client | null = null;

// Event handler untuk mencatat event penting
const eventHandler = (event: string, data?: any) => {
  console.log(`[WhatsApp] ${event}`, data ? JSON.stringify(data) : '');
};

// Inisialisasi WhatsApp client
export async function initWhatsAppClient(): Promise<{ client: Client | null, qrCodeDataURL: string | null }> {
  if (isInitializing) {
    return { client, qrCodeDataURL };
  }

  if (client && isReady) {
    return { client, qrCodeDataURL: null };
  }

  isInitializing = true;

  try {
    console.log('[WhatsApp] Initializing client...');

    client = new Client({
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
        ],
      }
    });

    // Event: QR Code diterima, perlu di-scan oleh admin
    client.on('qr', async (qr) => {
      qrCodeDataURL = await QRCode.toDataURL(qr);
      console.log('[WhatsApp] QR Code received. Scan with your phone.');
      
      // Simpan QR code ke file untuk debugging
      writeFileSync(join(AUTH_FOLDER, 'last_qr.txt'), qr);
      if (qrCodeDataURL) {
        writeFileSync(join(AUTH_FOLDER, 'last_qr.png'), Buffer.from(qrCodeDataURL.split(',')[1], 'base64'));
      }
      
      eventHandler('qr_received');
    });

    // Event: Client siap digunakan
    client.on('ready', () => {
      isReady = true;
      wasReady = true;
      qrCodeDataURL = null;
      eventHandler('ready');
      console.log('[WhatsApp] Client is ready!');
    });

    // Event: Client terautentikasi
    client.on('authenticated', () => {
      eventHandler('authenticated');
      console.log('[WhatsApp] Client is authenticated!');
    });

    // Event: Autentikasi gagal
    client.on('auth_failure', (msg) => {
      isReady = false;
      eventHandler('auth_failure', msg);
      console.error('[WhatsApp] Authentication failed', msg);
    });

    // Event: Koneksi terputus
    client.on('disconnected', (reason) => {
      isReady = false;
      qrCodeDataURL = null;
      eventHandler('disconnected', reason);
      console.log('[WhatsApp] Client was disconnected', reason);
    });

    await client.initialize();
    isInitializing = false;
    return { client, qrCodeDataURL };
  } catch (error) {
    console.error('[WhatsApp] Error initializing client:', error);
    isInitializing = false;
    isReady = false;
    return { client: null, qrCodeDataURL: null };
  }
}

// Cek apakah WhatsApp client sudah siap
export function isWhatsAppReady(): boolean {
  return isReady && client !== null;
}

// Kirim pesan WhatsApp
export async function sendWhatsAppMessage(
  phoneNumber: string, 
  message: string,
  options: { includeCountryCode?: boolean } = {}
): Promise<boolean> {
  try {
    if (!isReady || !client) {
      console.error('[WhatsApp] Client not ready. Cannot send message.');
      return false;
    }

    // Format nomor telepon
    let formattedNumber = phoneNumber.trim().replace(/\D/g, '');
    
    // Tambah kode negara Indonesia jika tidak ada
    if (options.includeCountryCode && !formattedNumber.startsWith('62') && formattedNumber.startsWith('0')) {
      formattedNumber = `62${formattedNumber.substring(1)}`;
    }
    
    // Pastikan format nomor sesuai untuk WhatsApp
    if (!formattedNumber.includes('@c.us')) {
      formattedNumber = `${formattedNumber}@c.us`;
    }

    // Cek apakah nomor terdaftar di WhatsApp
    const isRegistered = await client.isRegisteredUser(formattedNumber);
    if (!isRegistered) {
      console.log(`[WhatsApp] Phone number ${formattedNumber} is not registered on WhatsApp`);
      return false;
    }

    // Kirim pesan
    await client.sendMessage(formattedNumber, message);
    console.log(`[WhatsApp] Message sent to ${formattedNumber}`);
    return true;
  } catch (error) {
    console.error('[WhatsApp] Error sending message:', error);
    return false;
  }
}

// Status transaksi ke template pesan
export function getStatusNotificationTemplate(
  status: string,
  customerName: string,
  trackingCode: string,
  services: string[],
  licensePlate: string
): string {
  const servicesList = services.join(', ');
  const baseUrl = process.env.VITE_APP_URL || 'https://washcorner.replit.app';
  const trackingUrl = `${baseUrl}/tracking/${trackingCode}`;
  
  let emoji = '🔍';
  let statusText = 'sedang diproses';
  
  switch (status.toLowerCase()) {
    case 'pending':
      emoji = '⏳';
      statusText = 'sedang menunggu';
      break;
    case 'in_progress':
      emoji = '🔧';
      statusText = 'sedang dikerjakan';
      break;
    case 'completed':
      emoji = '✅';
      statusText = 'telah selesai';
      break;
    case 'cancelled':
      emoji = '❌';
      statusText = 'telah dibatalkan';
      break;
  }
  
  return `*Wash Corner - Status Cucian* ${emoji}\n\n` +
    `Halo ${customerName},\n\n` +
    `Kendaraan Anda dengan plat nomor *${licensePlate}* saat ini ${statusText}.\n\n` +
    `*Layanan:*\n${servicesList}\n\n` +
    `*Kode Tracking:* ${trackingCode}\n\n` +
    `Anda dapat mengecek status cucian Anda melalui link berikut:\n${trackingUrl}\n\n` +
    `Terima kasih telah menggunakan jasa Wash Corner!`;
}

// Reset WhatsApp client
export async function resetWhatsAppClient(): Promise<void> {
  if (client) {
    try {
      await client.destroy();
    } catch (error) {
      console.error('[WhatsApp] Error destroying client:', error);
    }
  }
  
  client = null;
  isReady = false;
  qrCodeDataURL = null;
  isInitializing = false;
}

// Get QR code URL untuk setup
export function getWhatsAppQRCode(): string | null {
  return qrCodeDataURL;
}