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
async function readUserHiddenPostIds(userId) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.get(`/users/${userId}/hidden-posts`, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function appendPostToUserHiddenPostIds(userId, postId) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.put(`/users/${userId}/hide-post/${postId}`, {}, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function removePostFromUserHiddenPostIds(userId, postId) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.put(`/users/${userId}/unhide-post/${postId}`, {}, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

export {
  readUserHiddenPostIds,
  appendPostToUserHiddenPostIds,
  removePostFromUserHiddenPostIds,
};
