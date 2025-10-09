import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  type SelectChangeEvent,
} from '@mui/material';
import {
  ShoppingCart as NeedIcon,
  CheckCircle as HaveIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ClearAll as ClearAllIcon,
  Verified as ActiveIcon,
} from '@mui/icons-material';
import type { PostType } from '../../../shared/types';

interface SearchAndFilterBarProps {
  searchQuery: string;
  filterType: PostType | 'ALL';
  filterPrice: string;
  filterSize: string;
  showActiveOnly: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: PostType | 'ALL') => void;
  onPriceFilterChange: (value: string) => void;
  onSizeFilterChange: (value: string) => void;
  onActiveFilterChange: (value: boolean) => void;
  onClearSearch: () => void;
  onClearAllFilters: () => void;
}

const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
  searchQuery,
  filterType,
  filterPrice,
  filterSize,
  showActiveOnly,
  onSearchChange,
  onFilterChange,
  onPriceFilterChange,
  onSizeFilterChange,
  onActiveFilterChange,
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

  const handleActiveFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onActiveFilterChange(event.target.checked);
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        useFlexGap
        sx={{ flexWrap: 'wrap' }}
      >
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
          sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 240 } }}
        />
        <FormControl size="small" fullWidth sx={{ minWidth: { xs: '100%', sm: 160 }, maxWidth: 200 }}>
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
        <FormControl size="small" fullWidth sx={{ minWidth: { xs: '100%', sm: 180 }, maxWidth: 220 }}>
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
        <FormControl size="small" fullWidth sx={{ minWidth: { xs: '100%', sm: 180 }, maxWidth: 220 }}>
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
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          minWidth: { xs: '100%', sm: 'auto' },
          justifyContent: { xs: 'flex-start', sm: 'center' }
        }}>
          <FormControlLabel
            control={
              <Switch
                checked={showActiveOnly}
                onChange={handleActiveFilterChange}
                size="small"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ActiveIcon fontSize="small" color={showActiveOnly ? "success" : "disabled"} />
                Show active deals only
              </Box>
            }
            sx={{ 
              mr: 0,
              '& .MuiFormControlLabel-label': { 
                fontSize: '0.875rem',
                whiteSpace: 'nowrap'
              } 
            }}
          />
        </Box>
        <Tooltip title="Clear all filters">
          <IconButton
            color="inherit"
            onClick={onClearAllFilters}
            sx={{
              alignSelf: { xs: 'flex-end', md: 'center' },
              color: 'text.secondary',
            }}
          >
            <ClearAllIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
};

export default SearchAndFilterBar;