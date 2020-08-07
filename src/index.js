/* eslint-disable no-console */
require('dotenv').config();
const configDB = require('./config/db');

// Handle uncaught exception
process.on('uncaughtException', error => {
  console.error(error.name, error.message);
  console.error('UNCAUGHT EXCEPTION ! CLOSING SERVER...');
  process.exit(1); // Exit
});

const app = require('./app');

const PORT = process.env.PORT || 3000;

let server;
configDB().then(() => {
  server = app.listen(PORT, () => console.log(`Server listening at port ${PORT}`));
});

// handle unhandled rejections
process.on('unhandledRejection', error => {
  console.error(error.name, error.message);
  console.error('UNHANDLED REJECTION ! CLOSING SERVER...');
  // Close server & exit
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else process.exit(1);
});

// handle SIGTERM
process.on('SIGTERM', () => {
  console.error('SIGTERM RECIVED ! CLOSING SERVER...');
  // Close server & exit
  if (server) {
    server.close(() => {
      console.log('Process terminated !');
    });
  }
});
