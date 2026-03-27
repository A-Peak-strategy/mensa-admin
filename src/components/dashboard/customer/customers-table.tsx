'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  Checkbox,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import dayjs from 'dayjs';
import { useSelection } from '@/hooks/use-selection';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { BASE_URL } from '../../../api/api'

interface Order {
  id: string;
  user_name: string;
  user_email: string;
  user_mobile: string;
  deliveryDate: string;
  status: string;
  deliveryAddress: string;
  specialNotes: string;
  subtotal: string;
  total: string;
  paymentMethod: string;
  createdAt: string;
  items: {
    flavour: string;
    message: string;
    quantity: number;
    type: string;
  }[];
}

export function CustomersTable(): React.JSX.Element {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null);
  const [openEditDialog, setOpenEditDialog] = React.useState(false);
  const [openViewDialog, setOpenViewDialog] = React.useState(false);
  const [newStatus, setNewStatus] = React.useState('');
  const [specialNote, setSpecialNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [open, setOpen] = useState(false);
  const rowIds = React.useMemo(() => orders.map((order) => order.id), [orders]);
  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < orders.length;
  const selectedAll = orders.length > 0 && selected?.size === orders.length;

  const selectedOrder = orders.find(order => order.id === selectedOrderId);

  React.useEffect(() => {
    fetch(`${BASE_URL}/orders/get-all`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.data);
      })
      .catch((err) => {setErrorMessage('Failed to fetch orders: ' + err.message); setOpen(true);});
  }, []);

  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditClick = () => {
    if (selectedOrderId && selectedOrder) {
      setNewStatus(selectedOrder.status);
      setOpenEditDialog(true);
    }
  };

  const handleViewClick = () => {
    if (selectedOrderId && selectedOrder) {
      setOpenViewDialog(true);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrderId) return;

    try {
      const response = await fetch(`${BASE_URL}/orders/updateStatus/${selectedOrderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note: specialNote }),
      });

      if (response.ok) {
        const updatedOrders = orders.map((order) =>
          order.id === selectedOrderId
            ? { ...order, status: newStatus, note: specialNote }
            : order
        );
        setOrders(updatedOrders);
        setOpenEditDialog(false);
        setSelectedOrderId(null);
        setSpecialNote('');
      }
    } catch (error) {
      setErrorMessage('Failed to update order.');
      setOpen(true);
    }
  };

  const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAll}
                  indeterminate={selectedSome}
                  onChange={(event) => {
                    if (event.target.checked) {
                      selectAll();
                    } else {
                      deselectAll();
                    }
                  }}
                />
              </TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Delivery Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.map((order) => {
              const isSelected = selected?.has(order.id);
              return (
                <TableRow
                  hover
                  key={order.id}
                  selected={isSelected}
                  onClick={() => {setSelectedOrderId(order.id)}}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          selectOne(order.id);
                          setSelectedOrderId(order.id);
                        } else {
                          deselectOne(order.id);
                          setSelectedOrderId(null);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{order.user_name}</TableCell>
                  <TableCell>{order.user_email}</TableCell>
                  <TableCell>{order.user_mobile}</TableCell>
                  <TableCell>{order.deliveryDate}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>{dayjs(order.createdAt).format('MMM D, YYYY h:mm A')}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>

      {selectedOrderId && (
        <Box sx={{ p: 2, textAlign: 'right' }}>
          <Button variant="outlined" onClick={handleViewClick} sx={{ mr: 2 }}>
            View Order
          </Button>
          <Button variant="contained" onClick={handleEditClick}>
            Edit Selected Order
          </Button>
        </Box>
      )}

      <Divider />
      <TablePagination
        component="div"
        count={orders.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      <Snackbar open={open} autoHideDuration={6000} onClose={() => {setOpen(false)}}>
        <Alert onClose={() => {setOpen(false)}} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => {setOpenEditDialog(false)}}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Typography mb={1}>Select new status:</Typography>
          <Select
            fullWidth
            value={newStatus}
            onChange={(e) => {setNewStatus(e.target.value)}}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>

          <Typography mt={3} mb={1}>Special Note (optional):</Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="Enter any special note here..."
            value={specialNote}
            onChange={(e) => {setSpecialNote(e.target.value)}}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setOpenEditDialog(false)}}>Cancel</Button>
          <Button variant="contained" onClick={handleStatusUpdate}>Update</Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={openViewDialog} onClose={() => {setOpenViewDialog(false);}} maxWidth="md" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box>
              <Typography variant="h6" gutterBottom>User Information</Typography>
              <Box display="flex" flexDirection="column" gap={1} mb={2}>
                <Typography>Customer Name: {selectedOrder.user_name}</Typography>
                <Typography>Email: {selectedOrder.user_email}</Typography>
                <Typography>Phone: {selectedOrder.user_mobile}</Typography>
                <Typography>Address: {selectedOrder.deliveryAddress}</Typography>
                <Typography>Delivery Date: {selectedOrder.deliveryDate}</Typography>
                <Typography>Status: {selectedOrder.status}</Typography>
                <Typography>Special Notes: {selectedOrder.specialNotes || 'None'}</Typography>
                <Typography>Created At: {dayjs(selectedOrder.createdAt).format('MMM D, YYYY h:mm A')}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>Ordered Items</Typography>
              {selectedOrder.items.map((item: any, index: number) => (
                <Card key={index} variant="outlined" sx={{ mb: 2, p: 2, display: 'flex', gap: 2 }}>
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    width={100}
                    height={100}
                    style={{ objectFit: 'cover', borderRadius: '8px' }}
                  />
                  <Box flex={1}>
                    <Typography fontWeight="bold">{item.name}</Typography>
                    <Typography>Quantity: {item.quantity}</Typography>
                    <Typography>Base Price: Rs. {item.basePrice}</Typography>
                    <Typography>Additional Variations:</Typography>
                    <ul>
                      {item.variations.map((variation: any, idx: number) => (
                        <li key={idx}>
                          {variation.name}: {variation.option} {variation.additionalPrice > 0 && `( +Rs. ${variation.additionalPrice} )`}
                        </li>
                      ))}
                    </ul>
                    <Typography variant="subtitle2" mt={1}>Item Total: Rs. {item.totalPrice}</Typography>
                  </Box>
                </Card>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between">
                <Typography fontWeight="bold">Total:</Typography>
                <Typography>Rs. {selectedOrder.total}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography fontWeight="bold">Payment Method:</Typography>
                <Typography>{selectedOrder.paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' : selectedOrder.paymentMethod}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setOpenViewDialog(false);}}>Close</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
