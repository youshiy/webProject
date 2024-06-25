// Profile page
import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

function ProfilePasswordEdit(props) {
  const {
    passwordType, oldPassword, newPassword, passwordError,
    handlePasswordChange, togglePasswordVisibility, cancelPasswordEdit, updatePassword,
  } = props;

  return (
    <div>
      <h5>User Password</h5>
      <div>
        <TextField sx={{ width: '100%' }} type={passwordType} label="Current Password" name="oldPassword" value={oldPassword} onChange={handlePasswordChange} />
        <br />
        <TextField sx={{ width: '100%' }} type={passwordType} label="New Password" name="newPassword" value={newPassword} onChange={handlePasswordChange} />
        <Button variant='contained' type="button" onClick={togglePasswordVisibility} sx={{ width: '100%' }}>Toggle Password Visibility</Button>
        {passwordError && <p>{passwordError}</p>}
      </div>
      <div>
        <Button variant='contained' onClick={cancelPasswordEdit} sx={{ width: '100%' }}>Cancel</Button>
        <Button variant='contained' onClick={updatePassword} sx={{ width: '100%' }}>Save Password</Button>
      </div>
    </div>
  );
}

ProfilePasswordEdit.propTypes = {
  passwordType: PropTypes.string.isRequired,
  oldPassword: PropTypes.string.isRequired,
  newPassword: PropTypes.string.isRequired,
  passwordError: PropTypes.string.isRequired,
  handlePasswordChange: PropTypes.func.isRequired,
  togglePasswordVisibility: PropTypes.func.isRequired,
  cancelPasswordEdit: PropTypes.func.isRequired,
  updatePassword: PropTypes.func.isRequired,
};

export default ProfilePasswordEdit;
