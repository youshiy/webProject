import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../axiosInstance';
import HeaderLoggedOut from './HeaderLoggedOut';
import HeaderLoggedIn from './HeaderLoggedIn';

describe('Header component', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    mock.onGet(new RegExp(`${'/profileimage'}.*`)).reply(200, 'https://i.imgur.com/NUWSyFp.jpeg');
  });

  afterEach(() => {
    mock.restore();
  });
  const loggedInUser = { id: 1, username: 'moneybaggg' };
  const loggedInUserProfileImage = 'https://i.imgur.com/NUWSyFp.jpeg';

  test('logged out: renders PENNITTER screen title and correct navigation links', () => {
    render(
      <MemoryRouter>
        <HeaderLoggedOut />
      </MemoryRouter>,
    );

    const titleText = screen.getAllByText('PENNITTER');
    const loginLink = screen.getAllByText('Login');
    const registrationLink = screen.getAllByText('Registration');

    expect(titleText).toHaveLength(2);
    expect(loginLink).toHaveLength(2);
    expect(registrationLink).toHaveLength(2);

    titleText.forEach((element) => {
      expect(element).toBeInTheDocument();
    });
    loginLink.forEach((element) => {
      expect(element).toBeInTheDocument();
    });
    registrationLink.forEach((element) => {
      expect(element).toBeInTheDocument();
    });
  });

  test('logged out: simulate window resize', () => {
    render(
      <MemoryRouter>
        <HeaderLoggedOut />
      </MemoryRouter>,
    );

    const titleText = screen.getAllByText('PENNITTER');
    expect(titleText).toHaveLength(2);

    // Simulate a window resize event
    window.innerWidth = 800; // Set to your desired width
    window.dispatchEvent(new Event('resize'));
    expect(titleText).toHaveLength(2);

    // Simulate a window resize event
    window.innerWidth = 1000; // Set to your desired width
    window.dispatchEvent(new Event('resize'));
    expect(titleText).toHaveLength(2);

    // Simulate a window resize event
    window.innerWidth = 800; // Set to your desired width
    window.dispatchEvent(new Event('resize'));
    expect(titleText).toHaveLength(2);
  });

  test('logged in: renders PENNITTER screen title, users username, and correct navigation links', () => {
    render(
      <MemoryRouter>
        <HeaderLoggedIn loggedInUser={loggedInUser}
          setLoggedInUser={() => { }} setAlert={() => { }}
        />
      </MemoryRouter>,
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
  });

  test('logged in: user profile image displays', async () => {
    render(
      <MemoryRouter>
        <HeaderLoggedIn loggedInUser={loggedInUser}
          setLoggedInUser={() => { }} setAlert={() => { }}
        />
      </MemoryRouter>,
    );

    const imageElement = screen.getByAltText('Profile Pic');

    await waitFor(() => {
      expect(imageElement).toBeInTheDocument();
      expect(imageElement).toHaveAttribute('src', loggedInUserProfileImage);
    });
  });

  test('logged in: open and close settings menu', async () => {
    render(
      <MemoryRouter>
        <HeaderLoggedIn loggedInUser={loggedInUser}
          setLoggedInUser={() => { }} setAlert={() => { }}
        />
      </MemoryRouter>,
    );

    const imageElement = screen.getByAltText('Profile Pic');

    await waitFor(() => {
      expect(imageElement).toBeInTheDocument();
      expect(imageElement).toHaveAttribute('src', loggedInUserProfileImage);
    });
    // open
    fireEvent.click(imageElement);
    // close
    fireEvent.click(imageElement);
  });

  test('logged in: simulate window resize', () => {
    render(
      <MemoryRouter>
        <HeaderLoggedIn loggedInUser={loggedInUser}
          setLoggedInUser={() => { }} setAlert={() => { }}
        />
      </MemoryRouter>,
    );

    const titleText = screen.getAllByText('PENNITTER');
    expect(titleText).toHaveLength(2);

    // Simulate a window resize event
    window.innerWidth = 800; // Set to your desired width
    window.dispatchEvent(new Event('resize'));
    expect(titleText).toHaveLength(2);

    // Simulate a window resize event
    window.innerWidth = 1000; // Set to your desired width
    window.dispatchEvent(new Event('resize'));
    expect(titleText).toHaveLength(2);

    // Simulate a window resize event
    window.innerWidth = 800; // Set to your desired width
    window.dispatchEvent(new Event('resize'));
    expect(titleText).toHaveLength(2);
  });
});
