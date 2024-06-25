import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  createComment,
  readCommentById,
  updateComment,
  readSubCommentIdsByParentCommentId,
  getDescendantCommentIds,
  deleteComment,
  deleteCommentById,
  readAllCommentIdsByPostId,
  readAllSubCommentIdsByCommentId,
  readAllCommentIdsAndSubcommentIdsByPostId,
} from './comments';

const mock = new MockAdapter(axios);

const sampleComments = [
  {
    id: 1,
    userId: 1,
    postId: 1,
    parentCommentId: -1,
    text: 'Comment 1',
    createdDate: new Date().toISOString(),
  },
  {
    id: 2,
    userId: 2,
    postId: 1,
    parentCommentId: -1,
    text: 'Comment 2',
    createdDate: new Date().toISOString(),
  },
  {
    id: 3,
    userId: 3,
    postId: 1,
    parentCommentId: 1,
    text: 'Reply 1 to Comment 1',
    createdDate: new Date().toISOString(),
  },
];

describe('api comments.js', () => {
  beforeEach(() => {
    mock.reset();
  });

  test('Test createComment function', async () => {
    mock.onGet(`http://localhost:3001/Comments?postId=${sampleComments[0].postId}`).reply(200, []);
    mock.onPost('http://localhost:3001/Comments').reply(200, sampleComments[0]);

    const response = await createComment(
      sampleComments[0].userId,
      sampleComments[0].postId,
      sampleComments[0].parentCommentId,
      { text: sampleComments[0].text },
      [sampleComments[0].postId],
    );

    expect(response.status).toBe(200);
    expect(response.data).toStrictEqual(sampleComments[0]);
  });

  test('Test createComment function - Invalid Post ID', async () => {
    const allPostIds = [];
    try {
      await createComment(
        sampleComments[0].userId,
        sampleComments[0].postId,
        sampleComments[0].parentCommentId,
        { text: sampleComments[0].text },
        [allPostIds],
      );
    } catch (error) {
      expect(error.toString()).toBe('Error: Post does not exist! Please refresh the page!');
    }
  });

  test('Test createComment function - Invalid Parent Comment ID', async () => {
    mock.onGet(`http://localhost:3001/Comments?postId=${sampleComments[0].postId}`).reply(200, []);

    try {
      await createComment(
        sampleComments[0].userId,
        sampleComments[0].postId,
        4,
        { text: sampleComments[0].text },
        [sampleComments[0].postId],
      );
    } catch (error) {
      expect(error.toString()).toBe('Error: The Comment/Reply you are replying to does not exist! Please refresh the page!');
    }
  });

  test('Test readCommentById function', async () => {
    mock.onGet(`http://localhost:3001/Comments/${sampleComments[0].id}`).reply(200, sampleComments[0]);

    const response = await readCommentById(sampleComments[0].id);

    expect(response.status).toBe(200);
    expect(response.data).toStrictEqual(sampleComments[0]);
  });

  test('Test updateComment function', async () => {
    mock.onPut(`http://localhost:3001/Comments/${sampleComments[0].id}`).reply(200, { ...sampleComments[0], updatedDate: new Date().toISOString() });

    const response = await updateComment(sampleComments[0]);

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(sampleComments[0]);
  });

  test('Test readSubCommentIdsByParentCommentId function', async () => {
    mock.onGet(`http://localhost:3001/Comments?parentCommentId=${sampleComments[1].id}`).reply(200, [sampleComments[2]]);

    const response = await readSubCommentIdsByParentCommentId(sampleComments[1].id);

    expect(response).toStrictEqual([sampleComments[2].id]);
  });

  test('Test getDescendantCommentIds function', async () => {
    mock.onGet(`http://localhost:3001/Comments?parentCommentId=${sampleComments[1].id}`).reply(200, [sampleComments[2]]);
    mock.onGet(`http://localhost:3001/Comments?parentCommentId=${sampleComments[2].id}`).reply(200, []);

    const response = await getDescendantCommentIds(sampleComments[1].id);

    expect(response).toStrictEqual([sampleComments[2].id]);
  });

  test('Test deleteComment function', async () => {
    mock.onDelete('http://localhost:3001/Comments/1').reply(200);
    const response = await deleteComment(1);
    expect(response.status).toBe(200);
  });

  test('Test deleteCommentById function', async () => {
    mock.onGet(`http://localhost:3001/Comments?parentCommentId=${sampleComments[1].id}`).reply(200, [sampleComments[2]]);
    mock.onGet(`http://localhost:3001/Comments?parentCommentId=${sampleComments[2].id}`).reply(200, []);
    mock.onDelete(`http://localhost:3001/Comments/${sampleComments[1].id}`).reply(200);
    mock.onDelete(`http://localhost:3001/Comments/${sampleComments[2].id}`).reply(200);

    const response = await deleteCommentById(sampleComments[1].id);

    expect(response[0].status).toBe(200);
    expect(response[1].status).toBe(200);
  });

  test('Test readAllCommentIdsByPostId function', async () => {
    mock.onGet('http://localhost:3001/Comments?postId=1').reply(200, sampleComments);

    const response = await readAllCommentIdsByPostId(1);

    expect(response).toStrictEqual([1, 2]);
  });

  test('Test readAllSubCommentIdsByCommentId function', async () => {
    mock.onGet(`http://localhost:3001/Comments?parentCommentId=${sampleComments[1].id}`).reply(200, [sampleComments[2]]);

    const response = await readAllSubCommentIdsByCommentId(sampleComments[1].id);

    expect(response).toStrictEqual([3]);
  });

  test('Test readAllCommentIdsAndSubcommentIdsByPostId function', async () => {
    mock.onGet('http://localhost:3001/Comments?postId=1').reply(200, sampleComments);

    const response = await readAllCommentIdsAndSubcommentIdsByPostId(1);

    expect(response).toStrictEqual([1, 2, 3]);
  });
});
