/**
 * This module will start the express server
 */
const { webapp } = require('./server');

// (5) define the port
const port = 8080;

// start the server and connect to the DB
webapp.listen(port, async () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port: ${port}`);
});
