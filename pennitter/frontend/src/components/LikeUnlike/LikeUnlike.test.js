import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LikeUnlikeButton from './LikeUnlike';

describe('LikeUnlike component', () => {
  test('renders liked LikeUnlike component', () => {
    render(<LikeUnlikeButton isLiked={true} likeCount={1}
      onLike={() => { }} onUnlike={() => { }} />);
    const numLikesButton = screen.getByText(/Likes/i);
    fireEvent.click(numLikesButton);
    expect(numLikesButton).toBeInTheDocument();
  });
  test('renders non-liked LikeUnlike component', () => {
    render(<LikeUnlikeButton isLiked={false} likeCount={1}
      onLike={() => { }} onUnlike={() => { }} />);
    const numLikesButton = screen.getByText(/Likes/i);
    fireEvent.click(numLikesButton);
    expect(numLikesButton).toBeInTheDocument();
  });
});
