import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';

function UnhidePost(props) {
  const { handleUnhidePost } = props;

  return (
    <Button variant="outlined" onClick={handleUnhidePost}>Unhide Post</Button>
  );
}

UnhidePost.propTypes = {
  handleUnhidePost: PropTypes.func.isRequired,
};

export default UnhidePost;
