const request = require('supertest');
const { ObjectId } = require('mongodb');
const path = require('path');
const { closeMongoDBConnection, connect, getDB } = require('../database/mongodb');
const { webapp, closeServerDatabase } = require('./server');
const s3 = require('../s3/s3Operations');

function encodeObjectToURLParams(obj) {
  const params = new URLSearchParams(Object.entries(obj).map(([key, value]) => [key, value]));
  return params.toString();
}

// TEST PUT ENDPOINT
describe('PUT endpoints integration test', () => {
  let MongoConnection;
  let db;

  let testUser0Id;
  let testUser0JWT;
  const testUser0 = { username: 'PUTtestuser0', email: 'PUTtestuser0@test.com', password: 'TestUser0!' };
  const testUser0ParamString = encodeObjectToURLParams(testUser0);

  let testUser1Id;
  // let testUser1JWT;
  const testUser1 = { username: 'PUTtestuser1', email: 'PUTtestuser1@test.com', password: 'TestUser1!' };
  const testUser1ParamString = encodeObjectToURLParams(testUser1);

  let testPostId;
  const testPost = { text: 'test post text', mediaUrl: '' };

  let testCommentId;
  const testComment = { text: 'test comment text' };

  let postS3MediaUrl;
  const filePath = path.join(__dirname, 'testImageFile.jpg');

  let s3ImageURL;
  let s3ImageUrlToDelete;

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

    // Create s3 image link to delete later
    s3ImageURL = await request(webapp).put(`/user/${testUser0Id}/profileimage`).set('Authorization', testUser0JWT).set('Content-Type', 'multipart/form-data')
      .attach('File_0', filePath);
    s3ImageURL = s3ImageURL.text;
    // Remove double quote at the beginning
    s3ImageURL = s3ImageURL.replace(/^"/, '');
    // Remove double quote at the end
    s3ImageURL = s3ImageURL.replace(/"$/, '');

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

      s3.deleteFile(decodeURIComponent(s3ImageUrlToDelete).split('amazonaws.com/')[1]);
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

  // **************************************USERS****************************************************
  test('Update a user endpoint status code and response async/await', async () => {
    const resp = await request(webapp).put(`/user/${testUser0Id}`).set('Authorization', testUser0JWT)
      .send({ id: testUser0Id, username: 'modifiedTestUser' });
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');

    // the database was updated
    const updatedUser = await db.collection('Users').findOne({ _id: ObjectId(testUser0Id) });
    expect(updatedUser.username).toEqual('modifiedTestUser');
  });

  test('Update a users password endpoint status code and response async/await', async () => {
    const resp = await request(webapp).put(`/user/${testUser0Id}/password`).set('Authorization', testUser0JWT)
      .send({ oldPassword: testUser0.password, newPassword: 'modifiedPassword' });
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');

    // the database was updated
    const updatedUser = await db.collection('Users').findOne({ _id: ObjectId(testUser0Id) });
    expect(updatedUser.password).toEqual('modifiedPassword');
  });

  test('update user image with s3 generated image link endpoint status code and response async/await', async () => {
    const resp = await request(webapp).put(`/user/${testUser0Id}/profileimage`).set('Authorization', testUser0JWT).set('Content-Type', 'multipart/form-data')
      .attach('File_0', filePath)
      .field('currentProfileImage', s3ImageURL.split('amazonaws.com/')[1]);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');

    // the database was updated
    const updatedUser = await db.collection('Users').findOne({ _id: ObjectId(testUser0Id) });
    expect(updatedUser.profileImage).toContain('testImageFile.jpg');
    s3ImageUrlToDelete = updatedUser.profileImage;
  });

  test('Post is hidden by a user endpoint status code and response async/await', async () => {
    const resp = await request(webapp).put(`/users/${testUser0Id}/hide-post/${testPostId}`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');

    // the database was updated
    const updatedUser = await db.collection('Users').findOne({ _id: ObjectId(testUser0Id) });
    expect(updatedUser.hiddenPostIds).toEqual([new ObjectId(testPostId)]);
    const updatedPost = await db.collection('Posts').findOne({ _id: ObjectId(testPostId) });
    expect(updatedPost.hiddenBy).toEqual([new ObjectId(testUser0Id)]);
  });

  test('Post is unhidden by a user endpoint status code and response async/await', async () => {
    const resp = await request(webapp).put(`/users/${testUser0Id}/unhide-post/${testPostId}`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');

    // the database was updated
    const updatedUser = await db.collection('Users').findOne({ _id: ObjectId(testUser0Id) });
    expect(updatedUser.hiddenPostIds).toEqual([]);
    const updatedPost = await db.collection('Posts').findOne({ _id: ObjectId(testPostId) });
    expect(updatedPost.hiddenBy).toEqual([]);
  });

  // *************************************FOLLOW****************************************************
  test('Follow a user endpoint status code and response async/await', async () => {
    const resp = await request(webapp).put(`/follow/${testUser0Id}/${testUser1Id}`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');

    // the database was updated
    const updatedUser = await db.collection('Users').findOne({ _id: ObjectId(testUser0Id) });
    expect(updatedUser.follows).toStrictEqual([new ObjectId(testUser1Id)]);
    const followedUser = await db.collection('Users').findOne({ _id: ObjectId(testUser1Id) });
    expect(followedUser.followers).toStrictEqual([new ObjectId(testUser0Id)]);
  });

  test('Unfollow a user endpoint status code and response async/await', async () => {
    const resp = await request(webapp).put(`/unfollow/${testUser0Id}/${testUser1Id}`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');

    // the database was updated
    const updatedUser = await db.collection('Users').findOne({ _id: ObjectId(testUser0Id) });
    expect(updatedUser.follows).toStrictEqual([]);
    const followedUser = await db.collection('Users').findOne({ _id: ObjectId(testUser1Id) });
    expect(followedUser.followers).toStrictEqual([]);
  });

  // *************************************COMMENTS**************************************************
  test('Update a comment endpoint status code and response async/await', async () => {
    const resp = await request(webapp).put(`/comments/${testCommentId}`).set('Authorization', testUser0JWT)
      .send({ id: testCommentId, text: 'modified comment text' });
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');

    // the database was updated
    const updatedComment = await db.collection('Comments').findOne({ _id: ObjectId(testCommentId) });
    expect(updatedComment.text).toEqual('modified comment text');
  });

  // ****************************************POSTS**************************************************
  test('Update a post endpoint status code and response async/await', async () => {
    const resp = await request(webapp).put(`/posts/${testPostId}`).set('Authorization', testUser0JWT).set('Content-Type', 'multipart/form-data')
      .attach('File_0', filePath)
      .field('post', JSON.stringify({ ...testPost, id: testPostId, text: 'modified post text' }));
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');

    // the database was updated
    const updatedPost = await db.collection('Posts').findOne({ _id: ObjectId(testPostId) });
    expect(updatedPost.text).toEqual('modified post text');
    expect(updatedPost.mediaUrl).toContain('testImageFile.jpg');
    postS3MediaUrl = updatedPost.mediaUrl;
  });

  test('Update a post with removeMedia endpoint status code and response async/await', async () => {
    const resp = await request(webapp).put(`/posts/${testPostId}`).set('Authorization', testUser0JWT).set('Content-Type', 'multipart/form-data')
      .field('post', JSON.stringify({
        ...testPost, id: testPostId, text: 'modified post text1', mediaUrl: postS3MediaUrl,
      }))
      .field('removeMedia', true);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');

    // the database was updated
    const updatedPost = await db.collection('Posts').findOne({ _id: ObjectId(testPostId) });
    expect(updatedPost.text).toEqual('modified post text1');
    expect(updatedPost.mediaUrl).toEqual('');
  });

  test('Update a post text only endpoint status code and response async/await', async () => {
    const resp = await request(webapp).put(`/posts/${testPostId}`).set('Authorization', testUser0JWT).set('Content-Type', 'multipart/form-data')
      .field('post', JSON.stringify({ ...testPost, id: testPostId, text: 'modified post text2' }));
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');

    // the database was updated
    const updatedPost = await db.collection('Posts').findOne({ _id: ObjectId(testPostId) });
    expect(updatedPost.text).toEqual('modified post text2');
  });

  test('Post is liked by a user endpoint status code and response async/await', async () => {
    const resp = await request(webapp).put(`/posts/${testPostId}/likedby/${testUser0Id}`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');

    // the database was updated
    const updatedPost = await db.collection('Posts').findOne({ _id: ObjectId(testPostId) });
    expect(updatedPost.likes).toStrictEqual([new ObjectId(testUser0Id)]);
  });

  test('Post is unliked by a user endpoint status code and response async/await', async () => {
    const resp = await request(webapp).put(`/posts/${testPostId}/unlikedby/${testUser0Id}`).set('Authorization', testUser0JWT);
    expect(resp.status).toEqual(200);
    expect(resp.type).toBe('application/json');

    // the database was updated
    const updatedPost = await db.collection('Posts').findOne({ _id: ObjectId(testPostId) });
    expect(updatedPost.likes).toStrictEqual([]);
  });
});
