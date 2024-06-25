import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  readAllIdsUsernamesImagesNotThisUserId, readWhoUserIdFollows, unfollowUser, followUser,
} from '../../api/follow';
import { readIdUsernameAndProfilePictureByUserId } from '../../api/users';
import FollowView from './FollowView';
import './Follow.css';

function Follow(props) {
  const {
    loggedInUserId,
    ownerUser,
    setAlert,
  } = props;
  const [userList, setUserList] = useState([]);
  const [followingList, setFollowingList] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      if (ownerUser === null) {
        const userData = await readAllIdsUsernamesImagesNotThisUserId(loggedInUserId);
        setUserList(userData.data);
      } else if (ownerUser !== null) {
        const userData = await readIdUsernameAndProfilePictureByUserId(ownerUser.id);
        setUserList([userData.data]);
      }

      const followerData = await readWhoUserIdFollows(loggedInUserId);
      setFollowingList(followerData.data);
    } catch (err) {
      setAlert({ severity: 'error', message: `Error fetching data: ${err.message ? err.message : err.toString()}` });
    }
  }, [loggedInUserId, ownerUser, setAlert]);

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(() => {
      fetchData();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchData]);

  async function unfollow(e) {
    try {
      const userIdToUnfollow = e.target.id;
      await unfollowUser(loggedInUserId, userIdToUnfollow);
      const following = followingList
        .filter((followingId) => followingId !== userIdToUnfollow);
      setFollowingList(following);
    } catch (err) {
      setAlert({ severity: 'error', message: `Error updating who you follow: ${err.message ? err.message : err.toString()}` });
    }
  }

  async function follow(e) {
    try {
      const userIdToFollow = e.target.id;
      await followUser(loggedInUserId, userIdToFollow);
      const following = [...followingList, userIdToFollow];
      setFollowingList(following);
    } catch (err) {
      setAlert({ severity: 'error', message: `Error updating who you follow: ${err.message ? err.message : err.toString()}` });
    }
  }

  return (
    <div className='followDiv'>
      {ownerUser === null && <h1>Find & Follow</h1>}
      {ownerUser === null && <h3>Pennitter Users</h3>}
      <FollowView userList={userList} followingList={followingList}
        unfollow={unfollow} follow={follow}
      />
    </div>
  );
}

Follow.propTypes = {
  loggedInUserId: PropTypes.string.isRequired,
  ownerUser: PropTypes.object,
  setAlert: PropTypes.func.isRequired,
};

export default Follow;
