// import the mongodb driver
const { MongoClient } = require('mongodb');
const {
  readUserHiddenPostIds,
  appendPostToUserHiddenPostIds,
  removePostFromUserHiddenPostIds,
  appendUserToPostHiddenBy,
  removeUserFromPostHiddenBy,
  removeUserFromAllPostHiddenBy,
} = require('./hideunhidepostDB');
const {
  authenticateUser,
  reauthenticateUser,
  verifyUser,
  isTokenExpiration1Minute,
} = require('./authenticationDB');
const {
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
} = require('./usersDB');
const {
  readAllIdsUsernamesImagesNotThisUserId,
  readWhoUserIdFollows,
  readWhoFollowsUserId,
  unfollowUser,
  followUser,
  allUsersUnfollowThisUserId,
  thisUserIdUnfollowAllUsers,
} = require('./followDB');
const {
  createComment,
  readCommentById,
  updateComment,
  getDescendantCommentIds,
  deleteComment,
  deleteCommentByIdWithPostId,
} = require('./commentsDB');
const {
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
} = require('./postsDB');

// dotenv helps manage environment variables
require('dotenv').config();

// the mongodb server URL
const dbURL = process.env.DBURL;
// the mongodb database name
const dbNAME = process.env.DBNAME;

// connection to the db
const connect = async () => {
  // always use try/catch to handle any exception
  try {
    const MongoConnection = (await MongoClient.connect(
      dbURL,
      { useNewUrlParser: true, useUnifiedTopology: true },
    )); // we return the entire connection, not just the DB
    // check that we are connected to the db
    // console.log(`connected to db: ${MongoConnection.db(dbNAME).databaseName}`);
    // const collectionsCursor = MongoConnection.db(dbNAME).listCollections();
    // const collections = await collectionsCursor.toArray();
    // console.log('Collections:');
    // collections.forEach((collection) => {
    // console.log(collection.name);
    // });
    // return MongoConnection.db(dbNAME);
    return MongoConnection;
  } catch (err) {
    // console.log(err.message);
    return null;
  }
};
/**
 *
 * @returns the database attached to this MongoDB connection
 */
const getDB = async (MongoConnection) => {
  // test if there is an active connection
  if (!MongoConnection) {
    return null;
  }
  return MongoConnection.db(dbNAME);
};

/**
 *
 * Close the mongodb connection
 */
const closeMongoDBConnection = async (MongoConnection) => {
  await MongoConnection.close();
};

// export the functions
module.exports = {
  closeMongoDBConnection,
  getDB,
  connect,
  authenticateUser,
  reauthenticateUser,
  verifyUser,
  isTokenExpiration1Minute,
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
  readUserHiddenPostIds,
  appendPostToUserHiddenPostIds,
  removePostFromUserHiddenPostIds,
  appendUserToPostHiddenBy,
  removeUserFromPostHiddenBy,
  removeUserFromAllPostHiddenBy,
  readAllIdsUsernamesImagesNotThisUserId,
  readWhoUserIdFollows,
  readWhoFollowsUserId,
  unfollowUser,
  followUser,
  allUsersUnfollowThisUserId,
  thisUserIdUnfollowAllUsers,
  createComment,
  readCommentById,
  updateComment,
  getDescendantCommentIds,
  deleteComment,
  deleteCommentByIdWithPostId,
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
