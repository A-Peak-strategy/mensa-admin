"use client";

import React, { useEffect, useState } from "react";
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, Typography, Grid, Paper,
    Snackbar, Alert, InputAdornment
} from "@mui/material";
import { Add, Edit, Delete, Visibility, Search } from "@mui/icons-material";
import { BASE_URL } from '../../../api/api';

interface Category {
    id: string;
    name: string;
    description: string;
    imageUrls: string[];
    createdAt: string;
    updatedAt: string;
}

const CategoryTable: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
    const [searchText, setSearchText] = useState("");
    const [openView, setOpenView] = useState(false);
    const [openForm, setOpenForm] = useState(false);
    const [formMode, setFormMode] = useState<"add" | "edit">("add");
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        imageUrls: [] as string[],
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const filtered = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredCategories(filtered);
    }, [searchText, categories]);

    const fetchCategories = async () => {
        try {
        const res = await fetch(`${BASE_URL}/category`);
        const data = await res.json();
        setCategories(data.data);
        } catch (error) {
        setSnackbar({ open: true, message: "Failed to fetch category.", severity: "error" });
        }
    };

    const handleView = (category: Category) => {
        setSelectedCategory(category);
        setOpenView(true);
    };

    const handleEdit = (category: Category) => {
        setFormData({ name: category.name, description: category.description, imageUrls: category.imageUrls });
        setSelectedCategory(category);
        setFormMode("edit");
        setOpenForm(true);
    };

    const handleDelete = async () => {
        if (!deleteTargetId) return;
        try {
        await fetch(`${BASE_URL}/category/delete/${deleteTargetId}`, {
            method: "DELETE",
        });
        setSnackbar({ open: true, message: "Category deleted successfully.", severity: "success" });
        fetchCategories();
        } catch (error) {
        setSnackbar({ open: true, message: "Failed to delete category.", severity: "error" });
        } finally {
        setOpenDeleteDialog(false);
        }
    };

    const handleFormSubmit = async () => {
        if (!formData.name.trim() || !formData.description.trim()) {
            setSnackbar({
            open: true,
            message: "Name and Description are required.",
            severity: "error",
            });
            return;
        }
        
        const formPayload = new FormData();
        formPayload.append("name", formData.name);
        formPayload.append("description", formData.description);

        const url =
        formMode === "add"
            ? `${BASE_URL}/category/create`
            : `${BASE_URL}/category/update/${selectedCategory?.id}`;

        const method = formMode === "add" ? "POST" : "PUT";

        try {
        await fetch(url, {
            method,
            body: formPayload,
        });
        setSnackbar({ open: true, message: `Category ${formMode === "add" ? "created" : "updated"} successfully.`, severity: "success" });
        setOpenForm(false);
        fetchCategories();
        } catch (error) {
        setSnackbar({ open: true, message: "Failed to submit form.", severity: "error" });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <Box p={3}>
        <Typography variant="h5" mb={2}>All Categories</Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <TextField
            placeholder="Search by name..."
            variant="outlined"
            size="small"
            value={searchText}
            onChange={(e) => {setSearchText(e.target.value)}}
            InputProps={{
                startAdornment: (
                <InputAdornment position="start">
                    <Search />
                </InputAdornment>
                ),
            }}
            />
            <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => {
                setFormData({ name: "", description: "", imageUrls: [] });
                setFormMode("add");
                setOpenForm(true);
            }}
            >
            Add New Category
            </Button>
        </Box>

        <TableContainer component={Paper}>
            <Table>
            <TableHead>
                <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Updated At</TableCell>
                <TableCell>Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {filteredCategories.map((cat) => (
                <TableRow key={cat.id}>
                    <TableCell>{cat.name}</TableCell>
                    <TableCell>{cat.description}</TableCell>
                    <TableCell>{new Date(cat.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(cat.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                    <IconButton onClick={() => {handleView(cat)}}><Visibility /></IconButton>
                    <IconButton color="primary" onClick={() => {handleEdit(cat)}}><Edit /></IconButton>
                    <IconButton color="error" onClick={() => {
                        setDeleteTargetId(cat.id);
                        setOpenDeleteDialog(true);
                    }}><Delete /></IconButton>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </TableContainer>

        {/* View Dialog */}
        <Dialog open={openView} onClose={() => {setOpenView(false)}}>
            <DialogTitle>Category Details</DialogTitle>
            <DialogContent>
            {selectedCategory && (
                <Box>
                <Typography><strong>Name:</strong> {selectedCategory.name}</Typography>
                <Typography><strong>Description:</strong> {selectedCategory.description}</Typography>
                <Typography><strong>Created At:</strong> {new Date(selectedCategory.createdAt).toLocaleString()}</Typography>
                <Typography><strong>Updated At:</strong> {new Date(selectedCategory.updatedAt).toLocaleString()}</Typography>
                {selectedCategory.imageUrls?.length > 0 && (
                    <Grid container spacing={1} mt={1}>
                    {selectedCategory.imageUrls.map((url, idx) => (
                        <Grid item xs={6} key={idx}>
                        <img src={url} alt="category-img" width="100%" />
                        </Grid>
                    ))}
                    </Grid>
                )}
                </Box>
            )}
            </DialogContent>
            <DialogActions>
            <Button onClick={() => {setOpenView(false)}}>Close</Button>
            </DialogActions>
        </Dialog>

        {/* Add/Edit Dialog */}
        <Dialog open={openForm} onClose={() => {setOpenForm(false)}} fullWidth>
            <DialogTitle>{formMode === "add" ? "Add Category" : "Edit Category"}</DialogTitle>
            <DialogContent>
            <TextField
                margin="dense"
                label="Name"
                name="name"
                fullWidth
                required
                value={formData.name}
                onChange={handleInputChange}
            />
            <TextField
                margin="dense"
                label="Description"
                name="description"
                fullWidth
                required
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
            />
            {/* Image input can be added here */}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {setOpenForm(false)}}>Cancel</Button>
                <Button onClick={handleFormSubmit} variant="contained" color="primary">
                    {formMode === "add" ? "Add" : "Update"}
                </Button>
            </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => {setOpenDeleteDialog(false)}}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
            <Typography>Are you sure you want to delete this category?</Typography>
            </DialogContent>
            <DialogActions>
            <Button onClick={() => {setOpenDeleteDialog(false)}}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
            </DialogActions>
        </Dialog>

        {/* Snackbar Alert */}
        <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => {setSnackbar({ ...snackbar, open: false })}}
        >
            <Alert severity={snackbar.severity} variant="filled">
            {snackbar.message}
            </Alert>
        </Snackbar>
        </Box>
    );
};

export default CategoryTable;

// ================================ with image upload ==============================

// "use client";

// import React, { useEffect, useState } from "react";
// import {
//   Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   IconButton, Table, TableBody, TableCell, TableContainer,
//   TableHead, TableRow, TextField, Typography, Grid, Paper,
//   Snackbar, Alert, InputAdornment, Pagination
// } from "@mui/material";
// import { Add, Edit, Delete, Visibility, Search } from "@mui/icons-material";
// import { BASE_URL } from '../../../api/api';

// interface Category {
//   id: string;
//   name: string;
//   description: string;
//   imageUrls: { url: string }[];
//   createdAt: string;
//   updatedAt: string;
// }

// const ITEMS_PER_PAGE = 5;

// const CategoryTable: React.FC = () => {
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [searchText, setSearchText] = useState("");
//   const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
//   const [paginatedCategories, setPaginatedCategories] = useState<Category[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);

//   const [openView, setOpenView] = useState(false);
//   const [openForm, setOpenForm] = useState(false);
//   const [formMode, setFormMode] = useState<"add" | "edit">("add");
//   const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     image: null as File | null,
//     preview: "",
//   });

//   const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
//   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
//   const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     const filtered = categories.filter((cat) =>
//       cat.name.toLowerCase().includes(searchText.toLowerCase())
//     );
//     setFilteredCategories(filtered);
//     setCurrentPage(1);
//   }, [searchText, categories]);

//   useEffect(() => {
//     const start = (currentPage - 1) * ITEMS_PER_PAGE;
//     const end = start + ITEMS_PER_PAGE;
//     setPaginatedCategories(filteredCategories.slice(start, end));
//   }, [currentPage, filteredCategories]);

//   const fetchCategories = async () => {
//     try {
//       const res = await fetch(`${BASE_URL}/category`);
//       const data = await res.json();
//       setCategories(data.data);
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//     }
//   };

//   const handleView = (category: Category) => {
//     setSelectedCategory(category);
//     setOpenView(true);
//   };

//   const handleEdit = (category: Category) => {
//     setFormData({
//       name: category.name,
//       description: category.description,
//       image: null,
//       preview: category.imageUrls?.[0]?.url || "",
//     });
//     setSelectedCategory(category);
//     setFormMode("edit");
//     setOpenForm(true);
//   };

//   const handleDelete = async () => {
//     if (!deleteTargetId) return;
//     try {
//       await fetch(`${BASE_URL}/category/delete/${deleteTargetId}`, {
//         method: "DELETE",
//       });
//       setSnackbar({ open: true, message: "Category deleted successfully.", severity: "success" });
//       fetchCategories();
//     } catch (error) {
//       setSnackbar({ open: true, message: "Failed to delete category.", severity: "error" });
//     } finally {
//       setOpenDeleteDialog(false);
//     }
//   };

//   const handleFormSubmit = async () => {
//     const formPayload = new FormData();
//     formPayload.append("name", formData.name);
//     formPayload.append("description", formData.description);
//     if (formData.image) formPayload.append("image", formData.image);

//     const url =
//       formMode === "add"
//         ? `${BASE_URL}/category/create`
//         : `${BASE_URL}/category/update/${selectedCategory?.id}`;

//     const method = formMode === "add" ? "POST" : "PUT";

//     try {
//       await fetch(url, {
//         method,
//         body: formPayload,
//       });
//       setSnackbar({ open: true, message: `Category ${formMode === "add" ? "created" : "updated"} successfully.`, severity: "success" });
//       setOpenForm(false);
//       fetchCategories();
//     } catch (error) {
//       setSnackbar({ open: true, message: "Failed to submit form.", severity: "error" });
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value, files } = e.target;
//     if (name === "image" && files && files.length > 0) {
//       const file = files[0];
//       setFormData((prev) => ({
//         ...prev,
//         image: file,
//         preview: URL.createObjectURL(file),
//       }));
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//     }
//   };

//   return (
//     <Box p={3}>
//       <Typography variant="h5" mb={2}>All Categories</Typography>

//       <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//         <TextField
//           placeholder="Search by name..."
//           variant="outlined"
//           size="small"
//           value={searchText}
//           onChange={(e) => setSearchText(e.target.value)}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <Search />
//               </InputAdornment>
//             ),
//           }}
//         />
//         <Button
//           variant="contained"
//           color="primary"
//           startIcon={<Add />}
//           onClick={() => {
//             setFormData({ name: "", description: "", image: null, preview: "" });
//             setFormMode("add");
//             setOpenForm(true);
//           }}
//         >
//           Add New Category
//         </Button>
//       </Box>

//       <TableContainer component={Paper}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>Name</TableCell>
//               <TableCell>Description</TableCell>
//               <TableCell>Created At</TableCell>
//               <TableCell>Updated At</TableCell>
//               <TableCell>Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {paginatedCategories.map((cat) => (
//               <TableRow key={cat.id}>
//                 <TableCell>{cat.name}</TableCell>
//                 <TableCell>{cat.description}</TableCell>
//                 <TableCell>{new Date(cat.createdAt).toLocaleDateString()}</TableCell>
//                 <TableCell>{new Date(cat.updatedAt).toLocaleDateString()}</TableCell>
//                 <TableCell>
//                   <IconButton onClick={() => handleView(cat)}><Visibility /></IconButton>
//                   <IconButton color="primary" onClick={() => handleEdit(cat)}><Edit /></IconButton>
//                   <IconButton color="error" onClick={() => {
//                     setDeleteTargetId(cat.id);
//                     setOpenDeleteDialog(true);
//                   }}><Delete /></IconButton>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       <Box mt={2} display="flex" justifyContent="center">
//         <Pagination
//           count={Math.ceil(filteredCategories.length / ITEMS_PER_PAGE)}
//           page={currentPage}
//           onChange={(_, page) => setCurrentPage(page)}
//           color="primary"
//         />
//       </Box>

//       {/* View Dialog */}
//       <Dialog open={openView} onClose={() => setOpenView(false)}>
//         <DialogTitle>Category Details</DialogTitle>
//         <DialogContent>
//           {selectedCategory && (
//             <Box>
//               <Typography><strong>Name:</strong> {selectedCategory.name}</Typography>
//               <Typography><strong>Description:</strong> {selectedCategory.description}</Typography>
//               <Typography><strong>Created At:</strong> {new Date(selectedCategory.createdAt).toLocaleString()}</Typography>
//               <Typography><strong>Updated At:</strong> {new Date(selectedCategory.updatedAt).toLocaleString()}</Typography>
//               {selectedCategory.imageUrls?.length > 0 && (
//                 <Grid container spacing={1} mt={1}>
//                   {selectedCategory.imageUrls.map((urls, idx) => (
//                     <Grid item xs={6} key={idx}>
//                       <img src={urls.url} alt="category-img" width="100%" />
//                     </Grid>
//                   ))}
//                 </Grid>
//               )}
//             </Box>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenView(false)}>Close</Button>
//         </DialogActions>
//       </Dialog>

//       {/* Add/Edit Dialog */}
//       <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth>
//         <DialogTitle>{formMode === "add" ? "Add Category" : "Edit Category"}</DialogTitle>
//         <DialogContent>
//           <TextField
//             margin="dense"
//             label="Name"
//             name="name"
//             fullWidth
//             value={formData.name}
//             onChange={handleInputChange}
//           />
//           <TextField
//             margin="dense"
//             label="Description"
//             name="description"
//             fullWidth
//             value={formData.description}
//             onChange={handleInputChange}
//             multiline
//             rows={3}
//           />
//           <Box mt={2}>
//             <input type="file" name="image" onChange={handleInputChange} />
//             {formData.preview && (
//               <Box mt={1}>
//                 <img src={formData.preview} alt="Preview" width={150} />
//               </Box>
//             )}
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenForm(false)}>Cancel</Button>
//           <Button onClick={handleFormSubmit} variant="contained" color="primary">
//             {formMode === "add" ? "Add" : "Update"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Delete Confirmation Dialog */}
//       <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
//         <DialogTitle>Confirm Delete</DialogTitle>
//         <DialogContent>
//           <Typography>Are you sure you want to delete this category?</Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
//           <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
//         </DialogActions>
//       </Dialog>

//       {/* Snackbar Alert */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//       >
//         <Alert severity={snackbar.severity} variant="filled">
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default CategoryTable;
