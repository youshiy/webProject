import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import { readIdUsernameAndProfilePictureByUserId } from '../../api/users';

function ExistingCommentHeader(props) {
  const {
    comment,
    parentCommentId,
    setAlert,
  } = props;
  const [commentAuthor, setCommentAuthor] = useState({ username: '', profileImage: '' });

  useEffect(() => {
    async function fetchCommentAuthorByPostId() {
      try {
        const readCommentAuthor = await readIdUsernameAndProfilePictureByUserId(comment.userId);
        setCommentAuthor(readCommentAuthor.data);
      } catch (err) {
        if (parentCommentId !== '-1') {
          setAlert({ severity: 'error', message: `Error fetching Reply Author: ${err.message ? err.message : err.toString()}` });
        } else {
          setAlert({ severity: 'error', message: `Error fetching Comment Author: ${err.message ? err.message : err.toString()}` });
        }
      }
    }

    fetchCommentAuthorByPostId();

    const intervalId = setInterval(() => {
      fetchCommentAuthorByPostId();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [comment, setAlert, parentCommentId]);

  const handleNavigation = (username) => {
    // Reload the app and navigate to the link
    window.location.href = `/${username}`;
  };

  return (
    <CardHeader
      avatar={
        <Avatar sx={{ bgcolor: 'white' }} aria-label="recipe">
          <img className='commentAuthorImg' src={commentAuthor.profileImage} alt='Profile Pic'></img>
        </Avatar>
      }
      title={
        <Link onClick={() => handleNavigation(commentAuthor.username)}>
          {commentAuthor.username}
        </Link>
      }
      subheader={
        <div>
          {comment.updatedDate ? (
            <p>Created: {new Date(comment.createdDate).toLocaleString()}
              , Last Updated: {new Date(comment.updatedDate).toLocaleString()}
            </p>
          ) : (
            <p>Created: {new Date(comment.createdDate).toLocaleString()}</p>
          )}
        </div>
      }
    />
  );
}

ExistingCommentHeader.propTypes = {
  comment: PropTypes.object.isRequired,
  parentCommentId: PropTypes.string.isRequired,
  setAlert: PropTypes.func.isRequired,
};

export default ExistingCommentHeader;
