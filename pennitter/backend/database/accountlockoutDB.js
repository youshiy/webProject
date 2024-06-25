// import DB function
const { updateUser } = require('./usersDB');

const MAX_FAILED_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION = 60000; // 1 minute in milliseconds

function isUserLocked(_user) {
  const user = _user;
  if (user.lockoutUntil !== null && user.lockoutUntil > Date.now()) {
    return true;
  }
  return false;
}

async function handleSuccessfulLogin(db, _user) {
  const user = _user;
  user.loginAttempts = 0;
  user.lockoutUntil = null;
  const { _id, ...rest } = user;
  await updateUser(db, { id: _id, ...rest });
}

async function handleFailedLogin(db, _user) {
  const user = _user;
  user.loginAttempts += 1;
  const { loginAttempts } = user;
  if (user.loginAttempts === MAX_FAILED_LOGIN_ATTEMPTS) {
    user.lockoutUntil = Date.now() + LOCKOUT_DURATION;
    user.loginAttempts = 0;
  }
  const { _id, ...rest } = user;
  await updateUser(db, { id: _id, ...rest });
  return loginAttempts;
}

module.exports = {
  isUserLocked,
  handleSuccessfulLogin,
  handleFailedLogin,
};
