import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';

function HidePost(props) {
  const { handleHidePost } = props;

  return (
    <Button variant="outlined" onClick={handleHidePost}>Hide Post</Button>
  );
}

HidePost.propTypes = {
  handleHidePost: PropTypes.func.isRequired,
};

export default HidePost;
