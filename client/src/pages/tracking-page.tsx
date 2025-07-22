import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Car, CheckCircle, Clock, WrenchIcon, XCircle, ArrowLeft, QrCode } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface TrackingData {
  trackingCode: string;
  status: string;
  date: string;
  vehicle: {
    type: string;
    plate: string;
  };
  services: string[];
}

export default function TrackingPage() {
  const [, params] = useRoute("/tracking/:code");
  const [trackingCode, setTrackingCode] = useState<string>(params?.code || "");
  const [searchMode, setSearchMode] = useState<boolean>(!params?.code);

  // Function to get status label and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Menunggu",
          icon: <Clock className="h-8 w-8 text-amber-500" />,
          color: "bg-amber-100 text-amber-800"
        };
      case "in_progress":
        return {
          label: "Sedang Dikerjakan",
          icon: <WrenchIcon className="h-8 w-8 text-blue-500" />,
          color: "bg-blue-100 text-blue-800"
        };
      case "completed":
        return {
          label: "Selesai",
          icon: <CheckCircle className="h-8 w-8 text-green-500" />,
          color: "bg-green-100 text-green-800"
        };
      case "cancelled":
        return {
          label: "Dibatalkan",
          icon: <XCircle className="h-8 w-8 text-red-500" />,
          color: "bg-red-100 text-red-800"
        };
      default:
        return {
          label: "Tidak Diketahui",
          icon: <Clock className="h-8 w-8 text-gray-500" />,
          color: "bg-gray-100 text-gray-800"
        };
    }
  };

  // Fetch tracking data if we have a code
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/public/tracking', trackingCode],
    queryFn: async () => {
      if (!trackingCode) return null;
      const res = await fetch(`/api/public/tracking/${trackingCode}`);
      if (!res.ok) {
        throw new Error(`Kode tracking "${trackingCode}" tidak ditemukan`);
      }
      return res.json();
    },
    enabled: !!trackingCode && !searchMode,
    refetchInterval: 30000, // Auto refresh every 30 seconds
  });

  // Handle form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode) {
      setSearchMode(false);
      refetch();
    }
  };

  // Reset search
  const handleReset = () => {
    setSearchMode(true);
    setTrackingCode("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="h-6 w-6" />
              <h1 className="text-xl font-bold">Wash Corner</h1>
            </div>
            <Button variant="outline" className="text-white" onClick={handleReset}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-2xl mx-auto">
          {searchMode ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Cek Status Cucian</CardTitle>
                <CardDescription className="text-center">
                  Masukkan kode tracking untuk melihat status cucian Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="trackingCode">Kode Tracking</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="trackingCode"
                        placeholder="Masukkan kode tracking (contoh: WC-ABCDEF)"
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit">Cek Status</Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <>
              {isLoading ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <Skeleton className="h-20 w-20 rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : error ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center text-red-600">Error</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                      <p>{error instanceof Error ? error.message : "Terjadi kesalahan saat mencari kode tracking"}</p>
                      <Button onClick={handleReset}>Coba Lagi</Button>
                    </div>
                  </CardContent>
                </Card>
              ) : data ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-center mb-2">
                      {getStatusInfo(data.status).icon}
                    </div>
                    <CardTitle className="text-center">
                      Status Cucian: <span className={`py-1 px-2 text-sm rounded-md ${getStatusInfo(data.status).color}`}>{getStatusInfo(data.status).label}</span>
                    </CardTitle>
                    <CardDescription className="text-center">
                      Kode Tracking: {data.trackingCode}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Vehicle Info */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-sm text-gray-500 mb-2">INFORMASI KENDARAAN</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm text-gray-500">Jenis</p>
                            <p className="font-medium">{data.vehicle?.type || "Tidak diketahui"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Plat Nomor</p>
                            <p className="font-medium">{data.vehicle?.plate || "Tidak diketahui"}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Services */}
                      <div>
                        <h3 className="font-medium text-sm text-gray-500 mb-2">LAYANAN</h3>
                        <ul className="space-y-1">
                          {data.services && data.services.length > 0 ? (
                            data.services.map((service: string, index: number) => (
                              <li key={index} className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                {service}
                              </li>
                            ))
                          ) : (
                            <li className="text-gray-500">Tidak ada layanan</li>
                          )}
                        </ul>
                      </div>
                      
                      {/* Time */}
                      <div>
                        <h3 className="font-medium text-sm text-gray-500 mb-2">TANGGAL & WAKTU</h3>
                        <p>{data.date ? format(new Date(data.date), "EEEE, dd MMMM yyyy • HH:mm", { locale: id }) : "Tidak diketahui"}</p>
                      </div>
                      
                      {/* Auto refresh info */}
                      <div className="text-center text-sm text-gray-500 pt-4 border-t">
                        <p>Halaman ini akan memperbarui otomatis setiap 30 detik</p>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="mt-1"
                          onClick={() => refetch()}
                        >
                          <Loader2 className="h-3 w-3 mr-1" /> Refresh sekarang
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-4 mt-auto">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Wash Corner. Semua hak dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}