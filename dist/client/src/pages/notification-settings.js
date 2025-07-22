"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NotificationSettingsPage;
const react_1 = require("react");
const use_toast_1 = require("@/hooks/use-toast");
const card_1 = require("@/components/ui/card");
const tabs_1 = require("@/components/ui/tabs");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const textarea_1 = require("@/components/ui/textarea");
const switch_1 = require("@/components/ui/switch");
const lucide_react_1 = require("lucide-react");
const queryClient_1 = require("@/lib/queryClient");
const react_query_1 = require("@tanstack/react-query");
const sidebar_1 = require("@/components/layout/sidebar");
const top_nav_1 = require("@/components/layout/top-nav");
const page_header_1 = require("@/components/layout/page-header");
const defaultTemplates = {
    pending: `*Wash Corner - Status Cucian* ⏳\n\nHalo {customerName},\n\nKendaraan Anda dengan plat nomor *{licensePlate}* saat ini sedang menunggu untuk dicuci.\n\n*Layanan:*\n{servicesList}\n\n*Kode Tracking:* {trackingCode}\n\nAnda dapat mengecek status cucian Anda melalui link berikut:\n{trackingUrl}\n\nTerima kasih telah menggunakan jasa Wash Corner!`,
    in_progress: `*Wash Corner - Status Cucian* 🔧\n\nHalo {customerName},\n\nKendaraan Anda dengan plat nomor *{licensePlate}* saat ini sedang dikerjakan.\n\n*Layanan:*\n{servicesList}\n\n*Kode Tracking:* {trackingCode}\n\nAnda dapat mengecek status cucian Anda melalui link berikut:\n{trackingUrl}\n\nTerima kasih telah menggunakan jasa Wash Corner!`,
    completed: `*Wash Corner - Status Cucian* ✅\n\nHalo {customerName},\n\nKendaraan Anda dengan plat nomor *{licensePlate}* telah selesai dikerjakan dan siap untuk diambil.\n\n*Layanan:*\n{servicesList}\n\n*Kode Tracking:* {trackingCode}\n\nAnda dapat mengecek status cucian Anda melalui link berikut:\n{trackingUrl}\n\nTerima kasih telah menggunakan jasa Wash Corner!`,
    cancelled: `*Wash Corner - Status Cucian* ❌\n\nHalo {customerName},\n\nKami informasikan bahwa cucian untuk kendaraan Anda dengan plat nomor *{licensePlate}* telah dibatalkan.\n\n*Layanan:*\n{servicesList}\n\n*Kode Tracking:* {trackingCode}\n\nJika Anda memiliki pertanyaan, silakan hubungi kami.\n\nTerima kasih telah menggunakan jasa Wash Corner!`
};
function NotificationSettingsPage() {
    const { toast } = (0, use_toast_1.useToast)();
    const [selectedTab, setSelectedTab] = (0, react_1.useState)("general");
    const [settings, setSettings] = (0, react_1.useState)({
        defaultPhone: "",
        enableWhatsapp: true,
        templates: defaultTemplates
    });
    // Fetch notification settings
    const { data: notificationStatus, isLoading: statusLoading } = (0, react_query_1.useQuery)({
        queryKey: ['/api/notification/status']
    });
    // Save notification settings
    const saveSettingsMutation = (0, react_query_1.useMutation)({
        mutationFn: async (newSettings) => {
            const res = await (0, queryClient_1.apiRequest)('POST', '/api/notification/settings', newSettings);
            return await res.json();
        },
        onSuccess: () => {
            toast({
                title: "Pengaturan berhasil disimpan",
                description: "Pengaturan notifikasi telah diperbarui",
            });
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/notification/settings'] });
        },
        onError: (error) => {
            toast({
                title: "Gagal menyimpan pengaturan",
                description: error.message,
                variant: "destructive"
            });
        }
    });
    // Handle form submission
    const handleSaveSettings = () => {
        saveSettingsMutation.mutate(settings);
    };
    // Reset templates to default
    const handleResetTemplates = () => {
        setSettings({
            ...settings,
            templates: defaultTemplates
        });
        toast({
            title: "Template direset",
            description: "Template notifikasi telah dikembalikan ke default",
        });
    };
    return (<div className="min-h-screen flex flex-col md:flex-row">
      <sidebar_1.Sidebar />
      
      <div className="flex-1 md:ml-64">
        <top_nav_1.TopNav title="Pengaturan Notifikasi"/>
        
        <div className="container mx-auto px-4 py-6">
          <page_header_1.PageHeader title="Pengaturan Notifikasi" subtitle="Konfigurasi pengaturan notifikasi dan template pesan" actions={[
            {
                label: 'Simpan Pengaturan',
                icon: 'settings',
                onClick: handleSaveSettings,
                primary: true
            }
        ]}/>
          
          <div className="grid gap-6">
            {/* Connection Status Card */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Status Koneksi</card_1.CardTitle>
                <card_1.CardDescription>Status koneksi sistem notifikasi</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="flex items-center gap-4">
                  {statusLoading ? (<div className="flex items-center gap-2">
                      <lucide_react_1.Loader2 className="h-5 w-5 animate-spin text-muted-foreground"/>
                      <span>Memeriksa status notifikasi...</span>
                    </div>) : notificationStatus?.ready ? (<div className="flex items-center gap-2 text-green-600">
                      <lucide_react_1.CheckCircle className="h-5 w-5"/>
                      <span>Sistem notifikasi aktif dan siap digunakan</span>
                    </div>) : (<div className="flex items-center gap-2 text-amber-600">
                      <lucide_react_1.AlertTriangle className="h-5 w-5"/>
                      <span>Sistem notifikasi tidak terhubung</span>
                    </div>)}
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Mode: {notificationStatus?.mode || "Tidak diketahui"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {notificationStatus?.info || ""}
                  </p>
                </div>
              </card_1.CardContent>
            </card_1.Card>
            
            {/* Settings Tabs */}
            <tabs_1.Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <tabs_1.TabsList className="grid w-full grid-cols-2">
                <tabs_1.TabsTrigger value="general">Pengaturan Umum</tabs_1.TabsTrigger>
                <tabs_1.TabsTrigger value="templates">Template Pesan</tabs_1.TabsTrigger>
              </tabs_1.TabsList>
              
              {/* General Settings */}
              <tabs_1.TabsContent value="general">
                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle>Pengaturan Umum</card_1.CardTitle>
                    <card_1.CardDescription>
                      Konfigurasi pengaturan umum notifikasi
                    </card_1.CardDescription>
                  </card_1.CardHeader>
                  <card_1.CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label_1.Label htmlFor="enableWhatsapp">Aktifkan Notifikasi</label_1.Label>
                        <switch_1.Switch id="enableWhatsapp" checked={settings.enableWhatsapp} onCheckedChange={(checked) => setSettings({ ...settings, enableWhatsapp: checked })}/>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Aktifkan atau nonaktifkan pengiriman notifikasi otomatis
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label_1.Label htmlFor="defaultPhone">Nomor WhatsApp Default</label_1.Label>
                      <input_1.Input id="defaultPhone" value={settings.defaultPhone} onChange={(e) => setSettings({ ...settings, defaultPhone: e.target.value })} placeholder="Contoh: 628123456789"/>
                      <p className="text-sm text-muted-foreground">
                        Nomor WhatsApp default untuk pengiriman notifikasi (jika pelanggan tidak memiliki nomor)
                      </p>
                    </div>
                    
                    <button_1.Button onClick={handleSaveSettings} disabled={saveSettingsMutation.isPending}>
                      {saveSettingsMutation.isPending && (<lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>)}
                      Simpan Pengaturan
                    </button_1.Button>
                  </card_1.CardContent>
                </card_1.Card>
              </tabs_1.TabsContent>
              
              {/* Template Settings */}
              <tabs_1.TabsContent value="templates">
                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle>Template Pesan</card_1.CardTitle>
                    <card_1.CardDescription>
                      Kustomisasi template pesan untuk setiap status
                    </card_1.CardDescription>
                  </card_1.CardHeader>
                  <card_1.CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">
                        <span className="font-medium">Variabel yang tersedia:</span>
                        <span className="ml-2 text-muted-foreground">
                          {"{customerName}"}, {"{licensePlate}"}, {"{servicesList}"}, {"{trackingCode}"}, {"{trackingUrl}"}
                        </span>
                      </p>
                      <button_1.Button variant="outline" onClick={handleResetTemplates}>
                        Reset ke Default
                      </button_1.Button>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Pending Template */}
                      <div>
                        <label_1.Label htmlFor="pendingTemplate" className="mb-2 inline-block">
                          Template Status Menunggu (Pending)
                        </label_1.Label>
                        <textarea_1.Textarea id="pendingTemplate" rows={8} value={settings.templates.pending} onChange={(e) => setSettings({
            ...settings,
            templates: { ...settings.templates, pending: e.target.value }
        })}/>
                      </div>
                      
                      {/* In Progress Template */}
                      <div>
                        <label_1.Label htmlFor="inProgressTemplate" className="mb-2 inline-block">
                          Template Status Dalam Proses (In Progress)
                        </label_1.Label>
                        <textarea_1.Textarea id="inProgressTemplate" rows={8} value={settings.templates.in_progress} onChange={(e) => setSettings({
            ...settings,
            templates: { ...settings.templates, in_progress: e.target.value }
        })}/>
                      </div>
                      
                      {/* Completed Template */}
                      <div>
                        <label_1.Label htmlFor="completedTemplate" className="mb-2 inline-block">
                          Template Status Selesai (Completed)
                        </label_1.Label>
                        <textarea_1.Textarea id="completedTemplate" rows={8} value={settings.templates.completed} onChange={(e) => setSettings({
            ...settings,
            templates: { ...settings.templates, completed: e.target.value }
        })}/>
                      </div>
                      
                      {/* Cancelled Template */}
                      <div>
                        <label_1.Label htmlFor="cancelledTemplate" className="mb-2 inline-block">
                          Template Status Dibatalkan (Cancelled)
                        </label_1.Label>
                        <textarea_1.Textarea id="cancelledTemplate" rows={8} value={settings.templates.cancelled} onChange={(e) => setSettings({
            ...settings,
            templates: { ...settings.templates, cancelled: e.target.value }
        })}/>
                      </div>
                    </div>
                    
                    <button_1.Button onClick={handleSaveSettings} disabled={saveSettingsMutation.isPending}>
                      {saveSettingsMutation.isPending && (<lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>)}
                      Simpan Template
                    </button_1.Button>
                  </card_1.CardContent>
                </card_1.Card>
              </tabs_1.TabsContent>
            </tabs_1.Tabs>
          </div>
        </div>
      </div>
    </div>);
}
