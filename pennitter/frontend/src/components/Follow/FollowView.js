import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { Button } from '@mui/material';
import './FollowView.css';

function FollowView(props) {
  const {
    userList,
    followingList,
    unfollow,
    follow,
  } = props;

  const handleNavigation = (username) => {
    // Reload the app and navigate to the link
    window.location.href = `/${username}`;
  };

  return (
    <div className='followViewDiv'>
      <List>
        {userList.map((user) => (
          <ListItem
            key={user.id}
            disablePadding
            sx={{ height: '50px', marginRight: '10px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'white' }}>
                  <img className='appUserImg' src={user.profileImage} alt={`${user.username}'s profile img`} />
                </Avatar>
              </ListItemAvatar>
              <Link onClick={() => handleNavigation(user.username)}>
                <ListItemText primary={user.username} />
              </Link>
            </div>
          </ListItem>
        ))}
        {!userList.length && <p>No Pennitter Users to follow!</p>}
      </List>
      <List>
        {userList.map((user) => (
          <ListItem
            key={user.id}
            disablePadding
            sx={{ height: '50px' }}
          >
            <div>
              {followingList.includes(user.id)
                ? (
                  <Button id={user.id} onClick={unfollow} data-testid={user.id}>
                    Unfollow
                  </Button>
                )
                : (
                  <Button id={user.id} onClick={follow} data-testid={user.id}>
                    Follow
                  </Button>
                )}
            </div>
          </ListItem>
        ))}
      </List>
    </div>
  );
}

FollowView.propTypes = {
  userList: PropTypes.array.isRequired,
  followingList: PropTypes.array.isRequired,
  unfollow: PropTypes.func.isRequired,
  follow: PropTypes.func.isRequired,
};

export default FollowView;
