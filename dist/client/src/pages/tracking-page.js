"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TrackingPage;
const react_1 = require("react");
const wouter_1 = require("wouter");
const react_query_1 = require("@tanstack/react-query");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const skeleton_1 = require("@/components/ui/skeleton");
const lucide_react_1 = require("lucide-react");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
function TrackingPage() {
    const [, params] = (0, wouter_1.useRoute)("/tracking/:code");
    const [trackingCode, setTrackingCode] = (0, react_1.useState)(params?.code || "");
    const [searchMode, setSearchMode] = (0, react_1.useState)(!params?.code);
    // Function to get status label and icon
    const getStatusInfo = (status) => {
        switch (status) {
            case "pending":
                return {
                    label: "Menunggu",
                    icon: <lucide_react_1.Clock className="h-8 w-8 text-amber-500"/>,
                    color: "bg-amber-100 text-amber-800"
                };
            case "in_progress":
                return {
                    label: "Sedang Dikerjakan",
                    icon: <lucide_react_1.WrenchIcon className="h-8 w-8 text-blue-500"/>,
                    color: "bg-blue-100 text-blue-800"
                };
            case "completed":
                return {
                    label: "Selesai",
                    icon: <lucide_react_1.CheckCircle className="h-8 w-8 text-green-500"/>,
                    color: "bg-green-100 text-green-800"
                };
            case "cancelled":
                return {
                    label: "Dibatalkan",
                    icon: <lucide_react_1.XCircle className="h-8 w-8 text-red-500"/>,
                    color: "bg-red-100 text-red-800"
                };
            default:
                return {
                    label: "Tidak Diketahui",
                    icon: <lucide_react_1.Clock className="h-8 w-8 text-gray-500"/>,
                    color: "bg-gray-100 text-gray-800"
                };
        }
    };
    // Fetch tracking data if we have a code
    const { data, isLoading, error, refetch } = (0, react_query_1.useQuery)({
        queryKey: ['/api/public/tracking', trackingCode],
        queryFn: async () => {
            if (!trackingCode)
                return null;
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
    const handleSearch = (e) => {
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
    return (<div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <lucide_react_1.Car className="h-6 w-6"/>
              <h1 className="text-xl font-bold">Wash Corner</h1>
            </div>
            <button_1.Button variant="outline" className="text-white" onClick={handleReset}>
              <lucide_react_1.ArrowLeft className="h-4 w-4 mr-2"/>
              Kembali
            </button_1.Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-2xl mx-auto">
          {searchMode ? (<card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="text-center">Cek Status Cucian</card_1.CardTitle>
                <card_1.CardDescription className="text-center">
                  Masukkan kode tracking untuk melihat status cucian Anda
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="space-y-2">
                    <label_1.Label htmlFor="trackingCode">Kode Tracking</label_1.Label>
                    <div className="flex space-x-2">
                      <input_1.Input id="trackingCode" placeholder="Masukkan kode tracking (contoh: WC-ABCDEF)" value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} className="flex-1"/>
                      <button_1.Button type="submit">Cek Status</button_1.Button>
                    </div>
                  </div>
                </form>
              </card_1.CardContent>
            </card_1.Card>) : (<>
              {isLoading ? (<card_1.Card>
                  <card_1.CardHeader>
                    <skeleton_1.Skeleton className="h-8 w-3/4 mx-auto"/>
                    <skeleton_1.Skeleton className="h-4 w-1/2 mx-auto mt-2"/>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <skeleton_1.Skeleton className="h-20 w-20 rounded-full"/>
                      </div>
                      <div className="space-y-2">
                        <skeleton_1.Skeleton className="h-4 w-full"/>
                        <skeleton_1.Skeleton className="h-4 w-full"/>
                        <skeleton_1.Skeleton className="h-4 w-3/4"/>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>) : error ? (<card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="text-center text-red-600">Error</card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="text-center space-y-4">
                      <lucide_react_1.XCircle className="h-16 w-16 text-red-500 mx-auto"/>
                      <p>{error instanceof Error ? error.message : "Terjadi kesalahan saat mencari kode tracking"}</p>
                      <button_1.Button onClick={handleReset}>Coba Lagi</button_1.Button>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>) : data ? (<card_1.Card>
                  <card_1.CardHeader>
                    <div className="flex justify-center mb-2">
                      {getStatusInfo(data.status).icon}
                    </div>
                    <card_1.CardTitle className="text-center">
                      Status Cucian: <span className={`py-1 px-2 text-sm rounded-md ${getStatusInfo(data.status).color}`}>{getStatusInfo(data.status).label}</span>
                    </card_1.CardTitle>
                    <card_1.CardDescription className="text-center">
                      Kode Tracking: {data.trackingCode}
                    </card_1.CardDescription>
                  </card_1.CardHeader>
                  <card_1.CardContent>
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
                          {data.services && data.services.length > 0 ? (data.services.map((service, index) => (<li key={index} className="flex items-center">
                                <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500 mr-2"/>
                                {service}
                              </li>))) : (<li className="text-gray-500">Tidak ada layanan</li>)}
                        </ul>
                      </div>
                      
                      {/* Time */}
                      <div>
                        <h3 className="font-medium text-sm text-gray-500 mb-2">TANGGAL & WAKTU</h3>
                        <p>{data.date ? (0, date_fns_1.format)(new Date(data.date), "EEEE, dd MMMM yyyy • HH:mm", { locale: locale_1.id }) : "Tidak diketahui"}</p>
                      </div>
                      
                      {/* Auto refresh info */}
                      <div className="text-center text-sm text-gray-500 pt-4 border-t">
                        <p>Halaman ini akan memperbarui otomatis setiap 30 detik</p>
                        <button_1.Button variant="ghost" size="sm" className="mt-1" onClick={() => refetch()}>
                          <lucide_react_1.Loader2 className="h-3 w-3 mr-1"/> Refresh sekarang
                        </button_1.Button>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>) : null}
            </>)}
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
    </div>);
}
