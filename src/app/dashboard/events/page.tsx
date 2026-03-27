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
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Snackbar,
  Alert,
  InputAdornment,
} from '@mui/material';
import { Add, Edit, Delete, Visibility, Search } from '@mui/icons-material';
import { BASE_URL } from '@/api/api';

type EventCategory = 'birthday' | 'hightea' | 'anniversary' | 'seasonal';

interface Event {
  id: string;
  title: string;
  category: EventCategory;
  price: string;
  description: string;
  longDescription: string;
  image?: { url: string; public_id?: string } | null;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: 'birthday', label: 'Birthday Parties' },
  { value: 'hightea', label: 'High Tea & Brunch' },
  { value: 'anniversary', label: 'Anniversary & Family' },
  { value: 'seasonal', label: 'Seasonal & Themed' },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filtered, setFiltered] = useState<Event[]>([]);
  const [searchText, setSearchText] = useState('');
  const [openView, setOpenView] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [selected, setSelected] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'birthday' as EventCategory,
    price: '',
    description: '',
    longDescription: '',
    image: null as File | null,
    imagePreview: '' as string,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const q = searchText.toLowerCase();
    setFiltered(events.filter((e) => e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)));
  }, [searchText, events]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/events`);
      if (!res.ok) {
        setSnackbar({
          open: true,
          message: `Failed to fetch events (${res.status}). Ensure the API is running. Dev: http://localhost:8000`,
          severity: 'error',
        });
        setEvents([]);
        return;
      }
      const json = (await res.json()) as { status?: boolean; data?: unknown[] };
      if (json?.status && Array.isArray(json.data)) {
        setEvents(json.data as Event[]);
      } else {
        setSnackbar({ open: true, message: 'Failed to fetch events.', severity: 'error' });
        setEvents([]);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to fetch events. Ensure the API is running (dev: http://localhost:8000).',
        severity: 'error',
      });
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (e: Event) => {
    setSelected(e);
    setOpenView(true);
  };

  const handleEdit = (e: Event) => {
    setFormData({
      title: e.title,
      category: e.category,
      price: e.price,
      description: e.description,
      longDescription: e.longDescription,
      image: null,
      imagePreview: e.image?.url || '',
    });
    setSelected(e);
    setFormMode('edit');
    setOpenForm(true);
  };

  const handleAdd = () => {
    setFormData({
      title: '',
      category: 'birthday',
      price: '',
      description: '',
      longDescription: '',
      image: null,
      imagePreview: '',
    });
    setSelected(null);
    setFormMode('add');
    setOpenForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${BASE_URL}/events/delete/${deleteId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.status) {
        setSnackbar({ open: true, message: 'Event deleted.', severity: 'success' });
        fetchEvents();
      } else setSnackbar({ open: true, message: json.error || 'Delete failed.', severity: 'error' });
    } catch {
      setSnackbar({ open: true, message: 'Delete failed.', severity: 'error' });
    }
    setOpenDelete(false);
    setDeleteId(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value?: unknown }>) => {
    const { name, value } = e.target;
    if (name === 'image' && 'files' in e.target && (e.target as HTMLInputElement).files?.length) {
      const file = (e.target as HTMLInputElement).files![0];
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name as keyof typeof formData]: value }));
  };

  const handleFormSubmit = async () => {
    if (!formData.title.trim()) {
      setSnackbar({ open: true, message: 'Title is required.', severity: 'error' });
      return;
    }
    const fd = new FormData();
    fd.append('title', formData.title.trim());
    fd.append('category', formData.category);
    fd.append('price', formData.price.trim());
    fd.append('description', formData.description.trim());
    fd.append('longDescription', formData.longDescription.trim());
    if (formData.image) fd.append('image', formData.image);

    const url = formMode === 'add' ? `${BASE_URL}/events/create` : `${BASE_URL}/events/update/${selected?.id}`;
    const method = formMode === 'add' ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, { method, body: fd });
      const json = await res.json();
      if (json.status) {
        setSnackbar({ open: true, message: formMode === 'add' ? 'Event created.' : 'Event updated.', severity: 'success' });
        setOpenForm(false);
        fetchEvents();
      } else setSnackbar({ open: true, message: json.error || 'Submit failed.', severity: 'error' });
    } catch {
      setSnackbar({ open: true, message: 'Submit failed.', severity: 'error' });
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Manage Events
      </Typography>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          placeholder="Search by title or category..."
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
        />
        <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleAdd}>
          Add Event
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Loading…
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No events yet. Add one from the button above.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((ev) => (
                <TableRow key={ev.id}>
                  <TableCell>{ev.title}</TableCell>
                  <TableCell>{CATEGORIES.find((c) => c.value === ev.category)?.label ?? ev.category}</TableCell>
                  <TableCell>{ev.price}</TableCell>
                  <TableCell>{ev.createdAt ? new Date(ev.createdAt).toLocaleDateString() : '—'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleView(ev)}>
                      <Visibility />
                    </IconButton>
                    <IconButton size="small" color="primary" onClick={() => handleEdit(ev)}>
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setDeleteId(ev.id);
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

      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent>
          {selected && (
            <Box>
              <Typography><strong>Title:</strong> {selected.title}</Typography>
              <Typography><strong>Category:</strong> {CATEGORIES.find((c) => c.value === selected.category)?.label ?? selected.category}</Typography>
              <Typography><strong>Price:</strong> {selected.price}</Typography>
              <Typography><strong>Description:</strong> {selected.description}</Typography>
              <Typography><strong>Long description:</strong> {selected.longDescription}</Typography>
              {selected.image?.url && (
                <Box mt={2}>
                  <img src={selected.image.url} alt={selected.title} style={{ maxWidth: '100%', borderRadius: 8 }} />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenView(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{formMode === 'add' ? 'Add Event' : 'Edit Event'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Title"
            name="title"
            fullWidth
            required
            value={formData.title}
            onChange={handleFormChange}
          />
          <FormControl margin="dense" fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              label="Category"
              onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value as EventCategory }))}
            >
              {CATEGORIES.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Price (e.g. LKR 2,000 PP or Varies)"
            name="price"
            fullWidth
            value={formData.price}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Short description"
            name="description"
            fullWidth
            multiline
            rows={2}
            value={formData.description}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Long description (for modal)"
            name="longDescription"
            fullWidth
            multiline
            rows={3}
            value={formData.longDescription}
            onChange={handleFormChange}
          />
          <Box mt={2}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFormChange}
              name="image"
              id="event-image"
              style={{ display: 'block', marginBottom: 8 }}
            />
            {formData.imagePreview && (
              <img src={formData.imagePreview} alt="Preview" style={{ maxWidth: 200, borderRadius: 8 }} />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button onClick={handleFormSubmit} variant="contained" color="primary">
            {formMode === 'add' ? 'Add' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Confirm delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this event?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
