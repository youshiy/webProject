import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import './HeaderStandardScreen.css';

function HeaderStandardScreen(props) {
  const { StandardScreenButtons } = props;
  return (
    <>
      <Typography
        variant="h5"
        noWrap
        component="a"
        sx={{
          mr: 2,
          display: { xs: 'none', md: 'flex' },
          fontFamily: 'monospace',
          fontWeight: 700,
          letterSpacing: '.3rem',
          color: 'inherit',
          textDecoration: 'none',
        }}
      >
        PENNITTER
      </Typography>
      <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }} id="navbar-standard-menu">
        {StandardScreenButtons}
      </Box>
    </>
  );
}

HeaderStandardScreen.propTypes = {
  StandardScreenButtons: PropTypes.element.isRequired,
};

export default HeaderStandardScreen;
