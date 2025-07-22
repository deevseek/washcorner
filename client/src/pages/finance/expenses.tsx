import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse, startOfMonth, endOfMonth } from "date-fns";
import { id } from "date-fns/locale";
import { z } from "zod";
import {
  DollarSign,
  Plus,
  Trash2,
  Edit,
  FileX,
  RefreshCw,
  AlertTriangle,
  Tags,
  Table as TableIcon,
  FileText,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
// Import komponen-komponen yang dibutuhkan
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

interface Expense {
  id: number;
  date: string;
  amount: number;
  description: string;
  categoryId: number;
  categoryName?: string;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseCategory {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

// Schema untuk form pengeluaran
const expenseFormSchema = z.object({
  date: z.date({
    required_error: "Tanggal wajib diisi",
  }),
  categoryId: z.coerce.number({
    required_error: "Kategori wajib dipilih",
  }),
  amount: z.coerce
    .number({
      required_error: "Jumlah wajib diisi",
    })
    .min(0, "Jumlah harus lebih dari 0"),
  description: z
    .string()
    .min(3, "Deskripsi minimal 3 karakter")
    .max(255, "Deskripsi maksimal 255 karakter"),
});

// Schema untuk form kategori
const categoryFormSchema = z.object({
  name: z
    .string()
    .min(3, "Nama kategori minimal 3 karakter")
    .max(50, "Nama kategori maksimal 50 karakter"),
  description: z.string().optional(),
});

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ExpensesPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return format(new Date(), "yyyy-MM");
  });
  const [openExpenseDialog, setOpenExpenseDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<ExpenseCategory | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(
    null
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const { toast } = useToast();

  const formattedMonth = (() => {
    try {
      const date = parse(selectedMonth, "yyyy-MM", new Date());
      return format(date, "MMMM yyyy", { locale: id });
    } catch {
      return "";
    }
  })();

  // Form untuk pengeluaran
  const expenseForm = useForm<z.infer<typeof expenseFormSchema>>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      date: new Date(),
      categoryId: 0,
      amount: 0,
      description: "",
    },
    mode: "onChange",
  });

  // Form untuk kategori
  const categoryForm = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onChange",
  });

  // Query untuk mendapatkan daftar pengeluaran berdasarkan bulan
  const {
    data: expenses,
    isLoading: isLoadingExpenses,
    refetch: refetchExpenses,
  } = useQuery({
    queryKey: ["/api/finance/expenses", selectedMonth],
    queryFn: async () => {
      const date = parse(selectedMonth, "yyyy-MM", new Date());
      const startDate = format(startOfMonth(date), "yyyy-MM-dd");
      const endDate = format(endOfMonth(date), "yyyy-MM-dd");
      const res = await apiRequest(
        "GET",
        `/api/finance/expenses?startDate=${startDate}&endDate=${endDate}`
      );
      return res.json() as Promise<Expense[]>;
    },
  });

  // Query untuk mendapatkan total pengeluaran bulan ini
  const {
    data: totalExpense,
    isLoading: isLoadingTotal,
    refetch: refetchTotalExpense,
  } = useQuery({
    queryKey: ["/api/finance/expenses/total", selectedMonth],
    queryFn: async () => {
      try {
        // Pastikan format tanggal valid
        if (!selectedMonth || !selectedMonth.match(/^\d{4}-\d{2}$/)) {
          throw new Error("Format bulan tidak valid");
        }

        // Extract year dan month dengan numeric parsing
        const [yearStr, monthStr] = selectedMonth.split("-");
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10);

        // Validasi angka
        if (
          isNaN(year) ||
          isNaN(month) ||
          year < 2000 ||
          year > 2100 ||
          month < 1 ||
          month > 12
        ) {
          throw new Error("Tahun atau bulan tidak valid");
        }

        // Gunakan parameter yang sudah divalidasi
        const res = await apiRequest(
          "GET",
          `/api/finance/expenses/total?year=${year}&month=${month}`
        );
        const data = await res.json();
        return data as { total: number };
      } catch (error) {
        console.error("Error fetching expense total:", error);
        // Return default empty data on error
        return { total: 0 };
      }
    },
    retry: false, // Tidak retry pada error untuk mencegah loop
  });

  // Query untuk mendapatkan daftar kategori
  const {
    data: categories,
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["/api/finance/expense-categories"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/finance/expense-categories");
      return res.json() as Promise<ExpenseCategory[]>;
    },
  });

  // Mutation untuk membuat pengeluaran baru
  const createExpenseMutation = useMutation({
    mutationFn: async (data: z.infer<typeof expenseFormSchema>) => {
      // Temukan kategori berdasarkan id
      const selectedCategory = categories?.find(
        (c) => c.id === data.categoryId
      );

      // Buat objek data dengan format yang sesuai untuk API
      const formattedData = {
        ...data,
        date: format(data.date, "yyyy-MM-dd"),
        category: selectedCategory?.name || "", // Tambahkan field category dari nama kategori
      };
      const res = await apiRequest(
        "POST",
        "/api/finance/expenses",
        formattedData
      );
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Pengeluaran berhasil ditambahkan",
      });

      // Invalidate semua query yang terkait dengan expenses dengan lebih spesifik
      queryClient.invalidateQueries({ queryKey: ["/api/finance/expenses"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/finance/expenses/total", selectedMonth],
      });

      // Force refresh data pengeluaran
      refetchExpenses();
      refetchTotalExpense();

      setOpenExpenseDialog(false);
      expenseForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Gagal menambahkan pengeluaran",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation untuk memperbarui pengeluaran
  const updateExpenseMutation = useMutation({
    mutationFn: async (
      data: z.infer<typeof expenseFormSchema> & { id: number }
    ) => {
      const { id, ...updateData } = data;

      // Temukan kategori berdasarkan id
      const selectedCategory = categories?.find(
        (c) => c.id === updateData.categoryId
      );

      const formattedData = {
        ...updateData,
        date: updateData.date.toISOString(),
        category: selectedCategory?.name || "", // Tambahkan field category dari nama kategori
      };
      const res = await apiRequest(
        "PUT",
        `/api/finance/expenses/${id}`,
        formattedData
      );
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Pengeluaran berhasil diperbarui",
      });

      // Invalidate semua query yang terkait dengan expenses dengan lebih spesifik
      queryClient.invalidateQueries({ queryKey: ["/api/finance/expenses"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/finance/expenses/total", selectedMonth],
      });

      // Force refresh data pengeluaran
      refetchExpenses();
      refetchTotalExpense();

      setOpenExpenseDialog(false);
      setEditingExpense(null);
      expenseForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Gagal memperbarui pengeluaran",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation untuk menghapus pengeluaran
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/finance/expenses/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Pengeluaran berhasil dihapus",
      });

      // Invalidate semua query yang terkait dengan expenses dengan lebih spesifik
      queryClient.invalidateQueries({ queryKey: ["/api/finance/expenses"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/finance/expenses/total", selectedMonth],
      });

      // Force refresh data pengeluaran
      refetchExpenses();
      refetchTotalExpense();

      setSelectedExpenseId(null);
    },
    onError: (error) => {
      toast({
        title: "Gagal menghapus pengeluaran",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation untuk membuat kategori baru
  const createCategoryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof categoryFormSchema>) => {
      const res = await apiRequest(
        "POST",
        "/api/finance/expense-categories",
        data
      );
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Kategori berhasil ditambahkan",
      });

      // Invalidate query yang terkait kategori
      queryClient.invalidateQueries({
        queryKey: ["/api/finance/expense-categories"],
      });

      // Force refresh data kategori
      refetchCategories();

      setOpenCategoryDialog(false);
      categoryForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Gagal menambahkan kategori",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation untuk memperbarui kategori
  const updateCategoryMutation = useMutation({
    mutationFn: async (
      data: z.infer<typeof categoryFormSchema> & { id: number }
    ) => {
      const { id, ...updateData } = data;
      const res = await apiRequest(
        "PUT",
        `/api/finance/expense-categories/${id}`,
        updateData
      );
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Kategori berhasil diperbarui",
      });

      // Invalidate query yang terkait kategori dan expense (karena nama kategori mungkin digunakan di expense)
      queryClient.invalidateQueries({
        queryKey: ["/api/finance/expense-categories"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/finance/expenses"] });

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
        title: "Gagal memperbarui kategori",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation untuk menghapus kategori
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/finance/expense-categories/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Kategori berhasil dihapus",
      });

      // Invalidate semua query yang terkait
      queryClient.invalidateQueries({
        queryKey: ["/api/finance/expense-categories"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/finance/expenses"] });

      // Force refresh data
      refetchCategories();
      refetchExpenses();

      setSelectedCategoryId(null);
    },
    onError: (error) => {
      toast({
        title: "Gagal menghapus kategori",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handler untuk submit form pengeluaran
  const onSubmitExpense = (data: z.infer<typeof expenseFormSchema>) => {
    if (editingExpense) {
      updateExpenseMutation.mutate({ ...data, id: editingExpense.id });
    } else {
      createExpenseMutation.mutate(data);
    }
  };

  // Handler untuk submit form kategori
  const onSubmitCategory = (data: z.infer<typeof categoryFormSchema>) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ ...data, id: editingCategory.id });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  // Handler untuk edit pengeluaran
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);

    try {
      // Parse tanggal dengan cara yang lebih aman
      let expenseDate = new Date();

      if (expense.date && typeof expense.date === "string") {
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
    } catch (error) {
      console.error("Error parsing date:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data pengeluaran",
        variant: "destructive",
      });
    }
  };

  // Handler untuk edit kategori
  const handleEditCategory = (category: ExpenseCategory) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      description: category.description || "",
    });
    setOpenCategoryDialog(true);
  };

  // Reset form ketika dialog dibuka
  useEffect(() => {
    if (!openExpenseDialog) {
      setEditingExpense(null);
      expenseForm.reset();
    }
  }, [openExpenseDialog, expenseForm]);

  useEffect(() => {
    if (!openCategoryDialog) {
      setEditingCategory(null);
      categoryForm.reset();
    }
  }, [openCategoryDialog, categoryForm]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pengeluaran</h1>
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              refetchExpenses();
              refetchCategories();
              refetchTotalExpense();
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={openExpenseDialog} onOpenChange={setOpenExpenseDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Pengeluaran
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingExpense
                    ? "Edit Pengeluaran"
                    : "Tambah Pengeluaran Baru"}
                </DialogTitle>
              </DialogHeader>
              <Form {...expenseForm}>
                <form
                  onSubmit={expenseForm.handleSubmit(onSubmitExpense)}
                  className="space-y-4"
                >
                  <FormField
                    control={expenseForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={format(field.value, "yyyy-MM-dd")}
                            onChange={(e) => {
                              const date = e.target.value
                                ? new Date(e.target.value)
                                : new Date();
                              field.onChange(date);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={expenseForm.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategori</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          value={String(field.value ?? "")}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingCategories ? (
                              <SelectItem value="loading" disabled>
                                Memuat kategori...
                              </SelectItem>
                            ) : categories && categories.length > 0 ? (
                              categories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id.toString()}
                                >
                                  {category.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="empty" disabled>
                                Tidak ada kategori
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={expenseForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jumlah (Rp)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Contoh: 50000"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={expenseForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deskripsi</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Contoh: Pembelian bahan pembersih"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={
                        createExpenseMutation.isPending ||
                        updateExpenseMutation.isPending ||
                        !expenseForm.formState.isValid
                      }
                    >
                      {editingExpense ? "Perbarui" : "Simpan"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pengeluaran Bulan Ini
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingTotal ? (
              <Skeleton className="h-7 w-[120px]" />
            ) : (
              <div className="text-2xl font-bold">
                {formatRupiah(totalExpense?.total || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Periode: {formattedMonth}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Jumlah Transaksi
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingExpenses ? (
              <Skeleton className="h-7 w-[80px]" />
            ) : (
              <div className="text-2xl font-bold">
                {expenses?.length || 0} Transaksi
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Periode: {formattedMonth}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Kategori Pengeluaran
            </CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingCategories ? (
              <Skeleton className="h-7 w-[80px]" />
            ) : (
              <div className="text-2xl font-bold">
                {categories?.length || 0} Kategori
              </div>
            )}
            <div className="flex justify-end mt-2">
              <Dialog
                open={openCategoryDialog}
                onOpenChange={setOpenCategoryDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="w-3 h-3 mr-1" />
                    Tambah Kategori
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory
                        ? "Edit Kategori"
                        : "Tambah Kategori Baru"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...categoryForm}>
                    <form
                      onSubmit={categoryForm.handleSubmit(onSubmitCategory)}
                      className="space-y-4"
                    >
                      <FormField
                        control={categoryForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Kategori</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Contoh: Bahan Pembersih"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={categoryForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deskripsi (Opsional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Deskripsi kategori (opsional)"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button
                          type="submit"
                          disabled={
                            createCategoryMutation.isPending ||
                            updateCategoryMutation.isPending ||
                            !categoryForm.formState.isValid
                          }
                        >
                          {editingCategory ? "Perbarui" : "Simpan"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="expenses">
            <TableIcon className="w-4 h-4 mr-2" />
            Daftar Pengeluaran
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Tags className="w-4 h-4 mr-2" />
            Kategori
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
              <CardTitle>Pengeluaran Bulan {formattedMonth}</CardTitle>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Label htmlFor="month-select" className="sr-only">
                  Pilih Bulan
                </Label>
                <Input
                  id="month-select"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full sm:w-auto"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingExpenses ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : expenses && expenses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => {
                      // Format date dengan handling error
                      let expenseDate = "Invalid Date";
                      try {
                        // Pastikan expense.date adalah string valid
                        if (expense.date && typeof expense.date === "string") {
                          // Coba parse tanggal, jika gagal gunakan fallback
                          const dateObj = new Date(expense.date);
                          if (!isNaN(dateObj.getTime())) {
                            expenseDate = format(dateObj, "d MMMM yyyy", {
                              locale: id,
                            });
                          }
                        }
                      } catch (error) {
                        console.error("Error formatting date:", error);
                      }

                      return (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">
                            {expenseDate}
                          </TableCell>
                          <TableCell>{expense.category || "-"}</TableCell>
                          <TableCell
                            className="max-w-[200px] truncate"
                            title={expense.description}
                          >
                            {expense.description}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatRupiah(expense.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditExpense(expense)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() =>
                                      setSelectedExpenseId(expense.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Hapus</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Konfirmasi Hapus Pengeluaran
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Apakah Anda yakin ingin menghapus
                                      pengeluaran ini? Tindakan ini tidak dapat
                                      dibatalkan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel
                                      onClick={() => setSelectedExpenseId(null)}
                                    >
                                      Batal
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        if (selectedExpenseId !== null) {
                                          deleteExpenseMutation.mutate(
                                            selectedExpenseId
                                          );
                                        }
                                      }}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <FileX className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Tidak ada data</h3>
                  <p className="mt-2 mb-4 text-sm text-muted-foreground">
                    Belum ada data pengeluaran untuk periode {formattedMonth}
                  </p>
                  <Button onClick={() => setOpenExpenseDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Pengeluaran
                  </Button>
                </div>
              )}
            </CardContent>
            {expenses && expenses.length > 0 && (
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Total {expenses.length} transaksi
                </div>
                <div className="font-semibold">
                  Total: {formatRupiah(totalExpense?.total || 0)}
                </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Kategori Pengeluaran</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingCategories ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : categories && categories.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Kategori</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">
                          {category.name}
                        </TableCell>
                        <TableCell
                          className="max-w-[300px] truncate"
                          title={category.description || ""}
                        >
                          {category.description || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() =>
                                    setSelectedCategoryId(category.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Hapus</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Konfirmasi Hapus Kategori
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    <div className="flex flex-col space-y-2">
                                      <p>
                                        Apakah Anda yakin ingin menghapus
                                        kategori "{category.name}"?
                                      </p>
                                      <div className="rounded-md bg-yellow-50 p-4 my-2">
                                        <div className="flex">
                                          <div className="flex-shrink-0">
                                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                          </div>
                                          <div className="ml-3">
                                            <h3 className="text-sm font-medium text-yellow-800">
                                              Perhatian
                                            </h3>
                                            <div className="mt-2 text-sm text-yellow-700">
                                              <p>
                                                Menghapus kategori ini juga akan
                                                menghapus semua data pengeluaran
                                                yang menggunakan kategori ini.
                                                Tindakan ini tidak dapat
                                                dibatalkan.
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    onClick={() => setSelectedCategoryId(null)}
                                  >
                                    Batal
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      if (selectedCategoryId !== null) {
                                        deleteCategoryMutation.mutate(
                                          selectedCategoryId
                                        );
                                      }
                                    }}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <FileX className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">
                    Tidak ada kategori
                  </h3>
                  <p className="mt-2 mb-4 text-sm text-muted-foreground">
                    Tambahkan kategori untuk mengorganisasi pengeluaran
                  </p>
                  <Button onClick={() => setOpenCategoryDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Kategori
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
