import * as XLSX from 'xlsx';

interface ExportOptions {
  fileName?: string;
  sheetName?: string;
  title?: string;
  subtitle?: string;
  companyName?: string;
  companyAddress?: string;
  dateRange?: string;
  footerText?: string;
}

interface CellStyle {
  alignment?: {
    horizontal?: 'left' | 'center' | 'right';
    vertical?: 'top' | 'center' | 'bottom';
    wrapText?: boolean;
  };
  font?: {
    bold?: boolean;
    color?: { rgb: string };
    sz?: number;
    name?: string;
  };
  fill?: {
    fgColor?: { rgb: string };
    patternType?: 'solid' | 'gray125' | 'darkGray' | 'mediumGray' | 'lightGray';
  };
  border?: {
    top?: { style: 'thin' | 'medium' | 'thick' | 'dotted' | 'dashed', color: { rgb: string } };
    bottom?: { style: 'thin' | 'medium' | 'thick' | 'dotted' | 'dashed', color: { rgb: string } };
    left?: { style: 'thin' | 'medium' | 'thick' | 'dotted' | 'dashed', color: { rgb: string } };
    right?: { style: 'thin' | 'medium' | 'thick' | 'dotted' | 'dashed', color: { rgb: string } };
  };
  numFmt?: string;
}

