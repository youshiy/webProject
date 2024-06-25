import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import List from '@mui/material/List';
import { readWhoFollowsUserId } from '../../api/follow';
import FollowersView from './FollowersView';
import './Followers.css';

function Follow(props) {
  const {
    loggedInUserId,
    setAlert,
  } = props;
  const [followerIdsList, setFollowerIdsList] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const followerData = await readWhoFollowsUserId(loggedInUserId);
      setFollowerIdsList(followerData.data);
    } catch (err) {
      setAlert({ severity: 'error', message: `Error fetching your followers: ${err.message ? err.message : err.toString()}` });
    }
  }, [loggedInUserId, setAlert]);

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(() => {
      fetchData();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchData]);

  return (
    <div className='followersDiv'>
      <h1>Followers</h1>
      <h3>Pennitter Users</h3>
      <List>
        {followerIdsList.map((followerId) => (
          <FollowersView key={followerId} followerId={followerId} setAlert={setAlert} />
        ))}
        {!followerIdsList.length && <p>No Pennitter User follows you!</p>}
      </List>
    </div>
  );
}

Follow.propTypes = {
  loggedInUserId: PropTypes.string.isRequired,
  setAlert: PropTypes.func.isRequired,
};

export default Follow;
