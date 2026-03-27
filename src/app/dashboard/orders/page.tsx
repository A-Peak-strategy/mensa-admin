'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { Visibility, Search, Refresh } from '@mui/icons-material';
import { BASE_URL } from '@/api/api';

type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    basePrice: number;
    totalPrice?: number;
    variations?: { name: string; option: string; additionalPrice: number }[];
    imageUrl?: string;
}

interface Order {
    id: string;
    user_id: string;
    user_email: string;
    user_name: string;
    user_mobile: string;
    deliveryAddress: string;
    deliveryDate: string;
    specialNotes?: string;
    status: OrderStatus;
    paymentMethod: string;
    items: OrderItem[];
    subtotal: number;
    total: number;
    createdAt: { _seconds?: number } | string;
}

const STATUS_OPTIONS: { value: OrderStatus; label: string; color: 'warning' | 'info' | 'success' | 'error' }[] = [
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'confirmed', label: 'Confirmed', color: 'info' },
    { value: 'delivered', label: 'Delivered', color: 'success' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' },
];

function formatDate(d: { _seconds?: number } | string | undefined): string {
    if (!d) return '—';
    if (typeof d === 'string') return new Date(d).toLocaleDateString();
    if (d._seconds) return new Date(d._seconds * 1000).toLocaleDateString();
    return '—';
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filtered, setFiltered] = useState<Order[]>([]);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [openView, setOpenView] = useState(false);
    const [selected, setSelected] = useState<Order | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        let result = orders;
        if (statusFilter !== 'all') {
            result = result.filter((o) => o.status === statusFilter);
        }
        if (searchText) {
            const q = searchText.toLowerCase();
            result = result.filter(
                (o) =>
                    o.user_name?.toLowerCase().includes(q) ||
                    o.user_email?.toLowerCase().includes(q) ||
                    o.id.toLowerCase().includes(q)
            );
        }
        setFiltered(result);
    }, [searchText, statusFilter, orders]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/orders/get-all`);
            if (!res.ok) throw new Error('Failed to fetch');
            const json = await res.json();
            if (json.status && Array.isArray(json.data)) {
                // Sort by newest first
                const sorted = (json.data as Order[]).sort((a, b) => {
                    const aTime = typeof a.createdAt === 'object' ? (a.createdAt._seconds ?? 0) : new Date(a.createdAt).getTime() / 1000;
                    const bTime = typeof b.createdAt === 'object' ? (b.createdAt._seconds ?? 0) : new Date(b.createdAt).getTime() / 1000;
                    return bTime - aTime;
                });
                setOrders(sorted);
            } else {
                setOrders([]);
            }
        } catch {
            setSnackbar({ open: true, message: 'Failed to fetch orders. Ensure API is running.', severity: 'error' });
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (order: Order) => {
        setSelected(order);
        setOpenView(true);
    };

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        setUpdating(orderId);
        try {
            const res = await fetch(`${BASE_URL}/orders/updateStatus/${orderId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const json = await res.json();
            if (json.status) {
                setSnackbar({ open: true, message: 'Order status updated.', severity: 'success' });
                setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
            } else {
                throw new Error(json.error || 'Update failed');
            }
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to update status.', severity: 'error' });
        } finally {
            setUpdating(null);
        }
    };

    const getStatusChip = (status: OrderStatus) => {
        const opt = STATUS_OPTIONS.find((s) => s.value === status);
        return <Chip label={opt?.label ?? status} color={opt?.color ?? 'default'} size="small" />;
    };

    return (
        <Box p={3}>
            <Typography variant="h5" mb={2}>
                Manage Orders
            </Typography>

            <Box display="flex" gap={2} alignItems="center" mb={2} flexWrap="wrap">
                <TextField
                    placeholder="Search by name, email, or ID..."
                    variant="outlined"
                    size="small"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ minWidth: 280 }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                    >
                        <MenuItem value="all">All Statuses</MenuItem>
                        {STATUS_OPTIONS.map((s) => (
                            <MenuItem key={s.value} value={s.value}>
                                {s.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button variant="outlined" startIcon={<Refresh />} onClick={fetchOrders} disabled={loading}>
                    Refresh
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order ID</TableCell>
                            <TableCell>Customer</TableCell>
                            <TableCell>Items</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Delivery Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    Loading…
                                </TableCell>
                            </TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((order) => (
                                <TableRow key={order.id} hover>
                                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                        {order.id.slice(0, 8)}...
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={500}>
                                            {order.user_name || 'Unknown'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {order.user_email}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{order.items?.length ?? 0} items</TableCell>
                                    <TableCell>LKR {order.total?.toLocaleString() ?? '—'}</TableCell>
                                    <TableCell>{formatDate(order.deliveryDate)}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={order.status}
                                            size="small"
                                            disabled={updating === order.id}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                            sx={{ minWidth: 120 }}
                                        >
                                            {STATUS_OPTIONS.map((s) => (
                                                <MenuItem key={s.value} value={s.value}>
                                                    {s.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton size="small" onClick={() => handleView(order)}>
                                            <Visibility />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* View Order Dialog */}
            <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="md" fullWidth>
                <DialogTitle>Order Details</DialogTitle>
                <DialogContent>
                    {selected && (
                        <Box>
                            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={3}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Order ID
                                    </Typography>
                                    <Typography variant="body2" fontFamily="monospace">
                                        {selected.id}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Status
                                    </Typography>
                                    {getStatusChip(selected.status)}
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Customer
                                    </Typography>
                                    <Typography variant="body2">{selected.user_name}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {selected.user_email} • {selected.user_mobile}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Delivery Date
                                    </Typography>
                                    <Typography variant="body2">{formatDate(selected.deliveryDate)}</Typography>
                                </Box>
                                <Box gridColumn="1 / -1">
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Delivery Address
                                    </Typography>
                                    <Typography variant="body2">{selected.deliveryAddress || '—'}</Typography>
                                </Box>
                                {selected.specialNotes && (
                                    <Box gridColumn="1 / -1">
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Special Notes
                                        </Typography>
                                        <Typography variant="body2">{selected.specialNotes}</Typography>
                                    </Box>
                                )}
                            </Box>

                            <Typography variant="subtitle1" fontWeight={600} mb={1}>
                                Items
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Item</TableCell>
                                            <TableCell>Qty</TableCell>
                                            <TableCell>Price</TableCell>
                                            <TableCell>Total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selected.items?.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>
                                                    <Typography variant="body2">{item.name}</Typography>
                                                    {item.variations && item.variations.length > 0 && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {item.variations.map((v) => `${v.name}: ${v.option}`).join(', ')}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>LKR {item.basePrice}</TableCell>
                                                <TableCell>LKR {item.totalPrice ?? item.basePrice * item.quantity}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell colSpan={3} align="right">
                                                <strong>Total</strong>
                                            </TableCell>
                                            <TableCell>
                                                <strong>LKR {selected.total?.toLocaleString()}</strong>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenView(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            >
                <Alert severity={snackbar.severity} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
