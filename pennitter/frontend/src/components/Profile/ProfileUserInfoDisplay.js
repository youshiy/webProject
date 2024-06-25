// Profile page
import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

function ProfileUserInfoDisplay(props) {
  const {
    username, email, editUserInfo,
  } = props;

  return (
    <div>
      <h5>User Info</h5>
      <div>
        <TextField sx={{ width: '100%' }} type="text" name="username" label="Username" value={username} disabled={true} />
      </div>
      <br />
      <div>
        <TextField sx={{ width: '100%' }} label="Email" type="text" name="email" value={email} disabled={true} />
      </div>
      <br />
      <Button variant='contained' onClick={editUserInfo} sx={{ width: '100%' }}>Edit User Info</Button>
    </div>
  );
}

ProfileUserInfoDisplay.propTypes = {
  username: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  editUserInfo: PropTypes.func.isRequired,
};

export default ProfileUserInfoDisplay;
