const { ObjectId } = require('mongodb');
const postsDB = require('./postsDB');

const {
  updatePostCommentIdsAdd, updatePostCommentIdsRemove, readAllCommentIdsAndSubcommentIdsByPostId,
} = postsDB;

// used
async function createComment(db, userId, postId, parentCommentId, comment) {
  try {
    const post = await db.collection('Posts').findOne({ _id: ObjectId(postId) });

    if (post) {
      const stringifiedCommentIds = post.commentIds
        .map((postCommentId) => postCommentId.toString());
      if (parentCommentId === '-1' || stringifiedCommentIds.includes(parentCommentId)) {
        const result = await db.collection('Comments').insertOne({
          userId: ObjectId(userId),
          parentCommentId: parentCommentId === '-1' ? '-1' : ObjectId(parentCommentId),
          text: comment.text,
          createdDate: new Date().toISOString(),
          updatedDate: null,
        });
        await updatePostCommentIdsAdd(db, postId, result.insertedId);
        return result.insertedId;
      }
      throw new Error('The Comment/Reply you are replying to does not exist! Please refresh the page!');
    }
    throw new Error('Post does not exist! Please refresh the page!');
  } catch (err) {
    throw err.message;
  }
}

// used
async function readCommentById(db, id) {
  try {
    const result = await db.collection('Comments').findOne({ _id: ObjectId(id) });
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
async function updateComment(db, updatedComment) {
  try {
    const { id, text } = updatedComment;
    const result = await db.collection('Comments')
      .findOneAndUpdate(
        { _id: ObjectId(id) },
        { $set: { text, updatedDate: new Date().toISOString() } },
        { returnDocument: 'after' },
      );
    return result;
  } catch (err) {
    throw err.message;
  }
}

// used
function getDescendantCommentIds(parentId, allPostComments) {
  try {
    const subCommentIds = allPostComments
      .filter((x) => x.parentCommentId.toString() === parentId.toString())
      // eslint-disable-next-line no-underscore-dangle
      .map((x) => x._id);

    const subCommentIdsArrays = subCommentIds
      .map((subCommentId) => getDescendantCommentIds(subCommentId, allPostComments));

    return [...subCommentIds, ...subCommentIdsArrays.flat()];
  } catch (err) {
    throw err.message;
  }
}

// used
async function deleteComment(db, commentId, postId) {
  try {
    await updatePostCommentIdsRemove(db, postId, commentId);
    const result = await db.collection('Comments').deleteOne({ _id: ObjectId(commentId) });
    return result;
  } catch (err) {
    throw err.message;
  }
}

// used
async function deleteCommentByIdWithPostId(db, commentId, postId) {
  try {
    const allPostCommentIds = await readAllCommentIdsAndSubcommentIdsByPostId(db, postId);
    const allPostComments = await db.collection('Comments')
      .find({ _id: { $in: allPostCommentIds } })
      .project({ _id: 1, parentCommentId: 1 })
      .toArray();
    const subCommentIds = getDescendantCommentIds(commentId, allPostComments);
    subCommentIds.push(commentId);
    const deleteCommentPromises = subCommentIds.map(async (subCommentId) => {
      try {
        return await deleteComment(db, subCommentId, postId);
      } catch (err) {
        throw err.message;
      }
    });

    return await Promise.all(deleteCommentPromises);
  } catch (err) {
    throw err.message;
  }
}

module.exports = {
  createComment,
  readCommentById,
  updateComment,
  getDescendantCommentIds,
  deleteComment,
  deleteCommentByIdWithPostId,
  readAllCommentIdsAndSubcommentIdsByPostId,
};
