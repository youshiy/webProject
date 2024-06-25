import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export function ExistingPostDisplayText(props) {
  const { text } = props;

  return (
    <TextField name="text" multiline value={text} disabled={true} />
  );
}

ExistingPostDisplayText.propTypes = {
  text: PropTypes.string.isRequired,
};

export function ExistingPostDisplayButtons(props) {
  const { handleEditPost, handleOpenDialog } = props;

  return (
    <>
      <Button variant="outlined" onClick={handleEditPost}>Edit Post</Button> &nbsp;
      <Button variant="outlined" color="error" onClick={handleOpenDialog}>Delete Post</Button>
    </>
  );
}

ExistingPostDisplayButtons.propTypes = {
  handleEditPost: PropTypes.func.isRequired,
  handleOpenDialog: PropTypes.func.isRequired,
};
