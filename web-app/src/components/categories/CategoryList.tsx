import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Edit, Trash2, Plus, Folder, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import { 
  Category, 
  TransactionType, 
  CreateCategoryRequest 
} from '../../types/financial';
import { categoryApi } from '../../services/api';
import { DashboardWrapper } from '../DashboardWrapper';

const CategoryCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(145deg, #1e1e1e, #2d2d2d)'
    : 'linear-gradient(145deg, #e6e6e6, #ffffff)',
  boxShadow: theme.palette.mode === 'dark'
    ? '20px 20px 60px #1a1a1a, -20px -20px 60px #333333'
    : '20px 20px 60px #d1d1d1, -20px -20px 60px #ffffff',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '25px 25px 75px #1a1a1a, -25px -25px 75px #333333'
      : '25px 25px 75px #d1d1d1, -25px -25px 75px #ffffff',
  },
}));

const getTypeIcon = (type: TransactionType) => {
  switch (type) {
    case TransactionType.INCOME:
      return TrendingUp;
    case TransactionType.EXPENSE:
      return TrendingDown;
    case TransactionType.TRANSFER:
      return ArrowRightLeft;
    default:
      return Folder;
  }
};

const getTypeColor = (type: TransactionType) => {
  switch (type) {
    case TransactionType.INCOME:
      return '#4caf50';
    case TransactionType.EXPENSE:
      return '#f44336';
    case TransactionType.TRANSFER:
      return '#ff9800';
    default:
      return '#757575';
  }
};

export const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: '',
    type: TransactionType.EXPENSE,
    icon: 'folder',
    color: '#757575',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryApi.getAll();
      setCategories(response.data);
    } catch (error) {
      setError('Failed to load categories');
      console.error('Load categories error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color,
        parentId: category.parentId,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        type: TransactionType.EXPENSE,
        icon: 'folder',
        color: getTypeColor(TransactionType.EXPENSE),
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingCategory) {
        // Note: Update functionality would need to be implemented in the API
        console.log('Update category:', editingCategory.id, formData);
      } else {
        await categoryApi.create(formData);
      }
      await loadCategories();
      handleCloseDialog();
    } catch (error) {
      console.error('Save category error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryApi.delete(id);
        await loadCategories();
      } catch (error) {
        console.error('Delete category error:', error);
      }
    }
  };

  const groupedCategories = categories.reduce((acc, category) => {
    if (!category.parentId) {
      acc[category.id] = {
        parent: category,
        children: categories.filter(c => c.parentId === category.id)
      };
    }
    return acc;
  }, {} as Record<number, { parent: Category; children: Category[] }>);

  if (loading) {
    return (
      <DashboardWrapper>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </DashboardWrapper>
    );
  }

  if (error) {
    return (
      <DashboardWrapper>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight="600">
            Categories
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => handleOpenDialog()}
          >
            Create Category
          </Button>
        </Box>

        <Grid container spacing={3}>
          {Object.values(groupedCategories).map(({ parent, children }) => {
            const TypeIcon = getTypeIcon(parent.type);
            
            return (
              <Grid item xs={12} md={6} lg={4} key={parent.id}>
                <CategoryCard>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          sx={{
                            bgcolor: parent.color,
                            width: 48,
                            height: 48,
                          }}
                        >
                          <TypeIcon size={24} />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="600">
                            {parent.name}
                          </Typography>
                          <Chip
                            label={parent.type}
                            size="small"
                            color={
                              parent.type === TransactionType.INCOME ? 'success' :
                              parent.type === TransactionType.EXPENSE ? 'error' : 'warning'
                            }
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </Box>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(parent)}
                        >
                          <Edit size={16} />
                        </IconButton>
                        {!parent.isSystem && (
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(parent.id)}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        )}
                      </Box>
                    </Box>

                    {children.length > 0 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                          Subcategories ({children.length})
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          {children.map((child) => (
                            <Chip
                              key={child.id}
                              label={child.name}
                              size="small"
                              variant="outlined"
                              onDelete={!child.isSystem ? () => handleDelete(child.id) : undefined}
                              onClick={() => handleOpenDialog(child)}
                              sx={{ cursor: 'pointer' }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    <Box mt={2}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        startIcon={<Plus size={16} />}
                        onClick={() => handleOpenDialog({ 
                          ...formData, 
                          parentId: parent.id,
                          type: parent.type 
                        } as any)}
                      >
                        Add Subcategory
                      </Button>
                    </Box>
                  </CardContent>
                </CategoryCard>
              </Grid>
            );
          })}
        </Grid>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingCategory ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Category Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
              />
              <TextField
                select
                label="Type"
                value={formData.type}
                onChange={(e) => {
                  const type = e.target.value as TransactionType;
                  setFormData({ 
                    ...formData, 
                    type,
                    color: getTypeColor(type)
                  });
                }}
                fullWidth
                required
              >
                {Object.values(TransactionType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                fullWidth
                helperText="Icon name (e.g., 'folder', 'shopping-cart', 'home')"
              />
              <TextField
                label="Color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardWrapper>
  );
};
