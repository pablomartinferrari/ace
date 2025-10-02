import React from 'react';
import {
  AppBar,
  Toolbar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  type SelectChangeEvent,
} from '@mui/material';
import {
  ShoppingCart as NeedIcon,
  CheckCircle as HaveIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import type { PostType } from '../../../shared/types';

interface SearchAndFilterBarProps {
  searchQuery: string;
  filterType: PostType | 'ALL';
  onSearchChange: (value: string) => void;
  onFilterChange: (value: PostType | 'ALL') => void;
  onClearSearch: () => void;
}

const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
  searchQuery,
  filterType,
  onSearchChange,
  onFilterChange,
  onClearSearch,
}) => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    onFilterChange(event.target.value as PostType | 'ALL');
  };

  return (
    <AppBar position="static" color="default" elevation={1} sx={{ mb: 2 }}>
      <Toolbar sx={{ gap: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search posts..."
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
          sx={{ flexGrow: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={filterType}
            label="Filter"
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
      </Toolbar>
    </AppBar>
  );
};

export default SearchAndFilterBar;