// Express app file

// import fs
const fs = require('fs');
// import formidable
const formidable = require('formidable');

// (1) import express
// backend ==> require
const express = require('express');

// (2) import and enable cors
// (cross-origin resource sharing)
const cors = require('cors');

// (3) create an instanece of our express app
const webapp = express();

// (4) enable cors
webapp.use(cors());

// (6) configure express to parse bodies
webapp.use(express.urlencoded({ extended: true }));
webapp.use(express.json()); // Add this line to parse JSON request bodies

// (7) import the db interactions module
const dbLib = require('../database/mongodb');

// import S3 operations
const s3 = require('../s3/s3Operations');

// (8) declare a db reference variable
let MongoConnection;
let db;

// Initialize the database connection
const initServerDatabase = async () => {
  MongoConnection = await dbLib.connect();
  db = await dbLib.getDB(MongoConnection);
  // eslint-disable-next-line no-console
  console.log(`Server running database: ${db.databaseName}`);
};

// Close database connection
const closeServerDatabase = async () => {
  await dbLib.closeMongoDBConnection(MongoConnection);
  // eslint-disable-next-line no-console
  console.log('Closing Server database');
};

// Connect to the DB
initServerDatabase();

// Define a function to check if a value has the expected type
const isValidType = (value, expectedType) => {
  switch (expectedType) {
    case 'string':
      // Check for stringified boolean or array
      if (typeof value === 'string' && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
        return false;
      }
      try {
        const parsedValue = JSON.parse(value);
        return !Array.isArray(parsedValue) && typeof parsedValue !== 'object';
      } catch (error) {
        return typeof value === 'string';
      }
    case 'object':
      return typeof value === 'object' && !Array.isArray(value);
    default:
      return false; // Unknown type
  }
};

const validateParameters = (urlParamDefs, bodyParamDefs) => (req, res, next) => {
  const { params, body } = req;
  const urlParams = params;
  const bodyParams = body;

  // Check URL parameters
  for (let i = 0; i < urlParamDefs.length; i += 1) {
    const paramDef = urlParamDefs[i];
    const paramName = paramDef.name;
    const expectedType = paramDef.type;

    if (!isValidType(urlParams[paramName], expectedType) && !paramDef.optional) {
      return res.status(400).json({ message: `Invalid type for URL parameter ${paramName}` });
    }
  }

  // Check body parameters
  for (let i = 0; i < bodyParamDefs.length; i += 1) {
    const paramDef = bodyParamDefs[i];
    const paramName = paramDef.name;
    const expectedType = paramDef.type;

    if (!isValidType(bodyParams[paramName], expectedType) && !paramDef.optional) {
      return res.status(400).json({ message: `Invalid type for body parameter ${paramName}` });
    }
  }

  // If all validations pass, continue to the next middleware or route handler
  return next();
};

// Root endpoint / route
webapp.get('/', (req, resp) => {
  resp.json({ message: 'Welcome to our backend!!!' });
});

// ***********************************REGISTER******************************************************
// used
// User registration
webapp.post('/register', validateParameters(
  [],
  [
    { name: 'username', type: 'string', optional: false },
    { name: 'email', type: 'string', optional: false },
    { name: 'password', type: 'string', optional: false },
  ],
), async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userId = await dbLib.createUser(db, username, email, password);
    res.status(201).json({ message: 'User created', userId });
  } catch (err) {
    res.status(500).json({ message: err.message || err });
  }
});

// ***********************************AUTHENTICATION************************************************
// used
webapp.post('/authenticate', validateParameters(
  [],
  [
    { name: 'usernameOrEmail', type: 'string', optional: false },
    { name: 'password', type: 'string', optional: false },
  ],
), async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    const result = await dbLib.authenticateUser(db, usernameOrEmail, password);
    if (result.status === 200) {
      res.status(200).json(result.userData);
    } else if (result.status === 401) {
      res.status(401).json({ message: 'Invalid Credentials!', loginAttempts: result.loginAttempts });
    } else if (result.status === 498) {
      res.status(401).json({ message: 'Account locked out!', loginAttempts: result.loginAttempts });
    } else if (result.status === 499) {
      res.status(401).json({ message: 'Active Session already exists!', loginAttempts: result.loginAttempts });
    } else {
      res.status(404).json({ message: 'User not found!' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message || err });
  }
});

