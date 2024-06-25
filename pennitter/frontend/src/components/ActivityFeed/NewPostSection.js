import React from 'react';
import PropTypes from 'prop-types';
import NewPost from '../Post/NewPost';

function NewPostSection(props) {
  const {
    loggedInUserId,
    setAlert,
    addToPostIds,
  } = props;

  return (
    <div>
      <h3>Create New Post</h3>
      <div>
        <NewPost postId={'0'} loggedInUserId={loggedInUserId}
          setAlert={setAlert} addToPostIds={addToPostIds}
        />
      </div>
    </div>
  );
}

NewPostSection.propTypes = {
  loggedInUserId: PropTypes.string.isRequired,
  setAlert: PropTypes.func.isRequired,
  addToPostIds: PropTypes.func.isRequired,
};

export default NewPostSection;
