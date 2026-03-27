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
import { Delete, Visibility, Edit, MarkEmailRead } from '@mui/icons-material';
import { BASE_URL } from '@/api/api';

interface Contact {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'unread' | 'read' | 'responded';
    notes: string;
    createdAt: string;
    updatedAt: string;
}

interface Stats {
    total: number;
    unread: number;
    read: number;
    responded: number;
}

const STATUS_COLORS: Record<string, 'error' | 'warning' | 'success'> = {
    unread: 'error',
    read: 'warning',
    responded: 'success',
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

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [viewContact, setViewContact] = useState<Contact | null>(null);
    const [editContact, setEditContact] = useState<Contact | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('');

    const fetchContacts = useCallback(async () => {
        try {
            setLoading(true);
            const url = filterStatus ? `${BASE_URL}/contacts?status=${filterStatus}` : `${BASE_URL}/contacts`;
            const res = await fetch(url);
            const json = await res.json();
            if (json?.status && Array.isArray(json.data)) {
                setContacts(json.data);
            }
        } catch {
            setSnackbar({ open: true, message: 'Failed to fetch contacts.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [filterStatus]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch(`${BASE_URL}/contacts/stats`);
            const json = await res.json();
            if (json?.status) {
                setStats(json.data);
            }
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        fetchContacts();
        fetchStats();
    }, [fetchContacts, fetchStats]);

    const handleMarkAsRead = async (id: string) => {
        try {
            const res = await fetch(`${BASE_URL}/contacts/read/${id}`, { method: 'PUT' });
            const json = await res.json();
            if (json.status) {
                setSnackbar({ open: true, message: 'Marked as read.', severity: 'success' });
                fetchContacts();
                fetchStats();
            }
        } catch {
            setSnackbar({ open: true, message: 'Failed to update.', severity: 'error' });
        }
    };

    const handleUpdateStatus = async (id: string, status: string, notes?: string) => {
        try {
            const res = await fetch(`${BASE_URL}/contacts/update/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, ...(notes !== undefined && { notes }) }),
            });
            const json = await res.json();
            if (json.status) {
                setSnackbar({ open: true, message: 'Contact updated.', severity: 'success' });
                fetchContacts();
                fetchStats();
                setEditContact(null);
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
            const res = await fetch(`${BASE_URL}/contacts/delete/${deleteId}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.status) {
                setSnackbar({ open: true, message: 'Contact deleted.', severity: 'success' });
                fetchContacts();
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
                Contact Messages
            </Typography>

            {/* Stats Cards */}
            {stats && (
                <Grid container spacing={2} mb={3}>
                    {[
                        { label: 'Total', value: stats.total, color: '#1976d2' },
                        { label: 'Unread', value: stats.unread, color: '#d32f2f' },
                        { label: 'Read', value: stats.read, color: '#ed6c02' },
                        { label: 'Responded', value: stats.responded, color: '#2e7d32' },
                    ].map((s) => (
                        <Grid item xs={6} sm={3} key={s.label}>
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
                        <MenuItem value="unread">Unread</MenuItem>
                        <MenuItem value="read">Read</MenuItem>
                        <MenuItem value="responded">Responded</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {loading ? (
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            ) : contacts.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No contact messages yet.</Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Subject</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Received</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {contacts.map((c) => (
                                <TableRow
                                    key={c.id}
                                    hover
                                    sx={{ bgcolor: c.status === 'unread' ? 'action.hover' : 'inherit' }}
                                >
                                    <TableCell>
                                        <Typography fontWeight={c.status === 'unread' ? 'bold' : 'medium'}>
                                            {c.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">{c.email}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            fontWeight={c.status === 'unread' ? 'bold' : 'normal'}
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                maxWidth: 200,
                                            }}
                                        >
                                            {c.subject}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={c.status} color={STATUS_COLORS[c.status]} size="small" />
                                    </TableCell>
                                    <TableCell>{formatDate(c.createdAt)}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={() => setViewContact(c)}>
                                            <Visibility />
                                        </IconButton>
                                        {c.status === 'unread' && (
                                            <IconButton size="small" onClick={() => handleMarkAsRead(c.id)} title="Mark as read">
                                                <MarkEmailRead />
                                            </IconButton>
                                        )}
                                        <IconButton size="small" onClick={() => setEditContact(c)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => setDeleteId(c.id)}>
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
            <Dialog open={!!viewContact} onClose={() => setViewContact(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Message Details</DialogTitle>
                <DialogContent dividers>
                    {viewContact && (
                        <Box sx={{ '& > div': { mb: 2 } }}>
                            <div><strong>Name:</strong> {viewContact.name}</div>
                            <div><strong>Email:</strong> {viewContact.email}</div>
                            <div><strong>Subject:</strong> {viewContact.subject}</div>
                            <div><strong>Message:</strong><br /><Paper sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>{viewContact.message}</Paper></div>
                            <div><strong>Notes:</strong><br />{viewContact.notes || '-'}</div>
                            <div><strong>Status:</strong> <Chip label={viewContact.status} color={STATUS_COLORS[viewContact.status]} size="small" /></div>
                            <div><strong>Received:</strong> {formatDate(viewContact.createdAt)}</div>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewContact(null)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editContact} onClose={() => setEditContact(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Update Contact</DialogTitle>
                <DialogContent>
                    {editContact && (
                        <Box mt={2}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={editContact.status}
                                    label="Status"
                                    onChange={(e) => setEditContact({ ...editContact, status: e.target.value as Contact['status'] })}
                                >
                                    <MenuItem value="unread">Unread</MenuItem>
                                    <MenuItem value="read">Read</MenuItem>
                                    <MenuItem value="responded">Responded</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                margin="dense"
                                label="Admin Notes"
                                fullWidth
                                multiline
                                rows={3}
                                value={editContact.notes}
                                onChange={(e) => setEditContact({ ...editContact, notes: e.target.value })}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditContact(null)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => editContact && handleUpdateStatus(editContact.id, editContact.status, editContact.notes)}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this message?</Typography>
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
