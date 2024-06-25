const { ObjectId } = require('mongodb');

const dbCollection = 'Users';

// used
async function readUserHiddenPostIds(db, id) {
  try {
    const result = await db.collection(dbCollection)
      .findOne({ _id: ObjectId(id) }, { projection: { _id: 0, hiddenPostIds: 1 } });

    return result?.hiddenPostIds || [];
  } catch (err) {
    throw err.message;
  }
}

// used
async function appendUserToPostHiddenBy(db, postId, userId) {
  try {
    const result = await db.collection('Posts')
      .findOneAndUpdate(
        { _id: ObjectId(postId) },
        { $addToSet: { hiddenBy: ObjectId(userId) } },
        { returnDocument: 'after', projection: { _id: 0, hiddenBy: 1 } },
      );

    if (!result.value) {
      throw new Error('Post does not exist! Please refresh the page!');
    }

    return result.value.hiddenBy || [];
  } catch (err) {
    throw err.message;
  }
}

// used
async function appendPostToUserHiddenPostIds(db, userId, postId) {
  try {
    const result = await db.collection(dbCollection)
      .findOneAndUpdate(
        { _id: ObjectId(userId) },
        { $addToSet: { hiddenPostIds: ObjectId(postId) } },
        { returnDocument: 'after', projection: { _id: 0, hiddenPostIds: 1 } },
      );

    await appendUserToPostHiddenBy(db, postId, userId);

    return result.value ? result.value.hiddenPostIds : [];
  } catch (err) {
    throw err.message;
  }
}

// used
async function removeUserFromPostHiddenBy(db, postId, userId) {
  try {
    const result = await db.collection('Posts')
      .findOneAndUpdate(
        { _id: ObjectId(postId) },
        { $pull: { hiddenBy: ObjectId(userId) } },
        { returnDocument: 'after', projection: { _id: 0, hiddenBy: 1 } },
      );

    return result.value ? result.value.hiddenBy : [];
  } catch (err) {
    throw err.message;
  }
}

// used
async function removePostFromUserHiddenPostIds(db, userId, postId) {
  try {
    const result = await db.collection(dbCollection)
      .findOneAndUpdate(
        { _id: ObjectId(userId) },
        { $pull: { hiddenPostIds: ObjectId(postId) } },
        { returnDocument: 'after', projection: { _id: 0, hiddenPostIds: 1 } },
      );

    await removeUserFromPostHiddenBy(db, postId, userId);

    return result.value ? result.value.hiddenPostIds : [];
  } catch (err) {
    throw err.message;
  }
}

// used
async function removeUserFromAllPostHiddenBy(db, id) {
  try {
    const result = await db.collection('Posts').updateMany(
      { hiddenBy: ObjectId(id) },
      { $pull: { hiddenBy: ObjectId(id) } },
    );
    return result;
  } catch (err) {
    throw err.message;
  }
}

module.exports = {
  readUserHiddenPostIds,
  appendPostToUserHiddenPostIds,
  removePostFromUserHiddenPostIds,
  appendUserToPostHiddenBy,
  removeUserFromPostHiddenBy,
  removeUserFromAllPostHiddenBy,
};
