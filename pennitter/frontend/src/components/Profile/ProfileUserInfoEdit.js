// Profile page
import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

function ProfileUserInfoEdit(props) {
  const {
    username, email, usernameError, emailError,
    handleUserInfoChange, cancelUserInfoEdit,
    userInfoIsChanged, updateUserInfo,
  } = props;

  return (
    <div>
      <h5>User Info</h5>
      <div>
        <TextField sx={{ width: '100%' }} type="text" name="username" label="Username" value={username} onChange={handleUserInfoChange} />
        {usernameError && <p>{usernameError}</p>}
      </div>
      <br />
      <div>
        <TextField sx={{ width: '100%' }} label="Email" type="text" name="email" value={email} onChange={handleUserInfoChange} />
        {emailError && <p>{emailError}</p>}
      </div>
      <br />
      <div>
        <Button variant='contained' onClick={cancelUserInfoEdit} sx={{ width: '100%' }}>Cancel</Button>
        {userInfoIsChanged() && <Button variant='contained' onClick={updateUserInfo} sx={{ width: '100%' }}>Save User Info</Button>}
      </div>
    </div>
  );
}

ProfileUserInfoEdit.propTypes = {
  username: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  usernameError: PropTypes.string.isRequired,
  emailError: PropTypes.string.isRequired,
  handleUserInfoChange: PropTypes.func.isRequired,
  cancelUserInfoEdit: PropTypes.func.isRequired,
  userInfoIsChanged: PropTypes.func.isRequired,
  updateUserInfo: PropTypes.func.isRequired,
};

export default ProfileUserInfoEdit;
