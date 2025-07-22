/**
 * Simple notification service for sending status updates
 * This implementasi sederhana akan digunakan sebagai pengganti WhatsApp Web.js
 * yang membutuhkan konfigurasi lebih kompleks
 */

import { Transaction, Customer, Service } from "@shared/schema";
import { generateTrackingCode } from "./barcode";
import { 
  getTemplateForStatus, 
  applyTemplateVariables, 
  isNotificationsEnabled,
  getDefaultPhone
} from "./notification-settings";

// Status terakhir yang dikirimkan untuk setiap nomor telepon
const lastNotificationPerPhone: Record<string, { 
  status: string, 
  timestamp: number,
  trackingCode: string 
}> = {};

/**
 * Menghasilkan tracking code unik untuk transaksi
 */
export function generateUniqueTrackingCode(): string {
  return generateTrackingCode();
}

/**
 * Kirim notifikasi status untuk transaksi
 * Fungsi ini hanya melakukan simulasi pengiriman pesan
 */
export async function sendStatusNotification(
  transaction: Transaction,
  customer: Customer,
  services: Service[],
  status?: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    console.log(`\n[NOTIFICATION] Starting notification process...`);
    console.log(`[NOTIFICATION] Transaction ID: ${transaction.id}`);
    console.log(`[NOTIFICATION] Transaction status: ${transaction.status}`);
    console.log(`[NOTIFICATION] Requested status: ${status || 'using transaction status'}`);
    
    // Validasi customer
    if (!customer) {
      console.log(`[NOTIFICATION] Customer is null or undefined`);
      return {
        success: false,
        message: "Data pelanggan tidak ditemukan"
      };
    }
    
    console.log(`[NOTIFICATION] Customer name: ${customer.name}`);
    console.log(`[NOTIFICATION] Customer phone: ${customer.phone || 'TIDAK ADA'}`);
    
    // Jika tidak ada customer atau nomor telepon, tidak dapat mengirim notifikasi
    if (!customer.phone) {
      return {
        success: false,
        message: "Tidak ada nomor telepon pelanggan"
      };
    }

    // Cek apakah notifikasi diaktifkan
    if (!isNotificationsEnabled()) {
      console.log(`[NOTIFICATION] Notifications are disabled in settings`);
      return {
        success: false,
        message: "Notifikasi WhatsApp dinonaktifkan di pengaturan"
      };
    }

    const notificationStatus = status || transaction.status;
    const trackingCode = transaction.trackingCode || generateUniqueTrackingCode();
    
    // Validasi services
    console.log(`[NOTIFICATION] Services:`, JSON.stringify(services));
    const serviceNames = services.filter(s => s && s.name).map(s => s.name);
    console.log(`[NOTIFICATION] Service names:`, serviceNames);
    
    if (serviceNames.length === 0) {
      console.log(`[NOTIFICATION] Warning: No service names found`);
    }
    
    // Format servicesList untuk template
    const servicesList = serviceNames.map(name => `- ${name}`).join('\n');
    
    // Ambil template berdasarkan status
    const template = getTemplateForStatus(notificationStatus);
    
    // Siapkan data untuk mengisi template
    const templateData = {
      customerName: customer.name,
      licensePlate: customer.licensePlate || 'Unknown',
      servicesList: servicesList,
      trackingCode: trackingCode,
      trackingUrl: `https://washcorner.replit.app/tracking/${trackingCode}`
    };
    
    // Terapkan template dengan data
    const messageContent = applyTemplateVariables(template, templateData);
    
    // Simulasi pengiriman notifikasi WhatsApp
    console.log(`\n[NOTIFICATION SIMULATOR] Status Update - ${new Date().toLocaleString()}`);
    console.log(`🔔 Mengirim notifikasi ke: ${customer.phone}`);
    console.log(`📱 Status: ${notificationStatus}`);
    console.log("📝 Pesan:");
    console.log(messageContent);
    
    // Simpan notifikasi terakhir untuk nomor telepon ini
    lastNotificationPerPhone[customer.phone] = {
      status: notificationStatus,
      timestamp: Date.now(),
      trackingCode
    };
    
    // Simulasi delay pengiriman
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: `Notifikasi status "${notificationStatus}" berhasil dikirim ke ${customer.phone}`
    };
  } catch (error) {
    console.error(`[NOTIFICATION] Error in sendStatusNotification:`, error);
    return {
      success: false,
      message: `Error: ${(error as Error).message}`
    };
  }
}

/**
 * Cek apakah sebuah notifikasi baru-baru ini telah dikirim ke nomor telepon tertentu
 */
export function hasRecentNotification(
  phone: string, 
  status: string, 
  timeWindowMs: number = 5 * 60 * 1000 // 5 menit
): boolean {
  const lastNotif = lastNotificationPerPhone[phone];
  if (!lastNotif) return false;
  
  return (
    lastNotif.status === status && 
    (Date.now() - lastNotif.timestamp) < timeWindowMs
  );
}

/**
 * Dapatkan notifikasi terakhir untuk nomor telepon
 */
export function getLastNotification(phone: string): {
  status: string;
  timestamp: number;
  trackingCode: string;
} | null {
  return lastNotificationPerPhone[phone] || null;
}