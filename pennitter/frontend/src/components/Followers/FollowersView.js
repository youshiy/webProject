import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { readIdUsernameAndProfilePictureByUserId } from '../../api/users';
import './FollowersView.css';

function FollowView(props) {
  const {
    followerId,
    setAlert,
  } = props;
  const [follower, setFollower] = useState({});

  const fetchData = useCallback(async () => {
    try {
      const followerData = await readIdUsernameAndProfilePictureByUserId(followerId);
      setFollower(followerData.data);
    } catch (err) {
      setAlert({ severity: 'error', message: `Error fetching your follower: ${err.message ? err.message : err.toString()}` });
    }
  }, [followerId, setAlert]);

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(() => {
      fetchData();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchData]);

  const handleNavigation = (username) => {
    // Reload the app and navigate to the link
    window.location.href = `/${username}`;
  };

  return (
    <div className='followersViewDiv'>
      <ListItem
        disablePadding
        sx={{ height: '50px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: 'white' }}>
              <img className='appUserImg' src={follower.profileImage} alt={`${follower.username}'s profile img`} />
            </Avatar>
          </ListItemAvatar>
          <Link onClick={() => handleNavigation(follower.username)}>
            <ListItemText primary={follower.username} />
          </Link>
        </div>
      </ListItem>
    </div>
  );
}

FollowView.propTypes = {
  followerId: PropTypes.string.isRequired,
  setAlert: PropTypes.func.isRequired,
};

export default FollowView;
