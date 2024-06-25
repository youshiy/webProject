import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { registerUser } from '../../api/authentication';
import { usernameOrEmailTaken } from '../../api/users';
import { validateUsernameEmailPassword } from '../../utilities/utilities';
import './Registration.css';

function Registration(props) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordType, setPasswordType] = useState('password');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  function handleUsernameChange(usernameEvent) {
    setUsername(usernameEvent.target.value);
  }
  function handleEmailChange(emailEvent) {
    setEmail(emailEvent.target.value);
  }
  function handlePasswordChange(passwordEvent) {
    setPassword(passwordEvent.target.value);
  }
  function togglePasswordVisibility() {
    setPasswordType((prevType) => (prevType === 'text' ? 'password' : 'text'));
  }

  async function isInputValid() {
    try {
      const results = validateUsernameEmailPassword({ username, email, password });
      if (Object.hasOwn(results, 'usernameRegexPass') && Object.hasOwn(results, 'emailRegexPass') && Object.hasOwn(results, 'passwordRegexPass')) {
        if (results.usernameRegexPass) {
          setUsernameError('');
        } else {
          setUsernameError(results.usernameErrorMessage);
        }
        if (results.emailRegexPass) {
          setEmailError('');
        } else {
          setEmailError(results.emailErrorMessage);
        }
        if (results.passwordRegexPass) {
          setPasswordError('');
        } else {
          setPasswordError(results.passwordErrorMessage);
        }
        if (results.usernameRegexPass && results.emailRegexPass && results.passwordRegexPass) {
          const result = await usernameOrEmailTaken(username, email);
          const { usernameInDB, emailInDB } = result.data;
          if (usernameInDB || emailInDB) {
            let message = '';
            if (usernameInDB && emailInDB) {
              message = 'Username and Email already in use!';
            } else if (usernameInDB) {
              message = 'Username already in use!';
            } else { // if (emailInDB) {
              message = 'Email already in use!';
            }
            props.setAlert({ severity: 'error', message });
            return false;
          }
        }

        return results.usernameRegexPass && results.emailRegexPass && results.passwordRegexPass;
      }

      props.setAlert({ severity: 'error', message: 'Error validating input!' });
      return false;
    } catch (err) {
      props.setAlert({ severity: 'error', message: `Error validating input: ${err.message ? err.message : err.toString()}` });
      return false;
    }
  }

  async function handleRegister() {
    try {
      if (!(await isInputValid())) {
        return;
      }

      await registerUser(username, email, password);

      props.setAlert({ severity: 'success', message: 'User Created!' });
    } catch (err) {
      props.setAlert({ severity: 'error', message: `Error creating user: ${err.message ? err.message : err.toString()}` });
    }
  }

  return (
    <div className='registrationDiv'>
      <h1>Registration</h1>
      <Stack spacing={2} direction="column">
        <TextField required label="Username" placeholder="username" onChange={handleUsernameChange} />
        {usernameError && <p>{usernameError}</p>}

        <TextField required label="Email" placeholder="email" onChange={handleEmailChange} />
        {emailError && <p>{emailError}</p>}

        <TextField required label="Password" placeholder="password" type={passwordType} onChange={handlePasswordChange} />
        <Button type="button" onClick={togglePasswordVisibility}>Toggle Password Visibility</Button>
        {passwordError && <p>{passwordError}</p>}

        <br />
        <Button variant="outlined" onClick={handleRegister}>Register</Button>
      </Stack>
    </div>
  );
}

Registration.propTypes = {
  setAlert: PropTypes.func.isRequired,
};

export default Registration;
