import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  type SelectChangeEvent,
} from '@mui/material';
import {
  ShoppingCart as NeedIcon,
  CheckCircle as HaveIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ClearAll as ClearAllIcon,
} from '@mui/icons-material';
import type { PostType } from '../../../shared/types';

interface SearchAndFilterBarProps {
  searchQuery: string;
  filterType: PostType | 'ALL';
  filterPrice: string;
  filterSize: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: PostType | 'ALL') => void;
  onPriceFilterChange: (value: string) => void;
  onSizeFilterChange: (value: string) => void;
  onClearSearch: () => void;
  onClearAllFilters: () => void;
}

const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
  searchQuery,
  filterType,
  filterPrice,
  filterSize,
  onSearchChange,
  onFilterChange,
  onPriceFilterChange,
  onSizeFilterChange,
  onClearSearch,
  onClearAllFilters,
}) => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    onFilterChange(event.target.value as PostType | 'ALL');
  };

  const handlePriceFilterChange = (event: SelectChangeEvent) => {
    onPriceFilterChange(event.target.value);
  };

  const handleSizeFilterChange = (event: SelectChangeEvent) => {
    onSizeFilterChange(event.target.value);
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search property deals..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                <SearchIcon />
              </Box>
            ),
            endAdornment: searchQuery && (
              <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={onClearSearch}>
                <ClearIcon sx={{ color: 'text.secondary' }} />
              </Box>
            ),
          }}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filterType}
            label="Type"
            onChange={handleFilterChange}
          >
            <MenuItem value="ALL">All Posts</MenuItem>
            <MenuItem value="NEED">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NeedIcon color="error" fontSize="small" />
                NEED
              </Box>
            </MenuItem>
            <MenuItem value="HAVE">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HaveIcon color="success" fontSize="small" />
                HAVE
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Price Range</InputLabel>
          <Select
            value={filterPrice}
            label="Price Range"
            onChange={handlePriceFilterChange}
          >
            <MenuItem value="ALL">Any Price</MenuItem>
            <MenuItem value="UNDER_100K">Under $100K</MenuItem>
            <MenuItem value="100K_500K">$100K - $500K</MenuItem>
            <MenuItem value="500K_1M">$500K - $1M</MenuItem>
            <MenuItem value="1M_5M">$1M - $5M</MenuItem>
            <MenuItem value="5M_10M">$5M - $10M</MenuItem>
            <MenuItem value="OVER_10M">Over $10M</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Size Range</InputLabel>
          <Select
            value={filterSize}
            label="Size Range"
            onChange={handleSizeFilterChange}
          >
            <MenuItem value="ALL">Any Size</MenuItem>
            <MenuItem value="UNDER_1000">Under 1,000 sq ft</MenuItem>
            <MenuItem value="1000_5000">1,000 - 5,000 sq ft</MenuItem>
            <MenuItem value="5000_10000">5,000 - 10,000 sq ft</MenuItem>
            <MenuItem value="10000_50000">10,000 - 50,000 sq ft</MenuItem>
            <MenuItem value="50000_100000">50,000 - 100,000 sq ft</MenuItem>
            <MenuItem value="OVER_100000">Over 100,000 sq ft</MenuItem>
          </Select>
        </FormControl>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            p: 1,
            borderRadius: 1,
            '&:hover': { bgcolor: 'action.hover' },
          }}
          onClick={onClearAllFilters}
          title="Clear all filters"
        >
          <ClearAllIcon sx={{ color: 'text.secondary' }} />
        </Box>
      </Box>
    </Paper>
  );
};

export default SearchAndFilterBar;