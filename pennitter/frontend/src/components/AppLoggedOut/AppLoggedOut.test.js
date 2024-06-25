import React from 'react';
import {
  render, screen,
} from '@testing-library/react';
import AppLoggedOut from './AppLoggedOut';

describe('AppLoggedOut component', () => {
  test('logged out: renders PENNITTER screen title and correct navigation links', () => {
    render(
      <AppLoggedOut setLoggedInUser={() => { }} setAlert={() => { }} />,
    );

    const titleText = screen.getAllByText('PENNITTER');
    const loginLink = screen.getAllByText('Login');
    const registrationLink = screen.getAllByText('Registration');

    expect(titleText).toHaveLength(2);
    expect(loginLink).toHaveLength(4);
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
});
