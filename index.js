import prompt from 'prompt';
import { createClient, AuthType } from 'webdav';

prompt
  .get({
    properties: {
      webdav: { description: 'Please enter the WebDAV URL' },
      username: { description: 'Please enter the username' },
      password: { description: 'Please enter the password', hidden: true }
    }
  })
  .then(({ webdav, username, password }) => {
    console.log(`Connecting to: ${webdav}`);
    const client = createClient(webdav, {
      authType: AuthType.Digest,
      username,
      password
    });

    return client.getDirectoryContents('/');
  })
  .then(x => console.log(x))
  .catch(error => console.log('There was an error: ', error.message));
