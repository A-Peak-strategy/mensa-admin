// 'use client';

// import React, { useEffect, useState } from 'react';
// import {
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
//   Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
//   TextField, Typography, Pagination, Stack, IconButton, InputAdornment,
//   Snackbar, Alert, Container
// } from '@mui/material';
// import DeleteIcon from '@mui/icons-material/Delete';
// import SearchIcon from '@mui/icons-material/Search';
// import EditFood from './edit-food';

// interface VariationOption {
//   name: string;
//   additionalPrice: number;
// }

// interface Variation {
//   name: string;
//   options: VariationOption[];
// }

// interface Food {
//   id: string;
//   name: string;
//   description: string;
//   basePrice: number;
//   categoryName: string;
//   categoryId: string;
//   imageUrls: string[];
//   variations: Variation[];
//   createdAt: {
//     _seconds: number;
//     _nanoseconds: number;
//   };
// }

// export function UpdatePasswordForm(): React.JSX.Element {
//   const [foods, setFoods] = useState<Food[]>([]);
//   const [selectedFood, setSelectedFood] = useState<Food | null>(null);
//   const [viewOpen, setViewOpen] = useState(false);
//   const [editOpen, setEditOpen] = useState(false);
//   const [page, setPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
//   const [foodToDelete, setFoodToDelete] = useState<Food | null>(null); 
//   const rowsPerPage = 5;

//   const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

//   useEffect(() => {
//     fetchFoods();
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       const res = await fetch('http://localhost:8000/api/category');
//       const result = await res.json();
//       if (result.status) setCategories(result.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const fetchFoods = async () => {
//     try {
//       const res = await fetch('http://localhost:8000/api/foods/');
//       const result = await res.json();
//       if (result.status) setFoods(result.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleView = (food: Food) => {
//     setSelectedFood(food);
//     setViewOpen(true);
//   };

//   const handleEdit = (food: Food) => {
//     setSelectedFood(food);
//     setEditOpen(true);
//   };

//   const handleConfirmDelete = (food: Food) => {
//     setFoodToDelete(food);
//     setConfirmDeleteOpen(true);
//   };

//   const handleDelete = async () => {
//     if (foodToDelete) {
//       try {
//         await fetch(`http://localhost:8000/api/foods/delete/${foodToDelete.id}`, { method: 'DELETE' });
//         setFoods(foods.filter(food => food.id !== foodToDelete.id));
//         setConfirmDeleteOpen(false);
//         setFoodToDelete(null);
//       } catch (err) {
//         console.error(err);
//       }
//     }
//   };

//   const handleCancelDelete = () => {
//     setConfirmDeleteOpen(false);
//     setFoodToDelete(null);
//   };

//   const handleEditSuccess = () => {
//     setEditOpen(false);
//     setSelectedFood(null);
//     setShowSuccess(true);
//     fetchFoods();
//   };

//   const handleEditClose = () => {
//     setEditOpen(false);
//     setSelectedFood(null);
//   };

//   const filteredFoods = foods.filter(food =>
//     food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     food.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const paginatedFoods = filteredFoods.slice((page - 1) * rowsPerPage, page * rowsPerPage);

//   return (
//     <Container>
//       <Paper sx={{ padding: 2 }}>
//         <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
//           <Typography variant="h6">Food Items</Typography>
//           <TextField
//             placeholder="Search by name or category"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon />
//                 </InputAdornment>
//               )
//             }}
//           />
//         </Stack>
//         <TableContainer component={Paper}>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Name</TableCell>
//                 <TableCell>Base Price</TableCell>
//                 <TableCell>Category</TableCell>
//                 <TableCell>Description</TableCell>
//                 <TableCell>Actions</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {paginatedFoods.map((food) => (
//                 <TableRow key={food.id}>
//                   <TableCell>{food.name}</TableCell>
//                   <TableCell>{food.basePrice}</TableCell>
//                   <TableCell>{food.categoryName}</TableCell>
//                   <TableCell>{food.description}</TableCell>
//                   <TableCell>
//                     <Button onClick={() => handleView(food)} sx={{ mr: 1 }}>View</Button>
//                     <Button variant="outlined" onClick={() => handleEdit(food)} sx={{ mr: 1 }}>Edit</Button>
//                     <IconButton color="error" onClick={() => handleConfirmDelete(food)}>
//                       <DeleteIcon />
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//         <Stack mt={2} alignItems="center">
//           <Pagination
//             count={Math.ceil(filteredFoods.length / rowsPerPage)}
//             page={page}
//             onChange={(_, value) => setPage(value)}
//           />
//         </Stack>

