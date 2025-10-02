import React from 'react';
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  type SelectChangeEvent,
} from '@mui/material';
import IndustrySelect from './IndustrySelect';
import type { PropertyType, IndustryType } from '../../../shared/types';

interface PropertyDetailsFormProps {
  propertyType: PropertyType | '';
  industry: IndustryType[];
  city: string;
  state: string;
  address: string;
  size: string;
  sizeUnit: 'sqft' | 'acres';
  price: string;
  onPropertyTypeChange: (value: PropertyType | '') => void;
  onIndustryChange: (industries: IndustryType[]) => void;
  onCityChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  onSizeUnitChange: (value: 'sqft' | 'acres') => void;
  onPriceChange: (value: string) => void;
  disabled?: boolean;
}

const PROPERTY_TYPE_OPTIONS: PropertyType[] = [
  'Office',
  'Retail',
  'Industrial',
  'Land',
  'Multifamily'
];

const PropertyDetailsForm: React.FC<PropertyDetailsFormProps> = ({
  propertyType,
  industry,
  city,
  state,
  address,
  size,
  sizeUnit,
  price,
  onPropertyTypeChange,
  onIndustryChange,
  onCityChange,
  onStateChange,
  onAddressChange,
  onSizeChange,
  onSizeUnitChange,
  onPriceChange,
  disabled = false
}) => {
  const handlePropertyTypeChange = (event: SelectChangeEvent) => {
    onPropertyTypeChange(event.target.value as PropertyType | '');
  };

  const handleSizeUnitChange = (event: SelectChangeEvent) => {
    onSizeUnitChange(event.target.value as 'sqft' | 'acres');
  };

  return (
    <>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
        Property Details (Optional)
      </Typography>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <FormControl sx={{ flex: 1 }} disabled={disabled}>
          <InputLabel>Property Type</InputLabel>
          <Select
            value={propertyType}
            label="Property Type"
            onChange={handlePropertyTypeChange}
          >
            <MenuItem value="">
              <em>Select property type...</em>
            </MenuItem>
            {PROPERTY_TYPE_OPTIONS.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flex: 1.2 }}>
          <IndustrySelect
            value={industry}
            onChange={onIndustryChange}
            disabled={disabled}
          />
        </Box>

        <TextField
          sx={{ flex: 1 }}
          label="Size"
          type="number"
          value={size}
          onChange={(e) => onSizeChange(e.target.value)}
          variant="outlined"
          disabled={disabled}
          InputProps={{
            endAdornment: (
              <FormControl size="small" sx={{ minWidth: 70 }}>
                <Select
                  value={sizeUnit}
                  onChange={handleSizeUnitChange}
                  variant="standard"
                  disableUnderline
                  disabled={disabled}
                >
                  <MenuItem value="sqft">sq ft</MenuItem>
                  <MenuItem value="acres">acres</MenuItem>
                </Select>
              </FormControl>
            ),
          }}
        />

        <TextField
          sx={{ flex: 1 }}
          label="Price (USD)"
          type="number"
          value={price}
          onChange={(e) => onPriceChange(e.target.value)}
          variant="outlined"
          disabled={disabled}
          InputProps={{
            startAdornment: '$',
          }}
        />
      </Box>

      <TextField
        fullWidth
        label="Address (Optional)"
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        variant="outlined"
        placeholder="Street address, building name, etc."
        disabled={disabled}
      />

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          label="City"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          variant="outlined"
          disabled={disabled}
        />
        <TextField
          fullWidth
          label="State"
          value={state}
          onChange={(e) => onStateChange(e.target.value)}
          variant="outlined"
          disabled={disabled}
        />
      </Box>
    </>
  );
};

export default PropertyDetailsForm;