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
async function usernameOrEmailTaken(username, email, currentUserId = 'empty') {
  try {
    if (currentUserId === 'empty') {
      return await axios.get(`/users/usernameOrEmailTaken/${username}/${email}/${currentUserId}`);
    }
    const config = await getAuthorizationHeader();
    return await axios.get(`/users/usernameOrEmailTaken/${username}/${email}/${currentUserId}`, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function readProfileImageByUserId(userId) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.get(`/user/${userId}/profileimage`, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function readAllIdsUsernames() {
  try {
    const config = await getAuthorizationHeader();
    return await axios.get('/user-ids-usernames', config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function readUsernameAndEmailByUserId(id) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.get(`/users/${id}/username-email`, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function readIdUsernameAndProfilePictureByUserId(id) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.get(`/user/${id}`, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function updateUser(updatedUser) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.put(`/user/${updatedUser.id}`, updatedUser, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function updatePasswordByUserId(userId, oldPassword, newPassword) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.put(`/user/${userId}/password`, {
      oldPassword,
      newPassword,
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
async function updateUserProfileImage(userId, formData) {
  try {
    const config = await getAuthorizationHeader();
    config.headers = { ...config.headers, 'Content-Type': 'multipart/form-data' };
    return await axios.put(`/user/${userId}/profileimage`, formData, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function deleteUserProfileImage(userId) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.delete(`/user/${userId}/profileimage`, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
async function deleteUserById(id) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.delete(`/user/${id}`, config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

export {
  usernameOrEmailTaken,
  readProfileImageByUserId,
  readAllIdsUsernames,
  readUsernameAndEmailByUserId,
  readIdUsernameAndProfilePictureByUserId,
  updateUser,
  updatePasswordByUserId,
  updateUserProfileImage,
  deleteUserProfileImage,
  deleteUserById,
};