//         <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth>
//           <DialogTitle>Food Details</DialogTitle>
//           <DialogContent dividers>
//             {selectedFood && (
//               <Stack spacing={2}>
//                 <Typography><strong>Name:</strong> {selectedFood.name}</Typography>
//                 <Typography><strong>Description:</strong> {selectedFood.description}</Typography>
//                 <Typography><strong>Base Price:</strong> {selectedFood.basePrice}</Typography>
//                 <Typography><strong>Category:</strong> {selectedFood.categoryName}</Typography>
//                 <Typography><strong>Variations:</strong></Typography>
//                 {selectedFood.variations.map((v, i) => (
//                   <Typography key={i} sx={{ pl: 2 }}>- {v.name}: {v.options.map(o => o.name).join(', ')}</Typography>
//                 ))}
//                 <Typography><strong>Images:</strong></Typography>
//                 <Stack direction="row" spacing={1}>
//                   {selectedFood.imageUrls.map((url, i) => (
//                     <img key={i} src={url} alt="food" width="100" height="100" style={{ objectFit: 'cover' }} />
//                   ))}
//                 </Stack>
//               </Stack>
//             )}
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setViewOpen(false)}>Close</Button>
//           </DialogActions>
//         </Dialog>

//         <Dialog open={editOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
//           <EditFood
//             foodToEdit={selectedFood}
//             onEditSuccess={handleEditSuccess}
//             onClose={handleEditClose}
//           />
//         </Dialog>

//         <Dialog open={confirmDeleteOpen} onClose={handleCancelDelete}>
//           <DialogTitle>Confirm Deletion</DialogTitle>
//           <DialogContent>
//             <Typography>Are you sure you want to delete this food?</Typography>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleDelete} color="error" variant="contained">
//               Yes
//             </Button>
//             <Button onClick={handleCancelDelete} color="primary" variant="outlined">
//               No
//             </Button>
//           </DialogActions>
//         </Dialog>

//         <Snackbar open={showSuccess} autoHideDuration={3000} onClose={() => setShowSuccess(false)}>
//           <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
//             Food updated successfully!
//           </Alert>
//         </Snackbar>
//       </Paper>
//     </Container>
//   );
// }

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, Pagination, Stack, IconButton, InputAdornment,
  Snackbar, Alert, Container
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import EditFood from './edit-food';
import { BASE_URL } from '../../../api/api';

interface VariationOption {
  name: string;
  additionalPrice: number;
}

interface Variation {
  name: string;
  options: VariationOption[];
}

