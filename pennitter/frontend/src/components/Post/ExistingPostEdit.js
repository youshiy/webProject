import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export function ExistingPostEditText(props) {
  const { text, handlePostChange } = props;

  return (
    <TextField name="text" multiline value={text} onChange={handlePostChange} placeholder="Update your post here..." />
  );
}

ExistingPostEditText.propTypes = {
  text: PropTypes.string.isRequired,
  handlePostChange: PropTypes.func.isRequired,
};

export function ExistingPostEditButtons(props) {
  const {
    text, handleCancelEditPost, handleUpdatePost,
  } = props;

  return (
    <>
      <Button variant="outlined" color="error" onClick={handleCancelEditPost}>Cancel Edit</Button>&nbsp;
      <Button variant="outlined" onClick={handleUpdatePost} disabled={text === ''}>Update Post</Button>
    </>
  );
}

ExistingPostEditButtons.propTypes = {
  text: PropTypes.string.isRequired,
  handleCancelEditPost: PropTypes.func.isRequired,
  handleUpdatePost: PropTypes.func.isRequired,
};
