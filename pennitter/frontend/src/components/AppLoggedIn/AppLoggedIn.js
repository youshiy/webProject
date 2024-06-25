import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  BrowserRouter as Router, Routes, Route, Navigate,
} from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { readAllIdsUsernames } from '../../api/users';
import { isTokenExpiration1Minute } from '../../api/authentication';
import Login from '../Login/Login';
import HeaderLoggedIn from '../Header/HeaderLoggedIn';
import Profile from '../Profile/Profile';
import ActivityFeedScreen from '../ActivityFeed/ActivityFeedScreen';
import ProfileFeedScreen from '../ActivityFeed/ProfileFeedScreen';
import Follow from '../Follow/Follow';
import Followers from '../Followers/Followers';
import CountdownTimer from '../CountdownTimer/CountdownTimer';

function AppLoggedIn(props) {
  const {
    loggedInUser,
    setLoggedInUser,
    setAlert,
  } = props;

  const [usernameList, setUsernameList] = useState(null);
  const [reAuthenticate, setReauthenticate] = useState(false);

  const isExpirationSoon = useCallback(async () => {
    try {
      if ((await isTokenExpiration1Minute()).data) {
        setReauthenticate(true);
      }
    } catch (err) {
      setAlert({ severity: 'error', message: `Error fetching JWT expiration: ${err.message ? err.message : err.toString()}` });
    }
  }, [setAlert]);

  useEffect(() => {
    async function fetchAllUsernames() {
      try {
        const allIdsUsernames = await readAllIdsUsernames();
        setUsernameList(allIdsUsernames.data);
      } catch (err) {
        setAlert({ severity: 'error', message: `Error fetching app user data: ${err.message ? err.message : err.toString()}` });
      }
    }

    fetchAllUsernames();

    const intervalId = setInterval(() => {
      isExpirationSoon();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isExpirationSoon, setAlert]);

  async function ourSetLoggedInUser(id, username) {
    setReauthenticate(false);
    setLoggedInUser(id, username);
  }

  async function LogoutUser() {
    sessionStorage.removeItem('app-token');
    setLoggedInUser(null, '');
  }

  return (
    <>
      <Router>
        <HeaderLoggedIn loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser}
          setAlert={setAlert} />
        <Dialog
        open={reAuthenticate}
      >
        <DialogTitle>Reauthenticate</DialogTitle>
          <DialogContentText>
            {'You have 1 minute to reauthenticate or else you will be logged out'}
            <CountdownTimer initialSeconds={60} timeExpiredCallback={LogoutUser}/>
          </DialogContentText>
        <DialogContent>
          <Login setLoggedInUser={ourSetLoggedInUser} setAlert={setAlert}
            loggedInUser={loggedInUser} />
        </DialogContent>
      </Dialog>
        <Routes>
          <Route path="/activityfeed" element={<ActivityFeedScreen loggedInUserId={loggedInUser.id} setAlert={setAlert} />} />
          <Route path="/follow" element={<Follow loggedInUserId={loggedInUser.id} ownerUser={null} setAlert={setAlert} />} />
          <Route path="/followers" element={<Followers loggedInUserId={loggedInUser.id} setAlert={setAlert} />} />
          {usernameList && usernameList.map((user) => (
            <Route key={user.id} path={`/${user.username}`} element={<ProfileFeedScreen key={user.id} loggedInUserId={loggedInUser.id} setAlert={setAlert} ownerUser={user} />} />
          ))}
          <Route path="/profile" element={<Profile loggedInUserId={loggedInUser.id} setLoggedInUser={setLoggedInUser} setAlert={setAlert} />} />
          {usernameList && <Route path="*" element={<Navigate to="/activityfeed" />} />}
        </Routes>
      </Router>
    </>
  );
}

AppLoggedIn.propTypes = {
  loggedInUser: PropTypes.object.isRequired,
  setLoggedInUser: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired,
};

export default AppLoggedIn;
