const { ObjectId } = require('mongodb');
const followDB = require('./followDB');
const usersDB = require('./usersDB');

const { readWhoUserIdFollows } = followDB;
const { updateUserPostIdsAdd, updateUserPostIdsRemove, readPostIdsByUserId } = usersDB;

// MongoDB collection name for posts
const dbCollection = 'Posts';

// used
async function createPost(db, userId, post) {
  try {
    const newPost = {
      userId: ObjectId(userId),
      text: post.text,
      mediaUrl: post.mediaUrl,
      createdDate: new Date().toISOString(),
      updatedDate: null,
      hiddenBy: [],
      likes: [],
      commentIds: [],
    };
    const result = await db.collection(dbCollection)
      .insertOne(newPost);
    await updateUserPostIdsAdd(db, userId, result.insertedId);
    return result.insertedId;
  } catch (err) {
    throw err.message;
  }
}

// used
async function readActivityFeedPostIds(db, userId) {
  try {
    const arrayUserIdsWhoUserFollows = await readWhoUserIdFollows(db, userId);
    const userIdsOfPostsToGet = [userId, ...arrayUserIdsWhoUserFollows];

    const postIdsPromises = userIdsOfPostsToGet.map(async (usrId) => {
      try {
        return await readPostIdsByUserId(db, usrId);
      } catch (err) {
        throw err.message;
      }
    });
    const resolvedPostIds = await Promise.all(postIdsPromises);
    const postIds = resolvedPostIds.flat().map((id) => ObjectId(id));

    const results = await db.collection(dbCollection)
      .find({ _id: { $in: postIds } })
      .sort({ createdDate: -1 })
      .project({ _id: 1 })
      .toArray();
    // eslint-disable-next-line no-underscore-dangle
    return results.map((post) => post._id);
  } catch (err) {
    throw err.message;
  }
}

// used
async function readPostById(db, id) {
  try {
    const result = await db.collection(dbCollection).findOne({ _id: ObjectId(id) });
    if (result) {
      const { _id, ...rest } = result;
      return { id: _id, ...rest };
    }
    return null;
  } catch (err) {
    throw err.message;
  }
}

// used
async function readPostMediaUrlByPostId(db, id) {
  try {
    const result = await db.collection(dbCollection)
      .findOne({ _id: ObjectId(id) }, { projection: { _id: 0, mediaUrl: 1 } });

    return result?.mediaUrl !== undefined && result?.mediaUrl !== null ? result.mediaUrl : null;
  } catch (err) {
    throw err.message;
  }
}

// used
async function readPostLikesByPostId(db, id) {
  try {
    const result = await db.collection(dbCollection)
      .findOne({ _id: ObjectId(id) }, { projection: { _id: 0, likes: 1 } });

    return result?.likes || [];
  } catch (err) {
    throw err.message;
  }
}

// used
async function readAllCommentIdsAndSubcommentIdsByPostId(db, id) {
  try {
    const result = await db.collection(dbCollection)
      .findOne({ _id: ObjectId(id) }, { projection: { _id: 0, commentIds: 1 } });

    return result?.commentIds || [];
  } catch (err) {
    throw err.message;
  }
}

// used
async function readAllCommentIdsByPostIdParentCommentId(db, postId, parentCommentId) {
  try {
    const allCommentIds = await readAllCommentIdsAndSubcommentIdsByPostId(db, postId);
    const parntCommentId = parentCommentId === '-1' ? '-1' : ObjectId(parentCommentId);
    const results = await db.collection('Comments')
      .find({ _id: { $in: allCommentIds }, parentCommentId: parntCommentId })
      .sort({ createdDate: 1 })
      .project({ _id: 1 })
      .toArray();
    // eslint-disable-next-line no-underscore-dangle
    return results.map((comment) => comment._id);
  } catch (err) {
    throw err.message;
  }
}

