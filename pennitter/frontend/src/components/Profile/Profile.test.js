import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../axiosInstance';
import Profile from './Profile';

// const url = '/users/usernameOrEmailTaken/';
// const urlRegex = new RegExp(`${url}.*`);
// mock.onGet(urlRegex).reply(200, { usernameInDB: true, emailInDB: true });

describe('Profile component', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    mock.onGet(new RegExp(`${'/profileimage'}.*`)).reply(200, 'https://i.imgur.com/NUWSyFp.jpeg');
    mock.onGet(new RegExp(`${'/username-email'}.*`)).reply(200, { username: 'testusername', email: 'test@email.com' });
  });

  afterEach(() => {
    mock.restore();
  });

  const loggedInUserId = 3;
  test('renders Profile Settings page header', () => {
    render(<Profile loggedInUserId={loggedInUserId} setLoggedInUser={() => { }}
    setAlert={() => { }} />);

    const screenTitle = screen.getByText('Profile Settings');
    expect(screenTitle).toBeInTheDocument();
  });
  test('after loading user: renders Profile Picture, User Info, and User Password section headers', async () => {
    render(<Profile loggedInUserId={loggedInUserId} setLoggedInUser={() => { }}
    setAlert={() => { }} />);

    await waitFor(() => {
      expect(screen.getByText('Profile Picture')).toBeInTheDocument();
      expect(screen.getByText('User Info')).toBeInTheDocument();
      expect(screen.getByText('User Password')).toBeInTheDocument();
    });
  });
  test('after loading user: renders Edit User Info, Change Password, and Delete Profile buttons', async () => {
    render(<Profile loggedInUserId={loggedInUserId} setLoggedInUser={() => { }}
    setAlert={() => { }} />);

    await waitFor(() => {
      expect(screen.getByText('Edit User Info')).toBeInTheDocument();
      expect(screen.getByText('Change Password')).toBeInTheDocument();
      expect(screen.getByText('Delete Profile')).toBeInTheDocument();
    });
  });
  test('after loading user: edit Username and Email, cancel Edit', async () => {
    render(<Profile loggedInUserId={loggedInUserId} setLoggedInUser={() => { }}
    setAlert={() => { }} />);

    await waitFor(() => {
      expect(screen.getByText('Edit User Info')).toBeInTheDocument();
    });

    const editUserInfoButton = screen.getByText('Edit User Info');
    fireEvent.click(editUserInfoButton);

    // confirm we are editing User Info
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    const cancelEditUserInfoButton = screen.getByText('Cancel');

    // now editing User Info
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(usernameInput, { target: { value: 'testuser!!!' } });
    fireEvent.change(emailInput, { target: { value: 'testuser' } });
    expect(usernameInput).toHaveValue('testuser!!!');
    expect(emailInput).toHaveValue('testuser');

    // confirm we can save the User Info
    expect(screen.getByText('Save User Info')).toBeInTheDocument();

    // Cancel editing of User Info
    fireEvent.click(cancelEditUserInfoButton);

    // Confirm we have cancelled edit User Info
    expect(screen.getByText('Edit User Info')).toBeInTheDocument();
  });
  test('after loading user: edit Username and Email, save with invalid input, displays validation failure messages', async () => {
    const usernameErrorMessage = 'Username must be 1 to 15 characters consisting only of letters, digits, and underscores.';
    const emailErrorMessage = 'Email must be a valid email format.';
    render(<Profile loggedInUserId={loggedInUserId} setLoggedInUser={() => { }}
    setAlert={() => { }} />);

    await waitFor(() => {
      expect(screen.getByText('Edit User Info')).toBeInTheDocument();
    });

    const editUserInfoButton = screen.getByText('Edit User Info');
    fireEvent.click(editUserInfoButton);

    // confirm we are editing User Info
    expect(screen.getByText('Cancel')).toBeInTheDocument();

    // now editing User Info
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(usernameInput, { target: { value: 'testuser!!!' } });
    fireEvent.change(emailInput, { target: { value: 'testuser' } });
    expect(usernameInput).toHaveValue('testuser!!!');
    expect(emailInput).toHaveValue('testuser');

    // confirm we can save the User Info
    expect(screen.getByText('Save User Info')).toBeInTheDocument();
    const saveUserInfoButton = screen.getByText('Save User Info');

    // save user info
    fireEvent.click(saveUserInfoButton);

    const usernameErrorMsg = screen.getByText(usernameErrorMessage);
    const emailErrorMsg = screen.getByText(emailErrorMessage);

    expect(usernameErrorMsg).toBeInTheDocument();
    expect(emailErrorMsg).toBeInTheDocument();

    // makes sure the right inputs are being invalidated
    expect(usernameInput).toHaveValue('testuser!!!');
    expect(emailInput).toHaveValue('testuser');
  });
  test('after loading user: edit Username and Email, save with valid input, but the username and email are already taken', async () => {
    mock.onGet(new RegExp(`${'/users/usernameOrEmailTaken/'}.*`)).reply(200, { usernameInDB: true, emailInDB: true });

    const setAlert = jest.fn();
    render(<Profile loggedInUserId={loggedInUserId} setLoggedInUser={() => { }}
    setAlert={setAlert} />);

    await waitFor(() => {
      expect(screen.getByText('Edit User Info')).toBeInTheDocument();
    });

    const editUserInfoButton = screen.getByText('Edit User Info');
    fireEvent.click(editUserInfoButton);

    // confirm we are editing User Info
    expect(screen.getByText('Cancel')).toBeInTheDocument();

    // now editing User Info
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(usernameInput, { target: { value: 'user1' } });
    fireEvent.change(emailInput, { target: { value: 'user1@user.com' } });
    expect(usernameInput).toHaveValue('user1');
    expect(emailInput).toHaveValue('user1@user.com');

    // confirm we can save the User Info
    expect(screen.getByText('Save User Info')).toBeInTheDocument();
    const saveUserInfoButton = screen.getByText('Save User Info');

    // save user info
    fireEvent.click(saveUserInfoButton);

    await waitFor(() => {
      expect(setAlert).toHaveBeenCalledTimes(1);
      expect(setAlert).toHaveBeenCalledWith({ severity: 'error', message: 'Username and Email already in use!' });
    });
  });
  test('after loading user: edit Username and Email, save with valid input, but the username is already taken', async () => {
    mock.onGet(new RegExp(`${'/users/usernameOrEmailTaken/'}.*`)).reply(200, { usernameInDB: true, emailInDB: false });

    const setAlert = jest.fn();
    render(<Profile loggedInUserId={loggedInUserId} setLoggedInUser={() => { }}
    setAlert={setAlert} />);

    await waitFor(() => {
      expect(screen.getByText('Edit User Info')).toBeInTheDocument();
    });

    const editUserInfoButton = screen.getByText('Edit User Info');
    fireEvent.click(editUserInfoButton);

    // confirm we are editing User Info
    expect(screen.getByText('Cancel')).toBeInTheDocument();

    // now editing User Info
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(usernameInput, { target: { value: 'user1' } });
    fireEvent.change(emailInput, { target: { value: 'user111111@user.com' } });
    expect(usernameInput).toHaveValue('user1');
    expect(emailInput).toHaveValue('user111111@user.com');

    // confirm we can save the User Info
    expect(screen.getByText('Save User Info')).toBeInTheDocument();
    const saveUserInfoButton = screen.getByText('Save User Info');

    // save user info
    fireEvent.click(saveUserInfoButton);

    await waitFor(() => {
      expect(setAlert).toHaveBeenCalledTimes(1);
      expect(setAlert).toHaveBeenCalledWith({ severity: 'error', message: 'Username already in use!' });
    });
  });
  test('after loading user: edit Username and Email, save with valid input, but the email is already taken', async () => {
    mock.onGet(new RegExp(`${'/users/usernameOrEmailTaken/'}.*`)).reply(200, { usernameInDB: false, emailInDB: true });

    const setAlert = jest.fn();
    render(<Profile loggedInUserId={loggedInUserId} setLoggedInUser={() => { }}
    setAlert={setAlert} />);

    await waitFor(() => {
      expect(screen.getByText('Edit User Info')).toBeInTheDocument();
    });

    const editUserInfoButton = screen.getByText('Edit User Info');
    fireEvent.click(editUserInfoButton);

    // confirm we are editing User Info
    expect(screen.getByText('Cancel')).toBeInTheDocument();

    // now editing User Info
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(usernameInput, { target: { value: 'user111111' } });
    fireEvent.change(emailInput, { target: { value: 'user1@user.com' } });
    expect(usernameInput).toHaveValue('user111111');
    expect(emailInput).toHaveValue('user1@user.com');

    // confirm we can save the User Info
    expect(screen.getByText('Save User Info')).toBeInTheDocument();
    const saveUserInfoButton = screen.getByText('Save User Info');

    // save user info
    fireEvent.click(saveUserInfoButton);

    await waitFor(() => {
      expect(setAlert).toHaveBeenCalledTimes(1);
      expect(setAlert).toHaveBeenCalledWith({ severity: 'error', message: 'Email already in use!' });
    });
  });

  test('after loading user: edit Password, toggle Password visibility, cancel Edit', async () => {
    render(<Profile loggedInUserId={loggedInUserId} setLoggedInUser={() => { }}
    setAlert={() => { }} />);

    await waitFor(() => {
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    const changePasswordInfoButton = screen.getByText('Change Password');
    fireEvent.click(changePasswordInfoButton);

    // confirm we are editing Password
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    const cancelEditPasswordButton = screen.getByText('Cancel');

    // now editing Password
    const newPasswordInput = screen.getByLabelText('Current Password');
    const currentPasswordInput = screen.getByLabelText('New Password');
    fireEvent.change(newPasswordInput, { target: { value: 'testuser!!!' } });
    fireEvent.change(currentPasswordInput, { target: { value: 'testuser' } });
    expect(newPasswordInput).toHaveValue('testuser!!!');
    expect(currentPasswordInput).toHaveValue('testuser');

    // confirm we can save the Password
    expect(screen.getByText('Save Password')).toBeInTheDocument();

    // toggle Password Visibility
    const toggleButton = screen.getByText(/Toggle Password Visibility/i);

    fireEvent.click(toggleButton);
    expect(newPasswordInput).toHaveAttribute('type', 'text');
    expect(currentPasswordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(newPasswordInput).toHaveAttribute('type', 'password');
    expect(currentPasswordInput).toHaveAttribute('type', 'password');

    // Cancel editing of Password
    fireEvent.click(cancelEditPasswordButton);

    // Confirm we have cancelled edit Password
    expect(screen.getByText('Change Password')).toBeInTheDocument();
  });
  test('after loading user: edit Password, save with invalid input, displays validation failure message', async () => {
    const passwordErrorMessage = 'Password must be at least 8 characters consisting of, and only of, at least one lowercase letter, one uppercase letter, one digit, and one special character (@,$,!,%,*,?,&).';
    render(<Profile loggedInUserId={loggedInUserId} setLoggedInUser={() => { }}
    setAlert={() => { }} />);

    await waitFor(() => {
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    const changePasswordInfoButton = screen.getByText('Change Password');
    fireEvent.click(changePasswordInfoButton);

    // confirm we are editing Password
    expect(screen.getByText('Cancel')).toBeInTheDocument();

    // now editing Password
    const newPasswordInput = screen.getByLabelText('Current Password');
    const currentPasswordInput = screen.getByLabelText('New Password');
    fireEvent.change(newPasswordInput, { target: { value: 'testuser!!!' } });
    fireEvent.change(currentPasswordInput, { target: { value: 'testuser' } });
    expect(newPasswordInput).toHaveValue('testuser!!!');
    expect(currentPasswordInput).toHaveValue('testuser');

    // confirm we can save the Password
    expect(screen.getByText('Save Password')).toBeInTheDocument();
    const savePasswordButton = screen.getByText('Save Password');

    // save Password
    fireEvent.click(savePasswordButton);

    const passwordErrorMsg = screen.getByText(passwordErrorMessage);
    expect(passwordErrorMsg).toBeInTheDocument();

    // makes sure the right inputs are being invalidated
    expect(newPasswordInput).toHaveValue('testuser!!!');
    expect(currentPasswordInput).toHaveValue('testuser');
  });
  test('after loading user: edit Password, save with valid input, but new PW cant be equal to old pw', async () => {
    const passwordErrorMessage = 'New Password cannot be identical to Current Password.';
    render(<Profile loggedInUserId={loggedInUserId} setLoggedInUser={() => { }}
    setAlert={() => { }} />);

    await waitFor(() => {
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    const changePasswordInfoButton = screen.getByText('Change Password');
    fireEvent.click(changePasswordInfoButton);

    // confirm we are editing Password
    expect(screen.getByText('Cancel')).toBeInTheDocument();

    // now editing Password
    const newPasswordInput = screen.getByLabelText('Current Password');
    const currentPasswordInput = screen.getByLabelText('New Password');
    fireEvent.change(newPasswordInput, { target: { value: 'TestUser!1' } });
    fireEvent.change(currentPasswordInput, { target: { value: 'TestUser!1' } });
    expect(newPasswordInput).toHaveValue('TestUser!1');
    expect(currentPasswordInput).toHaveValue('TestUser!1');

    // confirm we can save the Password
    expect(screen.getByText('Save Password')).toBeInTheDocument();
    const savePasswordButton = screen.getByText('Save Password');

    // save Password
    fireEvent.click(savePasswordButton);

    const passwordErrorMsg = screen.getByText(passwordErrorMessage);
    expect(passwordErrorMsg).toBeInTheDocument();

    // makes sure the right inputs are being invalidated
    expect(newPasswordInput).toHaveValue('TestUser!1');
    expect(currentPasswordInput).toHaveValue('TestUser!1');
  });
  test('after loading user: edit Password, save with valid input, but current PW doesnt match user credentials', async () => {
    mock.onPut(new RegExp(`${'/password'}.*`)).reply(401, { message: 'Incorrect Current Password!' });

    const setAlert = jest.fn();
    render(<Profile loggedInUserId={loggedInUserId} setLoggedInUser={() => { }}
    setAlert={setAlert} />);

    await waitFor(() => {
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    const changePasswordInfoButton = screen.getByText('Change Password');
    fireEvent.click(changePasswordInfoButton);

    // confirm we are editing Password
    expect(screen.getByText('Cancel')).toBeInTheDocument();

    // now editing Password
    const newPasswordInput = screen.getByLabelText('Current Password');
    const currentPasswordInput = screen.getByLabelText('New Password');
    fireEvent.change(newPasswordInput, { target: { value: 'TestUser!11111' } });
    fireEvent.change(currentPasswordInput, { target: { value: 'TestUser!1' } });
    expect(newPasswordInput).toHaveValue('TestUser!11111');
    expect(currentPasswordInput).toHaveValue('TestUser!1');

    // confirm we can save the Password
    expect(screen.getByText('Save Password')).toBeInTheDocument();
    const savePasswordButton = screen.getByText('Save Password');

    // save Password
    fireEvent.click(savePasswordButton);

    await waitFor(() => {
      expect(setAlert).toHaveBeenCalledTimes(1);
      expect(setAlert).toHaveBeenCalledWith({ severity: 'error', message: 'Error updating Password: Incorrect Current Password!' });
    });
  });

  test('after loading user: enter invalid file type for Profile picture', async () => {
    const content = 'x'.repeat(2 * 1024 * 1024); // Create content with a specified length (bytes)
    const file = new File([content], 'example.txt', { type: 'text/plain' });
    const setAlert = jest.fn();
    render(<Profile loggedInUserId={loggedInUserId} setLoggedInUser={() => { }}
    setAlert={setAlert} />);

    await waitFor(() => {
      expect(screen.getByText('Profile Picture')).toBeInTheDocument();
    });

    const imageInput = screen.getByTestId('imagePreview');
    fireEvent.change(imageInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(setAlert).toHaveBeenCalledTimes(1);
      expect(setAlert).toHaveBeenCalledWith({ severity: 'error', message: 'Unsupported file type' });
    });
  });

  test('after loading user: enter invalid file size for Profile picture', async () => {
    const content = 'x'.repeat(2 * 1024 * 1024); // Create content with a specified length (bytes)
    const file = new File([content], 'example.png', { type: 'image/png' });
    const setAlert = jest.fn();
    render(<Profile loggedInUserId={loggedInUserId} setLoggedInUser={() => { }}
    setAlert={setAlert} />);

    await waitFor(() => {
      expect(screen.getByText('Profile Picture')).toBeInTheDocument();
    });

    const imageInput = screen.getByTestId('imagePreview');
    fireEvent.change(imageInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(setAlert).toHaveBeenCalledTimes(1);
      expect(setAlert).toHaveBeenCalledWith({ severity: 'error', message: 'Image file size exceeds the limit (1MB)' });
    });
  });

  test('after loading user: upload new Profile picture file, load Image Preview, clear Image Preview', async () => {
    const content = 'x'.repeat(1024); // Create content with a specified length (bytes)
    const file = new File([content], 'example.png', { type: 'image/png' });
    const setAlert = jest.fn();
    render(<Profile loggedInUserId={loggedInUserId} setLoggedInUser={() => { }}
    setAlert={setAlert} />);

    await waitFor(() => {
      expect(screen.getByText('Profile Picture')).toBeInTheDocument();
    });

    const imageInput = screen.getByTestId('imagePreview');
    fireEvent.change(imageInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Image Preview')).toBeInTheDocument();
    });

    const clearImagePreviewButton = screen.getByText('Clear Image Preview');
    fireEvent.click(clearImagePreviewButton);
    expect(imageInput).toHaveValue('');
  });

  test('after loading user: enter new Profile picture file, load Image Preview, update Profile Image', async () => {
    mock.onPut(new RegExp(`${'/profileimage'}.*`)).reply(200, 'https://i.imgur.com/NUWSyFp.jpeg');

    const content = 'x'.repeat(1024); // Create content with a specified length (bytes)
    const file = new File([content], 'example.png', { type: 'image/png' });
    const setAlert = jest.fn();
    render(<Profile loggedInUserId={loggedInUserId} setLoggedInUser={() => { }}
    setAlert={setAlert} />);

    await waitFor(() => {
      expect(screen.getByText('Profile Picture')).toBeInTheDocument();
    });

    const imageInput = screen.getByTestId('imagePreview');
    fireEvent.change(imageInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Image Preview')).toBeInTheDocument();
    });

    const updateProfileImageButton = screen.getByText('Update Profile Picture');
    fireEvent.click(updateProfileImageButton);

    await waitFor(() => {
      expect(setAlert).toHaveBeenCalledTimes(1);
      expect(setAlert).toHaveBeenCalledWith({ severity: 'success', message: 'Profile Picture Updated!' });
    });
  });

  test('after loading user: delete Profile Image', async () => {
    mock.onDelete(new RegExp(`${'/profileimage'}.*`)).reply(200);
    mock.onPut(new RegExp(`${'/user/'}.*`)).reply(200);

    const setAlert = jest.fn();
    render(<Profile loggedInUserId={loggedInUserId} setLoggedInUser={() => { }}
    setAlert={setAlert} />);

    await waitFor(() => {
      expect(screen.getByText('Delete Profile Picture')).toBeInTheDocument();
    });

    const deleteProfileImageButton = screen.getByText('Delete Profile Picture');
    fireEvent.click(deleteProfileImageButton);

    await waitFor(() => {
      expect(setAlert).toHaveBeenCalledTimes(1);
      expect(setAlert).toHaveBeenCalledWith({ severity: 'success', message: 'Profile Picture Deleted!' });
    });
  });

  test('after loading user: click Delete Profile button, open Confirm Dialog, and click Confirm button', async () => {
    mock.onDelete(new RegExp(`${'/user/'}.*`)).reply(200);

    const setAlert = jest.fn();
    render(<Profile loggedInUserId={loggedInUserId} setLoggedInUser={() => { }}
    setAlert={setAlert} />);

    await waitFor(() => {
      expect(screen.getByText('Delete Profile')).toBeInTheDocument();
    });

    const deleteProfileButton = screen.getByText('Delete Profile');

    fireEvent.click(deleteProfileButton);

    const dialogText = screen.getByText('Are you sure you want to delete your profile? All of your posts and comments will also be deleted! This action cannot be reversed!');
    const confirmButton = screen.getByText('Confirm');
    const cancelButton = screen.getByText('Cancel');

    expect(dialogText).toBeInTheDocument();
    expect(confirmButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();

    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(setAlert).toHaveBeenCalledTimes(1);
      expect(setAlert).toHaveBeenCalledWith({ severity: 'success', message: 'Your Profile has been deleted :(' });
    });
  });
});
