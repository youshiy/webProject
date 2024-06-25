import React from 'react';
import { render, screen } from '@testing-library/react';
import AlertSnackbar from './AlertSnackbar';

describe('AlertSnackbar component', () => {
  test('renders Snackbar message', () => {
    const severity = 'error';
    const message = 'This is the testing message!';
    const alert = { key: 1, severity, message };
    render(<AlertSnackbar alert={alert} open={true} handleClose={() => { }} />);
    const messageText = screen.getByText(message);
    expect(messageText).toBeInTheDocument();
  });
});
