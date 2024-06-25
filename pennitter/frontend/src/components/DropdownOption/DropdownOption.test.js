import React from 'react';
import { render, screen } from '@testing-library/react';
import DropdownOption from './DropdownOption';

describe('DropdownOption component', () => {
  test('renders dropdown options', () => {
    const headerText = 'Dropdown Header Text';
    const options = [
      { value: 'all', description: 'Posts from this User' },
      { value: 'hidden', description: 'Posts from this User you have Hidden' },
    ];
    const selectedOption = options[0].value;
    const handleChange = () => { };
    render(
    <DropdownOption
      headerText={headerText}
      options={options}
      selectedOption={selectedOption}
      handleChange={handleChange}
    />,
    );

    const headerTxt = screen.getByLabelText(/Dropdown Header Text/i);
    expect(headerTxt).toBeInTheDocument();

    const selectedOptionText = screen.getByLabelText(/Posts from this User/i);
    expect(selectedOptionText).toBeInTheDocument();
  });
});
