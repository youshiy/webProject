import {
  readAllIdsUsernamesImagesNotYou,
  readWhoUserFollows,
  unfollowUser,
  followUser,
  allUsersUnfollowThisUserId,
} from './follow';

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const mock = new MockAdapter(axios);

describe('api follow.js', () => {
  beforeEach(() => {
    mock.reset();
  });
  const usersData = [
    {
      id: 1, username: 'user1', profileImage: 'image1.jpg', follows: [2],
    },
    {
      id: 2, username: 'user2', profileImage: 'image2.jpg', follows: [1, 3],
    },
    {
      id: 3, username: 'user3', profileImage: 'image3.jpg', follows: [1],
    },
  ];

  test('Test readAllIdsUsernamesImagesNotYou function', async () => {
    mock.onGet('http://localhost:3001/Users').reply(200, usersData);
    const response = await readAllIdsUsernamesImagesNotYou(usersData[0].id);

    const expectedResponse = usersData
      .map(({ id, username, profileImage }) => ({ id, username, profileImage }));
    expect(response).toStrictEqual([expectedResponse[1], expectedResponse[2]]);
  });

  test('Test readAllIdsUsernamesImagesNotYou function no users', async () => {
    mock.onGet('http://localhost:3001/Users').reply(200, []);
    const response = await readAllIdsUsernamesImagesNotYou(usersData[0].id);

    expect(response).toStrictEqual([]);
  });

  test('Test readWhoUserFollows function', async () => {
    mock.onGet(`http://localhost:3001/Users/${usersData[0].id}`).reply(200, usersData[0]);
    const response = await readWhoUserFollows(usersData[0].id);

    expect(response).toStrictEqual(usersData[0].follows);
  });

  test('Test readWhoUserFollows function has no follows', async () => {
    const { follows, ...noFollowsUser } = usersData[0];
    mock.onGet(`http://localhost:3001/Users/${usersData[0].id}`).reply(200, { noFollowsUser });
    const response = await readWhoUserFollows(usersData[0].id);

    expect(response).toStrictEqual([]);
  });

  test('Test unfollowUser function', async () => {
    const user1FollowsRemoved = usersData[0].follows.filter((x) => x !== usersData[1].id);
    mock.onGet(`http://localhost:3001/Users/${usersData[0].id}`).reply(200, usersData[0]);
    mock.onPut(`http://localhost:3001/Users/${usersData[0].id}`, { ...usersData[0], follows: user1FollowsRemoved })
      .reply(200, { ...usersData[0], follows: user1FollowsRemoved });
    const response = await unfollowUser(usersData[0].id, usersData[1].id);

    expect(response.status).toBe(200);
    expect(response.data).toStrictEqual({ ...usersData[0], follows: user1FollowsRemoved });
  });

  test('Test unfollowUser function has no follows', async () => {
    const { follows, ...noFollowsUser } = usersData[0];
    mock.onGet(`http://localhost:3001/Users/${usersData[0].id}`).reply(200, { noFollowsUser });
    const response = await unfollowUser(usersData[0].id, usersData[1].id);

    expect(response).toBe(200);
  });

  test('Test followUser function', async () => {
    const user1FollowsAdded = [...usersData[0].follows, usersData[2].id];
    mock.onGet('http://localhost:3001/Users').reply(200, usersData);
    mock.onGet(`http://localhost:3001/Users/${usersData[0].id}`).reply(200, usersData[0]);
    mock.onPut(`http://localhost:3001/Users/${usersData[0].id}`, { ...usersData[0], follows: user1FollowsAdded })
      .reply(200, { ...usersData[0], follows: user1FollowsAdded });

    const response = await followUser(usersData[0].id, usersData[2].id);

    expect(response.status).toBe(200);
    expect(response.data).toStrictEqual({ ...usersData[0], follows: user1FollowsAdded });
  });

  test('Test allUsersUnfollowThisUserId function', async () => {
    const user2FollowsRemoved = usersData[1].follows.filter((x) => x !== usersData[0].id);
    const user3FollowsRemoved = usersData[2].follows.filter((x) => x !== usersData[0].id);
    mock.onGet('http://localhost:3001/Users').reply(200, usersData);
    mock.onGet(`http://localhost:3001/Users/${usersData[1].id}`).reply(200, usersData[1]);
    mock.onGet(`http://localhost:3001/Users/${usersData[2].id}`).reply(200, usersData[2]);
    mock.onPut(`http://localhost:3001/Users/${usersData[1].id}`, { ...usersData[1], follows: user2FollowsRemoved })
      .reply(200, { ...usersData[1], follows: user2FollowsRemoved });
    mock.onPut(`http://localhost:3001/Users/${usersData[2].id}`, { ...usersData[2], follows: user3FollowsRemoved })
      .reply(200, { ...usersData[2], follows: user3FollowsRemoved });
    const response = await allUsersUnfollowThisUserId(usersData[0].id);

    expect(response[0].status).toBe(200);
    expect(response[0].data).toStrictEqual({ ...usersData[1], follows: user2FollowsRemoved });

    expect(response[1].status).toBe(200);
    expect(response[1].data).toStrictEqual({ ...usersData[2], follows: user3FollowsRemoved });
  });
});
