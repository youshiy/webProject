import React from 'react';
import {
  render, screen, waitFor, getByRole,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../axiosInstance';
import ActivityFeedScreen from './ActivityFeedScreen';

describe('ActivityFeed component', () => {
  const loggedInUserId = '2';
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  test('renders Activity Feed page header', async () => {
    mock.onGet(`/posts/activity-feed/${loggedInUserId}`).reply(200, []);
    mock.onGet(`/posts/user/${loggedInUserId}`).reply(200, []);
    mock.onGet(`/users/${loggedInUserId}/hidden-posts`).reply(200, []);
    jest.useFakeTimers();
    render(<ActivityFeedScreen loggedInUserId={loggedInUserId} setAlert={() => { }} />);
    const screenTitle = screen.getByText('Activity Feed');
    expect(screenTitle).toBeInTheDocument();
    jest.advanceTimersByTime(6000); // Advance time by 6 seconds

    userEvent.click(getByRole(screen.getByTestId('view-select'), 'combobox'));
    await waitFor(() => userEvent.click(screen.getByText(/^Posts from Users you follow$/i)));
  });

  test('renders Activity Feed page header, bad data fetch', async () => {
    const setAlert = jest.fn();
    mock.onGet(`/posts/activity-feed/${loggedInUserId}`).reply(401, { message: 'Failed Authentication' });
    render(<ActivityFeedScreen loggedInUserId={loggedInUserId} setAlert={setAlert} />);

    await waitFor(() => {
      expect(setAlert).toHaveBeenCalledTimes(1);
      expect(setAlert).toHaveBeenCalledWith({ severity: 'error', message: 'Error fetching Posts: Failed Authentication' });
    });
  });
});
