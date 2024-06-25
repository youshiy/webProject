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
async function createPost(formData) {
  try {
    const config = await getAuthorizationHeader();
    config.headers = { ...config.headers, 'Content-Type': 'multipart/form-data' };
    return await axios.post('/posts', formData, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function readPostIdsByUserId(userId) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.get(`/posts/user/${userId}`, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function readActivityFeedPostIds(userId) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.get(`/posts/activity-feed/${userId}`, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function readPostById(id) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.get(`/posts/${id}`, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function readPostMediaUrlByPostId(id) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.get(`/posts/${id}/mediaUrl`, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function readPostLikesByPostId(id) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.get(`/posts/${id}/likes`, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function updatePost(postId, formData) {
  try {
    const config = await getAuthorizationHeader();
    config.headers = { ...config.headers, 'Content-Type': 'multipart/form-data' };
    return await axios.put(`/posts/${postId}`, formData, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function deletePostByIdWithUserId(postId, userId) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.delete(`/user/${userId}/posts/${postId}`, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function appendUserToPostLikes(postId, userId) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.put(`/posts/${postId}/likedby/${userId}`, {}, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function removeUserFromPostLikes(postId, userId) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.put(`/posts/${postId}/unlikedby/${userId}`, {}, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

export {
  createPost,
  readPostIdsByUserId,
  readActivityFeedPostIds,
  readPostById,
  readPostMediaUrlByPostId,
  readPostLikesByPostId,
  updatePost,
  deletePostByIdWithUserId,
  appendUserToPostLikes,
  removeUserFromPostLikes,
};
