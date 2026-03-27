'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
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
    Chip,
    Grid,
} from '@mui/material';
import { Add, Edit, Delete, Visibility, Search, Refresh } from '@mui/icons-material';
import { BASE_URL } from '@/api/api';

interface Category {
    id: string;
    name: string;
}

interface Variation {
    name: string;
    options: { name: string; additionalPrice: number }[];
}

interface Food {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    categoryId: string;
    categoryName?: string;
    imageUrls?: { url: string; public_id?: string }[];
    variations?: Variation[];
    createdAt?: string;
    updatedAt?: string;
}

const VariationsEditor = ({
    variationsRaw,
    onChange
}: {
    variationsRaw: string;
    onChange: (val: string) => void;
}) => {
    let variations: Variation[] = [];
    try {
        variations = JSON.parse(variationsRaw);
        if (!Array.isArray(variations)) variations = [];
    } catch {
        variations = [];
    }

    const update = (newV: Variation[]) => {
        onChange(JSON.stringify(newV));
    };

    return (
        <Box mt={2} mb={2} component={Paper} variant="outlined" p={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight={600}>Variations & Add-ons</Typography>
                <Button size="small" startIcon={<Add />} onClick={() => update([...variations, { name: '', options: [] }])}>
                    Add Variation Group
                </Button>
            </Box>
            {variations.length === 0 && (
                <Typography variant="body2" color="text.secondary">No variations added. Item will have a fixed price.</Typography>
            )}
            {variations.map((v, vIndex) => (
                <Box key={vIndex} mb={2} p={2} bgcolor="grey.50" borderRadius={1} border="1px solid #e0e0e0">
                    <Box display="flex" gap={2} mb={2} alignItems="center">
                        <TextField
                            size="small"
                            label="Variation Name (e.g. Size)"
                            value={v.name}
                            onChange={(e) => {
                                const newV = [...variations];
                                newV[vIndex].name = e.target.value;
                                update(newV);
                            }}
                            fullWidth
                        />
                        <IconButton color="error" onClick={() => update(variations.filter((_, i) => i !== vIndex))}>
                            <Delete />
                        </IconButton>
                    </Box>
                    
                    <Typography variant="body2" fontWeight={500} mb={1}>Options:</Typography>
                    {v.options.map((opt, oIndex) => (
                        <Box key={oIndex} display="flex" gap={2} mb={1} alignItems="center" pl={2}>
                            <TextField
                                size="small"
                                label="Option Name (e.g. Large)"
                                value={opt.name}
                                onChange={(e) => {
                                    const newV = [...variations];
                                    newV[vIndex].options[oIndex].name = e.target.value;
                                    update(newV);
                                }}
                                fullWidth
                            />
                            <TextField
                                size="small"
                                label="Add Price (LKR)"
                                type="number"
                                value={opt.additionalPrice === 0 ? '' : opt.additionalPrice}
                                onChange={(e) => {
                                    const newV = [...variations];
                                    newV[vIndex].options[oIndex].additionalPrice = Number(e.target.value) || 0;
                                    update(newV);
                                }}
                                sx={{ width: 150 }}
                            />
                            <IconButton size="small" color="error" onClick={() => {
                                const newV = [...variations];
                                newV[vIndex].options = newV[vIndex].options.filter((_, i) => i !== oIndex);
                                update(newV);
                            }}>
                                <Delete fontSize="small" />
                            </IconButton>
                        </Box>
                    ))}
                    <Box pl={2}>
                        <Button size="small" startIcon={<Add />} onClick={() => {
                            const newV = [...variations];
                            newV[vIndex].options.push({ name: '', additionalPrice: 0 });
                            update(newV);
                        }}>
                            Add Option
                        </Button>
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export default function FoodsPage() {
    const [foods, setFoods] = useState<Food[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filtered, setFiltered] = useState<Food[]>([]);
    const [searchText, setSearchText] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [loading, setLoading] = useState(false);

    const [openView, setOpenView] = useState(false);
    const [openForm, setOpenForm] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
    const [selected, setSelected] = useState<Food | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        basePrice: '',
        categoryId: '',
        variations: '[]',
        images: null as FileList | null,
    });

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        fetchFoods();
        fetchCategories();
    }, []);

    useEffect(() => {
        let result = foods;
        if (categoryFilter !== 'all') {
            result = result.filter((f) => f.categoryId === categoryFilter);
        }
        if (searchText) {
            const q = searchText.toLowerCase();
            result = result.filter((f) => f.name.toLowerCase().includes(q) || f.description?.toLowerCase().includes(q));
        }
        setFiltered(result);
    }, [searchText, categoryFilter, foods]);

    const fetchFoods = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/foods`);
            if (!res.ok) throw new Error('Failed');
            const json = await res.json();
            if (json.status && Array.isArray(json.data)) {
                setFoods(json.data);
            } else {
                setFoods([]);
            }
        } catch {
            setSnackbar({ open: true, message: 'Failed to fetch foods.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${BASE_URL}/category`);
            const json = await res.json();
            if (json.status && Array.isArray(json.data)) {
                setCategories(json.data);
            }
        } catch {
            // Silent fail for categories
        }
    };

    const handleView = (food: Food) => {
        setSelected(food);
        setOpenView(true);
    };

    const handleAdd = () => {
        setFormData({
            name: '',
            description: '',
            basePrice: '',
            categoryId: categories[0]?.id || '',
            variations: '[]',
            images: null,
        });
        setSelected(null);
        setFormMode('add');
        setOpenForm(true);
    };

    const handleEdit = (food: Food) => {
        setFormData({
            name: food.name,
            description: food.description || '',
            basePrice: String(food.basePrice),
            categoryId: food.categoryId,
            variations: JSON.stringify(food.variations || []),
            images: null,
        });
        setSelected(food);
        setFormMode('edit');
        setOpenForm(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`${BASE_URL}/foods/delete/${deleteId}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.status) {
                setSnackbar({ open: true, message: 'Food item deleted.', severity: 'success' });
                fetchFoods();
            } else {
                throw new Error(json.error || 'Delete failed');
            }
        } catch {
            setSnackbar({ open: true, message: 'Failed to delete.', severity: 'error' });
        }
        setOpenDelete(false);
        setDeleteId(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value?: unknown }>) => {
        const { name, value } = e.target;
        if (name === 'images' && 'files' in e.target) {
            setFormData((prev) => ({ ...prev, images: (e.target as HTMLInputElement).files }));
            return;
        }
        setFormData((prev) => ({ ...prev, [name as string]: value }));
    };

    const handleFormSubmit = async () => {
        if (!formData.name.trim() || !formData.basePrice) {
            setSnackbar({ open: true, message: 'Name and base price are required.', severity: 'error' });
            return;
        }

        const fd = new FormData();
        fd.append('name', formData.name.trim());
        fd.append('description', formData.description.trim());
        fd.append('basePrice', formData.basePrice);
        fd.append('categoryId', formData.categoryId);
        
        const catName = categories.find((c) => c.id === formData.categoryId)?.name || formData.categoryId;
        fd.append('categoryName', catName);
        
        fd.append('variations', formData.variations);

        if (formData.images) {
            Array.from(formData.images).forEach((file) => {
                fd.append('images', file);
            });
        }

        const url = formMode === 'add' ? `${BASE_URL}/foods/create` : `${BASE_URL}/foods/update/${selected?.id}`;
        const method = formMode === 'add' ? 'POST' : 'PUT';

        try {
            const res = await fetch(url, { method, body: fd });
            const json = await res.json();
            if (json.status) {
                setSnackbar({ open: true, message: formMode === 'add' ? 'Food created.' : 'Food updated.', severity: 'success' });
                setOpenForm(false);
                fetchFoods();
            } else {
                let errMsg = json.error || 'Submit failed';
                if (json.errors) {
                     errMsg = json.errors.map((e: any) => e.msg).join(', ');
                }
                throw new Error(errMsg);
            }
        } catch (err: any) {
            console.error(err);
            setSnackbar({ open: true, message: err.message || 'Failed to save.', severity: 'error' });
        }
    };

    const getCategoryName = (catId: string) => {
        return categories.find((c) => c.id === catId)?.name || catId;
    };

    return (
        <Box p={3}>
            <Typography variant="h5" mb={2}>
                Manage Menu Items
            </Typography>

            <Box display="flex" gap={2} alignItems="center" mb={2} flexWrap="wrap" justifyContent="space-between">
                <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                    <TextField
                        placeholder="Search by name..."
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
                        sx={{ minWidth: 250 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={categoryFilter}
                            label="Category"
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <MenuItem value="all">All Categories</MenuItem>
                            {categories.map((c) => (
                                <MenuItem key={c.id} value={c.id}>
                                    {c.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button variant="outlined" startIcon={<Refresh />} onClick={fetchFoods} disabled={loading}>
                        Refresh
                    </Button>
                </Box>
                <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleAdd}>
                    Add Food Item
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Image</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Base Price</TableCell>
                            <TableCell>Variations</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    Loading…
                                </TableCell>
                            </TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No menu items found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((food) => (
                                <TableRow key={food.id} hover>
                                    <TableCell>
                                        {food.imageUrls?.[0]?.url ? (
                                            <img
                                                src={food.imageUrls[0].url}
                                                alt={food.name}
                                                style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }}
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: 50,
                                                    height: 50,
                                                    bgcolor: 'grey.200',
                                                    borderRadius: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                —
                                            </Box>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={500}>
                                            {food.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {food.description}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={getCategoryName(food.categoryId)} size="small" />
                                    </TableCell>
                                    <TableCell>LKR {food.basePrice.toLocaleString()}</TableCell>
                                    <TableCell>{food.variations?.length || 0}</TableCell>
                                    <TableCell>
                                        <IconButton size="small" onClick={() => handleView(food)}>
                                            <Visibility />
                                        </IconButton>
                                        <IconButton size="small" color="primary" onClick={() => handleEdit(food)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => {
                                                setDeleteId(food.id);
                                                setOpenDelete(true);
                                            }}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* View Dialog */}
            <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Food Item Details</DialogTitle>
                <DialogContent>
                    {selected && (
                        <Box>
                            {selected.imageUrls && selected.imageUrls.length > 0 && (
                                <Box mb={2} display="flex" gap={1} flexWrap="wrap">
                                    {selected.imageUrls.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img.url}
                                            alt={selected.name}
                                            style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8 }}
                                        />
                                    ))}
                                </Box>
                            )}
                            <Typography variant="h6">{selected.name}</Typography>
                            <Typography variant="body2" color="text.secondary" mb={1}>
                                {selected.description}
                            </Typography>
                            <Box display="flex" gap={2} mb={1}>
                                <Typography variant="body2">
                                    <strong>Category:</strong> {getCategoryName(selected.categoryId)}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Base Price:</strong> LKR {selected.basePrice.toLocaleString()}
                                </Typography>
                            </Box>
                            {selected.variations && selected.variations.length > 0 && (
                                <Box mt={2}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Variations
                                    </Typography>
                                    {selected.variations.map((v, idx) => (
                                        <Box key={idx} mb={1} pl={2}>
                                            <Typography variant="body2" fontWeight={500}>
                                                {v.name}
                                            </Typography>
                                            <Box display="flex" gap={1} flexWrap="wrap">
                                                {v.options.map((opt, oidx) => (
                                                    <Chip
                                                        key={oidx}
                                                        label={`${opt.name}${opt.additionalPrice > 0 ? ` (+${opt.additionalPrice})` : ''}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenView(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Add/Edit Dialog */}
            <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{formMode === 'add' ? 'Add Food Item' : 'Edit Food Item'}</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Name"
                        name="name"
                        fullWidth
                        required
                        value={formData.name}
                        onChange={handleFormChange}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        name="description"
                        fullWidth
                        multiline
                        rows={2}
                        value={formData.description}
                        onChange={handleFormChange}
                    />
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                margin="dense"
                                label="Base Price (LKR)"
                                name="basePrice"
                                type="number"
                                fullWidth
                                required
                                value={formData.basePrice}
                                onChange={handleFormChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl margin="dense" fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    name="categoryId"
                                    value={formData.categoryId}
                                    label="Category"
                                    onChange={(e) => setFormData((p) => ({ ...p, categoryId: e.target.value }))}
                                >
                                    {categories.map((c) => (
                                        <MenuItem key={c.id} value={c.id}>
                                            {c.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <VariationsEditor
                        variationsRaw={formData.variations}
                        onChange={(val) => setFormData(p => ({ ...p, variations: val }))}
                    />
                    <Box mt={2}>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFormChange}
                            name="images"
                            style={{ display: 'block' }}
                        />
                        <Typography variant="caption" color="text.secondary">
                            Upload up to 5 images
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenForm(false)}>Cancel</Button>
                    <Button onClick={handleFormSubmit} variant="contained" color="primary">
                        {formMode === 'add' ? 'Add' : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this food item?</Typography>
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
