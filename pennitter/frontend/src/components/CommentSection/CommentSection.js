import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Collapse from '@mui/material/Collapse';
import { readAllCommentIdsByPostIdParentCommentId } from '../../api/comments';
import NewComment from '../Comment/NewComment';
// eslint-disable-next-line import/no-cycle
import ExistingComment from '../Comment/ExistingComment';

function CommentSection(props) {
  const {
    expanded, postId, parentCommentId, loggedInUserId,
    setAlert,
  } = props;
  const [commentIds, setCommentIds] = useState([]);

  useEffect(() => {
    async function fetchCommentById() {
      try {
        const readCommentIds = await
        readAllCommentIdsByPostIdParentCommentId(postId, parentCommentId);
        setCommentIds(readCommentIds.data);
      } catch (err) {
        if (parentCommentId !== '-1') {
          setAlert({ severity: 'error', message: `Error fetching Replies: ${err.message ? err.message : err.toString()}` });
        } else {
          setAlert({ severity: 'error', message: `Error fetching Comments: ${err.message ? err.message : err.toString()}` });
        }
      }
    }

    fetchCommentById();

    const intervalId = setInterval(() => {
      fetchCommentById();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [postId, parentCommentId, setAlert]);

  function addToCommentIds(commentId) {
    setCommentIds((prevCommentIds) => [commentId, ...prevCommentIds]);
  }

  function removeFromCommentIds(commentIdToRemove) {
    setCommentIds((prevCommentIds) => prevCommentIds
      .filter((commentId) => commentId !== commentIdToRemove));
  }

  return (
    <Collapse in={expanded} timeout="auto" unmountOnExit>
      <NewComment
        postId={postId}
        parentCommentId={parentCommentId}
        loggedInUserId={loggedInUserId}
        setAlert={setAlert}
        addToCommentIds={addToCommentIds}
      />
      {commentIds.map((commentId) => (
        <ExistingComment key={commentId}
          commentId={commentId}
          postId={postId}
          parentCommentId={parentCommentId}
          loggedInUserId={loggedInUserId}
          setAlert={setAlert}
          removeFromCommentIds={removeFromCommentIds}
        />
      ))}
    </Collapse>
  );
}

CommentSection.propTypes = {
  expanded: PropTypes.bool.isRequired,
  postId: PropTypes.string.isRequired,
  parentCommentId: PropTypes.string.isRequired,
  loggedInUserId: PropTypes.string.isRequired,
  setAlert: PropTypes.func.isRequired,
};

export default CommentSection;
