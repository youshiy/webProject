import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { createComment } from '../../api/comments';
import './Comment.css';

function NewComment(props) {
  const {
    postId,
    parentCommentId,
    loggedInUserId,
    setAlert,
    addToCommentIds,
  } = props;
  const defaultCommentObj = { text: '' };
  const [comment, setComment] = useState(defaultCommentObj);
  let commentOrReplyText = { uppercase: 'Comment', lowercase: 'comment' };

  if (parentCommentId !== '-1') {
    commentOrReplyText = { uppercase: 'Reply', lowercase: 'reply' };
  }

  async function handleCommentChange(e) {
    const { name, value } = e.target;
    setComment((commentObject) => ({
      ...commentObject,
      [name]: value,
    }));
  }

  async function handleCreateComment() {
    try {
      const newCommentId = await createComment(
        loggedInUserId,
        postId,
        parentCommentId,
        comment,
      );
      addToCommentIds(newCommentId.data);

      setComment(defaultCommentObj);
      setAlert({ severity: 'success', message: `${commentOrReplyText.uppercase} Created!` });
    } catch (err) {
      setAlert({ severity: 'error', message: `Error creating ${commentOrReplyText.uppercase}: ${err.message ? err.message : err.toString()}` });
    }
  }

  return (
    <div className='commentDiv'>
      <Card sx={{ marginTop: '10px', marginLeft: '25px', marginRight: '25px' }}>
        <TextField multiline type='text' name="text" value={comment.text} onChange={handleCommentChange} placeholder={`Start your ${commentOrReplyText.lowercase} here...`} />
        <CardActions>
          <Button variant="contained" size="small" onClick={handleCreateComment} disabled={comment.text === ''} sx={{ marginTop: '10px' }}>Create {commentOrReplyText.uppercase}</Button>
        </CardActions>
      </Card>
    </div>
  );
}

NewComment.propTypes = {
  postId: PropTypes.string.isRequired,
  parentCommentId: PropTypes.string.isRequired,
  loggedInUserId: PropTypes.string.isRequired,
  setAlert: PropTypes.func.isRequired,
  addToCommentIds: PropTypes.func.isRequired,
};

export default NewComment;
