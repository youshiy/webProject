// Profile page
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ProfilePasswordDisplay from './ProfilePasswordDisplay';
import ProfilePasswordEdit from './ProfilePasswordEdit';
import { updatePasswordByUserId } from '../../api/users';
import { validateUsernameEmailPassword } from '../../utilities/utilities';

function ProfilePassword(props) {
  const {
    loggedInUserId, setAlert,
  } = props;
  const [oldNewPasswords, setOldNewPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [passwordType, setPasswordType] = useState('password');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  function editPassword() {
    setIsChangingPassword(true);
  }

  function togglePasswordVisibility() {
    setPasswordType((prevType) => (prevType === 'text' ? 'password' : 'text'));
  }

  function handlePasswordChange(e) {
    const { name, value } = e.target;
    setOldNewPasswords((passwordsObject) => ({
      ...passwordsObject,
      [name]: value,
    }));
  }

  function cancelPasswordEdit() {
    setOldNewPasswords({ oldPassword: '', newPassword: '' });
    setPasswordError('');
    setIsChangingPassword(false);
  }

  function isValidPassword() {
    const results = validateUsernameEmailPassword({ password: oldNewPasswords.newPassword });
    if (Object.hasOwn(results, 'passwordRegexPass')) {
      if (!results.passwordRegexPass) {
        setPasswordError(results.passwordErrorMessage);
        return false;
      }
      if (oldNewPasswords.oldPassword === oldNewPasswords.newPassword) {
        setPasswordError('New Password cannot be identical to Current Password.');
        return false;
      }
      setPasswordError('');
      return true;
    }

    setAlert({ severity: 'error', message: 'Error validating Password input!' });
    return false;
  }

  async function updatePassword() {
    try {
      if (!isValidPassword()) {
        return;
      }

      await updatePasswordByUserId(
        loggedInUserId,
        oldNewPasswords.oldPassword,
        oldNewPasswords.newPassword,
      );
      setOldNewPasswords({ oldPassword: '', newPassword: '' });
      setIsChangingPassword(false);
      setAlert({ severity: 'success', message: 'Password Updated!' });
    } catch (err) {
      setAlert({ severity: 'error', message: `Error updating Password: ${err.message ? err.message : err.toString()}` });
    }
  }

  return (
    <>
    {isChangingPassword ? (
      <ProfilePasswordEdit
        passwordType={passwordType} oldPassword={oldNewPasswords.oldPassword}
        newPassword={oldNewPasswords.newPassword} passwordError={passwordError}
        handlePasswordChange={handlePasswordChange}
        togglePasswordVisibility={togglePasswordVisibility}
        cancelPasswordEdit={cancelPasswordEdit} updatePassword={updatePassword}
      />
    ) : (
      <ProfilePasswordDisplay editPassword={editPassword} />
    )}
    </>
  );
}

ProfilePassword.propTypes = {
  loggedInUserId: PropTypes.string.isRequired,
  setAlert: PropTypes.func.isRequired,
};

export default ProfilePassword;
