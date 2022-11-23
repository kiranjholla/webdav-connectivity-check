const prompt = require('prompt');

const yo = prompt.get(
  {
    properties: {
      username: { description: 'Please enter the username' },
      password: { description: 'Please enter the password', hidden: true }
    }
  },
  (error, { username, password }) => {
    if (!error) {
      console.log({ username, password });
    } else {
      console.log('There was an error: ', error);
    }
  }
);
