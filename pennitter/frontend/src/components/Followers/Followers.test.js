import React from 'react';
import {
  render, screen, waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../axiosInstance';
import Followers from './Followers';

describe('Follow component', () => {
  const loggedInUserId = '2';
  const user0 = { id: '1', username: 'moneybaggg', profileImage: 'https://i.imgur.com/NUWSyFp.jpeg' };
  const user1 = { id: '3', username: 'user0', profileImage: 'https://i.imgur.com/NUWSyFp.jpeg' };
  const user2 = { id: '5', username: 'user2', profileImage: 'https://i.imgur.com/NUWSyFp.jpeg' };
  const followingList = [user0.id, user1.id, user2.id];
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    mock.onGet(new RegExp(`${'/users/followers/'}.*`)).reply(200, followingList);
    mock.onGet('/user/1').reply(200, user0);
    mock.onGet('/user/3').reply(200, user1);
    mock.onGet('/user/5').reply(200, user2);
  });

  afterEach(() => {
    mock.restore();
  });

  test('renders Followers and Pennitter Users headers', () => {
    render(
      <MemoryRouter>
        <Followers loggedInUserId={loggedInUserId} setAlert={() => { }} />
      </MemoryRouter>,
    );

    const screenTitle = screen.getByText('Followers');
    const usersTitle = screen.getByText('Pennitter Users');
    expect(screenTitle).toBeInTheDocument();
    expect(usersTitle).toBeInTheDocument();
  });

  test('renders followers', async () => {
    render(
      <MemoryRouter>
        <Followers loggedInUserId={loggedInUserId} setAlert={() => { }} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByAltText(/profile img/i)).toHaveLength(3);
    });
  });
});