export function exportTransactionsToExcel(
  transactions: any[],
  options: ExportOptions = {}
) {
  // Default options
  const fileName = options.fileName || 'Laporan_Transaksi_Wash_Corner';
  const sheetName = options.sheetName || 'Data Transaksi';
  const dateRange = options.dateRange || `${new Date().toLocaleDateString('id-ID')}`;

  // Buat workbook baru
  const wb = XLSX.utils.book_new();
  
  // Siapkan header untuk laporan (format profesional)
  const headers = [
    ['Wash Corner Car & Motorcycle Washing', '', '', '', '', '', '', '', '', ''],
    ['Jl. Merdeka No. 123, Jakarta', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', ''],
    ['LAPORAN TRANSAKSI WASH CORNER', '', '', '', '', '', '', '', '', ''],
    [`Periode: ${dateRange}`, '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', ''],
    ['NO', 'TANGGAL', 'PELANGGAN', 'KENDARAAN', 'NOPOL', 'JENIS', 'LAYANAN', 'STATUS', 'PEMBAYARAN', 'TOTAL']
  ];
  
  // Definisikan index untuk header tabel
  const headerRowIndex = 6; // Index dari baris header (NO, TANGGAL, dll.)
  
  // Siapkan data transaksi - format profesional
  const data = transactions.map((transaction, index) => {
    const customerName = transaction.customer?.name || '-';
    
    // Konversi format tanggal menjadi DD-MM-YYYY
    const date = transaction.date 
      ? new Date(transaction.date).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).replace(/\//g, '-')
      : '-';
    
    // Data kendaraan pelanggan
    const vehicleType = transaction.customer?.vehicleType === 'car' ? 'Mobil' : 
                        transaction.customer?.vehicleType === 'motorcycle' ? 'Motor' : '-';
    const vehicleBrand = transaction.customer?.vehicleBrand || '-';
    const vehicleModel = transaction.customer?.vehicleModel || '-';
    const licensePlate = transaction.customer?.licensePlate || '-';
    
    // Format kendaraan sesuai contoh - hanya model dan merk
    const customerVehicle = `${vehicleBrand} ${vehicleModel}`;
    
    // Format layanan - sesuai dengan screenshot
    let services = '-';
    if (transaction.items && transaction.items.length > 0) {
      services = transaction.items.map((item: any) => 
        item.serviceName || '-'
      ).join(', ');
    }
    
    // Format harga - hanya angka dengan pemisah ribuan
    const total = new Intl.NumberFormat('id-ID').format(transaction.total);
    
    // Status pembayaran - gunakan format profesional
    const status = transaction.status === 'completed' ? 'Completed' : 
                  transaction.status === 'pending' ? 'Pending' : 
                  transaction.status || 'Completed';
    
    // Metode pembayaran - format profesional
    const paymentMethod = transaction.paymentMethod === 'cash' ? 'CASH' : 
                         transaction.paymentMethod === 'credit_card' ? 'CARD' : 
                         transaction.paymentMethod || 'CASH';
    
    return [
      index + 1, 
      date, 
      customerName, 
      customerVehicle, 
      licensePlate,
      vehicleType,
      services, 
      status,
      paymentMethod,
      total
    ];
  });
  
  // Buat footer dengan ringkasan - format profesional
  const totalAmount = transactions.reduce((sum, t) => sum + t.total, 0);
  // Format total - hanya angka dengan pemisah ribuan, tanpa Rp
  const formattedTotal = new Intl.NumberFormat('id-ID').format(totalAmount);
  
  const footers = [
    ['', '', '', '', '', '', '', '', 'TOTAL', formattedTotal],
    ['', '', '', '', '', '', '', '', '', ''],  // Spasi kosong dibawah total
    ['', '', '', '', '', '', '', '', '', ''],  // Spasi kosong untuk sertifikat/footer
    ['', '', '', '', `Dicetak pada: ${new Date().toLocaleString('id-ID')}`, '', '', '', '', '']
  ];
  
  // Gabungkan semua baris
  const ws_data = [...headers, ...data, ...footers];
  
  // Buat worksheet
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  
  // Styling - definisikan lebar kolom
  const colWidths = [
    { wch: 5 },    // No
    { wch: 12 },   // Tanggal
    { wch: 20 },   // Pelanggan
    { wch: 25 },   // Kendaraan
    { wch: 12 },   // Nopol
    { wch: 8 },    // Jenis
    { wch: 25 },   // Layanan
    { wch: 12 },   // Status
    { wch: 15 },   // Pembayaran
    { wch: 15 },   // Total
  ];
  ws['!cols'] = colWidths;
  
  // Merge cells untuk header
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }, // Nama perusahaan
    { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } }, // Alamat
    { s: { r: 3, c: 0 }, e: { r: 3, c: 9 } }, // Judul
    { s: { r: 4, c: 0 }, e: { r: 4, c: 9 } }, // Subjudul/periode
  ];
  
  // Tambahkan style untuk cell
  if (!ws['!props']) ws['!props'] = {};
  if (!ws['!cols']) ws['!cols'] = colWidths;
  
  // Dapatkan batas dari data
  const lastRow = headerRowIndex + data.length;
  const totalRow = lastRow;
  
  // Membuat border untuk semua cell tabel
  for (let r = 0; r <= totalRow + footers.length; r++) {
    for (let c = 0; c <= 9; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      if (!ws[cellRef]) ws[cellRef] = { v: '' };
      if (!ws[cellRef].s) ws[cellRef].s = {};
      
      // Style default untuk semua cell
      ws[cellRef].s = {
        ...ws[cellRef].s,
        alignment: {
          vertical: 'center',
          horizontal: c === 0 ? 'center' : c === 9 ? 'right' : c === 4 || c === 5 ? 'center' : 'left',
          wrapText: true
        }
      };
      
      // Tambahkan border hanya untuk tabel
      if (r >= headerRowIndex && r <= totalRow) {
        ws[cellRef].s.border = {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
        };
      }
      
      // Header tabel styling - warna abu-abu dan bold text
      if (r === headerRowIndex) {
        ws[cellRef].s.fill = {
          patternType: 'solid',
          fgColor: { rgb: 'D9D9D9' }, // Light gray background untuk header
        };
        ws[cellRef].s.font = {
          bold: true,
          sz: 10,
        };
        
        // Tambahkan border tebal di bagian atas untuk header
        if (!ws[cellRef].s.border) ws[cellRef].s.border = {};
        ws[cellRef].s.border.top = { style: 'medium', color: { rgb: '000000' } };
      }
      
      // Format khusus untuk baris total (footer)
      if (r === totalRow) {
        // Border tebal di bagian bawah untuk total
        if (!ws[cellRef].s.border) ws[cellRef].s.border = {};
        ws[cellRef].s.border.bottom = { style: 'medium', color: { rgb: '000000' } };
        
        // Format 'TOTAL' dan nilai total dengan bold
        if (c === 8 || c === 9) {
          ws[cellRef].s.font = {
            bold: true,
            sz: 10,
          };
        }
      }
    }
  }
  
  // Style khusus untuk header perusahaan dan judul
  // - Nama perusahaan
  const companyNameCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
  if (!ws[companyNameCell].s) ws[companyNameCell].s = {};
  ws[companyNameCell].s = {
    ...ws[companyNameCell].s,
    font: { 
      bold: true, 
      sz: 12 
    },
    alignment: { 
      horizontal: 'left', 
      vertical: 'center' 
    }
  };
  
  // - Alamat perusahaan
  const addressCell = XLSX.utils.encode_cell({ r: 1, c: 0 });
  if (!ws[addressCell].s) ws[addressCell].s = {};
  ws[addressCell].s = {
    ...ws[addressCell].s,
    font: { 
      sz: 10 
    },
    alignment: { 
      horizontal: 'left', 
      vertical: 'center' 
    }
  };
  
  // - Judul Laporan
  const titleCell = XLSX.utils.encode_cell({ r: 3, c: 0 });
  if (!ws[titleCell].s) ws[titleCell].s = {};
  ws[titleCell].s = {
    ...ws[titleCell].s,
    font: { 
      bold: true, 
      sz: 14 
    },
    alignment: { 
      horizontal: 'left',
      vertical: 'center' 
    }
  };
  
  // - Periode
  const periodCell = XLSX.utils.encode_cell({ r: 4, c: 0 });
  if (!ws[periodCell].s) ws[periodCell].s = {};
  ws[periodCell].s = {
    ...ws[periodCell].s,
    font: { 
      sz: 10 
    },
    alignment: { 
      horizontal: 'left',
      vertical: 'center' 
    }
  };
  
  // Tambahkan worksheet ke workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Unduh file Excel
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export function exportServicesToExcel(
  services: any[],
  options: ExportOptions = {}
) {
  // Default options
  const fileName = options.fileName || 'Laporan_Layanan_Wash_Corner';
  const sheetName = options.sheetName || 'Data Layanan';
  const dateRange = options.dateRange || `${new Date().toLocaleDateString('id-ID')}`;

  // Buat workbook baru
  const wb = XLSX.utils.book_new();
  
  // Siapkan header untuk laporan
  const headers = [
    ['Wash Corner Car & Motorcycle Washing', '', '', '', ''],
    ['Jl. Merdeka No. 123, Jakarta', '', '', '', ''],
    ['', '', '', '', ''],
    ['LAPORAN LAYANAN WASH CORNER', '', '', '', ''],
    [`Periode: ${dateRange}`, '', '', '', ''],
    ['', '', '', '', ''],
    ['NO', 'NAMA LAYANAN', 'HARGA', 'JENIS KENDARAAN', 'DURASI']
  ];
  
  // Definisikan index untuk header tabel
  const headerRowIndex = 6;
  
  // Siapkan data layanan dengan format yang lebih profesional
  const data = services.map((service, index) => {
    // Format harga - hanya angka dengan pemisah ribuan
    const price = new Intl.NumberFormat('id-ID').format(service.price);
    
    // Format jenis kendaraan
    const vehicleType = service.vehicleType === 'car' ? 'Mobil' : 
                      service.vehicleType === 'motorcycle' ? 'Motor' : 
                      service.vehicleType || '-';
                      
    // Format durasi dalam menit
    const duration = `${service.duration || '-'} menit`;
    
    return [
      index + 1, 
      service.name || '-', 
      price, 
      vehicleType,
      duration
    ];
  });
  
  // Buat footer sederhana
  const footers = [
    ['', '', '', '', ''],  // Spasi
    ['', '', '', '', ''],  // Spasi
    ['', `Dicetak pada: ${new Date().toLocaleString('id-ID')}`, '', '', '']
  ];
  
  // Gabungkan semua baris
  const ws_data = [...headers, ...data, ...footers];
  
  // Buat worksheet
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  
  // Styling - definisikan lebar kolom
  const colWidths = [
    { wch: 5 },   // No
    { wch: 40 },  // Nama Layanan
    { wch: 20 },  // Harga
    { wch: 15 },  // Jenis Kendaraan
    { wch: 15 },  // Durasi
  ];
  ws['!cols'] = colWidths;
  
  // Merge cells untuk header
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // Nama perusahaan
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }, // Alamat
    { s: { r: 3, c: 0 }, e: { r: 3, c: 4 } }, // Judul
    { s: { r: 4, c: 0 }, e: { r: 4, c: 4 } }, // Periode
  ];
  
  // Tambahkan style untuk cell
  if (!ws['!props']) ws['!props'] = {};
  if (!ws['!cols']) ws['!cols'] = colWidths;
  
  // Dapatkan batas dari data
  const lastRow = headerRowIndex + data.length;
  
  // Styling untuk semua cells
  for (let r = 0; r <= lastRow + footers.length; r++) {
    for (let c = 0; c <= 4; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      if (!ws[cellRef]) ws[cellRef] = { v: '' };
      if (!ws[cellRef].s) ws[cellRef].s = {};
      
      // Default alignment
      ws[cellRef].s.alignment = {
        vertical: 'center',
        horizontal: c === 0 ? 'center' : c === 2 ? 'right' : 'left',
        wrapText: true
      };
      
      // Tambahkan border untuk tabel
      if (r >= headerRowIndex && r <= lastRow) {
        ws[cellRef].s.border = {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
        };
        
        // Border tebal untuk header dan baris terakhir
        if (r === headerRowIndex || r === lastRow) {
          if (r === headerRowIndex) {
            ws[cellRef].s.border.top = { style: 'medium', color: { rgb: '000000' } };
          }
          if (r === lastRow) {
            ws[cellRef].s.border.bottom = { style: 'medium', color: { rgb: '000000' } };
          }
        }
      }
      
      // Header styling
      if (r === headerRowIndex) {
        ws[cellRef].s.fill = {
          patternType: 'solid',
          fgColor: { rgb: 'D9D9D9' }, // Light gray
        };
        ws[cellRef].s.font = {
          bold: true,
          sz: 10,
        };
      }
    }
  }
  
  // Style khusus untuk header perusahaan dan judul
  // - Nama perusahaan
  const companyNameCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
  if (!ws[companyNameCell].s) ws[companyNameCell].s = {};
  ws[companyNameCell].s = {
    ...ws[companyNameCell].s,
    font: { 
      bold: true, 
      sz: 12 
    },
    alignment: { 
      horizontal: 'left', 
      vertical: 'center' 
    }
  };
  
  // - Alamat perusahaan
  const addressCell = XLSX.utils.encode_cell({ r: 1, c: 0 });
  if (!ws[addressCell].s) ws[addressCell].s = {};
  ws[addressCell].s = {
    ...ws[addressCell].s,
    font: { 
      sz: 10 
    },
    alignment: { 
      horizontal: 'left', 
      vertical: 'center' 
    }
  };
  
  // - Judul Laporan
  const titleCell = XLSX.utils.encode_cell({ r: 3, c: 0 });
  if (!ws[titleCell].s) ws[titleCell].s = {};
  ws[titleCell].s = {
    ...ws[titleCell].s,
    font: { 
      bold: true, 
      sz: 14 
    },
    alignment: { 
      horizontal: 'left',
      vertical: 'center' 
    }
  };
  
  // - Periode
  const periodCell = XLSX.utils.encode_cell({ r: 4, c: 0 });
  if (!ws[periodCell].s) ws[periodCell].s = {};
  ws[periodCell].s = {
    ...ws[periodCell].s,
    font: { 
      sz: 10 
    },
    alignment: { 
      horizontal: 'left',
      vertical: 'center' 
    }
  };
  
  // Tambahkan worksheet ke workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Unduh file Excel
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export function exportIncomeReportToExcel(
  transactions: any[],
  options: ExportOptions = {}
) {
  // Default options
  const fileName = options.fileName || 'Laporan_Pendapatan_Wash_Corner';
  const sheetName = options.sheetName || 'Data Pendapatan';
  const dateRange = options.dateRange || `${new Date().toLocaleDateString('id-ID')}`;

  // Buat workbook baru
  const wb = XLSX.utils.book_new();
  
  // Hitung pendapatan berdasarkan jenis layanan (bukan total transaksi)
  // Fungsi untuk menghitung total harga layanan dari transaksi
  const getServiceTotalPrice = (t: any) => {
    if (!t.items || t.items.length === 0) return 0;
    
    return t.items.reduce((sum: number, item: any) => {
      // Gunakan harga layanan dari serviceDetails jika tersedia
      const actualPrice = item.serviceDetails?.price || item.price;
      const quantity = item.quantity || 1;
      const discount = item.discount || 0;
      
      // Hitung total setelah diskon
      return sum + (actualPrice * quantity * (1 - discount/100));
    }, 0);
  };
  
  // Pengelompokan transaksi berdasarkan jenis kendaraan dari LAYANAN
  const carTransactions = transactions.filter(t => {
    // Periksa apakah ada layanan yang tipe kendaraannya mobil
    if (t.items && t.items.length > 0) {
      // Cek tipe kendaraan pada serviceDetails
      return t.items.some((item: any) => 
        item.serviceDetails?.vehicleType === 'car' || 
        // Fallback jika serviceDetails tidak ada
        (item.serviceDetails === undefined && t.customer?.vehicleType === 'car')
      );
    }
    // Fallback ke tipe kendaraan customer
    return t.customer?.vehicleType === 'car';
  });
  
  const motorcycleTransactions = transactions.filter(t => {
    // Periksa apakah ada layanan yang tipe kendaraannya motor
    if (t.items && t.items.length > 0) {
      // Cek tipe kendaraan pada serviceDetails
      return t.items.some((item: any) => 
        item.serviceDetails?.vehicleType === 'motorcycle' || 
        // Fallback jika serviceDetails tidak ada
        (item.serviceDetails === undefined && t.customer?.vehicleType === 'motorcycle')
      );
    }
    // Fallback ke tipe kendaraan customer
    return t.customer?.vehicleType === 'motorcycle';
  });
  
  // Hitung pendapatan berdasarkan harga layanan yang sebenarnya
  const carIncome = carTransactions.reduce((sum, t) => sum + getServiceTotalPrice(t), 0);
  const motorcycleIncome = motorcycleTransactions.reduce((sum, t) => sum + getServiceTotalPrice(t), 0);
  const totalIncome = carIncome + motorcycleIncome;
  
  // Format pendapatan dengan pemisah ribuan
  const formattedCarIncome = new Intl.NumberFormat('id-ID').format(carIncome);
  const formattedMotorcycleIncome = new Intl.NumberFormat('id-ID').format(motorcycleIncome);
  const formattedTotalIncome = new Intl.NumberFormat('id-ID').format(totalIncome);
  
  // Hitung jumlah transaksi
  const carCount = carTransactions.length;
  const motorcycleCount = motorcycleTransactions.length;
  const totalCount = transactions.length;
  
  // Siapkan header untuk laporan
  const headers = [
    ['Wash Corner Car & Motorcycle Washing', '', '', ''],
    ['Jl. Merdeka No. 123, Jakarta', '', '', ''],
    ['', '', '', ''],
    ['LAPORAN PENDAPATAN WASH CORNER', '', '', ''],
    [`Periode: ${dateRange}`, '', '', ''],
    ['', '', '', ''],
    ['KATEGORI', 'JUMLAH TRANSAKSI', 'PENDAPATAN', 'PERSENTASE']
  ];
  
  // Definisikan index untuk header tabel
  const headerRowIndex = 6;
  
  // Siapkan data laporan pendapatan
  const carPercentage = totalIncome > 0 ? ((carIncome / totalIncome) * 100).toFixed(2) : '0.00';
  const motorcyclePercentage = totalIncome > 0 ? ((motorcycleIncome / totalIncome) * 100).toFixed(2) : '0.00';
  
  const data = [
    ['Mobil', carCount, formattedCarIncome, `${carPercentage}%`],
    ['Motor', motorcycleCount, formattedMotorcycleIncome, `${motorcyclePercentage}%`],
    ['TOTAL', totalCount, formattedTotalIncome, '100.00%']
  ];
  
  // Buat footer sederhana
  const footers = [
    ['', '', '', ''],  // Spasi
    ['', '', '', ''],  // Spasi
    ['', `Dicetak pada: ${new Date().toLocaleString('id-ID')}`, '', '']
  ];
  
  // Gabungkan semua baris
  const ws_data = [...headers, ...data, ...footers];
  
  // Buat worksheet
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  
  // Styling - definisikan lebar kolom
  const colWidths = [
    { wch: 20 },  // Kategori
    { wch: 25 },  // Jumlah Transaksi
    { wch: 25 },  // Pendapatan
    { wch: 15 },  // Persentase
  ];
  ws['!cols'] = colWidths;
  
  // Merge cells untuk header
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Nama perusahaan
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }, // Alamat
    { s: { r: 3, c: 0 }, e: { r: 3, c: 3 } }, // Judul
    { s: { r: 4, c: 0 }, e: { r: 4, c: 3 } }, // Periode
  ];
  
  // Tambahkan style untuk cell
  if (!ws['!props']) ws['!props'] = {};
  if (!ws['!cols']) ws['!cols'] = colWidths;
  
  // Dapatkan batas dari data
  const totalRow = headerRowIndex + data.length - 1; // Baris TOTAL
  const lastRow = headerRowIndex + data.length;
  
  // Styling untuk semua cells
  for (let r = 0; r <= lastRow + footers.length - 1; r++) {
    for (let c = 0; c <= 3; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      if (!ws[cellRef]) ws[cellRef] = { v: '' };
      if (!ws[cellRef].s) ws[cellRef].s = {};
      
      // Default alignment
      ws[cellRef].s.alignment = {
        vertical: 'center',
        horizontal: c === 0 ? 'left' : c === 3 ? 'right' : 'center',
        wrapText: true
      };
      
      // Tambahkan border untuk tabel
      if (r >= headerRowIndex && r <= lastRow - 1) {
        ws[cellRef].s.border = {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
        };
        
        // Border tebal untuk header dan baris total
        if (r === headerRowIndex) {
          ws[cellRef].s.border.top = { style: 'medium', color: { rgb: '000000' } };
        }
        if (r === totalRow) {
          ws[cellRef].s.border.bottom = { style: 'medium', color: { rgb: '000000' } };
          ws[cellRef].s.font = {
            bold: true,
            sz: 10,
          };
        }
      }
      
      // Header styling
      if (r === headerRowIndex) {
        ws[cellRef].s.fill = {
          patternType: 'solid',
          fgColor: { rgb: 'D9D9D9' }, // Light gray
        };
        ws[cellRef].s.font = {
          bold: true,
          sz: 10,
        };
      }
    }
  }
  
  // Style khusus untuk header perusahaan dan judul
  // - Nama perusahaan
  const companyNameCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
  if (!ws[companyNameCell].s) ws[companyNameCell].s = {};
  ws[companyNameCell].s = {
    ...ws[companyNameCell].s,
    font: { 
      bold: true, 
      sz: 12 
    },
    alignment: { 
      horizontal: 'left', 
      vertical: 'center' 
    }
  };
  
  // - Alamat perusahaan
  const addressCell = XLSX.utils.encode_cell({ r: 1, c: 0 });
  if (!ws[addressCell].s) ws[addressCell].s = {};
  ws[addressCell].s = {
    ...ws[addressCell].s,
    font: { 
      sz: 10 
    },
    alignment: { 
      horizontal: 'left', 
      vertical: 'center' 
    }
  };
  
  // - Judul Laporan
  const titleCell = XLSX.utils.encode_cell({ r: 3, c: 0 });
  if (!ws[titleCell].s) ws[titleCell].s = {};
  ws[titleCell].s = {
    ...ws[titleCell].s,
    font: { 
      bold: true, 
      sz: 14 
    },
    alignment: { 
      horizontal: 'left',
      vertical: 'center' 
    }
  };
  
  // - Periode
  const periodCell = XLSX.utils.encode_cell({ r: 4, c: 0 });
  if (!ws[periodCell].s) ws[periodCell].s = {};
  ws[periodCell].s = {
    ...ws[periodCell].s,
    font: { 
      sz: 10 
    },
    alignment: { 
      horizontal: 'left',
      vertical: 'center' 
    }
  };
  
  // Tambahkan worksheet ke workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Unduh file Excel
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}