import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { authenticateUser, reauthenticateUser } from '../../api/authentication';
import { validateUsernameEmailPassword } from '../../utilities/utilities';
import './Login.css';

function Login(props) {
  const [usernameOrEmail, setUsernameOrEmail] = useState(props.loggedInUser ? props.loggedInUser.username : '');
  const [password, setPassword] = useState('');
  const [passwordType, setPasswordType] = useState('password');
  const [loginAttmpts, setLoginAttempts] = useState(0);
  const [usernameEmailError, setUserNameEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  function handleUsernameEmailChange(usernameOrEmailEvent) {
    setUsernameOrEmail(usernameOrEmailEvent.target.value);
  }
  function handlePasswordChange(passwordEvent) {
    setPassword(passwordEvent.target.value);
  }
  function togglePasswordVisibility() {
    setPasswordType((prevType) => (prevType === 'text' ? 'password' : 'text'));
  }

  async function isInputValid() {
    try {
      const results = validateUsernameEmailPassword(
        { username: usernameOrEmail, email: usernameOrEmail, password },
      );
      if (Object.hasOwn(results, 'usernameRegexPass') && Object.hasOwn(results, 'emailRegexPass') && Object.hasOwn(results, 'passwordRegexPass')) {
        if (results.usernameRegexPass || results.emailRegexPass) {
          setUserNameEmailError('');
        } else {
          setUserNameEmailError(`${results.usernameErrorMessage} ${results.emailErrorMessage}`);
        }
        if (results.passwordRegexPass) {
          setPasswordError('');
        } else {
          setPasswordError(results.passwordErrorMessage);
        }

        return (results.usernameRegexPass || results.emailRegexPass) && results.passwordRegexPass;
      }

      props.setAlert({ severity: 'error', message: 'Error validating input!' });
      return false;
    } catch (err) {
      props.setAlert({ severity: 'error', message: `Error validating input: ${err.message ? err.message : err.toString()}` });
      return false;
    }
  }

  async function handleLogin() {
    try {
      if (!(await isInputValid())) {
        return;
      }

      let userMatch = {};
      if (!props.loggedInUser) {
        userMatch = await authenticateUser(usernameOrEmail, password);
      } else {
        userMatch = await reauthenticateUser(usernameOrEmail, password);
      }
      sessionStorage.setItem('app-token', userMatch.data.token);
      props.setLoggedInUser(userMatch.data.id, userMatch.data.username);
    } catch (err) {
      if (err instanceof Error && typeof err.message === 'string') {
        try {
          const { message, loginAttempts } = JSON.parse(err.message);
          setLoginAttempts(loginAttempts);
          props.setAlert({ severity: 'error', message: `Error logging in: ${message}` });
        } catch (parseErr) {
          props.setAlert({ severity: 'error', message: `Error logging in: ${err.message ? err.message : err.toString()}` });
        }
      } else {
        props.setAlert({ severity: 'error', message: `Error logging in: ${err.message ? err.message : err.toString()}` });
      }
    }
  }
  return (
    <>
      <div className='loginDiv'>
        {!props.loggedInUser && <h1>Login</h1>}
        <Stack spacing={2} direction="column">
          <TextField required label="Username/Email" placeholder="username/email" value={usernameOrEmail} onChange={handleUsernameEmailChange} disabled={!!props.loggedInUser} />
          {usernameEmailError && <p>{usernameEmailError}</p>}

          <TextField required label="Password" placeholder="password" type={passwordType} onChange={handlePasswordChange} />
          <Button type="button" onClick={togglePasswordVisibility}>Toggle Password Visibility</Button>
          {passwordError && <p>{passwordError}</p>}

          <Button variant="outlined" onClick={handleLogin}>Login</Button>
        </Stack>
      </div>
      <Dialog
        open={loginAttmpts >= 3}
        onClose={() => setLoginAttempts(0)}
      >
        <DialogTitle>{'Locked out'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {'Your account has been locked out for 1 minute from intial lockout time. Even with correct credentials, you will not be authenticated.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoginAttempts(0)}>Ok</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={loginAttmpts === -1}
        onClose={() => setLoginAttempts(0)}
      >
        <DialogTitle>{'Active Session already exists'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {'Your account already has an active session. Even with correct credentials, you will not be authenticated until you log out of the active session, or the session expires.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoginAttempts(0)}>Ok</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

Login.propTypes = {
  setLoggedInUser: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired,
  loggedInUser: PropTypes.object,
};

export default Login;
