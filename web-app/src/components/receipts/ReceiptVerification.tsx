import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  TextField,
  Typography,
  Chip,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Close as CloseIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { NeumorphicPaper } from '../common/NeumorphicPaper';
import { Receipt, ReceiptItem, ReceiptVerificationRequest } from '../../types/receipt';

interface ReceiptVerificationProps {
  open: boolean;
  receipt: Receipt | null;
  onClose: () => void;
  onVerify: (verification: ReceiptVerificationRequest) => Promise<void>;
  isLoading?: boolean;
}

const ReceiptVerification: React.FC<ReceiptVerificationProps> = ({
  open,
  receipt,
  onClose,
  onVerify,
  isLoading = false
}) => {
  const [merchantName, setMerchantName] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number | undefined>();
  const [taxAmount, setTaxAmount] = useState<number | undefined>();
  const [tipAmount, setTipAmount] = useState<number | undefined>();
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [newItem, setNewItem] = useState({
    itemName: '',
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0
  });
  const [showAddItem, setShowAddItem] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (receipt && open) {
      // Pre-populate with extracted data
      const extracted = receipt.extractedData;
      setMerchantName(extracted?.merchantName || '');
      setTotalAmount(extracted?.totalAmount || 0);
      setSubtotal(extracted?.subtotal);
      setTaxAmount(extracted?.taxAmount);
      setTipAmount(extracted?.tipAmount);
      setDate(extracted?.date || '');
      setNotes('');
      setItems(receipt.items);
      
      // Reset form state
      setEditingItemId(null);
      setShowAddItem(false);
      setNewItem({
        itemName: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0
      });
    }
  }, [receipt, open]);

  const handleVerify = async () => {
    if (!receipt) return;

    const verification: ReceiptVerificationRequest = {
      receiptId: receipt.id,
      merchantName,
      totalAmount,
      date: date || undefined,
      taxAmount,
      tipAmount,
      subtotal,
      items: items.map(item => ({
        itemName: item.itemName || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        categorySuggestion: item.categorySuggestion,
        lineNumber: item.lineNumber
      })),
      notes: notes || undefined
    };

    await onVerify(verification);
  };

  const handleAddItem = () => {
    const item: ReceiptItem = {
      id: Date.now(), // Temporary ID
      itemName: newItem.itemName,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
      totalPrice: newItem.totalPrice,
      createdAt: new Date().toISOString()
    };
    
    setItems(prev => [...prev, item]);
    setNewItem({
      itemName: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    });
    setShowAddItem(false);
  };

  const handleEditItem = (itemId: number, updatedItem: Partial<ReceiptItem>) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updatedItem } : item
    ));
    setEditingItemId(null);
  };

  const handleDeleteItem = (itemId: number) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateTotals = () => {
    const itemsTotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    return itemsTotal;
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return theme.palette.grey[500];
    if (confidence >= 0.8) return theme.palette.success.main;
    if (confidence >= 0.6) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getConfidenceText = (confidence?: number) => {
    if (!confidence) return 'Unknown';
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  if (!receipt) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.default',
          backgroundImage: 'none',
          minHeight: '80vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1
        }}
      >
        <Box>
          <Typography variant="h6">Verify Receipt</Typography>
          <Typography variant="body2" color="text.secondary">
            Review and edit the extracted information
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Receipt Image */}
          <Grid item xs={12} md={4}>
            <NeumorphicPaper sx={{ p: 2, height: 'fit-content' }}>
              <Typography variant="h6" gutterBottom>
                <ImageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Receipt Image
              </Typography>
              
              {receipt.extractedData?.confidence && (
                <Box sx={{ mb: 2 }}>
                  <Chip
                    size="small"
                    label={`${getConfidenceText(receipt.extractedData.confidence)} Confidence`}
                    sx={{
                      bgcolor: getConfidenceColor(receipt.extractedData.confidence),
                      color: 'white'
                    }}
                  />
                </Box>
              )}

              <Box
                component="img"
                src={receipt.originalImageUrl}
                alt="Receipt"
                sx={{
                  width: '100%',
                  maxHeight: 400,
                  objectFit: 'contain',
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`
                }}
              />
            </NeumorphicPaper>
          </Grid>

          {/* Receipt Details */}
          <Grid item xs={12} md={8}>
            <NeumorphicPaper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Receipt Details
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Merchant Name"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Total Amount"
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                    required
                    inputProps={{ step: 0.01, min: 0 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Subtotal"
                    type="number"
                    value={subtotal || ''}
                    onChange={(e) => setSubtotal(e.target.value ? Number(e.target.value) : undefined)}
                    inputProps={{ step: 0.01, min: 0 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Tax Amount"
                    type="number"
                    value={taxAmount || ''}
                    onChange={(e) => setTaxAmount(e.target.value ? Number(e.target.value) : undefined)}
                    inputProps={{ step: 0.01, min: 0 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Tip Amount"
                    type="number"
                    value={tipAmount || ''}
                    onChange={(e) => setTipAmount(e.target.value ? Number(e.target.value) : undefined)}
                    inputProps={{ step: 0.01, min: 0 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes about this receipt..."
                  />
                </Grid>
              </Grid>
            </NeumorphicPaper>

            {/* Items Section */}
            <NeumorphicPaper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Items ({items.length})
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setShowAddItem(true)}
                  variant="outlined"
                  size="small"
                >
                  Add Item
                </Button>
              </Box>

              {/* Add Item Form */}
              {showAddItem && (
                <Card sx={{ mb: 2, bgcolor: 'background.default' }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Item Name"
                          value={newItem.itemName}
                          onChange={(e) => setNewItem(prev => ({ ...prev, itemName: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Quantity"
                          type="number"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Unit Price"
                          type="number"
                          value={newItem.unitPrice}
                          onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: Number(e.target.value) }))}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Total"
                          type="number"
                          value={newItem.totalPrice}
                          onChange={(e) => setNewItem(prev => ({ ...prev, totalPrice: Number(e.target.value) }))}
                        />
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        onClick={() => setShowAddItem(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={handleAddItem}
                        disabled={!newItem.itemName}
                      >
                        Add
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Items List */}
              <List>
                {items.map((item) => (
                  <ListItem
                    key={item.id}
                    sx={{
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: 'background.paper'
                    }}
                  >
                    <ListItemText
                      primary={item.itemName || 'Unnamed Item'}
                      secondary={
                        <Box>
                          {item.quantity && item.unitPrice && (
                            <Typography variant="body2" color="text.secondary">
                              {item.quantity} × ${item.unitPrice.toFixed(2)}
                            </Typography>
                          )}
                          {item.categorySuggestion && (
                            <Chip
                              size="small"
                              label={item.categorySuggestion}
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" fontWeight="bold">
                          ${(item.totalPrice || 0).toFixed(2)}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => setEditingItemId(item.id)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteItem(item.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>

              {items.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ py: 4 }}
                >
                  No items extracted. Click "Add Item" to manually add items.
                </Typography>
              )}

              {/* Totals Summary */}
              {items.length > 0 && (
                <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" color="text.secondary">
                    Items Total: ${calculateTotals().toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Receipt Total: ${totalAmount.toFixed(2)}
                  </Typography>
                  {Math.abs(calculateTotals() - totalAmount) > 0.01 && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      Items total doesn't match receipt total. Please verify the amounts.
                    </Alert>
                  )}
                </Box>
              )}
            </NeumorphicPaper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleVerify}
          variant="contained"
          disabled={isLoading || !merchantName || totalAmount <= 0}
          startIcon={isLoading ? <CircularProgress size={20} /> : <CheckIcon />}
          sx={{
            minWidth: 120,
            background: `linear-gradient(145deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: theme.palette.mode === 'dark'
              ? 'inset 2px 2px 5px #1a1a1a, inset -2px -2px 5px #2c2c2c'
              : 'inset 2px 2px 5px #d1d9e6, inset -2px -2px 5px #f9f9f9'
          }}
        >
          {isLoading ? 'Verifying...' : 'Verify Receipt'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReceiptVerification;
