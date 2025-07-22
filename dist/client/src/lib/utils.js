"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
exports.formatCurrency = formatCurrency;
exports.getInitials = getInitials;
exports.generateInvoiceNumber = generateInvoiceNumber;
exports.statusColor = statusColor;
exports.statusLabel = statusLabel;
exports.getChartColor = getChartColor;
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}
function getInitials(name) {
    if (!name)
        return '';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}
function generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().substring(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}${day}-${random}`;
}
function statusColor(status) {
    switch (status) {
        case 'completed':
            return { bg: 'bg-green-100', text: 'text-green-800' };
        case 'in_progress':
            return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
        case 'pending':
            return { bg: 'bg-blue-100', text: 'text-blue-800' };
        case 'cancelled':
            return { bg: 'bg-red-100', text: 'text-red-800' };
        default:
            return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
}
function statusLabel(status) {
    switch (status) {
        case 'completed':
            return 'Selesai';
        case 'in_progress':
            return 'Proses';
        case 'pending':
            return 'Menunggu';
        case 'cancelled':
            return 'Dibatalkan';
        default:
            return status;
    }
}
// Get a color based on an index for charts
function getChartColor(index) {
    const colors = [
        'hsl(var(--chart-1))',
        'hsl(var(--chart-2))',
        'hsl(var(--chart-3))',
        'hsl(var(--chart-4))',
        'hsl(var(--chart-5))'
    ];
    return colors[index % colors.length];
}
