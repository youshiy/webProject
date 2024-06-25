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
export async function registerUser(_username, _email, _password) {
  try {
    return await axios.post('/register', {
      username: _username,
      email: _email,
      password: _password,
    });
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
export async function authenticateUser(usernameOrEmail, password) {
  try {
    return await axios.post('/authenticate', {
      usernameOrEmail,
      password,
    });
  } catch (err) {
    if (err.response?.data?.message) {
      const { message, loginAttempts } = err.response.data;
      throw new Error(JSON.stringify({ message, loginAttempts }));
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
export async function reauthenticateUser(usernameOrEmail, password) {
  try {
    const config = await getAuthorizationHeader();
    return await axios.post('/reauthenticate', {
      usernameOrEmail,
      password,
    }, config);
  } catch (err) {
    if (err.response?.data?.message) {
      const { message, loginAttempts } = err.response.data;
      throw new Error(JSON.stringify({ message, loginAttempts }));
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}

// used
export async function isTokenExpiration1Minute() {
  try {
    const config = await getAuthorizationHeader();
    return await axios.get('/isTokenExpiration1Minute', config);
  } catch (err) {
    if (err.response?.data?.message) {
      throw Error(err.response.data.message);
    } else {
      throw Error(`Status ${err.response.status} ${err.response.statusText}`);
    }
  }
}
