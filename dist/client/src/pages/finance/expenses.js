"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ExpensesPage;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const zod_2 = require("zod");
const lucide_react_1 = require("lucide-react");
const queryClient_1 = require("@/lib/queryClient");
const use_toast_1 = require("@/hooks/use-toast");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const dialog_1 = require("@/components/ui/dialog");
const alert_dialog_1 = require("@/components/ui/alert-dialog");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const skeleton_1 = require("@/components/ui/skeleton");
// Import komponen-komponen yang dibutuhkan
const form_1 = require("@/components/ui/form");
const tabs_1 = require("@/components/ui/tabs");
const table_1 = require("@/components/ui/table");
const textarea_1 = require("@/components/ui/textarea");
// Schema untuk form pengeluaran
const expenseFormSchema = zod_2.z.object({
    date: zod_2.z.date({
        required_error: "Tanggal wajib diisi",
    }),
    categoryId: zod_2.z.coerce.number({
        required_error: "Kategori wajib dipilih",
    }),
    amount: zod_2.z.coerce.number({
        required_error: "Jumlah wajib diisi"
    }).min(0, "Jumlah harus lebih dari 0"),
    description: zod_2.z.string().min(3, "Deskripsi minimal 3 karakter").max(255, "Deskripsi maksimal 255 karakter"),
});
// Schema untuk form kategori
const categoryFormSchema = zod_2.z.object({
    name: zod_2.z.string().min(3, "Nama kategori minimal 3 karakter").max(50, "Nama kategori maksimal 50 karakter"),
    description: zod_2.z.string().optional(),
});
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
function ExpensesPage() {
    const [selectedMonth, setSelectedMonth] = (0, react_1.useState)(() => {
        return (0, date_fns_1.format)(new Date(), 'yyyy-MM');
    });
    const [openExpenseDialog, setOpenExpenseDialog] = (0, react_1.useState)(false);
    const [openCategoryDialog, setOpenCategoryDialog] = (0, react_1.useState)(false);
    const [editingExpense, setEditingExpense] = (0, react_1.useState)(null);
    const [editingCategory, setEditingCategory] = (0, react_1.useState)(null);
    const [selectedExpenseId, setSelectedExpenseId] = (0, react_1.useState)(null);
    const [selectedCategoryId, setSelectedCategoryId] = (0, react_1.useState)(null);
    const { toast } = (0, use_toast_1.useToast)();
    const formattedMonth = (() => {
        try {
            const date = (0, date_fns_1.parse)(selectedMonth, 'yyyy-MM', new Date());
            return (0, date_fns_1.format)(date, 'MMMM yyyy', { locale: locale_1.id });
        }
        catch {
            return '';
        }
    })();
    // Form untuk pengeluaran
    const expenseForm = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(expenseFormSchema),
        defaultValues: {
            date: new Date(),
            categoryId: 0,
            amount: 0,
            description: '',
        },
        mode: 'onChange'
    });
    // Form untuk kategori
    const categoryForm = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(categoryFormSchema),
        defaultValues: {
            name: '',
            description: '',
        },
        mode: 'onChange'
    });
    // Query untuk mendapatkan daftar pengeluaran berdasarkan bulan
    const { data: expenses, isLoading: isLoadingExpenses, refetch: refetchExpenses } = (0, react_query_1.useQuery)({
        queryKey: ['/api/finance/expenses', selectedMonth],
        queryFn: async () => {
            const date = (0, date_fns_1.parse)(selectedMonth, 'yyyy-MM', new Date());
            const startDate = (0, date_fns_1.format)((0, date_fns_1.startOfMonth)(date), 'yyyy-MM-dd');
            const endDate = (0, date_fns_1.format)((0, date_fns_1.endOfMonth)(date), 'yyyy-MM-dd');
            const res = await (0, queryClient_1.apiRequest)('GET', `/api/finance/expenses?startDate=${startDate}&endDate=${endDate}`);
            return res.json();
        },
    });
    // Query untuk mendapatkan total pengeluaran bulan ini
    const { data: totalExpense, isLoading: isLoadingTotal, refetch: refetchTotalExpense } = (0, react_query_1.useQuery)({
        queryKey: ['/api/finance/expenses/total', selectedMonth],
        queryFn: async () => {
            try {
                // Pastikan format tanggal valid
                if (!selectedMonth || !selectedMonth.match(/^\d{4}-\d{2}$/)) {
                    throw new Error("Format bulan tidak valid");
                }
                // Extract year dan month dengan numeric parsing
                const [yearStr, monthStr] = selectedMonth.split('-');
                const year = parseInt(yearStr, 10);
                const month = parseInt(monthStr, 10);
                // Validasi angka
                if (isNaN(year) || isNaN(month) || year < 2000 || year > 2100 || month < 1 || month > 12) {
                    throw new Error("Tahun atau bulan tidak valid");
                }
                // Gunakan parameter yang sudah divalidasi
                const res = await (0, queryClient_1.apiRequest)('GET', `/api/finance/expenses/total?year=${year}&month=${month}`);
                const data = await res.json();
                return data;
            }
            catch (error) {
                console.error("Error fetching expense total:", error);
                // Return default empty data on error
                return { total: 0 };
            }
        },
        retry: false, // Tidak retry pada error untuk mencegah loop
    });
    // Query untuk mendapatkan daftar kategori
    const { data: categories, isLoading: isLoadingCategories, refetch: refetchCategories } = (0, react_query_1.useQuery)({
        queryKey: ['/api/finance/expense-categories'],
        queryFn: async () => {
            const res = await (0, queryClient_1.apiRequest)('GET', '/api/finance/expense-categories');
            return res.json();
        },
    });
    // Mutation untuk membuat pengeluaran baru
    const createExpenseMutation = (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            // Temukan kategori berdasarkan id
            const selectedCategory = categories?.find(c => c.id === data.categoryId);
            // Buat objek data dengan format yang sesuai untuk API
            const formattedData = {
                ...data,
                date: (0, date_fns_1.format)(data.date, 'yyyy-MM-dd'),
                category: selectedCategory?.name || '', // Tambahkan field category dari nama kategori
            };
            const res = await (0, queryClient_1.apiRequest)('POST', '/api/finance/expenses', formattedData);
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: 'Berhasil',
                description: 'Pengeluaran berhasil ditambahkan',
            });
            // Invalidate semua query yang terkait dengan expenses dengan lebih spesifik
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/finance/expenses'] });
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/finance/expenses/total', selectedMonth] });
            // Force refresh data pengeluaran
            refetchExpenses();
            refetchTotalExpense();
            setOpenExpenseDialog(false);
            expenseForm.reset();
        },
        onError: (error) => {
            toast({
                title: 'Gagal menambahkan pengeluaran',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    // Mutation untuk memperbarui pengeluaran
    const updateExpenseMutation = (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            const { id, ...updateData } = data;
            // Temukan kategori berdasarkan id
            const selectedCategory = categories?.find(c => c.id === updateData.categoryId);
            const formattedData = {
                ...updateData,
                date: (0, date_fns_1.format)(updateData.date, 'yyyy-MM-dd'),
                category: selectedCategory?.name || '', // Tambahkan field category dari nama kategori
            };
            const res = await (0, queryClient_1.apiRequest)('PUT', `/api/finance/expenses/${id}`, formattedData);
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: 'Berhasil',
                description: 'Pengeluaran berhasil diperbarui',
            });
            // Invalidate semua query yang terkait dengan expenses dengan lebih spesifik
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/finance/expenses'] });
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/finance/expenses/total', selectedMonth] });
            // Force refresh data pengeluaran
            refetchExpenses();
            refetchTotalExpense();
            setOpenExpenseDialog(false);
            setEditingExpense(null);
            expenseForm.reset();
        },
        onError: (error) => {
            toast({
                title: 'Gagal memperbarui pengeluaran',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    // Mutation untuk menghapus pengeluaran
    const deleteExpenseMutation = (0, react_query_1.useMutation)({
        mutationFn: async (id) => {
            await (0, queryClient_1.apiRequest)('DELETE', `/api/finance/expenses/${id}`);
        },
        onSuccess: () => {
            toast({
                title: 'Berhasil',
                description: 'Pengeluaran berhasil dihapus',
            });
            // Invalidate semua query yang terkait dengan expenses dengan lebih spesifik
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/finance/expenses'] });
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/finance/expenses/total', selectedMonth] });
            // Force refresh data pengeluaran
            refetchExpenses();
            refetchTotalExpense();
            setSelectedExpenseId(null);
        },
        onError: (error) => {
            toast({
                title: 'Gagal menghapus pengeluaran',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    // Mutation untuk membuat kategori baru
    const createCategoryMutation = (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            const res = await (0, queryClient_1.apiRequest)('POST', '/api/finance/expense-categories', data);
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: 'Berhasil',
                description: 'Kategori berhasil ditambahkan',
            });
            // Invalidate query yang terkait kategori
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/finance/expense-categories'] });
            // Force refresh data kategori
            refetchCategories();
            setOpenCategoryDialog(false);
            categoryForm.reset();
        },
        onError: (error) => {
            toast({
                title: 'Gagal menambahkan kategori',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    // Mutation untuk memperbarui kategori
    const updateCategoryMutation = (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            const { id, ...updateData } = data;
            const res = await (0, queryClient_1.apiRequest)('PUT', `/api/finance/expense-categories/${id}`, updateData);
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: 'Berhasil',
                description: 'Kategori berhasil diperbarui',
            });
            // Invalidate query yang terkait kategori dan expense (karena nama kategori mungkin digunakan di expense)
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/finance/expense-categories'] });
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/finance/expenses'] });
            // Force refresh data kategori
            refetchCategories();
            // Juga refresh expenses karena nama kategori mungkin berubah
            refetchExpenses();
            setOpenCategoryDialog(false);
            setEditingCategory(null);
            categoryForm.reset();
        },
        onError: (error) => {
            toast({
                title: 'Gagal memperbarui kategori',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    // Mutation untuk menghapus kategori
    const deleteCategoryMutation = (0, react_query_1.useMutation)({
        mutationFn: async (id) => {
            await (0, queryClient_1.apiRequest)('DELETE', `/api/finance/expense-categories/${id}`);
        },
        onSuccess: () => {
            toast({
                title: 'Berhasil',
                description: 'Kategori berhasil dihapus',
            });
            // Invalidate semua query yang terkait
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/finance/expense-categories'] });
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/finance/expenses'] });
            // Force refresh data
            refetchCategories();
            refetchExpenses();
            setSelectedCategoryId(null);
        },
        onError: (error) => {
            toast({
                title: 'Gagal menghapus kategori',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    // Handler untuk submit form pengeluaran
    const onSubmitExpense = (data) => {
        if (editingExpense) {
            updateExpenseMutation.mutate({ ...data, id: editingExpense.id });
        }
        else {
            createExpenseMutation.mutate(data);
        }
    };
    // Handler untuk submit form kategori
    const onSubmitCategory = (data) => {
        if (editingCategory) {
            updateCategoryMutation.mutate({ ...data, id: editingCategory.id });
        }
        else {
            createCategoryMutation.mutate(data);
        }
    };
    // Handler untuk edit pengeluaran
    const handleEditExpense = (expense) => {
        setEditingExpense(expense);
        try {
            // Parse tanggal dengan cara yang lebih aman
            let expenseDate = new Date();
            if (expense.date && typeof expense.date === 'string') {
                // Coba parse langsung dengan new Date()
                const dateObj = new Date(expense.date);
                if (!isNaN(dateObj.getTime())) {
                    expenseDate = dateObj;
                }
            }
            expenseForm.reset({
                date: expenseDate,
                categoryId: expense.categoryId,
                amount: expense.amount,
                description: expense.description,
            });
            setOpenExpenseDialog(true);
        }
        catch (error) {
            console.error('Error parsing date:', error);
            toast({
                title: 'Error',
                description: 'Gagal memuat data pengeluaran',
                variant: 'destructive',
            });
        }
    };
    // Handler untuk edit kategori
    const handleEditCategory = (category) => {
        setEditingCategory(category);
        categoryForm.reset({
            name: category.name,
            description: category.description || '',
        });
        setOpenCategoryDialog(true);
    };
    // Reset form ketika dialog dibuka
    (0, react_1.useEffect)(() => {
        if (!openExpenseDialog) {
            setEditingExpense(null);
            expenseForm.reset();
        }
    }, [openExpenseDialog, expenseForm]);
    (0, react_1.useEffect)(() => {
        if (!openCategoryDialog) {
            setEditingCategory(null);
            categoryForm.reset();
        }
    }, [openCategoryDialog, categoryForm]);
    return (<div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pengeluaran</h1>
        <div className="flex space-x-2">
          <button_1.Button onClick={() => {
            refetchExpenses();
            refetchCategories();
            refetchTotalExpense();
        }}>
            <lucide_react_1.RefreshCw className="w-4 h-4 mr-2"/>
            Refresh
          </button_1.Button>
          <dialog_1.Dialog open={openExpenseDialog} onOpenChange={setOpenExpenseDialog}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button>
                <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
                Tambah Pengeluaran
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent>
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>{editingExpense ? 'Edit Pengeluaran' : 'Tambah Pengeluaran Baru'}</dialog_1.DialogTitle>
              </dialog_1.DialogHeader>
              <form_1.Form {...expenseForm}>
                <form onSubmit={expenseForm.handleSubmit(onSubmitExpense)} className="space-y-4">
                  <form_1.FormField control={expenseForm.control} name="date" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Tanggal</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input type="date" value={(0, date_fns_1.format)(field.value, 'yyyy-MM-dd')} onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : new Date();
                field.onChange(date);
            }}/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                  
                  <form_1.FormField control={expenseForm.control} name="categoryId" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Kategori</form_1.FormLabel>
                        <select_1.Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue placeholder="Pilih kategori"/>
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            {isLoadingCategories ? (<select_1.SelectItem value="loading" disabled>
                                Memuat kategori...
                              </select_1.SelectItem>) : categories && categories.length > 0 ? (categories.map((category) => (<select_1.SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </select_1.SelectItem>))) : (<select_1.SelectItem value="empty" disabled>
                                Tidak ada kategori
                              </select_1.SelectItem>)}
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                  
                  <form_1.FormField control={expenseForm.control} name="amount" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Jumlah (Rp)</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input type="number" placeholder="Contoh: 50000" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                  
                  <form_1.FormField control={expenseForm.control} name="description" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Deskripsi</form_1.FormLabel>
                        <form_1.FormControl>
                          <textarea_1.Textarea placeholder="Contoh: Pembelian bahan pembersih" {...field}/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                  
                  <dialog_1.DialogFooter>
                    <button_1.Button type="submit" disabled={createExpenseMutation.isPending ||
            updateExpenseMutation.isPending ||
            !expenseForm.formState.isValid}>
                      {editingExpense ? 'Perbarui' : 'Simpan'}
                    </button_1.Button>
                  </dialog_1.DialogFooter>
                </form>
              </form_1.Form>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Total Pengeluaran Bulan Ini
            </card_1.CardTitle>
            <lucide_react_1.DollarSign className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            {isLoadingTotal ? (<skeleton_1.Skeleton className="h-7 w-[120px]"/>) : (<div className="text-2xl font-bold">
                {formatRupiah(totalExpense?.total || 0)}
              </div>)}
            <p className="text-xs text-muted-foreground">
              Periode: {formattedMonth}
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Jumlah Transaksi
            </card_1.CardTitle>
            <lucide_react_1.FileText className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            {isLoadingExpenses ? (<skeleton_1.Skeleton className="h-7 w-[80px]"/>) : (<div className="text-2xl font-bold">
                {expenses?.length || 0} Transaksi
              </div>)}
            <p className="text-xs text-muted-foreground">
              Periode: {formattedMonth}
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Kategori Pengeluaran
            </card_1.CardTitle>
            <lucide_react_1.Tags className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            {isLoadingCategories ? (<skeleton_1.Skeleton className="h-7 w-[80px]"/>) : (<div className="text-2xl font-bold">
                {categories?.length || 0} Kategori
              </div>)}
            <div className="flex justify-end mt-2">
              <dialog_1.Dialog open={openCategoryDialog} onOpenChange={setOpenCategoryDialog}>
                <dialog_1.DialogTrigger asChild>
                  <button_1.Button variant="outline" size="sm">
                    <lucide_react_1.Plus className="w-3 h-3 mr-1"/>
                    Tambah Kategori
                  </button_1.Button>
                </dialog_1.DialogTrigger>
                <dialog_1.DialogContent>
                  <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle>
                      {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                    </dialog_1.DialogTitle>
                  </dialog_1.DialogHeader>
                  <form_1.Form {...categoryForm}>
                    <form onSubmit={categoryForm.handleSubmit(onSubmitCategory)} className="space-y-4">
                      <form_1.FormField control={categoryForm.control} name="name" render={({ field }) => (<form_1.FormItem>
                            <form_1.FormLabel>Nama Kategori</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input placeholder="Contoh: Bahan Pembersih" {...field}/>
                            </form_1.FormControl>
                            <form_1.FormMessage />
                          </form_1.FormItem>)}/>
                      
                      <form_1.FormField control={categoryForm.control} name="description" render={({ field }) => (<form_1.FormItem>
                            <form_1.FormLabel>Deskripsi (Opsional)</form_1.FormLabel>
                            <form_1.FormControl>
                              <textarea_1.Textarea placeholder="Deskripsi kategori (opsional)" {...field} value={field.value || ''}/>
                            </form_1.FormControl>
                            <form_1.FormMessage />
                          </form_1.FormItem>)}/>
                      
                      <dialog_1.DialogFooter>
                        <button_1.Button type="submit" disabled={createCategoryMutation.isPending ||
            updateCategoryMutation.isPending ||
            !categoryForm.formState.isValid}>
                          {editingCategory ? 'Perbarui' : 'Simpan'}
                        </button_1.Button>
                      </dialog_1.DialogFooter>
                    </form>
                  </form_1.Form>
                </dialog_1.DialogContent>
              </dialog_1.Dialog>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      <tabs_1.Tabs defaultValue="expenses" className="w-full">
        <tabs_1.TabsList className="mb-4">
          <tabs_1.TabsTrigger value="expenses">
            <lucide_react_1.Table className="w-4 h-4 mr-2"/>
            Daftar Pengeluaran
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="categories">
            <lucide_react_1.Tags className="w-4 h-4 mr-2"/>
            Kategori
          </tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="expenses">
          <card_1.Card>
            <card_1.CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
              <card_1.CardTitle>Pengeluaran Bulan {formattedMonth}</card_1.CardTitle>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label_1.Label htmlFor="month-select" className="sr-only">
                  Pilih Bulan
                </label_1.Label>
                <input_1.Input id="month-select" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full sm:w-auto"/>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent>
              {isLoadingExpenses ? (<div className="space-y-4">
                  <skeleton_1.Skeleton className="h-10 w-full"/>
                  <skeleton_1.Skeleton className="h-10 w-full"/>
                  <skeleton_1.Skeleton className="h-10 w-full"/>
                </div>) : expenses && expenses.length > 0 ? (<table_1.Table>
                  <table_1.TableHeader>
                    <table_1.TableRow>
                      <table_1.TableHead>Tanggal</table_1.TableHead>
                      <table_1.TableHead>Kategori</table_1.TableHead>
                      <table_1.TableHead>Deskripsi</table_1.TableHead>
                      <table_1.TableHead className="text-right">Jumlah</table_1.TableHead>
                      <table_1.TableHead className="text-right">Aksi</table_1.TableHead>
                    </table_1.TableRow>
                  </table_1.TableHeader>
                  <table_1.TableBody>
                    {expenses.map((expense) => {
                // Format date dengan handling error
                let expenseDate = "Invalid Date";
                try {
                    // Pastikan expense.date adalah string valid
                    if (expense.date && typeof expense.date === 'string') {
                        // Coba parse tanggal, jika gagal gunakan fallback
                        const dateObj = new Date(expense.date);
                        if (!isNaN(dateObj.getTime())) {
                            expenseDate = (0, date_fns_1.format)(dateObj, 'd MMMM yyyy', { locale: locale_1.id });
                        }
                    }
                }
                catch (error) {
                    console.error("Error formatting date:", error);
                }
                return (<table_1.TableRow key={expense.id}>
                          <table_1.TableCell className="font-medium">{expenseDate}</table_1.TableCell>
                          <table_1.TableCell>{expense.categoryName || '-'}</table_1.TableCell>
                          <table_1.TableCell className="max-w-[200px] truncate" title={expense.description}>
                            {expense.description}
                          </table_1.TableCell>
                          <table_1.TableCell className="text-right font-medium">
                            {formatRupiah(expense.amount)}
                          </table_1.TableCell>
                          <table_1.TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button_1.Button variant="ghost" size="icon" onClick={() => handleEditExpense(expense)}>
                                <lucide_react_1.Edit className="h-4 w-4"/>
                                <span className="sr-only">Edit</span>
                              </button_1.Button>
                              <alert_dialog_1.AlertDialog>
                                <alert_dialog_1.AlertDialogTrigger asChild>
                                  <button_1.Button variant="ghost" size="icon" className="text-destructive" onClick={() => setSelectedExpenseId(expense.id)}>
                                    <lucide_react_1.Trash2 className="h-4 w-4"/>
                                    <span className="sr-only">Hapus</span>
                                  </button_1.Button>
                                </alert_dialog_1.AlertDialogTrigger>
                                <alert_dialog_1.AlertDialogContent>
                                  <alert_dialog_1.AlertDialogHeader>
                                    <alert_dialog_1.AlertDialogTitle>
                                      Konfirmasi Hapus Pengeluaran
                                    </alert_dialog_1.AlertDialogTitle>
                                    <alert_dialog_1.AlertDialogDescription>
                                      Apakah Anda yakin ingin menghapus pengeluaran ini? 
                                      Tindakan ini tidak dapat dibatalkan.
                                    </alert_dialog_1.AlertDialogDescription>
                                  </alert_dialog_1.AlertDialogHeader>
                                  <alert_dialog_1.AlertDialogFooter>
                                    <alert_dialog_1.AlertDialogCancel onClick={() => setSelectedExpenseId(null)}>
                                      Batal
                                    </alert_dialog_1.AlertDialogCancel>
                                    <alert_dialog_1.AlertDialogAction onClick={() => {
                        if (selectedExpenseId !== null) {
                            deleteExpenseMutation.mutate(selectedExpenseId);
                        }
                    }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                      Hapus
                                    </alert_dialog_1.AlertDialogAction>
                                  </alert_dialog_1.AlertDialogFooter>
                                </alert_dialog_1.AlertDialogContent>
                              </alert_dialog_1.AlertDialog>
                            </div>
                          </table_1.TableCell>
                        </table_1.TableRow>);
            })}
                  </table_1.TableBody>
                </table_1.Table>) : (<div className="text-center py-12">
                  <lucide_react_1.FileX className="mx-auto h-12 w-12 text-muted-foreground"/>
                  <h3 className="mt-4 text-lg font-semibold">Tidak ada data</h3>
                  <p className="mt-2 mb-4 text-sm text-muted-foreground">
                    Belum ada data pengeluaran untuk periode {formattedMonth}
                  </p>
                  <button_1.Button onClick={() => setOpenExpenseDialog(true)}>
                    <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
                    Tambah Pengeluaran
                  </button_1.Button>
                </div>)}
            </card_1.CardContent>
            {expenses && expenses.length > 0 && (<card_1.CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Total {expenses.length} transaksi
                </div>
                <div className="font-semibold">
                  Total: {formatRupiah(totalExpense?.total || 0)}
                </div>
              </card_1.CardFooter>)}
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="categories">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Daftar Kategori Pengeluaran</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              {isLoadingCategories ? (<div className="space-y-4">
                  <skeleton_1.Skeleton className="h-10 w-full"/>
                  <skeleton_1.Skeleton className="h-10 w-full"/>
                  <skeleton_1.Skeleton className="h-10 w-full"/>
                </div>) : categories && categories.length > 0 ? (<table_1.Table>
                  <table_1.TableHeader>
                    <table_1.TableRow>
                      <table_1.TableHead>Nama Kategori</table_1.TableHead>
                      <table_1.TableHead>Deskripsi</table_1.TableHead>
                      <table_1.TableHead className="text-right">Aksi</table_1.TableHead>
                    </table_1.TableRow>
                  </table_1.TableHeader>
                  <table_1.TableBody>
                    {categories.map((category) => (<table_1.TableRow key={category.id}>
                        <table_1.TableCell className="font-medium">{category.name}</table_1.TableCell>
                        <table_1.TableCell className="max-w-[300px] truncate" title={category.description || ''}>
                          {category.description || '-'}
                        </table_1.TableCell>
                        <table_1.TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button_1.Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
                              <lucide_react_1.Edit className="h-4 w-4"/>
                              <span className="sr-only">Edit</span>
                            </button_1.Button>
                            <alert_dialog_1.AlertDialog>
                              <alert_dialog_1.AlertDialogTrigger asChild>
                                <button_1.Button variant="ghost" size="icon" className="text-destructive" onClick={() => setSelectedCategoryId(category.id)}>
                                  <lucide_react_1.Trash2 className="h-4 w-4"/>
                                  <span className="sr-only">Hapus</span>
                                </button_1.Button>
                              </alert_dialog_1.AlertDialogTrigger>
                              <alert_dialog_1.AlertDialogContent>
                                <alert_dialog_1.AlertDialogHeader>
                                  <alert_dialog_1.AlertDialogTitle>
                                    Konfirmasi Hapus Kategori
                                  </alert_dialog_1.AlertDialogTitle>
                                  <alert_dialog_1.AlertDialogDescription>
                                    <div className="flex flex-col space-y-2">
                                      <p>
                                        Apakah Anda yakin ingin menghapus kategori "{category.name}"?
                                      </p>
                                      <div className="rounded-md bg-yellow-50 p-4 my-2">
                                        <div className="flex">
                                          <div className="flex-shrink-0">
                                            <lucide_react_1.AlertTriangle className="h-5 w-5 text-yellow-500"/>
                                          </div>
                                          <div className="ml-3">
                                            <h3 className="text-sm font-medium text-yellow-800">
                                              Perhatian
                                            </h3>
                                            <div className="mt-2 text-sm text-yellow-700">
                                              <p>
                                                Menghapus kategori ini juga akan menghapus semua data pengeluaran
                                                yang menggunakan kategori ini. Tindakan ini tidak dapat dibatalkan.
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </alert_dialog_1.AlertDialogDescription>
                                </alert_dialog_1.AlertDialogHeader>
                                <alert_dialog_1.AlertDialogFooter>
                                  <alert_dialog_1.AlertDialogCancel onClick={() => setSelectedCategoryId(null)}>
                                    Batal
                                  </alert_dialog_1.AlertDialogCancel>
                                  <alert_dialog_1.AlertDialogAction onClick={() => {
                    if (selectedCategoryId !== null) {
                        deleteCategoryMutation.mutate(selectedCategoryId);
                    }
                }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Hapus
                                  </alert_dialog_1.AlertDialogAction>
                                </alert_dialog_1.AlertDialogFooter>
                              </alert_dialog_1.AlertDialogContent>
                            </alert_dialog_1.AlertDialog>
                          </div>
                        </table_1.TableCell>
                      </table_1.TableRow>))}
                  </table_1.TableBody>
                </table_1.Table>) : (<div className="text-center py-12">
                  <lucide_react_1.FileX className="mx-auto h-12 w-12 text-muted-foreground"/>
                  <h3 className="mt-4 text-lg font-semibold">Tidak ada kategori</h3>
                  <p className="mt-2 mb-4 text-sm text-muted-foreground">
                    Tambahkan kategori untuk mengorganisasi pengeluaran
                  </p>
                  <button_1.Button onClick={() => setOpenCategoryDialog(true)}>
                    <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
                    Tambah Kategori
                  </button_1.Button>
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
