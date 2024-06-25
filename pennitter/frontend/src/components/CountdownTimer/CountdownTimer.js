import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const CountdownTimer = (props) => {
  const {
    initialSeconds,
    timeExpiredCallback,
  } = props;
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds - 1);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    // Check if the timer has reached 0
    if (seconds === 0) {
      timeExpiredCallback();
    }
  }, [seconds, timeExpiredCallback]);

  return (
    <div>
      <p>Countdown: {seconds} seconds</p>
    </div>
  );
};

CountdownTimer.propTypes = {
  initialSeconds: PropTypes.number.isRequired,
  timeExpiredCallback: PropTypes.func.isRequired,
};

export default CountdownTimer;
