import prompt from 'prompt';
import { createClient, AuthType } from 'webdav';

export class WrappedWebdavClient {
  webdavConfig;
  remoteBaseDir;
  client;
  vaultFolderExists;

  saveUpdatedConfigFunc;

  constructor(webdavConfig, remoteBaseDir, saveUpdatedConfigFunc) {
    this.webdavConfig = webdavConfig;
    this.remoteBaseDir = remoteBaseDir;
    this.vaultFolderExists = false;
    this.saveUpdatedConfigFunc = saveUpdatedConfigFunc;
  }

  init = async () => {
    // init client if not inited
    const headers = {
      'Cache-Control': 'no-cache'
    };

    if (this.client === undefined) {
      if (this.webdavConfig.username !== '' && this.webdavConfig.password !== '') {
        this.client = createClient(this.webdavConfig.address, {
          username: this.webdavConfig.username,
          password: this.webdavConfig.password,
          headers: headers,
          authType: this.webdavConfig.authType === 'digest' ? AuthType.Digest : AuthType.Password
        });
      } else {
        console.log('no password');
        this.client = createClient(this.webdavConfig.address, {
          headers: headers
        });
      }
    }

    // check vault folder
    if (this.vaultFolderExists) {
      // pass
    } else {
      const res = await this.client.exists(`/${this.remoteBaseDir}/`);
      if (res) {
        // log.info("remote vault folder exits!");
        this.vaultFolderExists = true;
      } else {
        console.log('remote vault folder not exists, creating');
        await this.client.createDirectory(`/${this.remoteBaseDir}/`);
        console.log('remote vault folder created!');
        this.vaultFolderExists = true;
      }
    }

    // adjust depth parameter
    if (this.webdavConfig.depth === 'auto_unknown') {
      let testPassed = false;
      try {
        const res = await this.client.customRequest(`/${this.remoteBaseDir}/`, {
          method: 'PROPFIND',
          headers: {
            Depth: 'infinity'
          },
          responseType: 'text'
        });
        if (res.status === 403) {
          throw Error('not support Infinity, get 403');
        } else {
          testPassed = true;
          this.webdavConfig.depth = 'auto_infinity';
          this.webdavConfig.manualRecursive = false;
        }
      } catch (error) {
        testPassed = false;
      }
      if (!testPassed) {
        try {
          const res = await this.client.customRequest(`/${this.remoteBaseDir}/`, {
            method: 'PROPFIND',
            headers: {
              Depth: '1'
            },
            responseType: 'text'
          });
          testPassed = true;
          this.webdavConfig.depth = 'auto_1';
          this.webdavConfig.manualRecursive = true;
        } catch (error) {
          testPassed = false;
        }
      }
      if (testPassed) {
        // the depth option has been changed
        // save the setting
        if (this.saveUpdatedConfigFunc !== undefined) {
          await this.saveUpdatedConfigFunc();
          console.log(`webdav depth="auto_unknown" is changed to ${this.webdavConfig.depth}`);
        }
      }
    }
  };
}

prompt
  .get({
    properties: {
      address: { description: 'Please enter the WebDAV URL', default: 'https://dav.example.com' },
      username: { description: 'Please enter the username', default: 'davuser' },
      password: { description: 'Please enter the password', default: 'davpassword' }
    }
  })
  .then(({ address, username, password }) => {
    console.log(`Connecting to: ${address}`);
    const client = new WrappedWebdavClient(
      { authType: AuthType.Digest, username, password, address, depth: 'auto_unknown' },
      'myname',
      () => Promise.resolve()
    );

    client
      .init()
      .then(() => console.log('Inited'))
      .then(() => {
        console.log('Checking existence of folder');
        return client.client.exists('/myname/');
      })
      .then(res => {
        if (res) {
          // log.info("remote vault folder exits!");
          console.log('Vault Folder exists');
          return res;
        } else {
          console.log('remote vault folder not exists, creating');
          return client.client.createDirectory(`/myname/`).then(x => {
            console.log('Created vault');
            return x;
          });
        }
      })
      // .then(() => client.client.getDirectoryContents('/'))
      // .then(x => {
      //   console.log('Received contents: ', x);
      //   return x;
      // })
      .then(results => {
        console.log('Vault folder ', results);
        return client.client.stat('/myname/', { details: false });
      })
      .then(x => {
        console.log('Received stat: ', x);
        return x;
      })
      .catch(e => console.log('Error in inner promise chain: ', e));

  })
  .then(x => console.log(x))
  .catch(error => console.log('There was an error: ', error.message));
