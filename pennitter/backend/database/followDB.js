const { ObjectId } = require('mongodb');

// used
async function readAllIdsUsernamesImagesNotThisUserId(db, userId) {
  try {
    const usersCollection = db.collection('Users');
    const users = await usersCollection
      .find({ _id: { $ne: ObjectId(userId) } })
      .project({ _id: 1, username: 1, profileImage: 1 })
      .toArray();

    return users.map(({ _id, username, profileImage }) => ({ id: _id, username, profileImage }));
  } catch (err) {
    throw err.message;
  }
}

// used
async function readWhoUserIdFollows(db, userId) {
  try {
    const usersCollection = db.collection('Users');
    const user = await usersCollection
      .findOne({ _id: ObjectId(userId) }, { projection: { _id: 0, follows: 1 } });

    return user?.follows || [];
  } catch (err) {
    throw err.message;
  }
}

// used
async function readWhoFollowsUserId(db, userId) {
  try {
    const usersCollection = db.collection('Users');
    const user = await usersCollection
      .findOne({ _id: ObjectId(userId) }, { projection: { _id: 0, followers: 1 } });

    return user?.followers || [];
  } catch (err) {
    throw err.message;
  }
}

// used
async function removeFromFollowersOfUserId(db, userId, userIdToUnfollow) {
  try {
    const usersCollection = db.collection('Users');
    const result = await usersCollection.updateOne(
      { _id: ObjectId(userId) },
      { $pull: { followers: ObjectId(userIdToUnfollow) } },
    );

    return result.matchedCount ? 200 : 404;
  } catch (err) {
    throw err.message;
  }
}

// used
async function unfollowUser(db, userId, userIdToUnfollow) {
  try {
    const usersCollection = db.collection('Users');
    const result = await usersCollection.updateOne(
      { _id: ObjectId(userId) },
      { $pull: { follows: ObjectId(userIdToUnfollow) } },
    );

    await removeFromFollowersOfUserId(db, userIdToUnfollow, userId);

    return result.matchedCount ? 200 : 404;
  } catch (err) {
    throw err.message;
  }
}

// used
async function addToFollowersOfUserId(db, userId, userIdFollowing) {
  try {
    const usersCollection = db.collection('Users');
    const result = await usersCollection.updateOne(
      { _id: ObjectId(userId) },
      { $addToSet: { followers: ObjectId(userIdFollowing) } },
    );

    return result.matchedCount ? 200 : 404;
  } catch (err) {
    throw err.message;
  }
}

// used
async function followUser(db, userId, userIdToFollow) {
  try {
    const usersCollection = db.collection('Users');
    const userToFollow = await usersCollection.findOne({ _id: ObjectId(userIdToFollow) });

    if (!userToFollow) {
      throw new Error('User does not exist! Please refresh the page!');
    }

    const result = await usersCollection.updateOne(
      { _id: ObjectId(userId) },
      { $addToSet: { follows: ObjectId(userIdToFollow) } },
    );

    await addToFollowersOfUserId(db, userIdToFollow, userId);

    return result.matchedCount ? 200 : 404;
  } catch (err) {
    throw err.message;
  }
}

// used
async function allUsersUnfollowThisUserId(db, userIdToUnfollow) {
  try {
    const followers = await readWhoFollowsUserId(db, userIdToUnfollow);
    const result = await db.collection('Users').updateMany(
      { _id: { $in: followers } },
      { $pull: { follows: ObjectId(userIdToUnfollow) } },
    );
    return result;
  } catch (err) {
    throw err.message;
  }
}

// used
async function thisUserIdUnfollowAllUsers(db, userIdUnfollowing) {
  try {
    const userIdsToUnfollow = await readWhoUserIdFollows(db, userIdUnfollowing);
    const result = await db.collection('Users').updateMany(
      { _id: { $in: userIdsToUnfollow } },
      { $pull: { followers: ObjectId(userIdUnfollowing) } },
    );
    return result;
  } catch (err) {
    throw err.message;
  }
}

module.exports = {
  readAllIdsUsernamesImagesNotThisUserId,
  readWhoUserIdFollows,
  readWhoFollowsUserId,
  unfollowUser,
  followUser,
  allUsersUnfollowThisUserId,
  thisUserIdUnfollowAllUsers,
};
