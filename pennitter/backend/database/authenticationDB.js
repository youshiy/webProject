// import JWT
const jwt = require('jsonwebtoken');

// import the env variables
require('dotenv').config();

const { ObjectId } = require('mongodb');
// import DB function
const { isUserLocked, handleSuccessfulLogin, handleFailedLogin } = require('./accountlockoutDB');

// used
async function createOrUpdateSessionInDB(db, userId, jwtToken) {
  try {
    const update = await db.collection('Sessions')
      .findOneAndUpdate(
        { userId: ObjectId(userId) },
        { $set: { jwtToken, lastPing: Date.now() } },
        { returnDocument: 'after' },
      );

    if (!update.value) {
      const session = {
        userId: ObjectId(userId),
        jwtToken,
        lastPing: Date.now(),
      };
      await db.collection('Sessions').insertOne(session);
    }
  } catch (err) {
    throw err.message;
  }
}

// used
async function authentication(db, usernameOrEmail, password, reauthenticate) {
  try {
    const user = await db.collection('Users').findOne({
      $or: [
        { username: usernameOrEmail },
        { email: usernameOrEmail },
      ],
    });
    if (user) {
      const userLocked = isUserLocked(user);
      if (userLocked) {
        return { status: 498, loginAttempts: 3 };
      }
      if (user.password === password) {
        const { _id, username } = user;

        if (!reauthenticate) {
          const session = await db.collection('Sessions').findOne({ userId: _id });
          if (session) {
            // Check if last session ping happened more than 15 seconds ago
            const buffer15secs = session.lastPing + 15000 < Date.now();
            if (!buffer15secs) {
              return { status: 499, loginAttempts: -1 };
            }
          }
        }

        const token = jwt.sign({ id: _id.toString() }, process.env.JWT_SECRET, { expiresIn: '720s' });
        // console.log('token', token);
        await handleSuccessfulLogin(db, user);
        await createOrUpdateSessionInDB(db, _id.toString(), token);
        return { status: 200, userData: { token, id: _id, username } };
      }
      const loginAttempts = await handleFailedLogin(db, user);
      return { status: 401, loginAttempts };
    }
    return { status: 404 };
  } catch (err) {
    throw err.message;
  }
}

// used
async function authenticateUser(db, usernameOrEmail, password) {
  try {
    return await authentication(db, usernameOrEmail, password, false);
  } catch (err) {
    throw err.message;
  }
}

// used
async function reauthenticateUser(db, usernameOrEmail, password) {
  try {
    return await authentication(db, usernameOrEmail, password, true);
  } catch (err) {
    throw err.message;
  }
}

// used
async function updateSessionPing(db, userId) {
  try {
    await db.collection('Sessions')
      .findOneAndUpdate(
        { userId: ObjectId(userId) },
        { $set: { lastPing: Date.now() } },
        { returnDocument: 'after' },
      );
  } catch (err) {
    throw err.message;
  }
}

// used
async function verifyUser(db, token) {
  try {
    // decoded contains the paylod of the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('payload', decoded);
    // check that the payload contains a user with an active session
    const session = await db.collection('Sessions').findOne({ userId: ObjectId(decoded.id) });
    // console.log(session);
    if (!session) {
      // session is undefined
      // console.log('session false');
      return false;
    }
    // extra layer of security - Check if last session ping happened less than 15 seconds ago
    const recentPing = session.lastPing + 15000 > Date.now();
    if (!recentPing) {
      return false;
    }

    // extra layer of security - validate that the valid token matches the DB Session token
    const sessionValid = session.jwtToken === token;
    // console.log(sessionValid);
    if (!sessionValid) {
      // console.log('sessionValid false');
      return false;
    }

    // console.log('session is validated');
    updateSessionPing(db, decoded.id);
    return true;
  } catch (err) {
    // invalid token
    // console.log('error', err.message);
    return false;
  }
}

// used
function isTokenExpiration1Minute(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // Get the current time in seconds
  const currentTime = Math.floor(Date.now() / 1000);
  // Check if expiration time is less than 2 minutes from the current time
  const isExpirationSoon = decoded.exp < currentTime + 120;
  return isExpirationSoon;
}

module.exports = {
  authenticateUser,
  reauthenticateUser,
  verifyUser,
  isTokenExpiration1Minute,
};
