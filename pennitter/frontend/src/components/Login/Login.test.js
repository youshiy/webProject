import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../axiosInstance';
import Login from './Login';

describe('Login component', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  test('renders Username/Email TextField', () => {
    render(<Login setLoggedInUser={() => { }} setAlert={() => { }} />);
    const usernameEmailLabel = screen.getByLabelText(/Username\/Email/i);
    expect(usernameEmailLabel).toBeInTheDocument();
  });
  test('renders Password TextField', () => {
    render(<Login setLoggedInUser={() => { }} setAlert={() => { }} />);
    const passwordLabel = screen.getByLabelText(/Password/i);
    expect(passwordLabel).toBeInTheDocument();
  });
  test('renders Toggle Password Visibility Button', () => {
    render(<Login setLoggedInUser={() => { }} setAlert={() => { }} />);
    const togglebutton = screen.getByText(/Toggle Password Visibility/i);
    expect(togglebutton).toBeInTheDocument();
  });
  test('renders Login Header and Button', () => {
    render(<Login setLoggedInUser={() => { }} setAlert={() => { }} />);
    const login = screen.getAllByText(/Login/i);
    expect(login).toHaveLength(2);
  });

  test('handles username/email input change', () => {
    render(<Login setLoggedInUser={() => { }} setAlert={() => { }} />);
    const usernameEmailInput = screen.getByLabelText(/Username\/Email/i);
    fireEvent.change(usernameEmailInput, { target: { value: 'testuser' } });
    expect(usernameEmailInput).toHaveValue('testuser');
  });
  test('handles password input change', () => {
    render(<Login setLoggedInUser={() => { }} setAlert={() => { }} />);
    const passwordInput = screen.getByLabelText(/Password/i);
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    expect(passwordInput).toHaveValue('testpassword');
  });

  test('toggles password visibility', () => {
    render(<Login setLoggedInUser={() => { }} setAlert={() => { }} />);
    const toggleButton = screen.getByText(/Toggle Password Visibility/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('handles Login with invalid input, displays validation failure messages', () => {
    const usernameErrorMessage = 'Username must be 1 to 15 characters consisting only of letters, digits, and underscores.';
    const emailErrorMessage = 'Email must be a valid email format.';
    const passwordErrorMessage = 'Password must be at least 8 characters consisting of, and only of, at least one lowercase letter, one uppercase letter, one digit, and one special character (@,$,!,%,*,?,&).';

    render(<Login setLoggedInUser={() => { }} setAlert={() => { }} />);
    const usernameEmailInput = screen.getByLabelText(/Username\/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(usernameEmailInput, { target: { value: 'testuser!!!' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });

    fireEvent.click(loginButton);

    const usernameEmailErrorMsg = screen.getByText(`${usernameErrorMessage} ${emailErrorMessage}`);
    const passwordErrorMsg = screen.getByText(passwordErrorMessage);

    expect(usernameEmailErrorMsg).toBeInTheDocument();
    expect(passwordErrorMsg).toBeInTheDocument();

    // makes sure the right inputs are being invalidated
    expect(usernameEmailInput).toHaveValue('testuser!!!');
    expect(passwordInput).toHaveValue('testpassword');
  });

  test('handles login with invalid credentials', async () => {
    mock.onPost(new RegExp(`${'/authenticate'}.*`)).reply(401, { message: 'Invalid Credentials!' });
    const setAlert = jest.fn();
    render(<Login setLoggedInUser={() => { }} setAlert={setAlert} />);
    const usernameEmailInput = screen.getByLabelText(/Username\/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(usernameEmailInput, { target: { value: 'user0' } });
    fireEvent.change(passwordInput, { target: { value: 'UserUser!0' } });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(setAlert).toHaveBeenCalledTimes(1);
      expect(setAlert).toHaveBeenCalledWith({ severity: 'error', message: 'Error logging in: Invalid Credentials!' });
    });
  });
});
