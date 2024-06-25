// Profile page
import React from 'react';
import PropTypes from 'prop-types';
import ProfileImage from './ProfileImage';
import ProfileUserInfo from './ProfileUserInfo';
import ProfilePassword from './ProfilePassword';
import ProfileDeleteAccount from './ProfileDeleteAccount';
import './Profile.css';

function Profile(props) {
  const {
    loggedInUserId, setLoggedInUser, setAlert,
  } = props;

  return (
    <div className='profileSettingsDiv'>
      <h1>Profile Settings</h1>
      <ProfileImage loggedInUserId={loggedInUserId} setAlert={setAlert} />
      <ProfileUserInfo loggedInUserId={loggedInUserId} setAlert={setAlert}
        setLoggedInUser={setLoggedInUser}
      />
      <ProfilePassword loggedInUserId={loggedInUserId} setAlert={setAlert} />
      <ProfileDeleteAccount loggedInUserId={loggedInUserId} setAlert={setAlert}
        setLoggedInUser={setLoggedInUser}
      />
    </div>
  );
}

Profile.propTypes = {
  loggedInUserId: PropTypes.string.isRequired,
  setLoggedInUser: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired,
};

export default Profile;
