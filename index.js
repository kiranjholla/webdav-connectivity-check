const prompt = require('prompt');

prompt
  .get({
    properties: {
      username: { description: 'Please enter the username' },
      password: { description: 'Please enter the password', hidden: true }
    }
  })
  .then(({ username, password }) => {
    console.log({ username, password });
  })
  .catch(error => console.log('There was an error: ', error));
