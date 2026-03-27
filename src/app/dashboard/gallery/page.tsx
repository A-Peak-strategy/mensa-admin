'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Typography,
    Paper,
    Snackbar,
    Alert,
    Grid,
    Card,
    CardMedia,
    CardActions,
    Switch,
    FormControlLabel,
    Skeleton,
} from '@mui/material';
import { Add, Delete, CloudUpload, DragIndicator } from '@mui/icons-material';
import { BASE_URL } from '@/api/api';

interface GalleryImage {
    id: string;
    title: string;
    description: string;
    image: { url: string; public_id?: string } | null;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function GalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [openForm, setOpenForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: null as File | null,
        imagePreview: '',
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [openDelete, setOpenDelete] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [draggedId, setDraggedId] = useState<string | null>(null);

    const fetchImages = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${BASE_URL}/gallery`);
            if (!res.ok) {
                setSnackbar({
                    open: true,
                    message: `Failed to fetch gallery (${res.status}). Ensure the API is running.`,
                    severity: 'error',
                });
                setImages([]);
                return;
            }
            const json = await res.json();
            if (json?.status && Array.isArray(json.data)) {
                setImages(json.data);
            } else {
                setImages([]);
            }
        } catch {
            setSnackbar({
                open: true,
                message: 'Failed to fetch gallery. Ensure the API is running.',
                severity: 'error',
            });
            setImages([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const handleAdd = () => {
        setFormData({
            title: '',
            description: '',
            image: null,
            imagePreview: '',
        });
        setOpenForm(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, files } = e.target;
        if (name === 'image' && files?.length) {
            const file = files[0];
            setFormData((prev) => ({
                ...prev,
                image: file,
                imagePreview: URL.createObjectURL(file),
            }));
            return;
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async () => {
        if (!formData.image) {
            setSnackbar({ open: true, message: 'Please select an image.', severity: 'error' });
            return;
        }
        setSubmitting(true);
        const fd = new FormData();
        fd.append('title', formData.title.trim());
        fd.append('description', formData.description.trim());
        fd.append('image', formData.image);

        try {
            const res = await fetch(`${BASE_URL}/gallery/create`, { method: 'POST', body: fd });
            const json = await res.json();
            if (json.status) {
                setSnackbar({ open: true, message: 'Image added to gallery.', severity: 'success' });
                setOpenForm(false);
                fetchImages();
            } else {
                setSnackbar({ open: true, message: json.error || 'Upload failed.', severity: 'error' });
            }
        } catch {
            setSnackbar({ open: true, message: 'Upload failed.', severity: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`${BASE_URL}/gallery/delete/${deleteId}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.status) {
                setSnackbar({ open: true, message: 'Image deleted.', severity: 'success' });
                fetchImages();
            } else {
                setSnackbar({ open: true, message: json.error || 'Delete failed.', severity: 'error' });
            }
        } catch {
            setSnackbar({ open: true, message: 'Delete failed.', severity: 'error' });
        }
        setOpenDelete(false);
        setDeleteId(null);
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`${BASE_URL}/gallery/update/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus }),
            });
            const json = await res.json();
            if (json.status) {
                setImages((prev) =>
                    prev.map((img) => (img.id === id ? { ...img, isActive: !currentStatus } : img))
                );
            } else {
                setSnackbar({ open: true, message: 'Toggle failed.', severity: 'error' });
            }
        } catch {
            setSnackbar({ open: true, message: 'Toggle failed.', severity: 'error' });
        }
    };

    const handleDragStart = (id: string) => {
        setDraggedId(id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (targetId: string) => {
        if (!draggedId || draggedId === targetId) {
            setDraggedId(null);
            return;
        }

        const newImages = [...images];
        const draggedIndex = newImages.findIndex((img) => img.id === draggedId);
        const targetIndex = newImages.findIndex((img) => img.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) {
            setDraggedId(null);
            return;
        }

        const [draggedItem] = newImages.splice(draggedIndex, 1);
        newImages.splice(targetIndex, 0, draggedItem);

        setImages(newImages);
        setDraggedId(null);

        // Save new order to API
        try {
            const orderedIds = newImages.map((img) => img.id);
            await fetch(`${BASE_URL}/gallery/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderedIds }),
            });
        } catch {
            setSnackbar({ open: true, message: 'Failed to save order.', severity: 'error' });
        }
    };

    return (
        <Box p={3}>
            <Typography variant="h5" mb={2}>
                Manage Gallery
            </Typography>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="body2" color="text.secondary">
                    Drag and drop to reorder. Toggle switch to show/hide on website.
                </Typography>
                <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleAdd}>
                    Add Image
                </Button>
            </Box>

            {loading ? (
                <Grid container spacing={2}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                        </Grid>
                    ))}
                </Grid>
            ) : images.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        No images in gallery yet. Click &quot;Add Image&quot; to get started.
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={2}>
                    {images.map((img) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={img.id}>
                            <Card
                                draggable
                                onDragStart={() => handleDragStart(img.id)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(img.id)}
                                sx={{
                                    opacity: draggedId === img.id ? 0.5 : 1,
                                    cursor: 'grab',
                                    position: 'relative',
                                    border: !img.isActive ? '2px dashed #ccc' : 'none',
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        left: 8,
                                        zIndex: 1,
                                        bgcolor: 'rgba(255,255,255,0.9)',
                                        borderRadius: 1,
                                        p: 0.5,
                                    }}
                                >
                                    <DragIndicator fontSize="small" />
                                </Box>
                                <CardMedia
                                    component="img"
                                    height="180"
                                    image={img.image?.url || '/placeholder.jpg'}
                                    alt={img.title || 'Gallery image'}
                                    sx={{ filter: !img.isActive ? 'grayscale(100%)' : 'none' }}
                                />
                                <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={img.isActive}
                                                onChange={() => handleToggleActive(img.id, img.isActive)}
                                                size="small"
                                            />
                                        }
                                        label={img.isActive ? 'Visible' : 'Hidden'}
                                        sx={{ m: 0 }}
                                    />
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => {
                                            setDeleteId(img.id);
                                            setOpenDelete(true);
                                        }}
                                    >
                                        <Delete />
                                    </IconButton>
                                </CardActions>
                                {img.title && (
                                    <Box px={2} pb={1}>
                                        <Typography variant="body2" noWrap>
                                            {img.title}
                                        </Typography>
                                    </Box>
                                )}
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Add Image Dialog */}
            <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Gallery Image</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Title (optional)"
                        name="title"
                        fullWidth
                        value={formData.title}
                        onChange={handleFormChange}
                    />
                    <TextField
                        margin="dense"
                        label="Description (optional)"
                        name="description"
                        fullWidth
                        multiline
                        rows={2}
                        value={formData.description}
                        onChange={handleFormChange}
                    />
                    <Box mt={2}>
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUpload />}
                            fullWidth
                            sx={{ py: 3, borderStyle: 'dashed' }}
                        >
                            {formData.imagePreview ? 'Change Image' : 'Select Image'}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFormChange}
                                name="image"
                                hidden
                            />
                        </Button>
                        {formData.imagePreview && (
                            <Box mt={2} textAlign="center">
                                <img
                                    src={formData.imagePreview}
                                    alt="Preview"
                                    style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
                                />
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenForm(false)} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleFormSubmit} variant="contained" color="primary" disabled={submitting}>
                        {submitting ? 'Uploading...' : 'Upload'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this image? This cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Delete
                    </Button>
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
