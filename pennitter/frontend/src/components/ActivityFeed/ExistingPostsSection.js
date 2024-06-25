import React from 'react';
import PropTypes from 'prop-types';
import ExistingPost from '../Post/ExistingPost';

function ExistingPostsSection(props) {
  const {
    postIds,
    loggedInUserId,
    setAlert,
    removeFromPostIds,
  } = props;

  return (
    <div>
      <h3>Activity</h3>
      <div className='mainActivity'>
        {postIds.map((postId) => (
          <ExistingPost key={postId} postId={postId} loggedInUserId={loggedInUserId}
            setAlert={setAlert} removeFromPostIds={removeFromPostIds}
          />
        ))}
        {!postIds.length && <p>No Activity to display!</p>}
      </div>
    </div>
  );
}

ExistingPostsSection.propTypes = {
  postIds: PropTypes.array.isRequired,
  loggedInUserId: PropTypes.string.isRequired,
  setAlert: PropTypes.func.isRequired,
  removeFromPostIds: PropTypes.func.isRequired,
};

export default ExistingPostsSection;
