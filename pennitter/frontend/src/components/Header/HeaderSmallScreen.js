import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import './HeaderSmallScreen.css';

function HeaderSmallScreen(props) {
  const {
    anchorElNav, handleOpenNavMenu, handleCloseNavMenu, SmallScreenButtons,
  } = props;
  return (
    <>
      <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="navbar-hamburger-menu"
          aria-haspopup="true"
          onClick={handleOpenNavMenu}
          color="inherit"
        >
          <MenuIcon />
        </IconButton>
        <Menu
          id="navbar-hamburger-menu"
          anchorEl={anchorElNav}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          open={Boolean(anchorElNav)}
          onClose={handleCloseNavMenu}
          sx={{
            display: { xs: 'block', md: 'none' },
          }}
        >
          {SmallScreenButtons}
        </Menu>
      </Box>
      <Typography
        variant="h5"
        noWrap
        component="a"
        sx={{
          mr: 2,
          display: { xs: 'flex', md: 'none' },
          flexGrow: 1,
          fontFamily: 'monospace',
          fontWeight: 700,
          letterSpacing: '.3rem',
          color: 'inherit',
          textDecoration: 'none',
        }}
      >
        PENNITTER
      </Typography>
    </>
  );
}

HeaderSmallScreen.propTypes = {
  anchorElNav: PropTypes.object,
  handleOpenNavMenu: PropTypes.func.isRequired,
  handleCloseNavMenu: PropTypes.func.isRequired,
  SmallScreenButtons: PropTypes.element.isRequired,
};

export default HeaderSmallScreen;
