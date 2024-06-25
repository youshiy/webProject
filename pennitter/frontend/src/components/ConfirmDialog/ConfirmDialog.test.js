import React from 'react';
import { render, screen } from '@testing-library/react';
import ConfirmDialog from './ConfirmDialog';

describe('ConfirmDialog component', () => {
  test('renders dialog', () => {
    render(<ConfirmDialog dialogTitle={'dialogTitle'} dialogText={'dialogText'} openDialog={true} handleCloseDialog={() => { }} handleConfirm={() => { }} />);
    const dialogTitle = screen.getByText('dialogTitle');
    expect(dialogTitle).toBeInTheDocument();
    const dialogText = screen.getByText('dialogText');
    expect(dialogText).toBeInTheDocument();
  });
});
