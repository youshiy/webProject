const request = require('supertest');
const { ObjectId } = require('mongodb');
const path = require('path');
const { closeMongoDBConnection, connect, getDB } = require('../database/mongodb');
const { webapp, closeServerDatabase } = require('./server');

function encodeObjectToURLParams(obj) {
  const params = new URLSearchParams(Object.entries(obj).map(([key, value]) => [key, value]));
  return params.toString();
}

// TEST DELETE ENDPOINT
describe('DELETE endpoints integration test', () => {
  let MongoConnection;
  let db;

  let testUser0Id;
  let testUser0JWT;
  const testUser0 = { username: 'DELETEtestuser0', email: 'DELETEtestuser0@test.com', password: 'TestUser0!' };
  const testUser0ParamString = encodeObjectToURLParams(testUser0);

  let testUser1Id;
  let testUser1JWT;
  const testUser1 = { username: 'DELETEtestuser1', email: 'DELETEtestuser1@test.com', password: 'TestUser1!' };
  const testUser1ParamString = encodeObjectToURLParams(testUser1);

  let testPost0Id;
  const testPost0 = { text: 'test post0 text', mediaUrl: '' };

  let testPost1Id;
  const testPost1 = { text: 'test post1 text', mediaUrl: '' };

  let testComment0Id;
  const testComment0 = { text: 'test comment0 text' };

  let testComment1Id;
  const testComment1 = { text: 'test comment1 text' };

  const filePath = path.join(__dirname, 'testImageFile.jpg');

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
    const res1JWT = await request(webapp).post('/authenticate/').send(encodeObjectToURLParams(
      { usernameOrEmail: testUser1.username, password: testUser1.password },
    ));
    testUser0JWT = JSON.parse(res0JWT.text).token;
    testUser1JWT = JSON.parse(res1JWT.text).token;

    // Create upload profile image for both users
    await request(webapp).put(`/user/${testUser0Id}/profileimage`).set('Authorization', testUser0JWT).set('Content-Type', 'multipart/form-data')
      .attach('File_0', filePath);
    await request(webapp).put(`/user/${testUser1Id}/profileimage`).set('Authorization', testUser1JWT).set('Content-Type', 'multipart/form-data')
      .attach('File_0', filePath);

    // users follow each other
    await request(webapp).put(`/follow/${testUser0Id}/${testUser1Id}`).set('Authorization', testUser0JWT);
    await request(webapp).put(`/follow/${testUser1Id}/${testUser0Id}`).set('Authorization', testUser1JWT);

    // Create a post for each user
    const res2 = await request(webapp).post('/posts').set('Authorization', testUser0JWT).set('Content-Type', 'multipart/form-data')
      .field('userId', testUser0Id)
      .field('post', JSON.stringify(testPost0));
    testPost0Id = JSON.parse(res2.text);

    const res3 = await request(webapp).post('/posts').set('Authorization', testUser1JWT).set('Content-Type', 'multipart/form-data')
      .field('userId', testUser1Id)
      .field('post', JSON.stringify(testPost1));
    testPost1Id = JSON.parse(res3.text);

    // Like both posts for each user
    await request(webapp).put(`/posts/${testPost0Id}/likedby/${testUser0Id}`).set('Authorization', testUser0JWT);
    await request(webapp).put(`/posts/${testPost0Id}/likedby/${testUser1Id}`).set('Authorization', testUser1JWT);
    await request(webapp).put(`/posts/${testPost1Id}/likedby/${testUser0Id}`).set('Authorization', testUser0JWT);
    await request(webapp).put(`/posts/${testPost1Id}/likedby/${testUser1Id}`).set('Authorization', testUser1JWT);

    // Create a comment for each post
    const res4 = await request(webapp).post('/comments').set('Authorization', testUser0JWT)
      .send({
        userId: testUser0Id, postId: testPost0Id, parentCommentId: '-1', comment: testComment0,
      });
    testComment0Id = JSON.parse(res4.text);

    const res5 = await request(webapp).post('/comments').set('Authorization', testUser1JWT)
      .send({
        userId: testUser1Id, postId: testPost1Id, parentCommentId: '-1', comment: testComment1,
      });
    testComment1Id = JSON.parse(res5.text);

    // Create a subcomment for each post
    await request(webapp).post('/comments').set('Authorization', testUser0JWT)
      .send({
        userId: testUser0Id,
        postId: testPost0Id,
        parentCommentId: testComment0Id,
        comment: testComment0,
      });

    await request(webapp).post('/comments').set('Authorization', testUser1JWT)
      .send({
        userId: testUser1Id,
        postId: testPost1Id,
        parentCommentId: testComment1Id,
        comment: testComment1,
      });
  });

  const clearDatabase = async () => {
    try {
      const userIdsToDelete = [
        ObjectId(testUser0Id),
        ObjectId(testUser1Id),
      ];

      const result = await db.collection('Sessions').deleteMany({ userId: { $in: userIdsToDelete } });
      const { deletedCount } = result;
      if (deletedCount === userIdsToDelete.length) {
        // eslint-disable-next-line no-console
        // console.log('info', 'Successfully deleted test sessions');
      } else {
        // eslint-disable-next-line no-console
        console.log('warning', 'test sessions were not deleted');
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

  // **************************************COMMMENTS***********************************************
  test('Delete a comment and its descendants by ID and using the post ID endpoint status code and response async/await', async () => {
    const resp = await request(webapp).delete(`/post/${testPost0Id}/comments/${testComment0Id}/all`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');

    // the database was updated
    const deletedComment = await db.collection('Comments').findOne({ _id: ObjectId(testComment0Id) });
    expect(deletedComment).toBeNull();
  });

  // **************************************POSTS****************************************************
  test('Delete a post by ID endpoint status code and response async/await', async () => {
    const resp = await request(webapp).delete(`/user/${testUser0Id}/posts/${testPost0Id}`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');

    // the database was updated
    const deletedPost = await db.collection('Posts').findOne({ _id: ObjectId(testPost0Id) });
    expect(deletedPost).toBeNull();
  });

  // **************************************USERS***************************************************
  test('Delete user s3 image endpoint status code and response async/await', async () => {
    const resp = await request(webapp).delete(`/user/${testUser0Id}/profileimage`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');

    const returnMessage = JSON.parse(resp.text).message;
    expect(returnMessage).toBe('Profile Image deleted');
  });

  test('Delete a user endpoint status code and response async/await', async () => {
    const resp = await request(webapp).delete(`/user/${testUser1Id}`).set('Authorization', testUser1JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');

    // the database was updated
    const deletedUser = await db.collection('Users').findOne({ _id: ObjectId(testUser1Id) });
    expect(deletedUser).toBeNull();
  });

  test('Delete a user endpoint status code and response async/await', async () => {
    const resp = await request(webapp).delete(`/user/${testUser0Id}`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');

    // the database was updated
    const deletedUser = await db.collection('Users').findOne({ _id: ObjectId(testUser0Id) });
    expect(deletedUser).toBeNull();
  });
});