// used
webapp.post('/reauthenticate', validateParameters(
  [],
  [
    { name: 'usernameOrEmail', type: 'string', optional: false },
    { name: 'password', type: 'string', optional: false },
  ],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const { usernameOrEmail, password } = req.body;
      const result = await dbLib.reauthenticateUser(db, usernameOrEmail, password);
      if (result.status === 200) {
        res.status(200).json(result.userData);
      } else if (result.status === 401) {
        res.status(401).json({ message: 'Invalid Credentials!', loginAttempts: result.loginAttempts });
      } else if (result.status === 498) {
        res.status(401).json({ message: 'Account locked out!', loginAttempts: result.loginAttempts });
      } else {
        res.status(404).json({ message: 'User not found!' });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
webapp.get('/isTokenExpiration1Minute', async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    const isExpirationSoon = dbLib.isTokenExpiration1Minute(req.headers.authorization);
    res.status(200).json(isExpirationSoon);
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// **************************************USERS******************************************************

// used
// Check if username or email are already taken
webapp.get('/users/usernameOrEmailTaken/:username/:email/:currentUserId', validateParameters(
  [
    { name: 'username', type: 'string', optional: false },
    { name: 'email', type: 'string', optional: false },
    { name: 'currentUserId', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (req.params.currentUserId === 'empty' || await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const { username, email, currentUserId } = req.params;
      const usersInDatabase = await dbLib.readAllIdsUsernamesEmails(db);
      const usernameInDB = usersInDatabase.some(
        (item) => item.username.toLowerCase() === username.toLowerCase()
          && (currentUserId === 'empty' || item.id.toString() !== currentUserId.toString()),
      );
      const emailInDB = usersInDatabase.some(
        (item) => item.email.toLowerCase() === email.toLowerCase()
          && (currentUserId === 'empty' || item.id.toString() !== currentUserId.toString()),
      );
      res.status(200).json({ usernameInDB, emailInDB });
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// get user s3 image url
webapp.get('/user/:id/profileimage', validateParameters(
  [
    { name: 'id', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const userId = req.params.id;
      const profileImage = await dbLib.readProfileImageByUserId(db, userId);
      if (profileImage !== null && profileImage !== undefined) {
        res.status(200).json(profileImage);
      } else {
        res.status(404).json({ message: 'Profile Image not found' });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Get all user IDs and usernames
webapp.get('/user-ids-usernames', async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const userIDsUsernames = await dbLib.readAllIdsUsernames(db);
      res.status(200).json(userIDsUsernames);
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Get username and email by ID
webapp.get('/users/:id/username-email', validateParameters(
  [
    { name: 'id', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const userId = req.params.id;
      const userData = await dbLib.readUsernameAndEmailByUserId(db, userId);
      if (userData) {
        res.status(200).json(userData);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Get user ID, username, and profile picture by ID
webapp.get('/user/:id', validateParameters(
  [
    { name: 'id', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const userId = req.params.id;
      const userData = await dbLib.readIdUsernameAndProfilePictureByUserId(db, userId);
      if (userData) {
        res.status(200).json(userData);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Update a user
webapp.put('/user/:id', validateParameters(
  [
    { name: 'id', type: 'string', optional: false },
  ],
  [
    { name: 'id', type: 'string', optional: false },
    { name: 'username', type: 'string', optional: true },
    { name: 'email', type: 'string', optional: true },
    { name: 'profileImage', type: 'string', optional: true },
  ],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const updatedUser = req.body;
      const result = await dbLib.updateUser(db, updatedUser);
      if (result.matchedCount === 0) {
        res.status(404).json({ message: 'User not found' });
      } else {
        res.status(200).json({ message: 'User updated' });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Update a user's password
webapp.put('/user/:id/password', validateParameters(
  [
    { name: 'id', type: 'string', optional: false },
  ],
  [
    { name: 'oldPassword', type: 'string', optional: false },
    { name: 'newPassword', type: 'string', optional: false },
  ],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const userId = req.params.id;
      const { oldPassword, newPassword } = req.body;
      const result = await dbLib.updatePasswordByUserId(db, userId, oldPassword, newPassword);
      if (result === 200) {
        res.status(200).json({ message: 'Password Updated!' });
      } else if (result === 401) {
        res.status(401).json({ message: 'Incorrect Current Password!' });
      } else {
        res.status(404).json({ message: 'User not found!' });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// update user image with s3 generated image link
webapp.put('/user/:id/profileimage', validateParameters(
  [
    { name: 'id', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  const contentType = req.headers['content-type'];

  if (!contentType || !contentType.includes('multipart/form-data')) {
    res.status(400).json({ message: 'Invalid Content-Type.' });
    return;
  }

  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const userId = req.params.id;
      const form = formidable({});
      form.parse(req, (err, fields, files) => {
        if (err) {
          res.status(404).json({ message: err.message || err });
        }
        // create a buffer to cache uploaded file
        let cacheBuffer = Buffer.alloc(0);

        // create a stream from the virtual path of the uploaded file
        const fStream = fs.createReadStream(files.File_0.path);

        fStream.on('data', (chunk) => {
          // fill the buffer with data from the uploaded file
          cacheBuffer = Buffer.concat([cacheBuffer, chunk]);
        });

        fStream.on('end', async () => {
          // send buffer to AWS - The url of the object is returned

          const s3URL = await s3.uploadFile(cacheBuffer, `${new Date().toISOString()}_${files.File_0.name}`);

          const result = await dbLib
            .updateUser(db, { id: userId, profileImage: decodeURIComponent(s3URL) });
          if (result.matchedCount === 0) {
            res.status(404).json({ message: 'User not found' });
          } else {
            if (fields.currentProfileImage) {
              s3.deleteFile(decodeURIComponent(fields.currentProfileImage));
            }
            res.status(200).json(s3URL);
          }
        });
      });
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// delete user s3 image
webapp.delete('/user/:id/profileimage', validateParameters(
  [
    { name: 'id', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const userId = req.params.id;
      const profileImage = await dbLib.readProfileImageByUserId(db, userId);
      if (profileImage !== null && profileImage !== undefined && profileImage !== '') {
        if (profileImage.split('amazonaws.com/')[1] !== 'defaultProfilePicture.jpg') {
          s3.deleteFile(profileImage.split('amazonaws.com/')[1]);
          res.status(200).json({ message: 'Profile Image deleted' });
        } else {
          res.status(200).json({ message: 'No Profile Image to delete' });
        }
      } else {
        res.status(404).json({ message: 'Profile Image not found' });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Delete a user
webapp.delete('/user/:id', validateParameters(
  [
    { name: 'id', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const userId = req.params.id;
      const postIds = await dbLib.readPostIdsByUserId(db, userId);
      await Promise.all(postIds.map(async (postId) => {
        const mediaUrl = await dbLib.readPostMediaUrlByPostId(db, postId);
        if (mediaUrl !== null && mediaUrl !== undefined && mediaUrl !== '') {
          s3.deleteFile(decodeURIComponent(mediaUrl).split('amazonaws.com/')[1]);
        }
      }));
      await dbLib.deleteAllPostsByUserId(db, userId);
      await dbLib.thisUserIdUnfollowAllUsers(db, userId);
      await dbLib.allUsersUnfollowThisUserId(db, userId);
      await dbLib.removeUserFromAllPostLikes(db, userId);
      await dbLib.removeUserFromAllPostHiddenBy(db, userId);
      const profileImage = await dbLib.readProfileImageByUserId(db, userId);
      if (profileImage !== null && profileImage !== undefined && profileImage !== '') {
        if (profileImage.split('amazonaws.com/')[1] !== 'defaultProfilePicture.jpg') {
          s3.deleteFile(profileImage.split('amazonaws.com/')[1]);
        }
      }
      const result = await dbLib.deleteUserById(db, userId);
      if (result.deletedCount === 0) {
        res.status(404).json({ message: 'User not found' });
      } else {
        res.status(200).json({ message: 'User deleted' });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Get hidden post IDs by user ID
webapp.get('/users/:userId/hidden-posts', validateParameters(
  [
    { name: 'userId', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const { userId } = req.params;
      const postIds = await dbLib.readUserHiddenPostIds(db, userId);
      res.status(200).json(postIds);
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Post is hidden by a user
webapp.put('/users/:userId/hide-post/:postId', validateParameters(
  [
    { name: 'userId', type: 'string', optional: false },
    { name: 'postId', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const { postId, userId } = req.params;
      const result = await dbLib.appendPostToUserHiddenPostIds(db, userId, postId);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Post is unhidden by a user
webapp.put('/users/:userId/unhide-post/:postId', validateParameters(
  [
    { name: 'userId', type: 'string', optional: false },
    { name: 'postId', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const { postId, userId } = req.params;
      const result = await dbLib.removePostFromUserHiddenPostIds(db, userId, postId);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// *************************************FOLLOW******************************************************
// Get all users with IDs, usernames, and profile images except the given user
// used
webapp.get('/users/exclude/:id', validateParameters(
  [
    { name: 'id', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const userId = req.params.id;
      const users = await dbLib.readAllIdsUsernamesImagesNotThisUserId(db, userId);
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Get users that specific user follows
webapp.get('/users/follows/:id', validateParameters(
  [
    { name: 'id', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const userId = req.params.id;
      const follows = await dbLib.readWhoUserIdFollows(db, userId);
      res.status(200).json(follows);
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Get users that follow specific user
webapp.get('/users/followers/:id', validateParameters(
  [
    { name: 'id', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const userId = req.params.id;
      const follows = await dbLib.readWhoFollowsUserId(db, userId);
      res.status(200).json(follows);
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Unfollow a user
webapp.put('/unfollow/:userId/:userIdToUnfollow', validateParameters(
  [
    { name: 'userId', type: 'string', optional: false },
    { name: 'userIdToUnfollow', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const { userId, userIdToUnfollow } = req.params;
      await dbLib.unfollowUser(db, userId, userIdToUnfollow);
      res.status(200).json({ message: 'User unfollowed' });
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Follow a user
webapp.put('/follow/:userId/:userIdToFollow', validateParameters(
  [
    { name: 'userId', type: 'string', optional: false },
    { name: 'userIdToFollow', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const { userId, userIdToFollow } = req.params;
      await dbLib.followUser(db, userId, userIdToFollow);
      res.status(200).json({ message: 'User followed' });
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// *************************************COMMENTS****************************************************
// used
// Create a new comment
webapp.post('/comments', validateParameters(
  [],
  [
    { name: 'userId', type: 'string', optional: false },
    { name: 'postId', type: 'string', optional: false },
    { name: 'parentCommentId', type: 'string', optional: false },
    { name: 'comment', type: 'object', optional: false },
  ],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const {
        userId, postId, parentCommentId, comment,
      } = req.body;
      const insertedId = await dbLib
        .createComment(db, userId, postId, parentCommentId, comment);
      res.status(201).json(insertedId);
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Get a comment by ID
webapp.get('/comments/:id', validateParameters(
  [
    { name: 'id', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const commentId = req.params.id;
      const comment = await dbLib.readCommentById(db, commentId);
      if (comment) {
        res.status(200).json(comment);
      } else {
        res.status(404).json({ message: 'Comment not found' });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Update a comment
webapp.put('/comments/:id', validateParameters(
  [
    { name: 'id', type: 'string', optional: false },
  ],
  [
    { name: 'id', type: 'string', optional: false },
    { name: 'text', type: 'string', optional: false },
  ],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const updatedComment = req.body;
      const result = await dbLib.updateComment(db, updatedComment);
      if (!result.value) {
        res.status(404).json({ message: 'Comment not found' });
      } else {
        const { _id, ...rest } = result.value;
        res.status(200).json({ id: _id, ...rest });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Delete a comment and its descendants by ID and using the post ID
webapp.delete('/post/:postId/comments/:commentId/all', validateParameters(
  [
    { name: 'postId', type: 'string', optional: false },
    { name: 'commentId', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const { commentId, postId } = req.params;
      const result = await dbLib.deleteCommentByIdWithPostId(db, commentId, postId);
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({ message: 'Comment not found' });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Get all comment IDs by post ID and comment ID
webapp.get('/posts/:postId/comments/:commentId/sorted', validateParameters(
  [
    { name: 'postId', type: 'string', optional: false },
    { name: 'commentId', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const { commentId, postId } = req.params;
      const subCommentIds = await
      dbLib.readAllCommentIdsByPostIdParentCommentId(db, postId, commentId);
      res.status(200).json(subCommentIds);
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// ****************************************POSTS****************************************************
// used
// Create a new post
webapp.post('/posts', async (req, res) => {
  const contentType = req.headers['content-type'];

  if (!contentType || !contentType.includes('multipart/form-data')) {
    res.status(400).json({ message: 'Invalid Content-Type.' });
    return;
  }

  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const form = formidable({});
      form.parse(req, async (err, fields, files) => {
        const { userId } = fields;
        const post = JSON.parse(fields.post);
        if (err) {
          res.status(404).json({ message: err.message || err });
        }
        if (files && files.File_0) {
          let cacheBuffer = Buffer.alloc(0);
          const fStream = fs.createReadStream(files.File_0.path);
          fStream.on('data', (chunk) => {
            cacheBuffer = Buffer.concat([cacheBuffer, chunk]);
          });
          fStream.on('end', async () => {
            const s3URL = await s3.uploadFile(cacheBuffer, `${new Date().toISOString()}_${files.File_0.name}`);
            const insertedId = await dbLib
              .createPost(db, userId, { ...post, mediaUrl: decodeURIComponent(s3URL) });
            res.status(201).json(insertedId);
          });
        } else {
          const insertedId = await dbLib
            .createPost(db, userId, { ...post, mediaUrl: '' });
          res.status(201).json(insertedId);
        }
      });
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Get post IDs by user ID
webapp.get('/posts/user/:userId', validateParameters(
  [
    { name: 'userId', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const { userId } = req.params;
      const postIds = await dbLib.readPostIdsByUserId(db, userId);
      res.status(200).json(postIds);
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Get activity feed post IDs for a user
webapp.get('/posts/activity-feed/:userId', validateParameters(
  [
    { name: 'userId', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const { userId } = req.params;
      const postIds = await dbLib.readActivityFeedPostIds(db, userId);
      res.status(200).json(postIds);
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Get post by ID
webapp.get('/posts/:postId', validateParameters(
  [
    { name: 'postId', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const { postId } = req.params;
      const post = await dbLib.readPostById(db, postId);
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({ message: 'Post not found' });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Get post media url by post ID
webapp.get('/posts/:postId/mediaUrl', validateParameters(
  [
    { name: 'postId', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const { postId } = req.params;
      const mediaUrl = await dbLib.readPostMediaUrlByPostId(db, postId);
      if (mediaUrl !== null && mediaUrl !== undefined) {
        res.status(200).json(mediaUrl);
      } else {
        res.status(404).json({ message: 'Post not found' });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Get post likes by post ID
webapp.get('/posts/:postId/likes', validateParameters(
  [
    { name: 'postId', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const { postId } = req.params;
      const likes = await dbLib.readPostLikesByPostId(db, postId);
      res.status(200).json(likes);
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Update a post
webapp.put('/posts/:postId', validateParameters(
  [
    { name: 'postId', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  const contentType = req.headers['content-type'];

  if (!contentType || !contentType.includes('multipart/form-data')) {
    res.status(400).json({ message: 'Invalid Content-Type.' });
    return;
  }

  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const form = formidable({});
      form.parse(req, async (err, fields, files) => {
        const updatedPost = JSON.parse(fields.post);
        if (err) {
          res.status(404).json({ message: err.message || err });
        }
        if (files && files.File_0) {
          let cacheBuffer = Buffer.alloc(0);
          const fStream = fs.createReadStream(files.File_0.path);
          fStream.on('data', (chunk) => {
            cacheBuffer = Buffer.concat([cacheBuffer, chunk]);
          });
          fStream.on('end', async () => {
            const s3URL = await s3.uploadFile(cacheBuffer, `${new Date().toISOString()}_${files.File_0.name}`);
            const result = await dbLib
              .updatePost(db, { ...updatedPost, mediaUrl: decodeURIComponent(s3URL) });
            if (!result.value) {
              res.status(404).json({ message: 'Post not found' });
            } else {
              if (updatedPost.mediaUrl !== '') {
                s3.deleteFile(decodeURIComponent(updatedPost.mediaUrl).split('amazonaws.com/')[1]);
              }
              const { _id, ...rest } = result.value;
              res.status(200).json({ id: _id, ...rest });
            }
          });
        } else if (fields.removeMedia) {
          const result = await dbLib
            .updatePost(db, { ...updatedPost, mediaUrl: '' });
          if (!result.value) {
            res.status(404).json({ message: 'Post not found' });
          } else {
            if (updatedPost.mediaUrl !== '') {
              s3.deleteFile(decodeURIComponent(updatedPost.mediaUrl).split('amazonaws.com/')[1]);
            }
            const { _id, ...rest } = result.value;
            res.status(200).json({ id: _id, ...rest });
          }
        } else {
          const result = await dbLib.updatePost(db, updatedPost);
          if (!result.value) {
            res.status(404).json({ message: 'Post not found' });
          } else {
            const { _id, ...rest } = result.value;
            res.status(200).json({ id: _id, ...rest });
          }
        }
      });
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Delete a post by ID
webapp.delete('/user/:userId/posts/:postId', validateParameters(
  [
    { name: 'userId', type: 'string', optional: false },
    { name: 'postId', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const { postId, userId } = req.params;
      const mediaUrl = await dbLib.readPostMediaUrlByPostId(db, postId);
      if (mediaUrl !== null && mediaUrl !== undefined && mediaUrl !== '') {
        s3.deleteFile(decodeURIComponent(mediaUrl).split('amazonaws.com/')[1]);
      }
      const result = await dbLib.deletePostByIdWithUserId(db, postId, userId);
      if (result.deletedCount === 0) {
        res.status(404).json({ message: 'Post not found' });
      } else {
        res.status(200).json({ message: 'Post deleted' });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Post is liked by a user
webapp.put('/posts/:postId/likedby/:userId', validateParameters(
  [
    { name: 'postId', type: 'string', optional: false },
    { name: 'userId', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const { postId, userId } = req.params;
      const result = await dbLib.appendUserToPostLikes(db, postId, userId);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// used
// Post is unliked by a user
webapp.put('/posts/:postId/unlikedby/:userId', validateParameters(
  [
    { name: 'postId', type: 'string', optional: false },
    { name: 'userId', type: 'string', optional: false },
  ],
  [],
), async (req, res) => {
  if (await dbLib.verifyUser(db, req.headers.authorization)) {
    try {
      const { postId, userId } = req.params;
      const result = await dbLib.removeUserFromPostLikes(db, postId, userId);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: err.message || err });
    }
  } else {
    res.status(401).json({ message: 'Failed Authentication' });
  }
});

// Catch-all endpoint
webapp.use((req, resp) => {
  resp.status(404).json({ message: 'Invalid endpoint' });
});

module.exports = { webapp, closeServerDatabase };
