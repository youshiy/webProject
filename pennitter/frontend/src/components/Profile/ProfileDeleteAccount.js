// Profile page
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { deleteUserById } from '../../api/users';

function ProfileDeleteAccount(props) {
  const {
    loggedInUserId, setAlert, setLoggedInUser,
  } = props;
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  async function deleteProfile() {
    try {
      await deleteUserById(loggedInUserId);

      sessionStorage.removeItem('app-token');
      setLoggedInUser(null, '');
      setAlert({ severity: 'success', message: 'Your Profile has been deleted :(' });
    } catch (err) {
      setAlert({ severity: 'error', message: `Error deleting Profile: ${err.message ? err.message : err.toString()}` });
    }
  }

  return (
    <>
      <div>
        <br /><br /><br /><br />
        <div>
          <Button variant='contained' color='error' onClick={handleOpenDialog} sx={{ width: '100%' }}>Delete Profile</Button>
        </div>
      </div>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Delete Profile</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {'Are you sure you want to delete your profile? All of your posts and comments will also be deleted! This action cannot be reversed!'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={deleteProfile}>Confirm</Button>
          <Button onClick={handleCloseDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <br /><br /><br /><br />
    </>
  );
}

ProfileDeleteAccount.propTypes = {
  loggedInUserId: PropTypes.string.isRequired,
  setAlert: PropTypes.func.isRequired,
  setLoggedInUser: PropTypes.func.isRequired,
};

export default ProfileDeleteAccount;
