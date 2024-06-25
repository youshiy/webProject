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
async function readAllIdsUsernamesImagesNotThisUserId(userId) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.get(`/users/exclude/${userId}`, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function readWhoUserIdFollows(userId) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.get(`/users/follows/${userId}`, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function readWhoFollowsUserId(userId) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.get(`/users/followers/${userId}`, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function unfollowUser(userId, userIdToUnfollow) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.put(`/unfollow/${userId}/${userIdToUnfollow}`, {}, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function followUser(userId, userIdToFollow) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.put(`/follow/${userId}/${userIdToFollow}`, {}, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

export {
  readAllIdsUsernamesImagesNotThisUserId,
  readWhoUserIdFollows,
  readWhoFollowsUserId,
  unfollowUser,
  followUser,
};
