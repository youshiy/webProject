const { ObjectId } = require('mongodb');

const dbCollection = 'Users';

// used
async function createUser(db, username, email, password) {
  try {
    const user = {
      loginAttempts: 0,
      lockoutUntil: null,
      username,
      email,
      password,
      profileImage: 'https://projectmediadocuments.s3.us-east-1.amazonaws.com/defaultProfilePicture.jpg',
      followers: [],
      follows: [],
      postIds: [],
      hiddenPostIds: [],
    };
    const result = await db.collection(dbCollection).insertOne(user);
    return result.insertedId;
  } catch (err) {
    throw err.message;
  }
}

// used
async function readProfileImageByUserId(db, id) {
  try {
    const result = await db.collection(dbCollection)
      .findOne({ _id: ObjectId(id) }, { projection: { _id: 0, profileImage: 1 } });

    return result?.profileImage !== undefined && result?.profileImage !== null
      ? result.profileImage
      : null;
  } catch (err) {
    throw err.message;
  }
}

// used
async function readAllIdsUsernames(db) {
  try {
    const results = await db.collection(dbCollection).find({}, { _id: 1, username: 1 }).toArray();
    // eslint-disable-next-line no-underscore-dangle
    return results.map((user) => ({ id: user._id, username: user.username }));
  } catch (err) {
    throw err.message;
  }
}

// used
async function readAllIdsUsernamesEmails(db) {
  try {
    const results = await db.collection(dbCollection)
      .find({})
      .project({ _id: 1, username: 1, email: 1 })
      .toArray();
    // eslint-disable-next-line no-underscore-dangle
    return results.map((user) => ({ id: user._id, username: user.username, email: user.email }));
  } catch (err) {
    throw err.message;
  }
}

// used
async function readUsernameAndEmailByUserId(db, id) {
  try {
    const user = await db.collection(dbCollection)
      .findOne({ _id: ObjectId(id) }, { projection: { _id: 0, username: 1, email: 1 } });
    return user;
  } catch (err) {
    throw err.message;
  }
}

// used
async function readIdUsernameAndProfilePictureByUserId(db, id) {
  try {
    const user = await db.collection(dbCollection)
      .findOne({ _id: ObjectId(id) }, { projection: { _id: 1, username: 1, profileImage: 1 } });
    if (user) {
      const { _id, ...rest } = user;
      return { id: _id, ...rest };
    }
    return null;
  } catch (err) {
    throw err.message;
  }
}

// used
async function readPostIdsByUserId(db, id) {
  try {
    const result = await db.collection(dbCollection)
      .findOne({ _id: ObjectId(id) }, { projection: { _id: 0, postIds: 1 } });

    return result?.postIds?.reverse() || [];
  } catch (err) {
    throw err.message;
  }
}

// used
async function updateUser(db, updatedUser) {
  try {
    const { id, ...updatedData } = updatedUser;
    const result = await db.collection(dbCollection)
      .updateOne({ _id: ObjectId(id) }, { $set: updatedData });
    return result;
  } catch (err) {
    throw err.message;
  }
}

// used
async function updateUserPostIdsAdd(db, userId, postIdToAdd) {
  try {
    const result = await db.collection(dbCollection).updateOne(
      { _id: ObjectId(userId) },
      { $addToSet: { postIds: postIdToAdd } },
    );

    return result;
  } catch (err) {
    throw err.message;
  }
}

// used
async function updateUserPostIdsRemove(db, userId, postIdToRemove) {
  try {
    const result = await db.collection(dbCollection).updateOne(
      { _id: ObjectId(userId) },
      { $pull: { postIds: ObjectId(postIdToRemove) } },
    );

    return result.matchedCount ? 200 : 404;
  } catch (err) {
    throw err.message;
  }
}

// used
async function updatePasswordByUserId(db, userId, oldPassword, newPassword) {
  try {
    const result = await db.collection(dbCollection)
      .updateOne(
        { _id: ObjectId(userId), password: oldPassword },
        { $set: { password: newPassword } },
      );

    if (result.matchedCount === 1) {
      return 200; // Success
    }

    const userExists = await db.collection(dbCollection)
      .findOne({ _id: ObjectId(userId) });

    return userExists ? 401 : 404; // Incorrect old password or user not found
  } catch (err) {
    throw err.message;
  }
}

// used
async function deleteUserById(db, id) {
  try {
    const result = await db.collection(dbCollection).deleteOne({ _id: ObjectId(id) });
    return result;
  } catch (err) {
    throw err.message;
  }
}

module.exports = {
  createUser,
  readProfileImageByUserId,
  readAllIdsUsernames,
  readAllIdsUsernamesEmails,
  readUsernameAndEmailByUserId,
  readIdUsernameAndProfilePictureByUserId,
  readPostIdsByUserId,
  updateUser,
  updateUserPostIdsAdd,
  updateUserPostIdsRemove,
  updatePasswordByUserId,
  deleteUserById,
};
