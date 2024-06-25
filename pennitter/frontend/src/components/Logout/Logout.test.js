import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Logout from './Logout';

describe('Logout component', () => {
  test('renders logout button', () => {
    render(<Logout setLoggedInUser={() => { }} />);
    const logoutButton = screen.getByText(/Logout/i);
    expect(logoutButton).toBeInTheDocument();
  });

  test('renders confirm logout dialog and press Cancel button', () => {
    render(<Logout setLoggedInUser={() => { }} />);
    const logoutButton = screen.getByText(/Logout/i);
    expect(logoutButton).toBeInTheDocument();

    fireEvent.click(logoutButton);

    const dialogText = screen.getByText('Are you sure you want to logout?');
    const confirmButton = screen.getByText(/Confirm/i);
    const cancelButton = screen.getByText(/Cancel/i);

    expect(dialogText).toBeInTheDocument();
    expect(confirmButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();

    fireEvent.click(cancelButton);

    expect(logoutButton).toBeInTheDocument();
    expect(dialogText).toBeInTheDocument();
    expect(confirmButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });
});
