// Profile page
import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

function ProfilePasswordDisplay(props) {
  const {
    editPassword,
  } = props;

  return (
    <div>
      <h5>User Password</h5>
      <div>
        <TextField sx={{ width: '100%' }} label="Current Password" name="oldPassword" disabled={true} />
        <br />
        <TextField sx={{ width: '100%' }} label="New Password" name="newPassword" disabled={true} />
        <Button variant='contained' type="button" disabled={true} sx={{ width: '100%' }}>Toggle Password Visibility</Button>
      </div>
      <Button variant='contained' onClick={editPassword} sx={{ width: '100%' }}>Change Password</Button>
    </div>
  );
}

ProfilePasswordDisplay.propTypes = {
  editPassword: PropTypes.func.isRequired,
};

export default ProfilePasswordDisplay;
