import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../axiosInstance';
import NewPost from './NewPost';
import ExistingPost from './ExistingPost';

describe('Post component', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });
  const loggedInUserId = '1';
  const loggedInUser = { id: '1', username: 'moneybaggg', profileImage: 'https://i.imgur.com/NUWSyFp.jpeg' };
  const newPostId = '0';
  const realPostId = '7';
  const post = {
    id: realPostId, userId: '1', text: 'hello', mediaUrl: '', createdDate: new Date().toISOString(), updatedDate: null, hiddenBy: [], likes: [], commentIds: [],
  };
  const realCommentId = '1';
  const comment = {
    userId: '1', parentCommentId: '-1', text: 'hello', createdDate: new Date().toISOString(), updatedDate: null,
  };

  test('renders New Post section, creates new post', async () => {
    mock.onPost(new RegExp(`${'/posts'}.*`)).reply(201, '25');
    const setAlert = jest.fn();
    render(
      <MemoryRouter>
        <NewPost postId={newPostId} loggedInUserId={loggedInUserId}
          setAlert={setAlert} addToPostIds={() => { }} />
      </MemoryRouter>,
    );

    const postTextArea = screen.getByPlaceholderText('Start your post here...');
    const postMediaArea = screen.getByTestId(`mediaPreview${newPostId}`);
    const createPostButton = screen.getByText('Create Post');

    expect(postTextArea).toBeInTheDocument();
    expect(postMediaArea).toBeInTheDocument();
    expect(createPostButton).toBeInTheDocument();

    fireEvent.change(postTextArea, { target: { value: 'test post' } });
    expect(postTextArea).toHaveValue('test post');

    fireEvent.click(createPostButton);

    await waitFor(() => {
      expect(setAlert).toHaveBeenCalledTimes(1);
      expect(setAlert).toHaveBeenCalledWith({ severity: 'success', message: 'Post Created!' });
    });
  });

  test('renders PostId 7, click Edit Post, confirm that we are in Edit mode, change and verify post text and media, then click Cancel Edit Post button', async () => {
    mock.onGet(`/posts/${realPostId}`).reply(200, post);
    mock.onGet('/user/1').reply(200, loggedInUser);
    mock.onGet(new RegExp(`${'/posts/'}.*`)).reply(200, []);
    render(
    <MemoryRouter>
      <ExistingPost postId={realPostId} loggedInUserId={loggedInUserId}
        setAlert={() => { }} removeFromPostIds={() => { }} />
    </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Post')).toBeInTheDocument();
      expect(screen.getByText('Delete Post')).toBeInTheDocument();
    });

    const editPostButton = screen.getByText('Edit Post');
    expect(editPostButton).toBeInTheDocument();

    fireEvent.click(editPostButton);

    await waitFor(() => {
      expect(screen.getByText('Cancel Edit')).toBeInTheDocument();
      expect(screen.getByText('Update Post')).toBeInTheDocument();
    });

    const postText = screen.getByPlaceholderText('Update your post here...');
    const postMediaInput = screen.getByTestId('mediaPreview7');
    expect(postText).toBeInTheDocument();
    expect(postMediaInput).toBeInTheDocument();

    fireEvent.change(postText, { target: { value: 'testuser!!!' } });
    expect(postText).toHaveValue('testuser!!!');

    const content = 'x'.repeat(1024); // Create content with a specified length (bytes)
    let file = new File([content], 'example.png', { type: 'image/png' });
    fireEvent.change(postMediaInput, { target: { files: [file] } });
    file = new File([content], 'example.mp4', { type: 'video/mp4' });
    fireEvent.change(postMediaInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Clear Media')).toBeInTheDocument();
    });
    const clearMediaButton = screen.getByText('Clear Media');

    fireEvent.click(clearMediaButton);

    const cancelEditButton = screen.getByText('Cancel Edit');
    expect(cancelEditButton).toBeInTheDocument();

    fireEvent.click(cancelEditButton);

    await waitFor(() => {
      expect(screen.getByText('Edit Post')).toBeInTheDocument();
      expect(screen.getByText('Delete Post')).toBeInTheDocument();
    });
  });

  test('renders PostId 7, click Delete Post button, confirm that Confirm Delete dialog appears, then Cancel the Delete', async () => {
    mock.onGet(`/posts/${realPostId}`).reply(200, post);
    mock.onGet('/user/1').reply(200, loggedInUser);
    mock.onGet(new RegExp(`${'/posts/'}.*`)).reply(200, []);
    render(
    <MemoryRouter>
      <ExistingPost postId={realPostId} loggedInUserId={loggedInUserId}
        setAlert={() => { }} removeFromPostIds={() => { }} />
    </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Post')).toBeInTheDocument();
      expect(screen.getByText('Delete Post')).toBeInTheDocument();
    });

    const deletePostButton = screen.getByText('Delete Post');
    expect(deletePostButton).toBeInTheDocument();

    fireEvent.click(deletePostButton);

    await waitFor(() => {
      expect(screen.getByText('Are you sure you want to delete this post? All comments and replies on this post will also be deleted! This action cannot be reversed!')).toBeInTheDocument();
    });

    const cancelDeleteButton = screen.getByText('Cancel');
    expect(cancelDeleteButton).toBeInTheDocument();

    fireEvent.click(cancelDeleteButton);

    await waitFor(() => {
      expect(screen.getByText('Edit Post')).toBeInTheDocument();
      expect(screen.getByText('Delete Post')).toBeInTheDocument();
    });
  });

  test('renders PostId 7, open and close comment section with comments in it, delete a comment and create a comment', async () => {
    mock.onGet(`/posts/${realPostId}`).reply(200, { ...post, commentIds: [realCommentId] });
    mock.onGet('/user/1').reply(200, loggedInUser);
    mock.onGet(new RegExp(`${'/posts/7/comments/-1'}.*`)).reply(200, [realCommentId]);
    mock.onGet(new RegExp(`${'/posts/7/comments/1'}.*`)).reply(200, []);
    mock.onGet('/comments/1').reply(200, comment);
    mock.onDelete(new RegExp(`${'/post/'}.*`)).reply(200);
    const setAlert = jest.fn();
    render(
    <MemoryRouter>
      <ExistingPost postId={realPostId} loggedInUserId={loggedInUserId}
        setAlert={setAlert} removeFromPostIds={() => { }} />
    </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Post')).toBeInTheDocument();
      expect(screen.getByText('Delete Post')).toBeInTheDocument();
    });

    const openCloseCommentsButton = screen.getByLabelText('show more');
    expect(openCloseCommentsButton).toBeInTheDocument();

    fireEvent.click(openCloseCommentsButton);

    await waitFor(() => {
      expect(screen.getByText('Edit Comment')).toBeInTheDocument();
      expect(screen.getByText('Delete Comment')).toBeInTheDocument();
    });

    const deleteCommentButton = screen.getByText('Delete Comment');
    fireEvent.click(deleteCommentButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    const deleteCommentConfirmButton = screen.getByText('Confirm');
    fireEvent.click(deleteCommentConfirmButton);

    await waitFor(() => {
      expect(setAlert).toHaveBeenCalledTimes(2);
      expect(setAlert).toHaveBeenCalledWith({ severity: 'success', message: 'Your Comment has been deleted!' });
    });

    fireEvent.click(openCloseCommentsButton);
  });

  test('renders PostId 7, like and unlike Post, click Edit Post, confirm that we are in Edit mode, then click Update Post button, confirm that post updated', async () => {
    mock.onGet(`/posts/${realPostId}`).reply(200, post);
    mock.onGet('/user/1').reply(200, loggedInUser);
    mock.onGet(new RegExp(`${'/posts/'}.*`)).reply(200, []);
    mock.onGet(new RegExp(`${'/likes/'}.*`)).reply(200, []);
    mock.onPut(new RegExp(`${'/likedby/'}.*`)).reply(200, ['1']);
    mock.onPut(new RegExp(`${'/unlikedby/'}.*`)).reply(200, []);
    mock.onPut(`/posts/${realPostId}`).reply(200, post);
    const setAlert = jest.fn();
    render(
    <MemoryRouter>
      <ExistingPost postId={realPostId} loggedInUserId={loggedInUserId}
        setAlert={setAlert} removeFromPostIds={() => { }} />
    </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Likes/i)).toBeInTheDocument();
    });
    const likeUnlikeButton = screen.getByText(/Likes/i);

    fireEvent.click(likeUnlikeButton);

    await waitFor(() => {
      expect(screen.getByText(/1 Likes/i)).toBeInTheDocument();
    });

    fireEvent.click(likeUnlikeButton);

    await waitFor(() => {
      expect(screen.getByText('Edit Post')).toBeInTheDocument();
      expect(screen.getByText('Delete Post')).toBeInTheDocument();
    });

    const editPostButton = screen.getByText('Edit Post');
    expect(editPostButton).toBeInTheDocument();

    fireEvent.click(editPostButton);

    await waitFor(() => {
      expect(screen.getByText('Cancel Edit')).toBeInTheDocument();
      expect(screen.getByText('Update Post')).toBeInTheDocument();
    });

    const updatePostButton = screen.getByText('Update Post');
    expect(updatePostButton).toBeInTheDocument();

    fireEvent.click(updatePostButton);

    await waitFor(() => {
      expect(setAlert).toHaveBeenCalledTimes(1);
      expect(setAlert).toHaveBeenCalledWith({ severity: 'success', message: 'Post Updated!' });
    });
  });
});
