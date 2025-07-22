import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { 
  Loader2, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX 
} from 'lucide-react';
import { getInitials } from '@/lib/utils';

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: employees, isLoading } = useQuery({
    queryKey: ['/api/employees'],
  });

  // Filter employees based on search term
  const filteredEmployees = employees?.filter((employee: any) => 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.phone && employee.phone.includes(searchTerm))
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <TopNav title="Karyawan" />
        
        <div className="container mx-auto px-4 py-6">
          <PageHeader 
            title="Karyawan" 
            subtitle="Kelola data karyawan yang bekerja di Wash Corner" 
            actions={[
              { 
                label: 'Tambah Karyawan', 
                icon: 'user-plus', 
                onClick: () => {}, 
                primary: true 
              }
            ]} 
          />
          
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Cari berdasarkan nama, posisi, atau telepon"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button>
                  Tambah Karyawan
                </Button>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Karyawan</TableHead>
                        <TableHead>Posisi</TableHead>
                        <TableHead>Kontak</TableHead>
                        <TableHead>Tanggal Bergabung</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                            Tidak ada karyawan yang ditemukan
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredEmployees?.map((employee: any) => (
                          <TableRow key={employee.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium bg-primary">
                                  {getInitials(employee.name)}
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium text-gray-900">{employee.name}</p>
                                  <p className="text-gray-500 text-xs">ID: {employee.id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {employee.position}
                            </TableCell>
                            <TableCell>
                              <p>{employee.phone || '-'}</p>
                              <p className="text-gray-500 text-xs">{employee.email || '-'}</p>
                            </TableCell>
                            <TableCell>
                              {new Date(employee.joiningDate).toLocaleDateString('id-ID')}
                            </TableCell>
                            <TableCell>
                              {employee.isActive ? (
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                  Aktif
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                                  Tidak Aktif
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>
                                  {employee.isActive ? (
                                    <DropdownMenuItem>
                                      <UserX className="mr-2 h-4 w-4" />
                                      <span>Nonaktifkan</span>
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem>
                                      <UserCheck className="mr-2 h-4 w-4" />
                                      <span>Aktifkan</span>
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Hapus</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
