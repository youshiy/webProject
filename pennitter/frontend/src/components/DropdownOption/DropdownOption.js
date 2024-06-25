import React from 'react';
import PropTypes from 'prop-types';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

function DropdownOption(props) {
  const {
    headerText,
    options,
    selectedOption,
    handleChange,
  } = props;

  return (
    <FormControl>
      <InputLabel id="view-label">{headerText}</InputLabel>
      <Select
        labelId="view-label"
        id="view-select"
        data-testid="view-select"
        value={selectedOption}
        onChange={handleChange}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.description}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

DropdownOption.propTypes = {
  headerText: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  selectedOption: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default DropdownOption;
