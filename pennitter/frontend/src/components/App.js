import React, { useState, useEffect } from 'react';
import AlertSnackbar from './AlertSnackbar/AlertSnackbar';
import AppLoggedIn from './AppLoggedIn/AppLoggedIn';
import AppLoggedOut from './AppLoggedOut/AppLoggedOut';

export default function App() {
  const [loggedInUser, setLoggedInUserState] = useState(() => {
    const storedUser = sessionStorage.getItem('loggedInUser');
    return storedUser ? JSON.parse(storedUser) : { id: null, username: '' };
  });
  const [alert, setAlert] = useState(null);

  // Effect to update session storage when loggedInUser changes
  useEffect(() => {
    sessionStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
  }, [loggedInUser]);

  async function setLoggedInUser(id, username) {
    setLoggedInUserState({ id, username });
  }

  async function setSnackBarAlert(e) {
    setAlert({ ...e, key: new Date().getTime().toString() });
  }

  return (
    <>
      {alert && <AlertSnackbar alert={alert} open={true} handleClose={() => setAlert(null)} />}
      {loggedInUser.id !== null
        ? <AppLoggedIn loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser}
            setAlert={setSnackBarAlert} />
        : <AppLoggedOut setLoggedInUser={setLoggedInUser} setAlert={setSnackBarAlert} />}
    </>
  );
}
