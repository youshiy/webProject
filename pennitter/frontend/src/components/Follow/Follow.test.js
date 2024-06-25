import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../axiosInstance';
import Follow from './Follow';

describe('Follow component', () => {
  const loggedInUserId = '2';
  const followsUsername0 = { id: '1', username: 'moneybaggg', profileImage: 'https://i.imgur.com/NUWSyFp.jpeg' };
  const followsUsername1 = { id: '3', username: 'user0', profileImage: 'https://i.imgur.com/NUWSyFp.jpeg' };
  const followsUsername2 = { id: '5', username: 'user2', profileImage: 'https://i.imgur.com/NUWSyFp.jpeg' };
  const doesNotFollowUsername = { id: '4', username: 'user1', profileImage: 'https://i.imgur.com/NUWSyFp.jpeg' };
  const userList = [followsUsername0, followsUsername1, followsUsername2, doesNotFollowUsername];
  const folowingList = [followsUsername0.id, followsUsername1.id, followsUsername2.id];
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    mock.onGet(new RegExp(`${'/users/exclude/'}.*`)).reply(200, userList);
    mock.onGet(new RegExp(`${'/users/follows/'}.*`)).reply(200, folowingList);
    mock.onPut(new RegExp(`${'/follow/'}.*`)).reply(200);
    mock.onPut(new RegExp(`${'/unfollow/'}.*`)).reply(200);
  });

  afterEach(() => {
    mock.restore();
  });

  test('renders Find & Follow and Pennitter Users headers', () => {
    render(
      <MemoryRouter>
        <Follow loggedInUserId={loggedInUserId} ownerUser={null} setAlert={() => { }} />
      </MemoryRouter>,
    );

    const screenTitle = screen.getByText('Find & Follow');
    const usersTitle = screen.getByText('Pennitter Users');
    expect(screenTitle).toBeInTheDocument();
    expect(usersTitle).toBeInTheDocument();
  });

  test('renders users to follow/unfollow, and the respective follow/unfollow buttons for each user', async () => {
    render(
      <MemoryRouter>
        <Follow loggedInUserId={loggedInUserId} ownerUser={null} setAlert={() => { }} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByAltText(/profile img/i)).toHaveLength(4);
    });

    const followsUsername0Text = screen.getByText(followsUsername0.username);
    const followsUsername1Text = screen.getByText(followsUsername1.username);
    const followsUsername2Text = screen.getByText(followsUsername2.username);
    const doesNotFollowUsernameText = screen.getByText(doesNotFollowUsername.username);

    expect(followsUsername0Text).toBeInTheDocument();
    expect(followsUsername1Text).toBeInTheDocument();
    expect(followsUsername2Text).toBeInTheDocument();
    expect(doesNotFollowUsernameText).toBeInTheDocument();

    const followsUsername0Button = screen.getByTestId(followsUsername0.id);
    const followsUsername1Button = screen.getByTestId(followsUsername1.id);
    const followsUsername2Button = screen.getByTestId(followsUsername2.id);
    const doesNotFollowUsernameButton = screen.getByTestId(doesNotFollowUsername.id);

    expect(followsUsername0Button).toBeInTheDocument();
    expect(followsUsername1Button).toBeInTheDocument();
    expect(followsUsername2Button).toBeInTheDocument();
    expect(doesNotFollowUsernameButton).toBeInTheDocument();

    expect(followsUsername0Button).toHaveTextContent('Unfollow');
    expect(followsUsername1Button).toHaveTextContent('Unfollow');
    expect(followsUsername2Button).toHaveTextContent('Unfollow');
    expect(doesNotFollowUsernameButton).toHaveTextContent('Follow');
  });

  test('follow user', async () => {
    render(
      <MemoryRouter>
        <Follow loggedInUserId={loggedInUserId} ownerUser={null} setAlert={() => { }} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByAltText(/profile img/i)).toHaveLength(4);
    });

    const doesNotFollowUsernameText = screen.getByText(doesNotFollowUsername.username);
    expect(doesNotFollowUsernameText).toBeInTheDocument();

    const doesNotFollowUsernameButton = screen.getByTestId(doesNotFollowUsername.id);
    expect(doesNotFollowUsernameButton).toBeInTheDocument();
    expect(doesNotFollowUsernameButton).toHaveTextContent('Follow');

    fireEvent.click(doesNotFollowUsernameButton);
  });

  test('unfollow user', async () => {
    render(
      <MemoryRouter>
        <Follow loggedInUserId={loggedInUserId} ownerUser={null} setAlert={() => { }} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByAltText(/profile img/i)).toHaveLength(4);
    });

    const followsUsername0UsernameText = screen.getByText(followsUsername0.username);
    expect(followsUsername0UsernameText).toBeInTheDocument();

    const followsUsername0UsernameButton = screen.getByTestId(followsUsername0.id);
    expect(followsUsername0UsernameButton).toBeInTheDocument();
    expect(followsUsername0UsernameButton).toHaveTextContent('Unfollow');

    fireEvent.click(followsUsername0UsernameButton);
  });
});
