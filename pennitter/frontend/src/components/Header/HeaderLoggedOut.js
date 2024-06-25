import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Link,
} from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import HeaderSmallScreen from './HeaderSmallScreen';
import HeaderStandardScreen from './HeaderStandardScreen';

function SmallScreenButtons(props) {
  const { handleCloseNavMenu } = props;
  return (
    <>
    <Button className='smallScreen' onClick={handleCloseNavMenu}>
      <Link to="/login">Login</Link>
    </Button>
    <Button className='smallScreen' onClick={handleCloseNavMenu}>
      <Link to="/registration">Registration</Link>
    </Button>
    </>
  );
}

SmallScreenButtons.propTypes = {
  handleCloseNavMenu: PropTypes.func.isRequired,
};

function StandardScreenButtons() {
  return (
    <>
    <Button className='standardScreen'>
      <Link to="/login">Login</Link>
    </Button>
    <Button className='standardScreen'>
      <Link to="/registration">Registration</Link>
    </Button>
    </>
  );
}

function HeaderLoggedOut() {
  const [anchorElNav, setAnchorElNav] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  let smallWindow = window.innerWidth < 900;
  function handleResize() {
    if (window.innerWidth < 900) {
      if (!smallWindow) {
        smallWindow = true;
      }
    } else if (smallWindow) {
      smallWindow = false;
      handleCloseNavMenu();
    }
  }

  window.addEventListener('resize', handleResize);

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <HeaderSmallScreen anchorElNav={anchorElNav} handleOpenNavMenu={handleOpenNavMenu}
            handleCloseNavMenu={handleCloseNavMenu}
            SmallScreenButtons={
              <SmallScreenButtons handleCloseNavMenu={handleCloseNavMenu} />
            }
          />
          <HeaderStandardScreen
            StandardScreenButtons={
              <StandardScreenButtons />
            }
          />
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default HeaderLoggedOut;
