import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../axiosInstance';
import NewComment from './NewComment';
import ExistingComment from './ExistingComment';

describe('Comment component', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });
  const loggedInUserId = '1';
  const loggedInUser = { id: '1', username: 'moneybaggg', profileImage: 'https://i.imgur.com/NUWSyFp.jpeg' };
  const realCommentId = '1';
  const comment = {
    userId: '1', parentCommentId: '-1', text: 'hello', createdDate: new Date().toISOString(), updatedDate: null,
  };
  const commentsPostId = '24';

  test('renders New Comment section', () => {
    render(
      <MemoryRouter>
        <NewComment postId={commentsPostId} parentCommentId={'-1'}
          loggedInUserId={loggedInUserId} setAlert={() => { }} addToCommentIds={() => { }}
        />
      </MemoryRouter>,
    );

    const commentTextArea = screen.getByPlaceholderText('Start your comment here...');
    const createCommentButton = screen.getByText('Create Comment');

    expect(commentTextArea).toBeInTheDocument();
    expect(createCommentButton).toBeInTheDocument();
  });

  test('create New Comment', async () => {
    mock.onPost(new RegExp(`${'/comments'}.*`)).reply(201, '25');
    const setAlert = jest.fn();
    render(
      <MemoryRouter>
        <NewComment postId={commentsPostId} parentCommentId={'-1'}
          loggedInUserId={loggedInUserId} setAlert={setAlert} addToCommentIds={() => { }}
        />
      </MemoryRouter>,
    );

    const commentTextArea = screen.getByPlaceholderText('Start your comment here...');
    const createCommentButton = screen.getByText('Create Comment');

    expect(commentTextArea).toBeInTheDocument();
    expect(createCommentButton).toBeInTheDocument();

    fireEvent.change(commentTextArea, { target: { value: 'test comment' } });
    expect(commentTextArea).toHaveValue('test comment');

    fireEvent.click(createCommentButton);

    await waitFor(() => {
      expect(setAlert).toHaveBeenCalledTimes(1);
      expect(setAlert).toHaveBeenCalledWith({ severity: 'success', message: 'Comment Created!' });
    });
  });

  test('renders CommentId 1 Edit Comment and Delete Comment buttons', async () => {
    jest.useFakeTimers();
    mock.onGet('/comments/1').reply(200, comment);
    mock.onGet('/user/1').reply(200, loggedInUser);
    mock.onGet(new RegExp(`${'/posts/'}.*`)).reply(200, []);
    render(
      <MemoryRouter>
        <ExistingComment commentId={realCommentId} postId={commentsPostId} parentCommentId={'-1'}
          loggedInUserId={loggedInUserId} setAlert={() => { }} removeFromCommentIds={() => { }} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Comment')).toBeInTheDocument();
      expect(screen.getByText('Delete Comment')).toBeInTheDocument();
    });
    jest.advanceTimersByTime(6000); // Advance time by 6 seconds
  });

  test('renders CommentId 1, click Edit Comment, confirm that we are in Edit mode, change and verify comment text, then click Cancel Edit Comment button', async () => {
    mock.onGet('/comments/1').reply(200, comment);
    mock.onGet('/user/1').reply(200, loggedInUser);
    mock.onGet(new RegExp(`${'/posts/'}.*`)).reply(200, []);
    render(
      <MemoryRouter>
        <ExistingComment commentId={realCommentId} postId={commentsPostId} parentCommentId={'-1'}
          loggedInUserId={loggedInUserId} setAlert={() => { }} removeFromCommentIds={() => { }} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Comment')).toBeInTheDocument();
      expect(screen.getByText('Delete Comment')).toBeInTheDocument();
    });

    const editCommentButton = screen.getByText('Edit Comment');
    expect(editCommentButton).toBeInTheDocument();

    fireEvent.click(editCommentButton);

    await waitFor(() => {
      expect(screen.getByText('Cancel Edit')).toBeInTheDocument();
      expect(screen.getByText('Update Comment')).toBeInTheDocument();
    });

    const commentText = screen.getByPlaceholderText('Update your comment here...');
    fireEvent.change(commentText, { target: { value: 'testuser!!!' } });
    expect(commentText).toHaveValue('testuser!!!');

    const cancelEditButton = screen.getByText('Cancel Edit');
    expect(cancelEditButton).toBeInTheDocument();

    fireEvent.click(cancelEditButton);

    await waitFor(() => {
      expect(screen.getByText('Edit Comment')).toBeInTheDocument();
      expect(screen.getByText('Delete Comment')).toBeInTheDocument();
    });
  });

  test('renders CommentId 1, click Delete Comment button, confirm that Confirm Delete dialog appears, then Cancel the Delete', async () => {
    mock.onGet('/comments/1').reply(200, comment);
    mock.onGet('/user/1').reply(200, loggedInUser);
    mock.onGet(new RegExp(`${'/posts/'}.*`)).reply(200, []);
    render(
      <MemoryRouter>
        <ExistingComment commentId={realCommentId} postId={commentsPostId} parentCommentId={'-1'}
          loggedInUserId={loggedInUserId} setAlert={() => { }} removeFromCommentIds={() => { }} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Comment')).toBeInTheDocument();
      expect(screen.getByText('Delete Comment')).toBeInTheDocument();
    });

    const deleteCommentButton = screen.getByText('Delete Comment');
    expect(deleteCommentButton).toBeInTheDocument();

    fireEvent.click(deleteCommentButton);

    await waitFor(() => {
      expect(screen.getByText('Are you sure you want to delete this comment? All replies to this will also be deleted! This action cannot be reversed!')).toBeInTheDocument();
    });

    const cancelDeleteButton = screen.getByText('Cancel');
    expect(cancelDeleteButton).toBeInTheDocument();

    fireEvent.click(cancelDeleteButton);

    await waitFor(() => {
      expect(screen.getByText('Edit Comment')).toBeInTheDocument();
      expect(screen.getByText('Delete Comment')).toBeInTheDocument();
    });
  });

  test('renders CommentId 1, click Edit Comment, confirm that we are in Edit mode, update comment, then click Update Comment button, confirm that comment updated', async () => {
    const setAlert = jest.fn();
    mock.onGet('/comments/1').reply(200, comment);
    mock.onGet('/user/1').reply(200, loggedInUser);
    mock.onGet(new RegExp(`${'/posts/'}.*`)).reply(200, []);
    mock.onPut(new RegExp(`${'/comments/'}.*`)).reply(200, { ...comment, text: 'testuser!!!', updatedDate: new Date().toISOString() });
    render(
      <MemoryRouter>
        <ExistingComment commentId={realCommentId} postId={commentsPostId} parentCommentId={'-1'}
          loggedInUserId={loggedInUserId} setAlert={setAlert} removeFromCommentIds={() => { }} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Comment')).toBeInTheDocument();
      expect(screen.getByText('Delete Comment')).toBeInTheDocument();
    });

    const editCommentButton = screen.getByText('Edit Comment');
    expect(editCommentButton).toBeInTheDocument();

    fireEvent.click(editCommentButton);

    await waitFor(() => {
      expect(screen.getByText('Cancel Edit')).toBeInTheDocument();
      expect(screen.getByText('Update Comment')).toBeInTheDocument();
    });

    const commentText = screen.getByPlaceholderText('Update your comment here...');
    fireEvent.change(commentText, { target: { value: 'testuser!!!' } });
    expect(commentText).toHaveValue('testuser!!!');

    const updateCommentButton = screen.getByText('Update Comment');
    expect(updateCommentButton).toBeInTheDocument();

    fireEvent.click(updateCommentButton);

    await waitFor(() => {
      expect(setAlert).toHaveBeenCalledTimes(1);
      expect(setAlert).toHaveBeenCalledWith({ severity: 'success', message: 'Comment Updated!' });
    });
  });
});
