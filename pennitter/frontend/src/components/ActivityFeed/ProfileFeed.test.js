import React from 'react';
import {
  render, screen, waitFor, getByRole,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../axiosInstance';
import ProfileFeedScreen from './ProfileFeedScreen';

describe('ProfileFeed component', () => {
  const loggedInUserId = '2';
  const followsUsername0 = { id: '1', username: 'moneybaggg' };
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  test('renders {usernames}s page header (on user page) and Loading Feed text', async () => {
    mock.onGet(`/posts/user/${followsUsername0.id}`).reply(200, []);
    mock.onGet(`/users/${loggedInUserId}/hidden-posts`).reply(200, []);
    jest.useFakeTimers();
    render(<ProfileFeedScreen loggedInUserId={loggedInUserId}
      ownerUser={followsUsername0} setAlert={() => { }} />);
    const screenTitle = screen.getByText(`${followsUsername0.username}'s Profile Feed`);
    expect(screenTitle).toBeInTheDocument();
    jest.advanceTimersByTime(6000); // Advance time by 6 seconds

    userEvent.click(getByRole(screen.getByTestId('view-select'), 'combobox'));
    await waitFor(() => userEvent.click(screen.getByText(/^Posts from this User you have Hidden$/i)));
  });
});
