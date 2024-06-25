import React from 'react';
import {
  render, screen, waitFor,
} from '@testing-library/react';
import App from './App';

describe('App component', () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  test('logged out: renders the App component', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText('Registration')).toHaveLength(2);
    });
  });

  test('logged in: renders the App component', async () => {
    const loggedInUser = { id: 1, username: 'moneybaggg' };
    window.sessionStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText('Followers')).toHaveLength(2);
    });
  });
});
