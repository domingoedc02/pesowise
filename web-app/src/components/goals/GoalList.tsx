import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Fab,
  Snackbar,
  Alert,
  InputAdornment
} from '@mui/material';
import { Add, MoreVert, Edit, Delete, TrendingUp, TrackChanges, CalendarToday } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Goal, GoalCategory, CreateGoalRequest, UpdateGoalRequest } from '../../types/financial';
import { goalApi } from '../../services/api';
import { NeumorphicPaper } from '../common/NeumorphicPaper';

const GoalList: React.FC = () => {
  const theme = useTheme();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [contributeDialogOpen, setContributeDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateGoalRequest>({
    name: '',
    targetAmount: 0,
    targetDate: '',
    category: GoalCategory.OTHER,
    description: '',
    icon: '🎯',
    color: '#2196F3'
  });
  const [contributeAmount, setContributeAmount] = useState<number>(0);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await goalApi.getAll();
      setGoals(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, goal: Goal) => {
    setAnchorEl(event.currentTarget);
    setSelectedGoal(goal);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedGoal(null);
  };

  const handleCreateGoal = () => {
    setFormData({
      name: '',
      targetAmount: 0,
      targetDate: '',
      category: GoalCategory.OTHER,
      description: '',
      icon: '🎯',
      color: '#2196F3'
    });
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleEditGoal = () => {
    if (selectedGoal) {
      setFormData({
        name: selectedGoal.name,
        targetAmount: selectedGoal.targetAmount,
        targetDate: selectedGoal.targetDate.split('T')[0],
        category: selectedGoal.category,
        description: selectedGoal.description || '',
        icon: selectedGoal.icon || '🎯',
        color: selectedGoal.color || '#2196F3'
      });
      setIsEditing(true);
      setDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteGoal = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleContribute = () => {
    setContributeAmount(0);
    setContributeDialogOpen(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedGoal(null);
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && selectedGoal) {
        const updateData: UpdateGoalRequest = {
          name: formData.name,
          targetAmount: formData.targetAmount,
          targetDate: formData.targetDate,
          description: formData.description,
          icon: formData.icon,
          color: formData.color
        };
        await goalApi.update(selectedGoal.id, updateData);
        setSuccess('Goal updated successfully');
      } else {
        await goalApi.create(formData);
        setSuccess('Goal created successfully');
      }
      fetchGoals();
      handleDialogClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save goal');
    }
  };

  const handleDelete = async () => {
    if (selectedGoal) {
      try {
        await goalApi.delete(selectedGoal.id);
        setSuccess('Goal deleted successfully');
        fetchGoals();
        setDeleteDialogOpen(false);
        setSelectedGoal(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete goal');
      }
    }
  };

  const handleContributeSubmit = async () => {
    if (selectedGoal && contributeAmount > 0) {
      try {
        await goalApi.contribute(selectedGoal.id, {
          accountId: 1, // Should be selected from a dropdown in real app
          amount: contributeAmount,
          contributionDate: new Date().toISOString().split('T')[0]
        });
        setSuccess('Contribution added successfully');
        fetchGoals();
        setContributeDialogOpen(false);
        setSelectedGoal(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to add contribution');
      }
    }
  };

  const getGoalIcon = (category: GoalCategory) => {
    const icons = {
      [GoalCategory.EMERGENCY_FUND]: '🚨',
      [GoalCategory.VACATION]: '✈️',
      [GoalCategory.HOME]: '🏠',
      [GoalCategory.VEHICLE]: '🚗',
      [GoalCategory.EDUCATION]: '🎓',
      [GoalCategory.RETIREMENT]: '👴',
      [GoalCategory.INVESTMENT]: '📈',
      [GoalCategory.OTHER]: '🎯'
    };
    return icons[category];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const calculateDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading goals...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Financial Goals
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateGoal}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Add Goal
        </Button>
      </Box>

      <Grid container spacing={3}>
        {goals.map((goal) => {
          const daysRemaining = calculateDaysRemaining(goal.targetDate);
          const progressColor = goal.percentageComplete >= 100 ? 'success' : 
                              goal.percentageComplete >= 75 ? 'info' :
                              goal.percentageComplete >= 50 ? 'warning' : 'error';

          return (
            <Grid item xs={12} md={6} lg={4} key={goal.id}>
              <NeumorphicPaper sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h4">
                        {goal.icon || getGoalIcon(goal.category)}
                      </Typography>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {goal.name}
                        </Typography>
                        <Chip
                          label={goal.category.replace('_', ' ')}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, goal)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {goal.percentageComplete.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(goal.percentageComplete, 100)}
                      color={progressColor}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Current
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {formatCurrency(goal.currentAmount)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="text.secondary">
                        Target
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {formatCurrency(goal.targetAmount)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {daysRemaining > 0 ? `${daysRemaining} days left` : 'Target date passed'}
                      </Typography>
                    </Box>
                  </Box>

                  {goal.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {goal.description}
                    </Typography>
                  )}
                </CardContent>
              </NeumorphicPaper>
            </Grid>
          );
        })}
      </Grid>

      {goals.length === 0 && (
        <NeumorphicPaper sx={{ p: 4, textAlign: 'center' }}>
          <TrackChanges sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Goals Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start setting financial goals to track your progress and achieve your dreams.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateGoal}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Create Your First Goal
          </Button>
        </NeumorphicPaper>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleContribute}>
          <TrendingUp sx={{ mr: 1 }} />
          Add Contribution
        </MenuItem>
        <MenuItem onClick={handleEditGoal}>
          <Edit sx={{ mr: 1 }} />
          Edit Goal
        </MenuItem>
        <MenuItem onClick={handleDeleteGoal} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete Goal
        </MenuItem>
      </Menu>

      {/* Create/Edit Goal Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Goal' : 'Create New Goal'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Goal Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Target Amount"
                type="number"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Target Date"
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as GoalCategory })}
                  label="Category"
                >
                  {Object.values(GoalCategory).map((category) => (
                    <MenuItem key={category} value={category}>
                      {getGoalIcon(category)} {category.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="🎯"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEditing ? 'Update' : 'Create'} Goal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contribute Dialog */}
      <Dialog open={contributeDialogOpen} onClose={() => setContributeDialogOpen(false)}>
        <DialogTitle>Add Contribution</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Contribution Amount"
            type="number"
            value={contributeAmount}
            onChange={(e) => setContributeAmount(parseFloat(e.target.value))}
            InputProps={{
              startAdornment: <InputAdornment position="start">₱</InputAdornment>,
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContributeDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleContributeSubmit} variant="contained">
            Add Contribution
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Goal</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedGoal?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbars */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GoalList;
