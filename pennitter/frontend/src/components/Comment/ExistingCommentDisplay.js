import React from 'react';
import PropTypes from 'prop-types';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export function ExistingCommentDisplayText(props) {
  const { text } = props;

  return (
    <CardContent>
      <TextField multiline type='text' name="text" value={text} disabled={true} />
    </CardContent>
  );
}

ExistingCommentDisplayText.propTypes = {
  text: PropTypes.string.isRequired,
};

export function ExistingCommentDisplayButtons(props) {
  const { commentOrReplyText, handleEditComment, handleOpenDialog } = props;

  return (
    <>
      <Button size="small" variant='outlined' onClick={handleEditComment}>Edit {commentOrReplyText.uppercase}</Button> &nbsp;
      <Button size="small" variant='outlined' color="error" onClick={handleOpenDialog}>Delete {commentOrReplyText.uppercase}</Button>
    </>
  );
}

ExistingCommentDisplayButtons.propTypes = {
  commentOrReplyText: PropTypes.object.isRequired,
  handleEditComment: PropTypes.func.isRequired,
  handleOpenDialog: PropTypes.func.isRequired,
};
