import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, CheckCircle, AlertTriangle, MessageSquare } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { PageHeader } from "@/components/layout/page-header";

interface NotificationSettings {
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

export default function NotificationSettingsPage() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("general");
  
  const [settings, setSettings] = useState<NotificationSettings>({
    defaultPhone: "",
    enableWhatsapp: true,
    templates: defaultTemplates
  });
  
  // Fetch notification settings
  const { data: notificationStatus, isLoading: statusLoading } = useQuery<{
    ready: boolean;
    mode: string;
    info: string;
  }>({
    queryKey: ['/api/notification/status']
  });
  
  // Save notification settings
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: NotificationSettings) => {
      const res = await apiRequest('POST', '/api/notification/settings', newSettings);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Pengaturan berhasil disimpan",
        description: "Pengaturan notifikasi telah diperbarui",
      });
      queryClient.invalidateQueries({queryKey: ['/api/notification/settings']});
    },
    onError: (error: any) => {
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
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <TopNav title="Pengaturan Notifikasi" />
        
        <div className="container mx-auto px-4 py-6">
          <PageHeader 
            title="Pengaturan Notifikasi" 
            subtitle="Konfigurasi pengaturan notifikasi dan template pesan"
            actions={[
              { 
                label: 'Simpan Pengaturan', 
                icon: 'settings', 
                onClick: handleSaveSettings, 
                primary: true
              }
            ]} 
          />
          
          <div className="grid gap-6">
            {/* Connection Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Status Koneksi</CardTitle>
                <CardDescription>Status koneksi sistem notifikasi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {statusLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      <span>Memeriksa status notifikasi...</span>
                    </div>
                  ) : notificationStatus?.ready ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>Sistem notifikasi aktif dan siap digunakan</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Sistem notifikasi tidak terhubung</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Mode: {notificationStatus?.mode || "Tidak diketahui"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {notificationStatus?.info || ""}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Settings Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general">Pengaturan Umum</TabsTrigger>
                <TabsTrigger value="templates">Template Pesan</TabsTrigger>
              </TabsList>
              
              {/* General Settings */}
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>Pengaturan Umum</CardTitle>
                    <CardDescription>
                      Konfigurasi pengaturan umum notifikasi
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enableWhatsapp">Aktifkan Notifikasi</Label>
                        <Switch
                          id="enableWhatsapp"
                          checked={settings.enableWhatsapp}
                          onCheckedChange={(checked) => 
                            setSettings({...settings, enableWhatsapp: checked})
                          }
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Aktifkan atau nonaktifkan pengiriman notifikasi otomatis
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="defaultPhone">Nomor WhatsApp Default</Label>
                      <Input
                        id="defaultPhone"
                        value={settings.defaultPhone}
                        onChange={(e) => setSettings({...settings, defaultPhone: e.target.value})}
                        placeholder="Contoh: 628123456789"
                      />
                      <p className="text-sm text-muted-foreground">
                        Nomor WhatsApp default untuk pengiriman notifikasi (jika pelanggan tidak memiliki nomor)
                      </p>
                    </div>
                    
                    <Button 
                      onClick={handleSaveSettings}
                      disabled={saveSettingsMutation.isPending}
                    >
                      {saveSettingsMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Simpan Pengaturan
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Template Settings */}
              <TabsContent value="templates">
                <Card>
                  <CardHeader>
                    <CardTitle>Template Pesan</CardTitle>
                    <CardDescription>
                      Kustomisasi template pesan untuk setiap status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">
                        <span className="font-medium">Variabel yang tersedia:</span>
                        <span className="ml-2 text-muted-foreground">
                          {"{customerName}"}, {"{licensePlate}"}, {"{servicesList}"}, {"{trackingCode}"}, {"{trackingUrl}"}
                        </span>
                      </p>
                      <Button variant="outline" onClick={handleResetTemplates}>
                        Reset ke Default
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Pending Template */}
                      <div>
                        <Label htmlFor="pendingTemplate" className="mb-2 inline-block">
                          Template Status Menunggu (Pending)
                        </Label>
                        <Textarea
                          id="pendingTemplate"
                          rows={8}
                          value={settings.templates.pending}
                          onChange={(e) => setSettings({
                            ...settings,
                            templates: {...settings.templates, pending: e.target.value}
                          })}
                        />
                      </div>
                      
                      {/* In Progress Template */}
                      <div>
                        <Label htmlFor="inProgressTemplate" className="mb-2 inline-block">
                          Template Status Dalam Proses (In Progress)
                        </Label>
                        <Textarea
                          id="inProgressTemplate"
                          rows={8}
                          value={settings.templates.in_progress}
                          onChange={(e) => setSettings({
                            ...settings,
                            templates: {...settings.templates, in_progress: e.target.value}
                          })}
                        />
                      </div>
                      
                      {/* Completed Template */}
                      <div>
                        <Label htmlFor="completedTemplate" className="mb-2 inline-block">
                          Template Status Selesai (Completed)
                        </Label>
                        <Textarea
                          id="completedTemplate"
                          rows={8}
                          value={settings.templates.completed}
                          onChange={(e) => setSettings({
                            ...settings,
                            templates: {...settings.templates, completed: e.target.value}
                          })}
                        />
                      </div>
                      
                      {/* Cancelled Template */}
                      <div>
                        <Label htmlFor="cancelledTemplate" className="mb-2 inline-block">
                          Template Status Dibatalkan (Cancelled)
                        </Label>
                        <Textarea
                          id="cancelledTemplate"
                          rows={8}
                          value={settings.templates.cancelled}
                          onChange={(e) => setSettings({
                            ...settings,
                            templates: {...settings.templates, cancelled: e.target.value}
                          })}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleSaveSettings}
                      disabled={saveSettingsMutation.isPending}
                    >
                      {saveSettingsMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Simpan Template
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}