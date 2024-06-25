import axios from '../axiosInstance';

async function getAuthorizationHeader() {
  const config = {};
  const appToken = sessionStorage.getItem('app-token');
  if (appToken) {
    config.headers = {
      Authorization: appToken,
    };
  }
  return config;
}

// used
async function createComment(userId, postId, parentCommentId, comment) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.post('/comments', {
      userId,
      postId,
      parentCommentId,
      comment,
    }, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function readCommentById(id) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.get(`/comments/${id}`, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function updateComment(updatedComment) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.put(`/comments/${updatedComment.id}`, updatedComment, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function deleteCommentByIdWithPostId(commentId, postId) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.delete(`post/${postId}/comments/${commentId}/all`, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function readAllCommentIdsByPostIdParentCommentId(postId, commentId) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.get(`/posts/${postId}/comments/${commentId}/sorted`, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

export {
  createComment,
  readCommentById,
  updateComment,
  deleteCommentByIdWithPostId,
  readAllCommentIdsByPostIdParentCommentId,
};
