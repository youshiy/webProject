import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Link,
} from 'react-router-dom';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { readProfileImageByUserId } from '../../api/users';
import Logout from '../Logout/Logout';
import './HeaderLoggedInUserSection.css';

function HeaderLoggedInUserSection(props) {
  const { loggedInUser, setLoggedInUser, setAlert } = props;
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [profileImage, setProfileImage] = useState('');

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  useEffect(() => {
    async function fetchProfileImage() {
      try {
        const profileImg = await readProfileImageByUserId(loggedInUser.id);
        setProfileImage(profileImg.data);
      } catch (err) {
        setAlert({ severity: 'error', message: `Error fetching Profile Image: ${err.message ? err.message : err.toString()}` });
      }
    }
    fetchProfileImage();

    const intervalId = setInterval(() => {
      fetchProfileImage();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [loggedInUser.id, setAlert]);

  const handleNavigation = (username) => {
    // Reload the app and navigate to the link
    window.location.href = `/${username}`;
  };

  return (
    <div className='headerUserSectionDiv'>
      <Link onClick={() => handleNavigation(loggedInUser.username)}>
        <Typography>{loggedInUser.username}</Typography>
      </Link>
      <Box sx={{ flexGrow: 0 }}>
        <Tooltip title="Open settings">
          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
            <Avatar sx={{ bgcolor: 'white' }}>
              <img className='appUserImg' src={profileImage} alt="Profile Pic"></img>
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          sx={{ mt: '45px' }}
          id="navbar-user-menu"
          anchorEl={anchorElUser}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
        >
          <MenuItem onClick={handleCloseUserMenu}>
            <Link to="/profile"><Typography>My Profile Settings</Typography></Link>
          </MenuItem>
          <MenuItem onClick={handleCloseUserMenu}>
            <Logout setLoggedInUser={setLoggedInUser} />
          </MenuItem>
        </Menu>
      </Box>
    </div>
  );
}

HeaderLoggedInUserSection.propTypes = {
  loggedInUser: PropTypes.object.isRequired,
  setLoggedInUser: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired,
};

export default HeaderLoggedInUserSection;
