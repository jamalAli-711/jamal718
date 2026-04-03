// Arabic labels and mappings used across the entire system
// This makes maintenance and translation centralized
// Values match PHP integer-backed enums

export const ORDER_STATUSES = {
    1: { key: 'Pending',          label: 'معلق',        color: 'amber' },
    2: { key: 'Processing',      label: 'قيد التجهيز', color: 'blue' },
    3: { key: 'Out_for_Delivery', label: 'في الطريق',   color: 'purple' },
    4: { key: 'Delivered',        label: 'تم التسليم',  color: 'green' },
    5: { key: 'Rejected',         label: 'مرفوض',       color: 'red' },
};

export const USER_TYPES = {
    1:  { key: 'Admin',        label: 'مدير النظام' },
    2:  { key: 'Wholesaler',   label: 'تاجر جملة' },
    3:  { key: 'Retailer',     label: 'تاجر تجزئة' },
    4:  { key: 'Customer',     label: 'عميل' },
    5:  { key: 'Sales',        label: 'مبيعات' },
    6:  { key: 'SalesManager', label: 'إدارة المبيعات' },
    7:  { key: 'Accountant',   label: 'حسابات' },
    8:  { key: 'SalesRep',     label: 'مندوبين' },
    9:  { key: 'Driver',       label: 'سائق' },
    10: { key: 'Distributor',  label: 'موزع' },
};

// Reverse lookup by key name
export const USER_TYPE_VALUES = {
    Admin: 1,
    Wholesaler: 2,
    Retailer: 3,
    Customer: 4,
    Sales: 5,
    SalesManager: 6,
    Accountant: 7,
    SalesRep: 8,
    Driver: 9,
    Distributor: 10,
};

export const ORDER_STATUS_VALUES = {
    Pending: 1,
    Processing: 2,
    Out_for_Delivery: 3,
    Delivered: 4,
    Rejected: 5,
};

export const DELIVERY_STATUSES = {
    1: { key: 'In_Warehouse', label: 'في المستودع', color: 'gray' },
    2: { key: 'On_Way',       label: 'في الطريق',   color: 'blue' },
    3: { key: 'Delivered',    label: 'تم التوصيل',  color: 'green' },
};

// Format number with commas (Arabic-friendly)
export const formatNumber = (num) => {
    return Number(num || 0).toLocaleString('en');
};

// Format currency
export const formatCurrency = (amount, currency = 'ر.ي') => {
    return `${formatNumber(amount)} ${currency}`;
};

// Format date in Arabic
export const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
