import React from 'react';
import PropTypes from 'prop-types';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export function ExistingCommentEditText(props) {
  const { text, commentOrReplyText, handleCommentChange } = props;

  return (
    <CardContent>
      <TextField multiline type='text' name="text" value={text} onChange={handleCommentChange} placeholder={`Update your ${commentOrReplyText.lowercase} here...`} />
    </CardContent>
  );
}

ExistingCommentEditText.propTypes = {
  text: PropTypes.string.isRequired,
  commentOrReplyText: PropTypes.object.isRequired,
  handleCommentChange: PropTypes.func.isRequired,
};

export function ExistingCommentEditButtons(props) {
  const {
    text, commentOrReplyText, handleCancelEditComment, handleUpdateComment,
  } = props;

  return (
    <>
      <Button size="small" variant='outlined' color="error" onClick={handleCancelEditComment}>Cancel Edit</Button> &nbsp;
      <Button size="small" variant='outlined' onClick={handleUpdateComment} disabled={text === ''}>Update {commentOrReplyText.uppercase}</Button>
    </>
  );
}

ExistingCommentEditButtons.propTypes = {
  text: PropTypes.string.isRequired,
  commentOrReplyText: PropTypes.object.isRequired,
  handleCancelEditComment: PropTypes.func.isRequired,
  handleUpdateComment: PropTypes.func.isRequired,
};
