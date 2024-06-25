import {
  createPost,
  readAllPostIds,
  readAllPostIdsByUserId,
  readActivityFeedPostIds,
  readPostById,
  updatePost,
  deletePostById,
  deleteAllPostsByUserId,
} from './posts';

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const mock = new MockAdapter(axios);

const samplePosts = [
  {
    id: 1,
    userId: 1,
    text: 'Test Post 1',
    mediaUrl: 'https://www.youtube.com/embed/eVTXPUF4Oz4?si=DRbF1eHqAcpLwDSN',
    createdDate: '2023-10-16T12:00:00Z',
  },
  {
    id: 2,
    userId: 2,
    text: 'Test Post 2',
    mediaUrl: 'https://www.youtube.com/embed/6XIQR4p30Wo?si=aprGN7HFCvycmQfK',
    createdDate: '2023-10-16T12:15:00Z',
  },
];

describe('api posts.js', () => {
  beforeEach(() => {
    mock.reset();
  });

  test('Test createPost function', async () => {
    mock.onPost('http://localhost:3001/Posts').reply(201, samplePosts[0]);

    const response = await createPost(samplePosts[0].id, {
      text: samplePosts[0].text,
      mediaUrl: samplePosts[0].mediaUrl,
    });

    expect(response.status).toBe(201);
    expect(response.data).toStrictEqual(samplePosts[0]);
  });

  test('Test createPost function - Error response', async () => {
    mock.onPost('http://localhost:3001/Posts').reply(400);

    try {
      await createPost(samplePosts[0].id, {
        text: samplePosts[0].text,
        mediaUrl: samplePosts[0].mediaUrl,
      });
    } catch (err) {
      expect(err).toBe('Error: Request failed with status code 400');
    }
  });

  test('Test readAllPostIds function', async () => {
    mock.onGet('http://localhost:3001/Posts').reply(200, samplePosts);

    const response = await readAllPostIds();

    const ids = samplePosts.map((post) => post.id);
    expect(response).toStrictEqual(ids);
  });

  test('Test readAllPostIds function no Posts', async () => {
    mock.onGet('http://localhost:3001/Posts').reply(200, []);

    const response = await readAllPostIds();

    expect(response).toStrictEqual([]);
  });

  test('Test readAllPostIds function - Error response', async () => {
    mock.onGet('http://localhost:3001/Posts').reply(400);

    try {
      await readAllPostIds();
    } catch (err) {
      expect(err).toBe('Error: Request failed with status code 400');
    }
  });

  test('Test readAllPostIdsByUserId function', async () => {
    mock.onGet(`http://localhost:3001/Posts?userId=${samplePosts[0].userId}`).reply(200, [samplePosts[0]]);

    const response = await readAllPostIdsByUserId(samplePosts[0].userId);

    expect(response).toStrictEqual([samplePosts[0].id]);
  });

  test('Test readAllPostIdsByUserId function - Error response', async () => {
    mock.onGet(`http://localhost:3001/Posts?userId=${samplePosts[0].userId}`).reply(400);

    try {
      await readAllPostIdsByUserId(samplePosts[0].userId);
    } catch (err) {
      expect(err).toBe('Error: Request failed with status code 400');
    }
  });

  test('Test readActivityFeedPostIds function', async () => {
    mock.onGet('http://localhost:3001/Users/1').reply(200, { follows: [2] });
    mock.onGet('http://localhost:3001/Posts').reply(200, samplePosts);

    const response = await readActivityFeedPostIds(1);

    expect(response).toStrictEqual([samplePosts[1].id, samplePosts[0].id]);
  });

  test('Test readActivityFeedPostIds function - Error response', async () => {
    mock.onGet('http://localhost:3001/Users/1').reply(200, { follows: [2] });
    mock.onGet('http://localhost:3001/Posts').reply(400);

    try {
      await readActivityFeedPostIds(1);
    } catch (err) {
      expect(err).toBe('Error: Request failed with status code 400');
    }
  });

  test('Test readPostById function', async () => {
    mock.onGet(`http://localhost:3001/Posts/${samplePosts[0].id}`).reply(200, samplePosts[0]);

    const response = await readPostById(samplePosts[0].id);

    expect(response.status).toBe(200);
    expect(response.data).toStrictEqual(samplePosts[0]);
  });

  test('Test updatePost function', async () => {
    mock.onPut(`http://localhost:3001/Posts/${samplePosts[0].id}`).reply(200, { ...samplePosts[0], updatedDate: new Date().toISOString() });

    const response = await updatePost(samplePosts[0]);

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(samplePosts[0]);
  });

  test('Test deletePostById function', async () => {
    mock.onGet(`http://localhost:3001/Comments?postId=${samplePosts[0].id}`).reply(200, []);
    mock.onDelete(`http://localhost:3001/Posts/${samplePosts[0].id}`).reply(200);

    const response = await deletePostById(samplePosts[0].id);

    expect(response.status).toBe(200);
  });

  test('Test deleteAllPostsByUserId function', async () => {
    mock.onGet(`http://localhost:3001/Posts?userId=${samplePosts[0].userId}`).reply(200, [samplePosts[0]]);
    mock.onGet(`http://localhost:3001/Comments?postId=${samplePosts[0].id}`).reply(200, []);
    mock.onDelete(`http://localhost:3001/Posts/${samplePosts[0].id}`).reply(200);

    const response = await deleteAllPostsByUserId(samplePosts[0].id);

    expect(response[0].status).toBe(200);
  });
});
