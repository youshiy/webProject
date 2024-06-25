import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';

import { appendUserToPostLikes, removeUserFromPostLikes, readPostLikesByPostId } from '../../api/posts';
import { readIdUsernameAndProfilePictureByUserId } from '../../api/users';
import LikeUnlikeButton from '../LikeUnlike/LikeUnlike';

function ExistingPostHeader(props) {
  const {
    post, loggedInUserId, setAlert,
  } = props;
  const [postAuthor, setPostAuthor] = useState({ username: '', profileImage: '' });

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    async function fetchPostAuthorByPostId() {
      try {
        const readPostAuthor = await readIdUsernameAndProfilePictureByUserId(post.userId);
        setPostAuthor(readPostAuthor.data);
      } catch (err) {
        setAlert({ severity: 'error', message: `Error fetching Post Author: ${err.message ? err.message : err.toString()}` });
      }
    }
    async function fetchPostLikesAndIfLikedByLoggedInUser() {
      try {
        const readLikes = await readPostLikesByPostId(post.id);
        setLikeCount(readLikes.data.length);
        if (readLikes.data
          .findIndex((userId) => userId.toString() === loggedInUserId.toString()) !== -1) {
          setIsLiked(true);
        } else {
          setIsLiked(false);
        }
      } catch (err) {
        setAlert({ severity: 'error', message: `Error fetching Post likes: ${err.message ? err.message : err.toString()}` });
      }
    }

    fetchPostAuthorByPostId();
    fetchPostLikesAndIfLikedByLoggedInUser();

    const intervalId = setInterval(() => {
      fetchPostAuthorByPostId();
      fetchPostLikesAndIfLikedByLoggedInUser();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [post.userId, post.id, setAlert, loggedInUserId]);

  // Function to handle liking a post
  const handleLikePost = async () => {
    try {
      const likesResult = await appendUserToPostLikes(post.id, loggedInUserId);
      setLikeCount(likesResult.data.length);
      setIsLiked(true);
    } catch (err) {
      setAlert({ severity: 'error', message: `Error liking the Post: ${err.message ? err.message : err.toString()}` });
    }
  };

  // Function to handle unliking a post
  const handleUnlikePost = async () => {
    try {
      const likesResult = await removeUserFromPostLikes(post.id, loggedInUserId);
      setLikeCount(likesResult.data.length);
      setIsLiked(false);
    } catch (err) {
      setAlert({ severity: 'error', message: `Error unliking the Post: ${err.message ? err.message : err.toString()}` });
    }
  };

  const handleNavigation = (username) => {
    // Reload the app and navigate to the link
    window.location.href = `/${username}`;
  };

  return (
    <CardHeader
      avatar={
        <Avatar sx={{ bgcolor: 'white' }} aria-label="recipe">
          <img className='postAuthorImg' src={postAuthor.profileImage} alt='Profile Pic'></img>
        </Avatar>
      }
      title={
        <Link onClick={() => handleNavigation(postAuthor.username)}>{postAuthor.username}</Link>
      }
      subheader={
        <div>
          {post.updatedDate ? (
            <p>Created: {new Date(post.createdDate).toLocaleString()}
              , Last Updated: {new Date(post.updatedDate).toLocaleString()}
            </p>
          ) : (
            <p>Created: {new Date(post.createdDate).toLocaleString()}</p>
          )}
        </div>
      }
      action={
        <div>
          <LikeUnlikeButton
            isLiked={isLiked}
            likeCount={likeCount}
            onLike={handleLikePost}
            onUnlike={handleUnlikePost}
          />
        </div>
      }
    />
  );
}

ExistingPostHeader.propTypes = {
  post: PropTypes.object.isRequired,
  loggedInUserId: PropTypes.string.isRequired,
  setAlert: PropTypes.func.isRequired,
};

export default ExistingPostHeader;
