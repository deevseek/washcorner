/**
 * Notification settings service
 * Untuk menyimpan dan mendapatkan pengaturan notifikasi
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface NotificationSettings {
  defaultPhone: string;
  enableWhatsapp: boolean;
  templates: {
    pending: string;
    in_progress: string;
    completed: string;
    cancelled: string;
  };
}

const defaultTemplates = {
  pending: `*Wash Corner - Status Cucian* ⏳\n\nHalo {customerName},\n\nKendaraan Anda dengan plat nomor *{licensePlate}* saat ini sedang menunggu untuk dicuci.\n\n*Layanan:*\n{servicesList}\n\n*Kode Tracking:* {trackingCode}\n\nAnda dapat mengecek status cucian Anda melalui link berikut:\n{trackingUrl}\n\nTerima kasih telah menggunakan jasa Wash Corner!`,
  
  in_progress: `*Wash Corner - Status Cucian* 🔧\n\nHalo {customerName},\n\nKendaraan Anda dengan plat nomor *{licensePlate}* saat ini sedang dikerjakan.\n\n*Layanan:*\n{servicesList}\n\n*Kode Tracking:* {trackingCode}\n\nAnda dapat mengecek status cucian Anda melalui link berikut:\n{trackingUrl}\n\nTerima kasih telah menggunakan jasa Wash Corner!`,
  
  completed: `*Wash Corner - Status Cucian* ✅\n\nHalo {customerName},\n\nKendaraan Anda dengan plat nomor *{licensePlate}* telah selesai dikerjakan dan siap untuk diambil.\n\n*Layanan:*\n{servicesList}\n\n*Kode Tracking:* {trackingCode}\n\nAnda dapat mengecek status cucian Anda melalui link berikut:\n{trackingUrl}\n\nTerima kasih telah menggunakan jasa Wash Corner!`,
  
  cancelled: `*Wash Corner - Status Cucian* ❌\n\nHalo {customerName},\n\nKami informasikan bahwa cucian untuk kendaraan Anda dengan plat nomor *{licensePlate}* telah dibatalkan.\n\n*Layanan:*\n{servicesList}\n\n*Kode Tracking:* {trackingCode}\n\nJika Anda memiliki pertanyaan, silakan hubungi kami.\n\nTerima kasih telah menggunakan jasa Wash Corner!`
};

// Default settings
const defaultSettings: NotificationSettings = {
  defaultPhone: "",
  enableWhatsapp: true,
  templates: defaultTemplates
};

// Path to settings file
const SETTINGS_FILE = join(process.cwd(), 'notification-settings.json');

/**
 * Get notification settings
 */
export function getNotificationSettings(): NotificationSettings {
  try {
    if (existsSync(SETTINGS_FILE)) {
      const fileContent = readFileSync(SETTINGS_FILE, 'utf-8');
      return JSON.parse(fileContent);
    }
    
    // Create default settings file if it doesn't exist
    saveNotificationSettings(defaultSettings);
    return defaultSettings;
  } catch (error) {
    console.error('Error reading notification settings:', error);
    return defaultSettings;
  }
}

/**
 * Save notification settings
 */
export function saveNotificationSettings(settings: NotificationSettings): boolean {
  try {
    writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving notification settings:', error);
    return false;
  }
}

/**
 * Get template for a specific status
 */
export function getTemplateForStatus(status: string): string {
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
export function applyTemplateVariables(
  template: string,
  variables: {
    customerName?: string;
    licensePlate?: string;
    servicesList?: string;
    trackingCode?: string;
    trackingUrl?: string;
    [key: string]: string | undefined;
  }
): string {
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
export function getDefaultPhone(): string {
  const settings = getNotificationSettings();
  return settings.defaultPhone;
}

/**
 * Check if notifications are enabled
 */
export function isNotificationsEnabled(): boolean {
  const settings = getNotificationSettings();
  return settings.enableWhatsapp;
}