// used
async function updatePost(db, updatedPost) {
  try {
    const { id, text, mediaUrl } = updatedPost;
    const result = await db.collection(dbCollection)
      .findOneAndUpdate(
        { _id: ObjectId(id) },
        { $set: { text, mediaUrl, updatedDate: new Date().toISOString() } },
        { returnDocument: 'after' },
      );
    return result;
  } catch (err) {
    throw err.message;
  }
}

// used
async function updatePostCommentIdsAdd(db, postId, commentIdToAdd) {
  try {
    const result = await db.collection(dbCollection).updateOne(
      { _id: ObjectId(postId) },
      { $addToSet: { commentIds: commentIdToAdd } },
    );

    return result.matchedCount ? 200 : 404;
  } catch (err) {
    throw err.message;
  }
}

// used
async function updatePostCommentIdsRemove(db, postId, commentIdToRemove) {
  try {
    const result = await db.collection(dbCollection).updateOne(
      { _id: ObjectId(postId) },
      { $pull: { commentIds: ObjectId(commentIdToRemove) } },
    );

    return result.matchedCount ? 200 : 404;
  } catch (err) {
    throw err.message;
  }
}

// used
async function deletePostByIdWithUserId(db, postId, userId) {
  try {
    const commentIds = await readAllCommentIdsAndSubcommentIdsByPostId(db, postId);
    const deletePromises = commentIds.map(async (commentId) => {
      try {
        return await db.collection('Comments').deleteOne({ _id: commentId });
      } catch (err) {
        throw err.message;
      }
    });

    await Promise.all(deletePromises);
    await updateUserPostIdsRemove(db, userId, postId);
    const result = await db.collection(dbCollection).deleteOne({ _id: ObjectId(postId) });
    return result;
  } catch (err) {
    throw err.message;
  }
}

// used
async function deleteAllPostsByUserId(db, userId) {
  try {
    const postIds = await readPostIdsByUserId(db, userId);
    const deletePromises = postIds.map(async (postId) => {
      try {
        return await deletePostByIdWithUserId(db, postId, userId);
      } catch (err) {
        throw err.message;
      }
    });

    return await Promise.all(deletePromises);
  } catch (err) {
    throw err.message;
  }
}

// used
async function appendUserToPostLikes(db, postId, userId) {
  try {
    const result = await db.collection(dbCollection)
      .findOneAndUpdate(
        { _id: ObjectId(postId) },
        { $addToSet: { likes: ObjectId(userId) } },
        { returnDocument: 'after', projection: { _id: 0, likes: 1 } },
      );

    if (!result.value) {
      throw new Error('Post does not exist! Please refresh the page!');
    }

    return result.value.likes || [];
  } catch (err) {
    throw err.message;
  }
}

// used
async function removeUserFromPostLikes(db, postId, userId) {
  try {
    const result = await db.collection(dbCollection)
      .findOneAndUpdate(
        { _id: ObjectId(postId) },
        { $pull: { likes: ObjectId(userId) } },
        { returnDocument: 'after', projection: { _id: 0, likes: 1 } },
      );

    return result.value ? result.value.likes : [];
  } catch (err) {
    throw err.message;
  }
}

// used
async function removeUserFromAllPostLikes(db, id) {
  try {
    const result = await db.collection(dbCollection).updateMany(
      { likes: ObjectId(id) },
      { $pull: { likes: ObjectId(id) } },
    );
    return result;
  } catch (err) {
    throw err.message;
  }
}

module.exports = {
  createPost,
  readActivityFeedPostIds,
  readPostById,
  readPostMediaUrlByPostId,
  readPostLikesByPostId,
  readAllCommentIdsAndSubcommentIdsByPostId,
  readAllCommentIdsByPostIdParentCommentId,
  updatePost,
  updatePostCommentIdsAdd,
  updatePostCommentIdsRemove,
  deletePostByIdWithUserId,
  deleteAllPostsByUserId,
  appendUserToPostLikes,
  removeUserFromPostLikes,
  removeUserFromAllPostLikes,
};
