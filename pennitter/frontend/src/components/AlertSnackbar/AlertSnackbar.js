import React from 'react';
import PropTypes from 'prop-types';
import Snackbar from '@mui/material/Snackbar';
import { Alert } from '@mui/material';

function AlertSnackbar(props) {
  const {
    alert, open, handleClose,
  } = props;

  return (
    <Snackbar key={alert.key} open={open} autoHideDuration={6000} onClose={handleClose}>
      <Alert onClose={handleClose} severity={alert.severity}>
        {alert.message}
      </Alert>
    </Snackbar>
  );
}

AlertSnackbar.propTypes = {
  alert: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default AlertSnackbar;
