"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Button, 
  TextField, 
  Box, 
  Typography, 
  IconButton,
  Grid, 
  Divider,
  Card,
  CardContent,
  FormControl,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Container,
  Snackbar,
  Alert,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon,
  Save as SaveIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { BASE_URL } from '../../../api/api'

// TypeScript interfaces
interface Option {
  additionalPrice: number;
  name: string;
}

interface Variation {
  name: string;
  options: Option[];
}

interface Category {
  id: string;
  name: string;
}

interface FoodItem {
  id?: string;
  basePrice: number;
  description: string;
  name: string;
  variations: Variation[];
  categoryId?: string;
  categoryName?: string;
  imageUrls?: string[];
}

interface FoodApiResponse {
  status: boolean;
  error?: string;
}

interface EditFoodProps {
  foodToEdit?: FoodItem | null;
  onEditSuccess: () => void;
  onClose: () => void;
}

const EditFood: React.FC<EditFoodProps> = ({ foodToEdit, onEditSuccess, onClose }) => {
  // Initial empty food item
  const initialFoodState: FoodItem = {
    basePrice: 0,
    description: '',
    name: '',
    variations: []
  };

  const [food, setFood] = useState<FoodItem>(initialFoodState);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = Boolean(foodToEdit?.id);

  // Initialize form with food data when editing
  useEffect(() => {
    if (foodToEdit && isEditMode) {
      setFood({
        id: foodToEdit.id,
        name: foodToEdit.name || '',
        description: foodToEdit.description || '',
        basePrice: foodToEdit.basePrice || 0,
        variations: foodToEdit.variations || [],
        categoryId: foodToEdit.categoryId,
        categoryName: foodToEdit.categoryName
      });
      
      setSelectedCategoryId(foodToEdit.categoryId || '');
      setSelectedCategoryName(foodToEdit.categoryName || '');
      setExistingImages(foodToEdit.imageUrls || []);
    } else {
      // Reset form for new food creation
      setFood(initialFoodState);
      setSelectedCategoryId('');
      setSelectedCategoryName('');
      setExistingImages([]);
      setSelectedFiles([]);
      setFilePreviewUrls([]);
    }
  }, [foodToEdit, isEditMode]);

  // Fetch categories
  useEffect(() => {
    fetch(`${BASE_URL}/category`)
      .then(res => res.json())
      .then(data => {
        if (data.status && Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          throw new Error('Invalid category data');
        }
      })
      .catch(err => {
        setNotification({
          open: true,
          message: `Failed to fetch categories: ${err.message}`,
          severity: 'error'
        });
      });
  }, []);

  // Handle basic food info changes
  const handleFoodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'basePrice') {
      setFood({ ...food, [name]: value === '' ? 0 : Number(value) });
    } else {
      setFood({ ...food, [name]: value });
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Validate file count (existing + new + selected)
      const totalImages = existingImages.length + newFiles.length + selectedFiles.length;
      if (totalImages > 5) {
        setNotification({
          open: true,
          message: 'You can upload a maximum of 5 images',
          severity: 'error'
        });
        return;
      }
      
      setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
      
      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setFilePreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selected = categories.find(cat => cat.id === selectedId);
    setSelectedCategoryId(selectedId);
    setSelectedCategoryName(selected?.name || '');
  };

  // Remove existing image
  const removeExistingImage = (index: number) => {
    const updatedImages = [...existingImages];
    updatedImages.splice(index, 1);
    setExistingImages(updatedImages);
  };

  // Remove new file
  const removeFile = (index: number) => {
    URL.revokeObjectURL(filePreviewUrls[index]);
    
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
    
    const updatedPreviewUrls = [...filePreviewUrls];
    updatedPreviewUrls.splice(index, 1);
    setFilePreviewUrls(updatedPreviewUrls);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Add a new variation
  const addVariation = () => {
    setFood({
      ...food,
      variations: [
        ...food.variations,
        {
          name: '',
          options: []
        }
      ]
    });
  };

  // Remove a variation
  const removeVariation = (variationIndex: number) => {
    const updatedVariations = [...food.variations];
    updatedVariations.splice(variationIndex, 1);
    setFood({ ...food, variations: updatedVariations });
  };

  // Handle variation name change
  const handleVariationNameChange = (variationIndex: number, value: string) => {
    const updatedVariations = [...food.variations];
    updatedVariations[variationIndex].name = value;
    setFood({ ...food, variations: updatedVariations });
  };

  // Add a new option to a variation
  const addOption = (variationIndex: number) => {
    const updatedVariations = [...food.variations];
    updatedVariations[variationIndex].options.push({
      additionalPrice: 0,
      name: ''
    });
    setFood({ ...food, variations: updatedVariations });
  };

  // Remove an option from a variation
  const removeOption = (variationIndex: number, optionIndex: number) => {
    const updatedVariations = [...food.variations];
    updatedVariations[variationIndex].options.splice(optionIndex, 1);
    setFood({ ...food, variations: updatedVariations });
  };

  // Handle option changes
  const handleOptionChange = (
    variationIndex: number,
    optionIndex: number,
    field: keyof Option,
    value: string | number
  ) => {
    const updatedVariations = [...food.variations];
    
    if (field === 'additionalPrice') {
      updatedVariations[variationIndex].options[optionIndex][field] = 
        value === '' ? 0 : Number(value);
    } else {
      updatedVariations[variationIndex].options[optionIndex][field] = value as string;
    }
    
    setFood({ ...food, variations: updatedVariations });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate the form data
      if (!food.name.trim()) {
        throw new Error('Food name is required');
      }
      
      if (food.basePrice <= 0) {
        throw new Error('Base price must be greater than 0');
      }

      if (!selectedCategoryId) {
        throw new Error('Please select a category');
      }
      
      // Validate variations
      food.variations.forEach((variation, index) => {
        if (!variation.name.trim()) {
          throw new Error(`Variation #${index + 1} name is required`);
        }
        
        if (variation.options.length === 0) {
          throw new Error(`Variation "${variation.name}" needs at least one option`);
        }
        
        variation.options.forEach((option) => {
          if (!option.name.trim()) {
            throw new Error(`Option name in variation "${variation.name}" is required`);
          }
        });
      });
      
      // Create form data
      const formData = new FormData();
      
      // Add food data
      formData.append('name', food.name);
      formData.append('basePrice', food.basePrice.toString());
      formData.append('description', food.description);
      formData.append('categoryId', selectedCategoryId);
      formData.append('categoryName', selectedCategoryName);
      // formData.append('variations', JSON.stringify(food.variations));

      // Add variations as individual form fields instead of JSON string
      food.variations.forEach((variation, variationIndex) => {
        formData.append(`variations[${variationIndex}][name]`, variation.name);
        variation.options.forEach((option, optionIndex) => {
          formData.append(`variations[${variationIndex}][options][${optionIndex}][name]`, option.name);
          formData.append(`variations[${variationIndex}][options][${optionIndex}][additionalPrice]`, option.additionalPrice.toString());
        });
      });
      
      // Add existing images (for edit mode)
      if (isEditMode) {
        formData.append('existingImages', JSON.stringify(existingImages));
      }
      
      // Add new images
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });
      
      // Determine API endpoint and method
      const apiUrl = isEditMode 
        ? `${BASE_URL}/foods/update/${food.id}`
        : `${BASE_URL}/foods/create`;
      const method = isEditMode ? 'PUT' : 'POST';
      
      // Send to backend API
      const response = await fetch(apiUrl, {
        method: method,
        body: formData,
      });
      
      const result = await response.json() as FoodApiResponse;
      
      if (!result.status) {
        throw new Error(result.error || `Failed to ${isEditMode ? 'update' : 'create'} food item`);
      }
      
      // Show success notification
      setNotification({
        open: true,
        message: `Food "${food.name}" ${isEditMode ? 'updated' : 'added'} successfully!`,
        severity: 'success'
      });
      
      // Call success callback
      setTimeout(() => {
        onEditSuccess();
      }, 1000);
      
    } catch (error) {
      setNotification({
        open: true,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const totalImages = existingImages.length + selectedFiles.length;

  return (
    <>
      <DialogTitle>
        {isEditMode ? 'Edit Food Item' : 'Create New Food Item'}
      </DialogTitle>
      <DialogContent dividers>
        <Container maxWidth="md">
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Food Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={8}>
                <FormControl fullWidth required variant='outlined'>
                  <select
                    id="category"
                    value={selectedCategoryId}
                    onChange={handleCategoryChange}
                    style={{
                      height: '56px',
                      padding: '0 14px',
                      fontSize: '16px',
                      borderRadius: '8px',
                      border: '1px solid #ccc'
                    }}
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  required
                  label="Food Name"
                  name="name"
                  value={food.name}
                  onChange={handleFoodChange}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel htmlFor="base-price">Base Price</InputLabel>
                  <OutlinedInput
                    id="base-price"
                    name="basePrice"
                    type="number"
                    value={food.basePrice === 0 ? '' : food.basePrice}
                    onChange={handleFoodChange}
                    startAdornment={<InputAdornment position="start">LKR</InputAdornment>}
                    label="Base Price"
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={food.description}
                  onChange={handleFoodChange}
                  variant="outlined"
                  multiline
                  rows={2}
                />
              </Grid>
              
              {/* Image Upload */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Images
                </Typography>
                
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Current Images:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {existingImages.map((url, index) => (
                        <Box
                          key={`existing-${index}`}
                          sx={{
                            position: 'relative',
                            width: 100,
                            height: 100,
                          }}
                        >
                          <img
                            src={url}
                            alt={`Existing ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: -10,
                              right: -10,
                              backgroundColor: 'white',
                              '&:hover': { backgroundColor: '#f5f5f5' }
                            }}
                            onClick={() => {removeExistingImage(index);}}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                />
                <Button
                  variant="contained"
                  onClick={handleUploadClick}
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 2 }}
                  disabled={totalImages >= 5}
                >
                  {isEditMode ? 'Add More Images' : 'Upload Images'} (Max 5, Current: {totalImages})
                </Button>
                
                {/* New Images Preview */}
                {filePreviewUrls.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                    {filePreviewUrls.map((url, index) => (
                      <Box
                        key={`preview-${index}`}
                        sx={{
                          position: 'relative',
                          width: 100,
                          height: 100,
                        }}
                      >
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -10,
                            right: -10,
                            backgroundColor: 'white',
                            '&:hover': { backgroundColor: '#f5f5f5' }
                          }}
                          onClick={() => {removeFile(index);}}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Grid>
              
              {/* Variations */}
              <Grid item xs={12}>
                <Divider sx={{ my: 3 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Variations</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={addVariation}
                  >
                    Add Variation
                  </Button>
                </Box>
              </Grid>
              
              {food.variations.map((variation, variationIndex) => (
                <Grid item xs={12} key={`variation-${variationIndex}`}>
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <TextField
                          label="Variation Name"
                          value={variation.name}
                          onChange={(e) => {handleVariationNameChange(variationIndex, e.target.value);}}
                          variant="outlined"
                          required
                          sx={{ width: '70%' }}
                        />
                        <IconButton
                          onClick={() => {removeVariation(variationIndex);}}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      
                      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                        Options
                      </Typography>
                      
                      {variation.options.map((option, optionIndex) => (
                        <Box
                          key={`option-${variationIndex}-${optionIndex}`}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 1,
                            gap: 2
                          }}
                        >
                          <TextField
                            label="Option Name"
                            value={option.name}
                            onChange={(e) => {handleOptionChange(
                              variationIndex,
                              optionIndex,
                              'name',
                              e.target.value
                            );}}
                            variant="outlined"
                            required
                            sx={{ flex: 2 }}
                          />
                          
                          <FormControl variant="outlined" sx={{ flex: 1 }}>
                            <InputLabel htmlFor={`price-${variationIndex}-${optionIndex}`}>
                              Additional Price
                            </InputLabel>
                            <OutlinedInput
                              id={`price-${variationIndex}-${optionIndex}`}
                              type="number"
                              value={option.additionalPrice === 0 ? '' : option.additionalPrice}
                              onChange={(e) => {handleOptionChange(
                                variationIndex,
                                optionIndex,
                                'additionalPrice',
                                e.target.value
                              );}}
                              startAdornment={<InputAdornment position="start">LKR</InputAdornment>}
                              label="Additional Price"
                              inputProps={{ min: 0, step: 0.01 }}
                            />
                          </FormControl>
                          
                          <IconButton
                            onClick={() => {removeOption(variationIndex, optionIndex);}}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      ))}
                      
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => {addOption(variationIndex);}}
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        Add Option
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </form>
        </Container>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          disabled={loading}
        >
          {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Food' : 'Create Food')}
        </Button>
      </DialogActions>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditFood;