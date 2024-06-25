// Profile page
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ProfileUserInfoDisplay from './ProfileUserInfoDisplay';
import ProfileUserInfoEdit from './ProfileUserInfoEdit';
import { readUsernameAndEmailByUserId, usernameOrEmailTaken, updateUser } from '../../api/users';
import { validateUsernameEmailPassword } from '../../utilities/utilities';

function ProfileUserInfo(props) {
  const {
    loggedInUserId, setAlert, setLoggedInUser,
  } = props;
  const [userInfo, setUserInfo] = useState({ username: '', email: '' });
  const [originalUserInfo, setOriginalUserInfo] = useState({ username: '', email: '' });
  const [isEditingUserInfo, setIsEditingUserInfo] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    async function fetchUserById(id) {
      try {
        const userData = await readUsernameAndEmailByUserId(id);
        const { username, email } = userData.data;
        setUserInfo({ username, email });
        setOriginalUserInfo({ username, email });
      } catch (err) {
        setAlert({ severity: 'error', message: `Error fetching user data: ${err.message ? err.message : err.toString()}` });
      }
    }
    fetchUserById(loggedInUserId);
  }, [loggedInUserId, setAlert]);

  function editUserInfo() {
    setIsEditingUserInfo(true);
  }

  function handleUserInfoChange(e) {
    const { name, value } = e.target;
    setUserInfo((userObject) => ({
      ...userObject,
      [name]: value,
    }));
  }

  function cancelUserInfoEdit() {
    setUserInfo(originalUserInfo);
    setUsernameError('');
    setEmailError('');
    setIsEditingUserInfo(false);
  }

  function userInfoIsChanged() {
    return (userInfo.username !== originalUserInfo.username)
        || (userInfo.email !== originalUserInfo.email);
  }

  async function isValidUserInfo() {
    try {
      const results = validateUsernameEmailPassword(
        {
          username: userInfo.username,
          email: userInfo.email,
        },
      );
      if (Object.hasOwn(results, 'usernameRegexPass') && Object.hasOwn(results, 'emailRegexPass')) {
        if (results.usernameRegexPass) {
          setUsernameError('');
        } else {
          setUsernameError(results.usernameErrorMessage);
        }
        if (results.emailRegexPass) {
          setEmailError('');
        } else {
          setEmailError(results.emailErrorMessage);
        }
        if (results.usernameRegexPass && results.emailRegexPass) {
          const result = await
          usernameOrEmailTaken(userInfo.username, userInfo.email, loggedInUserId);
          const { usernameInDB, emailInDB } = result.data;
          if (usernameInDB || emailInDB) {
            let message = '';
            if (usernameInDB && emailInDB) {
              message = 'Username and Email already in use!';
            } else if (usernameInDB) {
              message = 'Username already in use!';
            } else { // if (emailInDB) {
              message = 'Email already in use!';
            }
            setAlert({ severity: 'error', message });
            return false;
          }
        }

        return results.usernameRegexPass && results.emailRegexPass;
      }

      setAlert({ severity: 'error', message: 'Error validating User Info input!' });
      return false;
    } catch (err) {
      setAlert({ severity: 'error', message: `Error validating User Info input: ${err.message ? err.message : err.toString()}` });
      return false;
    }
  }

  async function updateUserInfo() {
    try {
      if (!(await isValidUserInfo())) {
        return;
      }

      await updateUser({ id: loggedInUserId, username: userInfo.username, email: userInfo.email });
      setOriginalUserInfo((userObj) => (
        { ...userObj, username: userInfo.username, email: userInfo.email }
      ));
      setLoggedInUser(loggedInUserId, userInfo.username);
      setIsEditingUserInfo(false);

      setAlert({ severity: 'success', message: 'User Info Updated!' });
    } catch (err) {
      setAlert({ severity: 'error', message: `Error updating User Info: ${err.message ? err.message : err.toString()}` });
    }
  }

  return (
    <>
      {isEditingUserInfo ? (
        <ProfileUserInfoEdit username={userInfo.username} email={userInfo.email}
          usernameError={usernameError} emailError={emailError}
          handleUserInfoChange={handleUserInfoChange} cancelUserInfoEdit={cancelUserInfoEdit}
          userInfoIsChanged={userInfoIsChanged} updateUserInfo={updateUserInfo}
        />
      ) : (
        <ProfileUserInfoDisplay username={userInfo.username} email={userInfo.email}
          editUserInfo={editUserInfo}
        />
      )}
    </>
  );
}

ProfileUserInfo.propTypes = {
  loggedInUserId: PropTypes.string.isRequired,
  setAlert: PropTypes.func.isRequired,
  setLoggedInUser: PropTypes.func.isRequired,
};

export default ProfileUserInfo;
