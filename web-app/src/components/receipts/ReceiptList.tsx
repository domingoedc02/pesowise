import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Typography,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Skeleton,
  Alert,
  useTheme,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Link as LinkIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  CheckCircle as VerifiedIcon,
  CheckCircle,
  HourglassEmpty as ProcessingIcon,
  Error as ErrorIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { NeumorphicPaper } from '../common/NeumorphicPaper';
import { Receipt, ReceiptProcessingStatus, ReceiptFilter, ReceiptSortOptions } from '../../types/receipt';

interface ReceiptListProps {
  receipts: Receipt[];
  loading?: boolean;
  error?: string | null;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onFilterChange?: (filter: ReceiptFilter) => void;
  onSortChange?: (sort: ReceiptSortOptions) => void;
  onReceiptClick?: (receipt: Receipt) => void;
  onReceiptEdit?: (receipt: Receipt) => void;
  onReceiptDelete?: (receiptId: number) => void;
  onReceiptLink?: (receipt: Receipt) => void;
  onReceiptDownload?: (receipt: Receipt) => void;
}

const ReceiptList: React.FC<ReceiptListProps> = ({
  receipts,
  loading = false,
  error = null,
  totalCount = 0,
  currentPage = 1,
  pageSize = 12,
  onPageChange,
  onFilterChange,
  onSortChange,
  onReceiptClick,
  onReceiptEdit,
  onReceiptDelete,
  onReceiptLink,
  onReceiptDownload
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReceiptProcessingStatus | ''>('');
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | ''>('');
  const [sortField, setSortField] = useState<'createdAt' | 'totalAmount' | 'merchantName' | 'processingStatus'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const theme = useTheme();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, receipt: Receipt) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedReceipt(receipt);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReceipt(null);
  };

  const handleMenuAction = (action: string) => {
    if (!selectedReceipt) return;

    switch (action) {
      case 'view':
        onReceiptClick?.(selectedReceipt);
        break;
      case 'edit':
        onReceiptEdit?.(selectedReceipt);
        break;
      case 'link':
        onReceiptLink?.(selectedReceipt);
        break;
      case 'download':
        onReceiptDownload?.(selectedReceipt);
        break;
      case 'delete':
        onReceiptDelete?.(selectedReceipt.id);
        break;
    }
    handleMenuClose();
  };

  const handleFilterChange = () => {
    const filter: ReceiptFilter = {
      ...(statusFilter && { status: statusFilter }),
      ...(verifiedFilter !== '' && { isVerified: verifiedFilter }),
      ...(searchTerm && { merchantName: searchTerm })
    };
    onFilterChange?.(filter);
  };

  const handleSortChange = (field: typeof sortField) => {
    const newDirection = field === sortField && sortDirection === 'desc' ? 'asc' : 'desc';
    setSortField(field);
    setSortDirection(newDirection);
    onSortChange?.({ field, direction: newDirection });
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleFilterChange();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, verifiedFilter]);

  const getStatusIcon = (status: ReceiptProcessingStatus) => {
    switch (status) {
      case ReceiptProcessingStatus.VERIFIED:
        return <VerifiedIcon color="success" />;
      case ReceiptProcessingStatus.PROCESSED:
        return <CheckCircle color="primary" />;
      case ReceiptProcessingStatus.PROCESSING:
        return <ProcessingIcon color="warning" />;
      case ReceiptProcessingStatus.FAILED:
        return <ErrorIcon color="error" />;
      default:
        return <UploadIcon color="info" />;
    }
  };

  const getStatusColor = (status: ReceiptProcessingStatus) => {
    switch (status) {
      case ReceiptProcessingStatus.VERIFIED:
        return 'success';
      case ReceiptProcessingStatus.PROCESSED:
        return 'primary';
      case ReceiptProcessingStatus.PROCESSING:
        return 'warning';
      case ReceiptProcessingStatus.FAILED:
        return 'error';
      default:
        return 'info';
    }
  };

  const formatAmount = (amount?: number) => {
    return amount ? `$${amount.toFixed(2)}` : 'N/A';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header and Filters */}
      <NeumorphicPaper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Receipts {totalCount > 0 && `(${totalCount})`}
          </Typography>
          <Button
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? 'contained' : 'outlined'}
          >
            Filters
          </Button>
        </Box>

        {showFilters && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Search merchant"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value as ReceiptProcessingStatus | '')}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value={ReceiptProcessingStatus.UPLOADED}>Uploaded</MenuItem>
                  <MenuItem value={ReceiptProcessingStatus.PROCESSING}>Processing</MenuItem>
                  <MenuItem value={ReceiptProcessingStatus.PROCESSED}>Processed</MenuItem>
                  <MenuItem value={ReceiptProcessingStatus.VERIFIED}>Verified</MenuItem>
                  <MenuItem value={ReceiptProcessingStatus.FAILED}>Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Verified</InputLabel>
                <Select
                  value={verifiedFilter}
                  label="Verified"
                  onChange={(e) => setVerifiedFilter(e.target.value as boolean | '')}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Verified</MenuItem>
                  <MenuItem value="false">Unverified</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sortField}
                  label="Sort by"
                  onChange={(e) => handleSortChange(e.target.value as typeof sortField)}
                >
                  <MenuItem value="createdAt">Date Created</MenuItem>
                  <MenuItem value="totalAmount">Amount</MenuItem>
                  <MenuItem value="merchantName">Merchant</MenuItem>
                  <MenuItem value="processingStatus">Status</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}
      </NeumorphicPaper>

      {/* Receipt Grid */}
      <Grid container spacing={3}>
        {loading ? (
          // Loading skeletons
          Array.from({ length: pageSize }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : receipts.length === 0 ? (
          <Grid item xs={12}>
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                color: 'text.secondary'
              }}
            >
              <ReceiptIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" gutterBottom>
                No receipts found
              </Typography>
              <Typography variant="body2">
                Upload your first receipt to get started
              </Typography>
            </Box>
          </Grid>
        ) : (
          receipts.map((receipt) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={receipt.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
                onClick={() => onReceiptClick?.(receipt)}
              >
                {/* Receipt Image */}
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={receipt.originalImageUrl}
                    alt={`Receipt from ${receipt.extractedData?.merchantName || 'Unknown'}`}
                    sx={{ objectFit: 'cover' }}
                  />
                  
                  {/* Status Badge */}
                  <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                    <Tooltip title={receipt.processingStatus}>
                      <Chip
                        icon={getStatusIcon(receipt.processingStatus)}
                        label={receipt.processingStatus}
                        size="small"
                        color={getStatusColor(receipt.processingStatus) as any}
                        sx={{ bgcolor: 'rgba(255, 255, 255, 0.9)' }}
                      />
                    </Tooltip>
                  </Box>

                  {/* Menu Button */}
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, receipt)}
                      sx={{ bgcolor: 'rgba(255, 255, 255, 0.9)' }}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>

                  {/* Linked Badge */}
                  {receipt.linkedTransactionIds.length > 0 && (
                    <Box sx={{ position: 'absolute', bottom: 8, right: 8 }}>
                      <Badge badgeContent={receipt.linkedTransactionIds.length} color="primary">
                        <LinkIcon sx={{ color: 'white', bgcolor: 'primary.main', borderRadius: '50%', p: 0.5 }} />
                      </Badge>
                    </Box>
                  )}
                </Box>

                {/* Receipt Details */}
                <CardContent sx={{ pb: 1 }}>
                  <Typography variant="h6" noWrap>
                    {receipt.extractedData?.merchantName || receipt.verifiedData?.merchantName || 'Unknown Merchant'}
                  </Typography>
                  
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {formatAmount(receipt.extractedData?.totalAmount || receipt.verifiedData?.totalAmount)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(receipt.createdAt)}
                  </Typography>

                  {receipt.items.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      {receipt.items.length} item{receipt.items.length !== 1 ? 's' : ''}
                    </Typography>
                  )}

                  {/* Verification Status */}
                  <Box sx={{ mt: 1 }}>
                    {receipt.isVerified ? (
                      <Chip
                        size="small"
                        label="Verified"
                        color="success"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        size="small"
                        label="Needs Review"
                        color="warning"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>

                <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
                  <Button
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReceiptClick?.(receipt);
                    }}
                  >
                    View
                  </Button>
                  
                  {!receipt.isVerified && (
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onReceiptEdit?.(receipt);
                      }}
                    >
                      Verify
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => onPageChange?.(page)}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleMenuAction('view')}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('edit')}>
          <EditIcon sx={{ mr: 1 }} />
          Edit/Verify
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('link')}>
          <LinkIcon sx={{ mr: 1 }} />
          Link to Transaction
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('download')}>
          <DownloadIcon sx={{ mr: 1 }} />
          Download
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('delete')} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ReceiptList;
