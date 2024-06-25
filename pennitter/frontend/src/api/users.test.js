import {
  createUser,
  readAllUsers,
  readUserById,
  readAllUserIds,
  readAllIdsUsernames,
  readIdUsernameAndProfilePictureById,
  updateUser,
  deleteUserById,
} from './users';

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const mock = new MockAdapter(axios);

const sampleUser = {
  id: 1,
  username: 'testuser',
  email: 'testuser@example.com',
  password: '123adc',
  profileImage: 'https://thumbs.dreamstime.com/b/money-bag-filled-dollars-24929385.jpg',
};

describe('api users.js', () => {
  beforeEach(() => {
    mock.reset();
  });

  test('createUser should make a POST request and create a user', async () => {
    mock.onPost('http://localhost:3001/Users').reply(201, sampleUser);

    const response = await createUser(
      sampleUser.username,
      sampleUser.email,
      sampleUser.password,
    );

    expect(response.status).toBe(201);
    expect(response.data).toEqual(sampleUser);
  });

  test('createUser should make a POST request - Error response', async () => {
    mock.onPost('http://localhost:3001/Users').reply(400);

    try {
      await createUser(
        sampleUser.username,
        sampleUser.email,
        sampleUser.password,
      );
    } catch (err) {
      expect(err).toBe('Error: Request failed with status code 400');
    }
  });

  test('readAllUsers should make a GET request and return a list of users', async () => {
    mock.onGet('http://localhost:3001/Users').reply(200, [sampleUser]);

    const response = await readAllUsers();

    expect(response.status).toBe(200);
    expect(response.data).toEqual([sampleUser]);
  });

  test('readAllUsers should make a GET request - Error response', async () => {
    mock.onGet('http://localhost:3001/Users').reply(400, [sampleUser]);

    try {
      await readAllUsers();
    } catch (err) {
      expect(err).toBe('Error: Request failed with status code 400');
    }
  });

  test('readUserById should make a GET request and return a specific user', async () => {
    mock.onGet('http://localhost:3001/Users/1').reply(200, sampleUser);

    const response = await readUserById(1);

    expect(response.status).toBe(200);
    expect(response.data).toEqual(sampleUser);
  });

  test('readAllUserIds should return an empty array when response.data is empty', async () => {
    const users = [];
    mock.onGet('http://localhost:3001/Users').reply(200, users);

    const response = await readAllUserIds();

    expect(response).toStrictEqual(users);
  });

  test('readAllUserIds should return an array of user IDs when response.data is not empty', async () => {
    mock.onGet('http://localhost:3001/Users').reply(200, [sampleUser]);

    const response = await readAllUserIds();

    expect(response).toEqual([sampleUser.id]);
  });

  test('readAllIdsUsernames should make a GET request and return user ids and usernames', async () => {
    mock.onGet('http://localhost:3001/Users').reply(200, [sampleUser]);

    const response = await readAllIdsUsernames();

    expect(response).toEqual([{
      id: sampleUser.id,
      username: sampleUser.username,
    }]);
  });

  test('readAllIdsUsernames should make a GET request and return empty array', async () => {
    mock.onGet('http://localhost:3001/Users').reply(200, []);

    const response = await readAllIdsUsernames();

    expect(response).toStrictEqual([]);
  });

  test('readIdUsernameAndProfilePictureById should make a GET request and return user data', async () => {
    mock.onGet('http://localhost:3001/Users/1').reply(200, sampleUser);

    const response = await readIdUsernameAndProfilePictureById(1);

    expect(response).toStrictEqual({
      id: sampleUser.id,
      username: sampleUser.username,
      profileImage: sampleUser.profileImage,
    });
  });

  test('updateUser should make a PUT request and update a user', async () => {
    mock.onPut('http://localhost:3001/Users/1').reply(200, sampleUser);

    const response = await updateUser(sampleUser);

    expect(response.status).toBe(200);
    expect(response.data).toEqual(sampleUser);
  });

  test('deleteUserById should make a DELETE request and update a user', async () => {
    mock.onDelete('http://localhost:3001/Users/1').reply(200);

    const response = await deleteUserById(1);

    expect(response.status).toBe(200);
  });
});
