import React from 'react';
import PropTypes from 'prop-types';
import {
  BrowserRouter as Router, Routes, Route, Navigate,
} from 'react-router-dom';
import HeaderLoggedOut from '../Header/HeaderLoggedOut';
import Login from '../Login/Login';
import Registration from '../Registration/Registration';

function AppLoggedOut(props) {
  const {
    setLoggedInUser,
    setAlert,
  } = props;

  return (
    <>
      <Router>
        <HeaderLoggedOut />
        {/* Main View */}
        <Routes>
          <Route path="/login" element={<Login setLoggedInUser={setLoggedInUser} setAlert={setAlert} />} />
          <Route path="/registration" element={<Registration setAlert={setAlert} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </>
  );
}

AppLoggedOut.propTypes = {
  setLoggedInUser: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired,
};

export default AppLoggedOut;
