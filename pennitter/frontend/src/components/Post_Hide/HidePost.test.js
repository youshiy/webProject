import React from 'react';
import { render, screen } from '@testing-library/react';
import HidePost from './HidePost';

describe('HidePost component', () => {
  test('renders Hide Post button', () => {
    render(<HidePost handleHidePost={() => { }}/>);
    const buttonText = screen.getByText(/Hide Post/i);
    expect(buttonText).toBeInTheDocument();
  });
});
