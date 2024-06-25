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
import HeaderLoggedInUserSection from './HeaderLoggedInUserSection';

function SmallScreenButtons(props) {
  const { handleCloseNavMenu, loggedInUser } = props;
  const handleNavigation = (username) => {
    // Reload the app and navigate to the link
    window.location.href = `/${username}`;
  };
  return (
    <>
    <Button className='smallScreen' onClick={handleCloseNavMenu}>
      <Link to="/activityfeed">Activity Feed</Link>
    </Button>
    <Button className='smallScreen' onClick={handleCloseNavMenu}>
      <Link to="/follow">Find & Follow</Link>
    </Button>
    <Button className='smallScreen' onClick={handleCloseNavMenu}>
      <Link to="/followers">Followers</Link>
    </Button>
    <Button className='smallScreen' onClick={handleCloseNavMenu}>
      <Link onClick={() => handleNavigation(loggedInUser.username)}>My Profile Feed</Link>
    </Button>
    </>
  );
}

SmallScreenButtons.propTypes = {
  handleCloseNavMenu: PropTypes.func.isRequired,
  loggedInUser: PropTypes.object.isRequired,
};

function StandardScreenButtons(props) {
  const { loggedInUser } = props;
  const handleNavigation = (username) => {
    // Reload the app and navigate to the link
    window.location.href = `/${username}`;
  };
  return (
    <>
    <Button className='standardScreen'>
      <Link to="/activityfeed">Activity Feed</Link>
    </Button>
    <Button className='standardScreen'>
      <Link to="/follow">Find & Follow</Link>
    </Button>
    <Button className='standardScreen'>
      <Link to="/followers">Followers</Link>
    </Button>
    <Button className='standardScreen'>
      <Link onClick={() => handleNavigation(loggedInUser.username)}>My Profile Feed</Link>
    </Button>

    </>
  );
}

StandardScreenButtons.propTypes = {
  loggedInUser: PropTypes.object.isRequired,
};

function HeaderLoggedIn(props) {
  const { loggedInUser, setLoggedInUser, setAlert } = props;
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
              <SmallScreenButtons handleCloseNavMenu={handleCloseNavMenu}
                loggedInUser={loggedInUser} />
            }
          />
          <HeaderStandardScreen
            StandardScreenButtons={
              <StandardScreenButtons loggedInUser={loggedInUser} />
            }
          />
          <HeaderLoggedInUserSection loggedInUser={loggedInUser}
            setLoggedInUser={setLoggedInUser} setAlert={setAlert}
          />
        </Toolbar>
      </Container>
    </AppBar>
  );
}

HeaderLoggedIn.propTypes = {
  loggedInUser: PropTypes.object.isRequired,
  setLoggedInUser: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired,
};

export default HeaderLoggedIn;
