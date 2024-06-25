const request = require('supertest');
const { ObjectId } = require('mongodb');
const { closeMongoDBConnection, connect, getDB } = require('../database/mongodb');
const { webapp, closeServerDatabase } = require('./server');

function encodeObjectToURLParams(obj) {
  const params = new URLSearchParams(Object.entries(obj).map(([key, value]) => [key, value]));
  return params.toString();
}

// TEST POST ENDPOINT
describe('POST endpoints integration test', () => {
  let MongoConnection;
  let db;

  let userIdsToDelete = [];
  let postIdsToDelete = [];
  let commentIdsToDelete = [];

  let testUser0JWT;
  const testUser0 = { username: 'POSTtestuser0', email: 'POSTtestuser0@test.com', password: 'TestUser0!' };
  const testUser0ParamString = encodeObjectToURLParams(testUser0);

  const testPost = { text: 'test post text' };

  const testComment = { text: 'test comment text' };

  beforeAll(async () => {
    MongoConnection = await connect();
    db = await getDB(MongoConnection);
  });

  const clearDatabase = async () => {
    try {
      userIdsToDelete = userIdsToDelete.map((userId) => ObjectId(userId));
      postIdsToDelete = postIdsToDelete.map((postId) => ObjectId(postId));
      commentIdsToDelete = commentIdsToDelete.map((commentId) => ObjectId(commentId));

      const result = await db.collection('Users').deleteMany({ _id: { $in: userIdsToDelete } });
      let { deletedCount } = result;
      if (deletedCount === userIdsToDelete.length) {
        // eslint-disable-next-line no-console
        // console.log('info', 'Successfully deleted test users');
      } else {
        // eslint-disable-next-line no-console
        console.log('warning', 'test users were not deleted');
      }

      const result0 = await db.collection('Sessions').deleteMany({ userId: { $in: userIdsToDelete } });
      deletedCount = result0.deletedCount;
      if (deletedCount === userIdsToDelete.length) {
        // eslint-disable-next-line no-console
        // console.log('info', 'Successfully deleted test sessions');
      } else {
        // eslint-disable-next-line no-console
        console.log('warning', 'test sessions were not deleted');
      }

      const result1 = await db.collection('Posts').deleteMany({ _id: { $in: postIdsToDelete } });
      deletedCount = result1.deletedCount;
      if (deletedCount === postIdsToDelete.length) {
        // eslint-disable-next-line no-console
        // console.log('info', 'Successfully deleted test post');
      } else {
        // eslint-disable-next-line no-console
        console.log('warning', 'test post was not deleted');
      }

      const result2 = await db.collection('Comments').deleteMany({ _id: { $in: commentIdsToDelete } });
      deletedCount = result2.deletedCount;
      if (deletedCount === commentIdsToDelete.length) {
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

  // ***********************************REGISTER****************************************************
  test('User registration endpoint status code and response async/await', async () => {
    const resp = await request(webapp).post('/register/').send(testUser0ParamString);
    expect(resp.status).toEqual(201);
    expect(resp.type).toBe('application/json');

    const testUser0Id = JSON.parse(resp.text).userId;

    // the user was created in the DB
    const createdUser = await db.collection('Users').findOne({ _id: ObjectId(testUser0Id) });
    expect(createdUser.username).toEqual(testUser0.username);
    userIdsToDelete.push(testUser0Id);
  });

  // ***********************************AUTHENTICATION**********************************************
  test('FAILED Authentication status code and response async/await', async () => {
    const resp = await request(webapp).post('/authenticate/').send(encodeObjectToURLParams(
      { usernameOrEmail: testUser0.username, password: 'incorrect' },
    ));
    expect(resp.status).toEqual(401);
    expect(resp.type).toBe('application/json');

    const respMessage = JSON.parse(resp.text).message;
    expect(respMessage).toBe('Invalid Credentials!');

    const session = await db.collection('Sessions').findOne({ userId: ObjectId(userIdsToDelete[0]) });
    expect(session).toBeNull();
  });

  test('Authentication status code and response async/await', async () => {
    const resp = await request(webapp).post('/authenticate/').send(encodeObjectToURLParams(
      { usernameOrEmail: testUser0.username, password: testUser0.password },
    ));
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');

    const testUser0Id = JSON.parse(resp.text).id;
    const testUser0Username = JSON.parse(resp.text).username;
    const testUser0Token = JSON.parse(resp.text).token;

    // returned id and username should be the same that we sent in
    expect(testUser0Id).toEqual(userIdsToDelete[0]);
    expect(testUser0Username).toEqual(testUser0.username);

    // the session was created in the DB with correct JWT token
    const createdSession = await db.collection('Sessions').findOne({ userId: ObjectId(userIdsToDelete[0]) });
    expect(createdSession.jwtToken).toEqual(testUser0Token);

    testUser0JWT = testUser0Token;
  });

  test('Reauthentication status code and response async/await', async () => {
    const resp = await request(webapp).post('/reauthenticate/').set('Authorization', testUser0JWT).send(encodeObjectToURLParams(
      { usernameOrEmail: testUser0.username, password: testUser0.password },
    ));
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');

    const testUser0Id = JSON.parse(resp.text).id;
    const testUser0Username = JSON.parse(resp.text).username;
    const testUser0Token = JSON.parse(resp.text).token;

    // returned id and username should be the same that we sent in
    expect(testUser0Id).toEqual(userIdsToDelete[0]);
    expect(testUser0Username).toEqual(testUser0.username);

    // the session was created in the DB with correct JWT token
    const createdSession = await db.collection('Sessions').findOne({ userId: ObjectId(userIdsToDelete[0]) });
    expect(createdSession.jwtToken).toEqual(testUser0Token);

    testUser0JWT = testUser0Token;
  });

  // ****************************************POSTS**************************************************
  test('Create a post for testUser endpoint status code and response async/await', async () => {
    const testUser0Id = userIdsToDelete[0];
    const res3 = await request(webapp).post('/posts/').set('Authorization', testUser0JWT).set('Content-Type', 'multipart/form-data')
      .field('userId', testUser0Id)
      .field('post', JSON.stringify(testPost));
    expect(res3.status).toEqual(201);
    expect(res3.type).toBe('application/json');

    const testPostId = JSON.parse(res3.text);

    // the post was created in the DB
    const createdPost = await db.collection('Posts').findOne({ _id: ObjectId(testPostId) });
    expect(createdPost.text).toEqual(testPost.text);
    postIdsToDelete.push(testPostId);
  });

  // *************************************COMMENTS**************************************************
  test('Create a new comment endpoint status code and response async/await', async () => {
    const testUser0Id = userIdsToDelete[0];
    const testPostId = postIdsToDelete[0];
    const res4 = await request(webapp).post('/comments/').set('Authorization', testUser0JWT)
      .send({
        userId: testUser0Id, postId: testPostId, parentCommentId: '-1', comment: testComment,
      });
    expect(res4.status).toEqual(201);
    expect(res4.type).toBe('application/json');

    const testCommentId = JSON.parse(res4.text);

    // the comment was created in the DB
    const createdComment = await db.collection('Comments').findOne({ _id: ObjectId(testCommentId) });
    expect(createdComment.text).toEqual(testComment.text);
    commentIdsToDelete.push(testCommentId);
  });
});
