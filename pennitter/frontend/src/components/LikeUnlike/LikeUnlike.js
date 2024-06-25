import React from 'react';
import PropTypes from 'prop-types';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

function LikeUnlikeButton(props) {
  const handleLike = () => {
    if (!props.isLiked) {
      props.onLike();
    } else {
      props.onUnlike();
    }
  };

  return (
    <div>
      <button onClick={handleLike}>
        {props.isLiked ? (
          <ThumbUpIcon style={{ color: 'blue' }} />
        ) : (
          <ThumbUpIcon />
        )}
        {props.likeCount} Likes
      </button>
    </div>
  );
}

LikeUnlikeButton.propTypes = {
  isLiked: PropTypes.bool.isRequired,
  likeCount: PropTypes.number.isRequired,
  onLike: PropTypes.func.isRequired,
  onUnlike: PropTypes.func.isRequired,
};

export default LikeUnlikeButton;
