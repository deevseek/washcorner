"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HrdDashboard;
const react_query_1 = require("@tanstack/react-query");
const wouter_1 = require("wouter");
const sidebar_1 = require("@/components/layout/sidebar");
const top_nav_1 = require("@/components/layout/top-nav");
const page_header_1 = require("@/components/layout/page-header");
const card_1 = require("@/components/ui/card");
const tabs_1 = require("@/components/ui/tabs");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
function HrdDashboard() {
    const { data: stats, isLoading: isLoadingStats } = (0, react_query_1.useQuery)({
        queryKey: ['/api/hrd/dashboard/stats'],
        refetchInterval: 60000, // Refresh every minute
    });
    return (<div className="min-h-screen flex flex-col md:flex-row">
      <sidebar_1.Sidebar />
      
      <div className="flex-1 md:ml-64">
        <top_nav_1.TopNav title="HRD Management"/>
        
        <div className="container mx-auto px-4 py-6">
          <page_header_1.PageHeader title="HRD Dashboard" subtitle="Kelola sumber daya manusia dan operasional karyawan" actions={[
            {
                label: 'Tambah Karyawan',
                icon: 'user-plus',
                onClick: () => { },
                primary: true
            }
        ]}/>

          {isLoadingStats ? (<div className="flex justify-center items-center h-64">
              <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </div>) : (<>
              {/* Statistik HRD */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <card_1.Card>
                  <card_1.CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Karyawan</p>
                        <h3 className="text-2xl font-bold mt-1">{stats?.totalEmployees || 0}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="text-green-500 font-medium">{stats?.activeEmployees || 0}</span> aktif
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <lucide_react_1.Users className="h-6 w-6 text-blue-600"/>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Kehadiran Hari Ini</p>
                        <h3 className="text-2xl font-bold mt-1">{stats?.presentToday || 0}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="text-orange-500 font-medium">{stats?.lateToday || 0}</span> terlambat
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <lucide_react_1.Calendar className="h-6 w-6 text-green-600"/>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Cuti Tertunda</p>
                        <h3 className="text-2xl font-bold mt-1">{stats?.pendingLeaveRequests || 0}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="text-blue-500 font-medium">menunggu persetujuan</span>
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <lucide_react_1.FileCheck className="h-6 w-6 text-purple-600"/>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Dokumen Kadaluarsa</p>
                        <h3 className="text-2xl font-bold mt-1">{stats?.expiringSoonDocuments || 0}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="text-red-500 font-medium">dalam 30 hari</span>
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <lucide_react_1.AlertTriangle className="h-6 w-6 text-red-600"/>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              </div>

              <tabs_1.Tabs defaultValue="attendance" className="mt-8">
                <tabs_1.TabsList className="grid grid-cols-3 md:grid-cols-5 mb-4">
                  <tabs_1.TabsTrigger value="attendance">Absensi</tabs_1.TabsTrigger>
                  <tabs_1.TabsTrigger value="leave">Pengajuan Cuti</tabs_1.TabsTrigger>
                  <tabs_1.TabsTrigger value="payroll">Penggajian</tabs_1.TabsTrigger>
                  <tabs_1.TabsTrigger value="training">Pelatihan</tabs_1.TabsTrigger>
                  <tabs_1.TabsTrigger value="performance">Performa</tabs_1.TabsTrigger>
                </tabs_1.TabsList>

                <tabs_1.TabsContent value="attendance">
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle>Absensi Hari Ini</card_1.CardTitle>
                      <card_1.CardDescription>
                        Rekap kehadiran karyawan untuk tanggal {new Date().toLocaleDateString('id-ID')}
                      </card_1.CardDescription>
                    </card_1.CardHeader>
                    <card_1.CardContent className="p-6">
                      <div className="text-center py-10">
                        <lucide_react_1.Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4"/>
                        <h3 className="text-lg font-medium">Belum ada data absensi</h3>
                        <p className="text-muted-foreground mt-1">Tambahkan data absensi karyawan untuk hari ini</p>
                        <button_1.Button className="mt-4">Catat Absensi</button_1.Button>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                </tabs_1.TabsContent>

                <tabs_1.TabsContent value="leave">
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle>Pengajuan Cuti Tertunda</card_1.CardTitle>
                      <card_1.CardDescription>
                        Pengajuan cuti karyawan yang membutuhkan persetujuan
                      </card_1.CardDescription>
                    </card_1.CardHeader>
                    <card_1.CardContent className="p-6">
                      <div className="text-center py-10">
                        <lucide_react_1.FileCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4"/>
                        <h3 className="text-lg font-medium">Belum ada pengajuan cuti</h3>
                        <p className="text-muted-foreground mt-1">Semua pengajuan cuti sudah diproses</p>
                        <button_1.Button className="mt-4">Lihat Semua Cuti</button_1.Button>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                </tabs_1.TabsContent>

                <tabs_1.TabsContent value="payroll">
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle>Penggajian Bulan Ini</card_1.CardTitle>
                      <card_1.CardDescription>
                        Ringkasan proses penggajian karyawan untuk bulan {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                      </card_1.CardDescription>
                    </card_1.CardHeader>
                    <card_1.CardContent className="p-6">
                      <div className="text-center py-10">
                        <lucide_react_1.Award className="h-16 w-16 text-muted-foreground mx-auto mb-4"/>
                        <h3 className="text-lg font-medium">Belum ada data penggajian</h3>
                        <p className="text-muted-foreground mt-1">Tambahkan data penggajian untuk periode ini</p>
                        <wouter_1.Link href="/hrd-payroll">
                          <button_1.Button className="mt-4">Kelola Penggajian</button_1.Button>
                        </wouter_1.Link>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                </tabs_1.TabsContent>

                <tabs_1.TabsContent value="training">
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle>Pelatihan Mendatang</card_1.CardTitle>
                      <card_1.CardDescription>
                        Jadwal pelatihan karyawan yang akan datang
                      </card_1.CardDescription>
                    </card_1.CardHeader>
                    <card_1.CardContent className="p-6">
                      <div className="text-center py-10">
                        <lucide_react_1.GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4"/>
                        <h3 className="text-lg font-medium">Belum ada jadwal pelatihan</h3>
                        <p className="text-muted-foreground mt-1">Tambahkan jadwal pelatihan untuk karyawan</p>
                        <button_1.Button className="mt-4">Buat Pelatihan</button_1.Button>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                </tabs_1.TabsContent>

                <tabs_1.TabsContent value="performance">
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle>Evaluasi Kinerja</card_1.CardTitle>
                      <card_1.CardDescription>
                        Penilaian kinerja karyawan dalam periode terakhir
                      </card_1.CardDescription>
                    </card_1.CardHeader>
                    <card_1.CardContent className="p-6">
                      <div className="text-center py-10">
                        <lucide_react_1.Award className="h-16 w-16 text-muted-foreground mx-auto mb-4"/>
                        <h3 className="text-lg font-medium">Belum ada evaluasi kinerja</h3>
                        <p className="text-muted-foreground mt-1">Buat penilaian kinerja karyawan</p>
                        <button_1.Button className="mt-4">Buat Evaluasi</button_1.Button>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                </tabs_1.TabsContent>
              </tabs_1.Tabs>
            </>)}
        </div>
      </div>
    </div>);
}
