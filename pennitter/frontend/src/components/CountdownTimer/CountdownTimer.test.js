import React from 'react';
import { render, screen } from '@testing-library/react';
import CountdownTimer from './CountdownTimer';

describe('CountdownTimer component', () => {
  test('renders seconds remaining message', () => {
    const initialSeconds = 60;
    render(<CountdownTimer initialSeconds={initialSeconds} timeExpiredCallback={() => { }}/>);
    const countdownText = screen.getByText(/Countdown:/i);
    expect(countdownText).toBeInTheDocument();
    const secondsText = screen.getByText(/seconds/i);
    expect(secondsText).toBeInTheDocument();
  });
});
