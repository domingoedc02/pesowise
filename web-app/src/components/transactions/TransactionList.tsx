import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
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
  Snackbar,
  Alert,
  InputAdornment,
  Stack
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  FilterList,
  Search,
  SwapHoriz,
  TrendingUp,
  TrendingDown,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import {
  Transaction,
  TransactionType,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  PaginatedResponse
} from '../../types/financial';
import { transactionApi, accountApi, categoryApi } from '../../services/api';
import { NeumorphicPaper } from '../common/NeumorphicPaper';

const TransactionList: React.FC = () => {
  const theme = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'ALL'>('ALL');
  const [formData, setFormData] = useState<CreateTransactionRequest>({
    accountId: 0,
    categoryId: 0,
    amount: 0,
    type: TransactionType.EXPENSE,
    description: '',
    transactionDate: new Date().toISOString().split('T')[0],
    tags: [],
    location: ''
  });

  useEffect(() => {
    fetchTransactions();
    fetchAccounts();
    fetchCategories();
  }, [page, rowsPerPage, searchTerm, typeFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      let response;
      
      if (searchTerm) {
        response = await transactionApi.search(searchTerm, page, rowsPerPage);
      } else {
        response = await transactionApi.getAll(page, rowsPerPage);
      }
      
      const paginatedData: PaginatedResponse<Transaction> = response.data;
      let filteredTransactions = paginatedData.content;
      
      if (typeFilter !== 'ALL') {
        filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
      }
      
      setTransactions(filteredTransactions);
      setTotalElements(paginatedData.totalElements);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await accountApi.getAll();
      setAccounts(response.data);
    } catch (err: any) {
      console.error('Failed to fetch accounts:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, transaction: Transaction) => {
    setAnchorEl(event.currentTarget);
    setSelectedTransaction(transaction);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTransaction(null);
  };

  const handleCreateTransaction = () => {
    setFormData({
      accountId: 0,
      categoryId: 0,
      amount: 0,
      type: TransactionType.EXPENSE,
      description: '',
      transactionDate: new Date().toISOString().split('T')[0],
      tags: [],
      location: ''
    });
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleEditTransaction = () => {
    if (selectedTransaction) {
      setFormData({
        accountId: selectedTransaction.accountId,
        categoryId: selectedTransaction.categoryId,
        amount: selectedTransaction.amount,
        type: selectedTransaction.type,
        description: selectedTransaction.description || '',
        transactionDate: selectedTransaction.transactionDate.split('T')[0],
        tags: selectedTransaction.tags || [],
        location: selectedTransaction.location || ''
      });
      setIsEditing(true);
      setDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteTransaction = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedTransaction(null);
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && selectedTransaction) {
        const updateData: UpdateTransactionRequest = {
          categoryId: formData.categoryId,
          amount: formData.amount,
          description: formData.description,
          transactionDate: formData.transactionDate,
          tags: formData.tags,
          location: formData.location
        };
        await transactionApi.update(selectedTransaction.id, updateData);
        setSuccess('Transaction updated successfully');
      } else {
        await transactionApi.create(formData);
        setSuccess('Transaction created successfully');
      }
      fetchTransactions();
      handleDialogClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save transaction');
    }
  };

  const handleDelete = async () => {
    if (selectedTransaction) {
      try {
        await transactionApi.delete(selectedTransaction.id);
        setSuccess('Transaction deleted successfully');
        fetchTransactions();
        setDeleteDialogOpen(false);
        setSelectedTransaction(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete transaction');
      }
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INCOME:
        return <TrendingUp sx={{ color: 'success.main' }} />;
      case TransactionType.EXPENSE:
        return <TrendingDown sx={{ color: 'error.main' }} />;
      case TransactionType.TRANSFER:
        return <SwapHoriz sx={{ color: 'info.main' }} />;
      default:
        return <ReceiptIcon />;
    }
  };

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INCOME:
        return 'success';
      case TransactionType.EXPENSE:
        return 'error';
      case TransactionType.TRANSFER:
        return 'info';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading transactions...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Transactions
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateTransaction}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Add Transaction
        </Button>
      </Box>

      {/* Filters */}
      <NeumorphicPaper sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'ALL')}
              label="Type"
            >
              <MenuItem value="ALL">All Types</MenuItem>
              <MenuItem value={TransactionType.INCOME}>Income</MenuItem>
              <MenuItem value={TransactionType.EXPENSE}>Expense</MenuItem>
              <MenuItem value={TransactionType.TRANSFER}>Transfer</MenuItem>
            </Select>
          </FormControl>
          
          <IconButton>
            <FilterList />
          </IconButton>
        </Stack>
      </NeumorphicPaper>

      {/* Transactions Table */}
      <NeumorphicPaper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Account</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getTransactionIcon(transaction.type)}
                      <Chip
                        label={transaction.type}
                        color={getTransactionColor(transaction.type) as any}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {transaction.description || 'No description'}
                      </Typography>
                      {transaction.tags && transaction.tags.length > 0 && (
                        <Box sx={{ mt: 0.5 }}>
                          {transaction.tags.map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, fontSize: '0.7rem', height: 20 }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {transaction.categoryName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {transaction.accountName}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={
                        transaction.type === TransactionType.INCOME
                          ? 'success.main'
                          : transaction.type === TransactionType.EXPENSE
                          ? 'error.main'
                          : 'text.primary'
                      }
                    >
                      {transaction.type === TransactionType.EXPENSE ? '-' : ''}
                      {formatCurrency(transaction.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(transaction.transactionDate)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, transaction)}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </NeumorphicPaper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditTransaction}>
          <Edit sx={{ mr: 1 }} />
          Edit Transaction
        </MenuItem>
        <MenuItem onClick={handleDeleteTransaction} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete Transaction
        </MenuItem>
      </Menu>

      {/* Create/Edit Transaction Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Transaction' : 'Create New Transaction'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Account</InputLabel>
              <Select
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: Number(e.target.value) })}
                label="Account"
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
                label="Type"
              >
                <MenuItem value={TransactionType.INCOME}>Income</MenuItem>
                <MenuItem value={TransactionType.EXPENSE}>Expense</MenuItem>
                <MenuItem value={TransactionType.TRANSFER}>Transfer</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              InputProps={{
                startAdornment: <InputAdornment position="start">₱</InputAdornment>,
              }}
              required
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <TextField
              fullWidth
              label="Date"
              type="date"
              value={formData.transactionDate}
              onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
              InputLabelProps={{
                shrink: true,
              }}
              required
            />

            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEditing ? 'Update' : 'Create'} Transaction
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Transaction</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this transaction? This action cannot be undone.
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

export default TransactionList;
