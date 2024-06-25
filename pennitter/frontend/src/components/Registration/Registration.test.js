import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../axiosInstance';
import Registration from './Registration';

describe('Registration component', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  test('renders Registration Title', () => {
    render(<Registration setAlert={() => { }} />);
    const pageTitle = screen.getByText(/Registration/i);
    expect(pageTitle).toBeInTheDocument();
  });
  test('renders Username TextField', () => {
    render(<Registration setAlert={() => { }} />);
    const usernameLabel = screen.getByLabelText(/Username/i);
    expect(usernameLabel).toBeInTheDocument();
  });
  test('renders Email TextField', () => {
    render(<Registration setAlert={() => { }} />);
    const emailLabel = screen.getByLabelText(/Email/i);
    expect(emailLabel).toBeInTheDocument();
  });
  test('renders Password TextField', () => {
    render(<Registration setAlert={() => { }} />);
    const passwordLabel = screen.getByLabelText(/Password/i);
    expect(passwordLabel).toBeInTheDocument();
  });
  test('renders Toggle Password Visibility Button', () => {
    render(<Registration setAlert={() => { }} />);
    const togglebutton = screen.getByText(/Toggle Password Visibility/i);
    expect(togglebutton).toBeInTheDocument();
  });
  test('renders Register Button', () => {
    render(<Registration setAlert={() => { }} />);
    const registerButton = screen.getByText(/Register/i);
    expect(registerButton).toBeInTheDocument();
  });

  test('handles username input change', () => {
    render(<Registration setAlert={() => { }} />);
    const usernameInput = screen.getByLabelText(/Username/i);
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    expect(usernameInput).toHaveValue('testuser');
  });
  test('handles email input change', () => {
    render(<Registration setAlert={() => { }} />);
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'testuser@example.com' } });
    expect(emailInput).toHaveValue('testuser@example.com');
  });
  test('handles password input change', () => {
    render(<Registration setAlert={() => { }} />);
    const passwordInput = screen.getByLabelText(/Password/i);
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    expect(passwordInput).toHaveValue('testpassword');
  });

  test('toggles password visibility', () => {
    render(<Registration setAlert={() => { }} />);
    const toggleButton = screen.getByText(/Toggle Password Visibility/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('handles registration with invalid input, displays validation failure messages', () => {
    const usernameErrorMessage = 'Username must be 1 to 15 characters consisting only of letters, digits, and underscores.';
    const emailErrorMessage = 'Email must be a valid email format.';
    const passwordErrorMessage = 'Password must be at least 8 characters consisting of, and only of, at least one lowercase letter, one uppercase letter, one digit, and one special character (@,$,!,%,*,?,&).';

    render(<Registration setAlert={() => { }} />);
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const registerButton = screen.getByText(/Register/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser!!!' } });
    fireEvent.change(emailInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });

    fireEvent.click(registerButton);

    const usernameErrorMsg = screen.getByText(usernameErrorMessage);
    const emailErrorMsg = screen.getByText(emailErrorMessage);
    const passwordErrorMsg = screen.getByText(passwordErrorMessage);

    expect(usernameErrorMsg).toBeInTheDocument();
    expect(emailErrorMsg).toBeInTheDocument();
    expect(passwordErrorMsg).toBeInTheDocument();

    // makes sure the right inputs are being invalidated
    expect(usernameInput).toHaveValue('testuser!!!');
    expect(emailInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('testpassword');
  });

  test('handles registration with valid input, but the username and email are already taken', async () => {
    const url = '/users/usernameOrEmailTaken/';
    const urlRegex = new RegExp(`${url}.*`);
    mock.onGet(urlRegex).reply(200, { usernameInDB: true, emailInDB: true });

    const setAlert = jest.fn();
    render(<Registration setAlert={setAlert} />);
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const registerButton = screen.getByText(/Register/i);

    fireEvent.change(usernameInput, { target: { value: 'user0' } });
    fireEvent.change(emailInput, { target: { value: 'user0@user.com' } });
    fireEvent.change(passwordInput, { target: { value: 'UserUser!0' } });

    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(setAlert).toHaveBeenCalledTimes(1);
      expect(setAlert).toHaveBeenCalledWith({ severity: 'error', message: 'Username and Email already in use!' });
    });
  });

  test('handles registration with valid input, but the username is already taken', async () => {
    const url = '/users/usernameOrEmailTaken/';
    const urlRegex = new RegExp(`${url}.*`);
    mock.onGet(urlRegex).reply(200, { usernameInDB: true, emailInDB: false });

    const setAlert = jest.fn();
    render(<Registration setAlert={setAlert} />);
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const registerButton = screen.getByText(/Register/i);

    fireEvent.change(usernameInput, { target: { value: 'user0' } });
    fireEvent.change(emailInput, { target: { value: 'user000000@user.com' } });
    fireEvent.change(passwordInput, { target: { value: 'UserUser!0' } });

    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(setAlert).toHaveBeenCalledTimes(1);
      expect(setAlert).toHaveBeenCalledWith({ severity: 'error', message: 'Username already in use!' });
    });
  });

  test('handles registration with valid input, but the email is already taken', async () => {
    const url = '/users/usernameOrEmailTaken/';
    const urlRegex = new RegExp(`${url}.*`);
    mock.onGet(urlRegex).reply(200, { usernameInDB: false, emailInDB: true });

    const setAlert = jest.fn();
    render(<Registration setAlert={setAlert} />);
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const registerButton = screen.getByText(/Register/i);

    fireEvent.change(usernameInput, { target: { value: 'user000000' } });
    fireEvent.change(emailInput, { target: { value: 'user0@user.com' } });
    fireEvent.change(passwordInput, { target: { value: 'UserUser!0' } });

    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(setAlert).toHaveBeenCalledTimes(1);
      expect(setAlert).toHaveBeenCalledWith({ severity: 'error', message: 'Email already in use!' });
    });
  });
});
