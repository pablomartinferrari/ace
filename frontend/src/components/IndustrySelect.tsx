import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from '@mui/material';
import type { IndustryType } from '../../../shared/types';

interface IndustrySelectProps {
  value: IndustryType[];
  onChange: (industries: IndustryType[]) => void;
  disabled?: boolean;
}

const INDUSTRY_OPTIONS: IndustryType[] = [
  'Healthcare',
  'Logistics',
  'Food & Beverage',
  'Technology',
  'Manufacturing',
  'Hospitality',
  'Financial Services',
  'Education',
  'Other'
];

const IndustrySelect: React.FC<IndustrySelectProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const selectedValues = event.target.value as IndustryType[];
    onChange(selectedValues);
  };

  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel>Industry</InputLabel>
      <Select
        multiple
        value={value}
        label="Industry"
        onChange={handleChange}
        renderValue={(selected) => (selected as string[]).join(', ')}
      >
        {INDUSTRY_OPTIONS.map((industry) => (
          <MenuItem key={industry} value={industry}>
            {industry}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default IndustrySelect;