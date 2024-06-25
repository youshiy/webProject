import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import registerUser from './authentication';

const mock = new MockAdapter(axios);

const testUsername = 'testuser';
const testEmail = 'testuser@example.com';
const testPassword = 'TestUser!1';
describe('api authentication.js', () => {
  beforeEach(() => {
    mock.reset();
  });
  test('registerUser should make a POST request and register a user', async () => {
    mock.onPost('http://localhost:3001/Users').reply(201, {
      id: 1,
      username: testUsername,
      email: testEmail,
      password: testPassword,
      profileImage: 'https://static.vecteezy.com/system/resources/thumbnails/002/608/327/small/mobile-application-avatar-web-button-menu-digital-silhouette-style-icon-free-vector.jpg',
    });

    const response = await registerUser(
      testUsername,
      testEmail,
      testPassword,
    );

    expect(response.status).toBe(201);
    expect(response.data).toStrictEqual({
      id: 1,
      username: testUsername,
      email: testEmail,
      password: testPassword,
      profileImage: 'https://static.vecteezy.com/system/resources/thumbnails/002/608/327/small/mobile-application-avatar-web-button-menu-digital-silhouette-style-icon-free-vector.jpg',
    });
  });

  test('registerUser should handle errors', async () => {
    mock.onPost('http://localhost:3001/Users').reply(400);

    try {
      await registerUser(
        testUsername,
        testEmail,
        testPassword,
      );
    } catch (error) {
      expect(error).toBe('Error: Request failed with status code 400');
    }
  });
});
