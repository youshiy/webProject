import React from 'react';
import { render, screen } from '@testing-library/react';
import UnhidePost from './UnhidePost';

describe('UnhidePost component', () => {
  test('renders Unhide Post button', () => {
    render(<UnhidePost handleUnhidePost={() => { }}/>);
    const buttonText = screen.getByText(/Unhide Post/i);
    expect(buttonText).toBeInTheDocument();
  });
});
