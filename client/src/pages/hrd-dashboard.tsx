import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Calendar, FileCheck, Award, GraduationCap, Newspaper, AlertTriangle } from 'lucide-react';

export default function HrdDashboard() {
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/hrd/dashboard/stats'],
    refetchInterval: 60000, // Refresh every minute
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <TopNav title="HRD Management" />
        
        <div className="container mx-auto px-4 py-6">
          <PageHeader 
            title="HRD Dashboard" 
            subtitle="Kelola sumber daya manusia dan operasional karyawan"
            actions={[
              { 
                label: 'Tambah Karyawan', 
                icon: 'user-plus', 
                onClick: () => {}, 
                primary: true 
              }
            ]} 
          />

          {isLoadingStats ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Statistik HRD */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Karyawan</p>
                        <h3 className="text-2xl font-bold mt-1">{stats?.totalEmployees || 0}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="text-green-500 font-medium">{stats?.activeEmployees || 0}</span> aktif
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Kehadiran Hari Ini</p>
                        <h3 className="text-2xl font-bold mt-1">{stats?.presentToday || 0}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="text-orange-500 font-medium">{stats?.lateToday || 0}</span> terlambat
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Cuti Tertunda</p>
                        <h3 className="text-2xl font-bold mt-1">{stats?.pendingLeaveRequests || 0}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="text-blue-500 font-medium">menunggu persetujuan</span>
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <FileCheck className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Dokumen Kadaluarsa</p>
                        <h3 className="text-2xl font-bold mt-1">{stats?.expiringSoonDocuments || 0}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="text-red-500 font-medium">dalam 30 hari</span>
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="attendance" className="mt-8">
                <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-4">
                  <TabsTrigger value="attendance">Absensi</TabsTrigger>
                  <TabsTrigger value="leave">Pengajuan Cuti</TabsTrigger>
                  <TabsTrigger value="payroll">Penggajian</TabsTrigger>
                  <TabsTrigger value="training">Pelatihan</TabsTrigger>
                  <TabsTrigger value="performance">Performa</TabsTrigger>
                </TabsList>

                <TabsContent value="attendance">
                  <Card>
                    <CardHeader>
                      <CardTitle>Absensi Hari Ini</CardTitle>
                      <CardDescription>
                        Rekap kehadiran karyawan untuk tanggal {new Date().toLocaleDateString('id-ID')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="text-center py-10">
                        <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">Belum ada data absensi</h3>
                        <p className="text-muted-foreground mt-1">Tambahkan data absensi karyawan untuk hari ini</p>
                        <Button className="mt-4">Catat Absensi</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="leave">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pengajuan Cuti Tertunda</CardTitle>
                      <CardDescription>
                        Pengajuan cuti karyawan yang membutuhkan persetujuan
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="text-center py-10">
                        <FileCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">Belum ada pengajuan cuti</h3>
                        <p className="text-muted-foreground mt-1">Semua pengajuan cuti sudah diproses</p>
                        <Button className="mt-4">Lihat Semua Cuti</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payroll">
                  <Card>
                    <CardHeader>
                      <CardTitle>Penggajian Bulan Ini</CardTitle>
                      <CardDescription>
                        Ringkasan proses penggajian karyawan untuk bulan {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="text-center py-10">
                        <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">Belum ada data penggajian</h3>
                        <p className="text-muted-foreground mt-1">Tambahkan data penggajian untuk periode ini</p>
                        <Link href="/hrd-payroll">
                          <Button className="mt-4">Kelola Penggajian</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="training">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pelatihan Mendatang</CardTitle>
                      <CardDescription>
                        Jadwal pelatihan karyawan yang akan datang
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="text-center py-10">
                        <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">Belum ada jadwal pelatihan</h3>
                        <p className="text-muted-foreground mt-1">Tambahkan jadwal pelatihan untuk karyawan</p>
                        <Button className="mt-4">Buat Pelatihan</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="performance">
                  <Card>
                    <CardHeader>
                      <CardTitle>Evaluasi Kinerja</CardTitle>
                      <CardDescription>
                        Penilaian kinerja karyawan dalam periode terakhir
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="text-center py-10">
                        <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">Belum ada evaluasi kinerja</h3>
                        <p className="text-muted-foreground mt-1">Buat penilaian kinerja karyawan</p>
                        <Button className="mt-4">Buat Evaluasi</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
}