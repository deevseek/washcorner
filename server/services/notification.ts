/**
 * Notification Service Factory
 * Memilih implementasi notifikasi yang sesuai berdasarkan konfigurasi
 */

import { Transaction, Customer, Service } from "@shared/schema";
import * as simpleNotification from "./simpleNotification";
import * as whatsappBusinessApi from "./whatsappBusinessApi";
import { isNotificationsEnabled } from "./notification-settings";

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
export async function sendStatusNotification(
  transaction: Transaction,
  customer: Customer,
  services: Service[],
  status?: string
): Promise<{
  success: boolean;
  message: string;
}> {
  // Periksa jika notifikasi diaktifkan
  if (!isNotificationsEnabled()) {
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
    } else {
      console.log(`[NOTIFICATION] Using simple notification implementation`);
      return await simpleNotification.sendStatusNotification(transaction, customer, services, status);
    }
  } catch (error) {
    console.error(`[NOTIFICATION] Error sending notification:`, error);
    return {
      success: false,
      message: `Error: ${(error as Error).message}`
    };
  }
}

/**
 * Generate a new tracking code
 */
export function generateTrackingCode(): string {
  return simpleNotification.generateUniqueTrackingCode();
}

/**
 * Check if a notification was recently sent to a phone number
 */
export function hasRecentNotification(
  phone: string, 
  status: string, 
  timeWindowMs: number = 5 * 60 * 1000
): boolean {
  // Hanya simpleNotification yang menyimpan riwayat status
  return simpleNotification.hasRecentNotification(phone, status, timeWindowMs);
}

/**
 * Get the last notification for a phone number
 */
export function getLastNotification(phone: string): {
  status: string;
  timestamp: number;
  trackingCode: string;
} | null {
  // Hanya simpleNotification yang menyimpan riwayat status
  return simpleNotification.getLastNotification(phone);
}