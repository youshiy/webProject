import React from 'react';
import {
  render, screen,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../axiosInstance';
import AppLoggedIn from './AppLoggedIn';

describe('Header component', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    mock.onGet('/isTokenExpiration1Minute').reply(200, true);
    mock.onGet(new RegExp(`${'/user-ids-usernames'}.*`)).reply(200, [{ id: '2', username: 'testusername' }]);
  });

  afterEach(() => {
    mock.restore();
  });
  const loggedInUser = { id: '1', username: 'moneybaggg' };

  test('logged in: renders PENNITTER screen title, users username, and correct navigation links', () => {
    jest.useFakeTimers();
    render(
      <AppLoggedIn loggedInUser={loggedInUser} setLoggedInUser={() => { }} setAlert={() => { }} />,
    );

    const titleText = screen.getAllByText('PENNITTER');
    const usernameText = screen.getByText(loggedInUser.username);
    const activityFeedLink = screen.getAllByText('Activity Feed');
    const findAndFollowLink = screen.getAllByText('Find & Follow');
    const profileFeedLink = screen.getAllByText('My Profile Feed');
    const profileSettingsLink = screen.getByText('My Profile Settings');

    expect(usernameText).toBeInTheDocument();
    expect(profileSettingsLink).toBeInTheDocument();

    expect(titleText).toHaveLength(2);
    expect(activityFeedLink).toHaveLength(2);
    expect(findAndFollowLink).toHaveLength(2);
    expect(profileFeedLink).toHaveLength(2);

    titleText.forEach((element) => {
      expect(element).toBeInTheDocument();
    });
    activityFeedLink.forEach((element) => {
      expect(element).toBeInTheDocument();
    });
    findAndFollowLink.forEach((element) => {
      expect(element).toBeInTheDocument();
    });
    profileFeedLink.forEach((element) => {
      expect(element).toBeInTheDocument();
    });
    jest.advanceTimersByTime(6000); // Advance time by 6 seconds
  });
});
