const request = require('supertest');
const { ObjectId } = require('mongodb');
const { closeMongoDBConnection, connect, getDB } = require('../database/mongodb');
const { webapp, closeServerDatabase } = require('./server');

function encodeObjectToURLParams(obj) {
  const params = new URLSearchParams(Object.entries(obj).map(([key, value]) => [key, value]));
  return params.toString();
}

// TEST GET ENDPOINT
describe('GET endpoints integration test', () => {
  let MongoConnection;
  let db;

  let testUser0Id;
  let testUser0JWT;
  const testUser0 = { username: 'GETtestuser0', email: 'GETtestuser0@test.com', password: 'TestUser0!' };
  const testUser0ParamString = encodeObjectToURLParams(testUser0);

  let testUser1Id;
  // let testUser1JWT;
  const testUser1 = { username: 'GETtestuser1', email: 'GETtestuser1@test.com', password: 'TestUser1!' };
  const testUser1ParamString = encodeObjectToURLParams(testUser1);

  let testPostId;
  const testPost = { text: 'test post text' };

  let testCommentId;
  const testComment = { text: 'test comment text' };

  beforeAll(async () => {
    MongoConnection = await connect();
    db = await getDB(MongoConnection);
    // Create 2 users and get their JWT
    const res0 = await request(webapp).post('/register/').send(testUser0ParamString);
    const res1 = await request(webapp).post('/register/').send(testUser1ParamString);
    testUser0Id = JSON.parse(res0.text).userId;
    testUser1Id = JSON.parse(res1.text).userId;
    const res0JWT = await request(webapp).post('/authenticate/').send(encodeObjectToURLParams(
      { usernameOrEmail: testUser0.username, password: testUser0.password },
    ));
    // const res1JWT = await request(webapp).post('/authenticate/').send(encodeObjectToURLParams(
    //   { usernameOrEmail: testUser1.username, password: testUser1.password },
    // ));
    testUser0JWT = JSON.parse(res0JWT.text).token;
    // testUser1JWT = JSON.parse(res1JWT.text).token;

    // Create a post for testUser0
    const res3 = await request(webapp).post('/posts').set('Authorization', testUser0JWT).set('Content-Type', 'multipart/form-data')
      .field('userId', testUser0Id)
      .field('post', JSON.stringify(testPost));
    testPostId = JSON.parse(res3.text);

    // Create a comment for testPost
    const res4 = await request(webapp).post('/comments').set('Authorization', testUser0JWT)
      .send({
        userId: testUser0Id, postId: testPostId, parentCommentId: '-1', comment: testComment,
      });
    testCommentId = JSON.parse(res4.text);
  });

  const clearDatabase = async () => {
    try {
      const userIdsToDelete = [
        ObjectId(testUser0Id),
        ObjectId(testUser1Id),
      ];

      const result = await db.collection('Users').deleteMany({ _id: { $in: userIdsToDelete } });
      let { deletedCount } = result;
      if (deletedCount === userIdsToDelete.length) {
        // eslint-disable-next-line no-console
        // console.log('info', 'Successfully deleted test users');
      } else {
        // eslint-disable-next-line no-console
        console.log('warning', 'test users were not deleted');
      }

      const result0 = await db.collection('Sessions').deleteOne({ userId: ObjectId(testUser0Id) });
      deletedCount = result0.deletedCount;
      if (deletedCount === 1) {
        // eslint-disable-next-line no-console
        // console.log('info', 'Successfully deleted test sessions');
      } else {
        // eslint-disable-next-line no-console
        console.log('warning', 'test sessions were not deleted');
      }

      const result1 = await db.collection('Posts').deleteOne({ _id: ObjectId(testPostId) });
      deletedCount = result1.deletedCount;
      if (deletedCount === 1) {
        // eslint-disable-next-line no-console
        // console.log('info', 'Successfully deleted test post');
      } else {
        // eslint-disable-next-line no-console
        console.log('warning', 'test post was not deleted');
      }

      const result2 = await db.collection('Comments').deleteOne({ _id: ObjectId(testCommentId) });
      deletedCount = result2.deletedCount;
      if (deletedCount === 1) {
        // eslint-disable-next-line no-console
        // console.log('info', 'Successfully deleted test comment');
      } else {
        // eslint-disable-next-line no-console
        console.log('warning', 'test comment was not deleted');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('error', err.message);
    }
  };

  afterAll(async () => {
    try {
      await clearDatabase();
      await closeServerDatabase();
      await closeMongoDBConnection(MongoConnection); // mongo client that started server.
      return true;
    } catch (err) {
      return err;
    }
  });

  test('Get backend welcome', async () => {
    const resp = await request(webapp).get('/');
    const returnObj = JSON.parse(resp.text);
    expect(returnObj.message).toBe('Welcome to our backend!!!');
  });

  // ***********************************AUTHENTICATION**********************************************
  test('Get is token is expiring in 1 minute or less', async () => {
    const resp = await request(webapp).get('/isTokenExpiration1Minute/').set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const expirationStatus = JSON.parse(resp.text);
    expect(expirationStatus).toBe(false);
  });

  // **************************************USERS***************************************************
  test('Check if username or email are already taken', async () => {
    const resp = await request(webapp).get(`/users/usernameOrEmailTaken/${testUser1.username}/${testUser1.email}/${testUser0Id}`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const { usernameInDB, emailInDB } = JSON.parse(resp.text);
    expect(usernameInDB).toBe(true);
    expect(emailInDB).toBe(true);
  });

  test('Get user s3 image url', async () => {
    const resp = await request(webapp).get(`/user/${testUser0Id}/profileimage`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const profileImage = JSON.parse(resp.text);
    // To check if profileImage ends with 'defaultProfilePicture.jpg':
    expect(profileImage).toMatch(/defaultProfilePicture.jpg$/);
  });

  test('Get all user IDs and usernames endpoint status code and data', async () => {
    const resp = await request(webapp).get('/user-ids-usernames/').set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const userIdUsernameArr = JSON.parse(resp.text);
    expect(userIdUsernameArr.some(
      (user) => user.id === testUser0Id && user.username === testUser0.username,
    )).toBe(true);
  });

  test('Get username and email by ID endpoint status code and data', async () => {
    const resp = await request(webapp).get(`/users/${testUser0Id}/username-email`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const user = JSON.parse(resp.text);
    expect(user).toStrictEqual({ username: testUser0.username, email: testUser0.email });
  });

  test('Get user ID, username, and profile picture by ID endpoint status code and data', async () => {
    const resp = await request(webapp).get(`/user/${testUser0Id}`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const user = JSON.parse(resp.text);
    expect(user).toMatchObject({ id: testUser0Id, username: testUser0.username });
    // To check if profileImage ends with 'defaultProfilePicture.jpg':
    expect(user.profileImage).toMatch(/defaultProfilePicture.jpg$/);
  });

  test('Get hidden post IDs by user ID endpoint status code and data', async () => {
    const resp = await request(webapp).get(`/users/${testUser0Id}/hidden-posts`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const hiddenPostIds = JSON.parse(resp.text);
    expect(hiddenPostIds).toStrictEqual([]);
  });

  // *************************************FOLLOW***************************************************
  test('Get all users with IDs, usernames, and profile images except the given user endpoint status code and data', async () => {
    const resp = await request(webapp).get(`/users/exclude/${testUser0Id}`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const userIdUsernameArr = JSON.parse(resp.text);
    expect(userIdUsernameArr.some(
      (user) => user.id === testUser1Id && user.username === testUser1.username && user.profileImage.endsWith('defaultProfilePicture.jpg'),
    )).toBe(true);
  });

  test('Get users that specific user follows endpoint status code and data', async () => {
    const resp = await request(webapp).get(`/users/follows/${testUser0Id}`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const followsUserIdArr = JSON.parse(resp.text);
    expect(followsUserIdArr).toStrictEqual([]);
  });

  test('Get users that follow specific user endpoint status code and data', async () => {
    const resp = await request(webapp).get(`/users/followers/${testUser0Id}`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const followersUserIdArr = JSON.parse(resp.text);
    expect(followersUserIdArr).toStrictEqual([]);
  });

  // *************************************COMMENTS*************************************************
  test('Get a comment by ID endpoint status code and data', async () => {
    const resp = await request(webapp).get(`/comments/${testCommentId}`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const comment = JSON.parse(resp.text);
    // testComment is the response
    expect(comment).toMatchObject({ id: testCommentId, text: testComment.text });
  });

  test('Get all comment IDs by post ID and parentcomment ID endpoint status code and data', async () => {
    const resp = await request(webapp).get(`/posts/${testPostId}/comments/${testCommentId}/sorted`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const commentsArr = JSON.parse(resp.text);
    expect(commentsArr).toStrictEqual([]);
  });

  // ****************************************POSTS*************************************************
  test('Get post IDs by user ID endpoint status code and data', async () => {
    const resp = await request(webapp).get(`/posts/user/${testUser0Id}`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const postIdsArr = JSON.parse(resp.text);
    expect(postIdsArr).toStrictEqual([testPostId]);
  });

  test('Get activity feed post IDs for a user endpoint status code and data', async () => {
    const resp = await request(webapp).get(`/posts/activity-feed/${testUser0Id}`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const postIdsArr = JSON.parse(resp.text);
    expect(postIdsArr).toStrictEqual([testPostId]);
  });

  test('Get post by ID endpoint status code and data', async () => {
    const resp = await request(webapp).get(`/posts/${testPostId}`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const post = JSON.parse(resp.text);
    expect(post).toMatchObject({ id: testPostId, text: testPost.text });
  });

  test('Get post media url by post ID endpoint status code and data', async () => {
    const resp = await request(webapp).get(`/posts/${testPostId}/mediaUrl`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const mediaUrl = JSON.parse(resp.text);
    expect(mediaUrl).toBe('');
  });

  test('Get post likes by post ID endpoint status code and data', async () => {
    const resp = await request(webapp).get(`/posts/${testPostId}/likes`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');
    const likesArr = JSON.parse(resp.text);
    expect(likesArr).toStrictEqual([]);
  });
});
