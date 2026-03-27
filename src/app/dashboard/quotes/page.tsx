'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    Paper,
    Snackbar,
    Alert,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Chip,
    IconButton,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Skeleton,
    Grid,
    Card,
    CardContent,
} from '@mui/material';
import { Delete, Visibility, Edit } from '@mui/icons-material';
import { BASE_URL } from '@/api/api';

interface Quote {
    id: string;
    name: string;
    email: string;
    phone: string;
    eventType: string;
    guestCount: string;
    eventDate: string;
    budget: string;
    message: string;
    status: 'pending' | 'reviewed' | 'contacted' | 'completed' | 'cancelled';
    notes: string;
    createdAt: string;
    updatedAt: string;
}

interface Stats {
    total: number;
    pending: number;
    reviewed: number;
    contacted: number;
    completed: number;
    cancelled: number;
}

const STATUS_COLORS: Record<string, 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
    pending: 'warning',
    reviewed: 'info',
    contacted: 'primary',
    completed: 'success',
    cancelled: 'error',
};

const EVENT_LABELS: Record<string, string> = {
    birthday: 'Birthday Party',
    hightea: 'High Tea',
    anniversary: 'Anniversary',
    corporate: 'Corporate Event',
    wedding: 'Wedding Catering',
    custom: 'Custom Order',
};

function formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function QuotesPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [viewQuote, setViewQuote] = useState<Quote | null>(null);
    const [editQuote, setEditQuote] = useState<Quote | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('');

    const fetchQuotes = useCallback(async () => {
        try {
            setLoading(true);
            const url = filterStatus ? `${BASE_URL}/quotes?status=${filterStatus}` : `${BASE_URL}/quotes`;
            const res = await fetch(url);
            const json = await res.json();
            if (json?.status && Array.isArray(json.data)) {
                setQuotes(json.data);
            }
        } catch {
            setSnackbar({ open: true, message: 'Failed to fetch quotes.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [filterStatus]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch(`${BASE_URL}/quotes/stats`);
            const json = await res.json();
            if (json?.status) {
                setStats(json.data);
            }
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        fetchQuotes();
        fetchStats();
    }, [fetchQuotes, fetchStats]);

    const handleUpdateStatus = async (id: string, status: string, notes?: string) => {
        try {
            const res = await fetch(`${BASE_URL}/quotes/update/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, ...(notes !== undefined && { notes }) }),
            });
            const json = await res.json();
            if (json.status) {
                setSnackbar({ open: true, message: 'Quote updated.', severity: 'success' });
                fetchQuotes();
                fetchStats();
                setEditQuote(null);
            } else {
                setSnackbar({ open: true, message: json.error || 'Update failed.', severity: 'error' });
            }
        } catch {
            setSnackbar({ open: true, message: 'Update failed.', severity: 'error' });
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`${BASE_URL}/quotes/delete/${deleteId}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.status) {
                setSnackbar({ open: true, message: 'Quote deleted.', severity: 'success' });
                fetchQuotes();
                fetchStats();
            } else {
                setSnackbar({ open: true, message: json.error || 'Delete failed.', severity: 'error' });
            }
        } catch {
            setSnackbar({ open: true, message: 'Delete failed.', severity: 'error' });
        }
        setDeleteId(null);
    };

    return (
        <Box p={3}>
            <Typography variant="h5" mb={2}>
                Quote Requests
            </Typography>

            {/* Stats Cards */}
            {stats && (
                <Grid container spacing={2} mb={3}>
                    {[
                        { label: 'Total', value: stats.total, color: '#1976d2' },
                        { label: 'Pending', value: stats.pending, color: '#ed6c02' },
                        { label: 'Reviewed', value: stats.reviewed, color: '#0288d1' },
                        { label: 'Contacted', value: stats.contacted, color: '#7b1fa2' },
                        { label: 'Completed', value: stats.completed, color: '#2e7d32' },
                        { label: 'Cancelled', value: stats.cancelled, color: '#d32f2f' },
                    ].map((s) => (
                        <Grid item xs={6} sm={4} md={2} key={s.label}>
                            <Card sx={{ borderLeft: `4px solid ${s.color}` }}>
                                <CardContent sx={{ py: 2 }}>
                                    <Typography variant="h4" fontWeight="bold">{s.value}</Typography>
                                    <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Filter */}
            <Box display="flex" justifyContent="flex-end" mb={2}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Filter Status</InputLabel>
                    <Select
                        value={filterStatus}
                        label="Filter Status"
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="reviewed">Reviewed</MenuItem>
                        <MenuItem value="contacted">Contacted</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {loading ? (
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            ) : quotes.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No quote requests yet.</Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Event Type</TableCell>
                                <TableCell>Event Date</TableCell>
                                <TableCell>Guests</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Submitted</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {quotes.map((q) => (
                                <TableRow key={q.id} hover>
                                    <TableCell>
                                        <Typography fontWeight="medium">{q.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{q.email}</Typography>
                                    </TableCell>
                                    <TableCell>{EVENT_LABELS[q.eventType] || q.eventType}</TableCell>
                                    <TableCell>{q.eventDate}</TableCell>
                                    <TableCell>{q.guestCount || '-'}</TableCell>
                                    <TableCell>
                                        <Chip label={q.status} color={STATUS_COLORS[q.status]} size="small" />
                                    </TableCell>
                                    <TableCell>{formatDate(q.createdAt)}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={() => setViewQuote(q)}>
                                            <Visibility />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => setEditQuote(q)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => setDeleteId(q.id)}>
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* View Dialog */}
            <Dialog open={!!viewQuote} onClose={() => setViewQuote(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Quote Details</DialogTitle>
                <DialogContent dividers>
                    {viewQuote && (
                        <Box sx={{ '& > div': { mb: 2 } }}>
                            <div><strong>Name:</strong> {viewQuote.name}</div>
                            <div><strong>Email:</strong> {viewQuote.email}</div>
                            <div><strong>Phone:</strong> {viewQuote.phone || '-'}</div>
                            <div><strong>Event Type:</strong> {EVENT_LABELS[viewQuote.eventType] || viewQuote.eventType}</div>
                            <div><strong>Event Date:</strong> {viewQuote.eventDate}</div>
                            <div><strong>Guest Count:</strong> {viewQuote.guestCount || '-'}</div>
                            <div><strong>Budget:</strong> {viewQuote.budget || '-'}</div>
                            <div><strong>Message:</strong><br />{viewQuote.message || '-'}</div>
                            <div><strong>Notes:</strong><br />{viewQuote.notes || '-'}</div>
                            <div><strong>Status:</strong> <Chip label={viewQuote.status} color={STATUS_COLORS[viewQuote.status]} size="small" /></div>
                            <div><strong>Submitted:</strong> {formatDate(viewQuote.createdAt)}</div>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewQuote(null)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editQuote} onClose={() => setEditQuote(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Update Quote</DialogTitle>
                <DialogContent>
                    {editQuote && (
                        <Box mt={2}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={editQuote.status}
                                    label="Status"
                                    onChange={(e) => setEditQuote({ ...editQuote, status: e.target.value as Quote['status'] })}
                                >
                                    <MenuItem value="pending">Pending</MenuItem>
                                    <MenuItem value="reviewed">Reviewed</MenuItem>
                                    <MenuItem value="contacted">Contacted</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                margin="dense"
                                label="Admin Notes"
                                fullWidth
                                multiline
                                rows={3}
                                value={editQuote.notes}
                                onChange={(e) => setEditQuote({ ...editQuote, notes: e.target.value })}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditQuote(null)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => editQuote && handleUpdateStatus(editQuote.id, editQuote.status, editQuote.notes)}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this quote request?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteId(null)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            >
                <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}
