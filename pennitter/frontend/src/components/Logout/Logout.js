import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function Logout(props) {
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  function handleLogout() {
    sessionStorage.removeItem('app-token');
    props.setLoggedInUser(null, '');
  }

  return (
    <>
      <Button onClick={handleOpenDialog} variant="contained" color="error" sx={{ width: '100%' }}>Logout</Button>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {'Are you sure you want to logout?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogout}>Confirm</Button>
          <Button onClick={handleCloseDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

Logout.propTypes = {
  setLoggedInUser: PropTypes.func.isRequired,
};

export default Logout;