interface Food {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  categoryName: string;
  categoryId: string;
  imageUrls: string[];
  variations: Variation[];
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

interface Category {
  id: string;
  name: string;
}

interface ApiResponse<T> {
  status: boolean;
  data: T;
}

export function UpdatePasswordForm(): React.JSX.Element {
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState<Food | null>(null);
  const rowsPerPage = 5;

  const fetchCategories = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch(`${BASE_URL}/category`);
      const result: ApiResponse<Category[]> = await res.json();
      if (result.status) {
        // Categories are fetched but not used in current implementation
        // Keeping the fetch for potential future use
      }
    } catch (err) {
      // Consider implementing proper error handling (e.g., error state, user notification)
    }
  }, []);

  const fetchFoods = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch(`${BASE_URL}/foods/`);
      const result: ApiResponse<Food[]> = await res.json();
      if (result.status) {
        setFoods(result.data);
      }
    } catch (err) {
      // Consider implementing proper error handling
    }
  }, []);

  useEffect(() => {
    void fetchFoods();
    void fetchCategories();
  }, [fetchFoods, fetchCategories]);

  const handleView = useCallback((food: Food): void => {
    setSelectedFood(food);
    setViewOpen(true);
  }, []);

  const handleEdit = useCallback((food: Food): void => {
    setSelectedFood(food);
    setEditOpen(true);
  }, []);

  const handleConfirmDelete = useCallback((food: Food): void => {
    setFoodToDelete(food);
    setConfirmDeleteOpen(true);
  }, []);

  const handleDelete = useCallback(async (): Promise<void> => {
    if (foodToDelete) {
      try {
        const response = await fetch(`${BASE_URL}/foods/delete/${foodToDelete.id}`, { method: 'DELETE' });
        if (response.ok) {
          setFoods((prevFoods) => prevFoods.filter(food => food.id !== foodToDelete.id));
          setConfirmDeleteOpen(false);
          setFoodToDelete(null);
        }
      } catch (err) {
        // Consider implementing proper error handling
      }
    }
  }, [foodToDelete]);

  const handleCancelDelete = useCallback((): void => {
    setConfirmDeleteOpen(false);
    setFoodToDelete(null);
  }, []);

  const handleEditSuccess = useCallback((): void => {
    setEditOpen(false);
    setSelectedFood(null);
    setShowSuccess(true);
    void fetchFoods();
  }, [fetchFoods]);

  const handleEditClose = useCallback((): void => {
    setEditOpen(false);
    setSelectedFood(null);
  }, []);

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedFoods = filteredFoods.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Container>
      <Paper sx={{ padding: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Food Items</Typography>
          <TextField
            placeholder="Search by name or category"
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value);}}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Stack>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Base Price</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedFoods.map((food) => (
                <TableRow key={food.id}>
                  <TableCell>{food.name}</TableCell>
                  <TableCell>{food.basePrice}</TableCell>
                  <TableCell>{food.categoryName}</TableCell>
                  <TableCell>{food.description}</TableCell>
                  <TableCell>
                    <Button onClick={() => {handleView(food);}} sx={{ mr: 1 }}>View</Button>
                    <Button variant="outlined" onClick={() => {handleEdit(food);}} sx={{ mr: 1 }}>Edit</Button>
                    <IconButton color="error" onClick={() => {handleConfirmDelete(food);}}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack mt={2} alignItems="center">
          <Pagination
            count={Math.ceil(filteredFoods.length / rowsPerPage)}
            page={page}
            onChange={(_, value) => {setPage(value);}}
          />
        </Stack>

        {selectedFood && (
          <Dialog open={viewOpen} onClose={() => {setViewOpen(false);}} maxWidth="md" fullWidth>
            <DialogTitle>Food Details</DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <Typography><strong>Name:</strong> {selectedFood.name}</Typography>
                <Typography><strong>Description:</strong> {selectedFood.description}</Typography>
                <Typography><strong>Base Price:</strong> {selectedFood.basePrice}</Typography>
                <Typography><strong>Category:</strong> {selectedFood.categoryName}</Typography>
                <Typography><strong>Variations:</strong></Typography>
                {selectedFood.variations.map((v) => (
                  <Typography key={`${selectedFood.id}-variation-${v.name}`} sx={{ pl: 2 }}>
                    - {v.name}: {v.options.map(o => o.name).join(', ')}
                  </Typography>
                ))}
                <Typography><strong>Images:</strong></Typography>
                <Stack direction="row" spacing={1}>
                  {selectedFood.imageUrls.map((url) => (
                    <img key={`${selectedFood.id}-image-${url}`} src={url} alt="food" width="100" height="100" style={{ objectFit: 'cover' }} />
                  ))}
                </Stack>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {setViewOpen(false);}}>Close</Button>
            </DialogActions>
          </Dialog>
        )}

        {selectedFood && (
          <Dialog open={editOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
            <EditFood
              foodToEdit={selectedFood}
              onEditSuccess={handleEditSuccess}
              onClose={handleEditClose}
            />
          </Dialog>
        )}

        <Dialog open={confirmDeleteOpen} onClose={handleCancelDelete}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this food?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => void handleDelete()} color="error" variant="contained">
              Yes
            </Button>
            <Button onClick={handleCancelDelete} color="primary" variant="outlined">
              No
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={showSuccess} autoHideDuration={3000} onClose={() => {setShowSuccess(false);}}>
          <Alert onClose={() => { setShowSuccess(false); }} severity="success" sx={{ width: '100%' }}>
            Food updated successfully!
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
}