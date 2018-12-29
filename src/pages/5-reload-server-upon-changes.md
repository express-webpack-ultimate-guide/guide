# Chapter V - Reload server upon changes (the smart way)

This chapter is the key to perfection of our Express app setup, at least, if we do it properly.

When a NodeJS app is running it won't see changes while it is running. Even if you manage to restart the http server
instance, you'll need to deal with forcing to reload your code.
 
The most common way to handle server reloads is using [nodemon](https://nodemon.io/). This tool wraps your script in a
 separate process, watches your files for changes and restart the entire process when triggered.

While this works very straightforward and does wat we want, it's far from perfect. Since our webpack-dev-server is also 
running in the same script, it will get restarted as well. This has some undesirable effects:

- webpack is so smart it can re-build just the modules that have changed. This makes webpack very fast. However, if the
 server gets restarted, it has to rebuild all from scratch. 
- The browser will disconnect its socket connection with the server. The client does have a mechanism to reconnect but
 it throws some errors and will be flaky at best.
- We won't be able to reload the browser since the server goes down as well, we can't let nodemon talk to wds to 
trigger a reload.

So, with Nodemon out of the question, I went looking for alternatives and found some interesting blog posts on the 
subject:
- (https://blog.cloudboost.io/reloading-the-express-server-without-nodemon-e7fa69294a96)
- (https://codeburst.io/dont-use-nodemon-there-are-better-ways-fc016b50b45e)

Basically, we need to do 3 things to replace Nodemon with a better controlled solution:
1. Use `chokidar` to watch for file changes
2. Restart the server which I learned how in
 [Akshendra's blog post](https://blog.cloudboost.io/reloading-the-express-server-without-nodemon-e7fa69294a96)
3. Clear Node's require cache which is shown in
 [Kevin's blog post](https://codeburst.io/dont-use-nodemon-there-are-better-ways-fc016b50b45e)

This way we keep control of the restart while keeping the webpack-dev-server alive.

OK, enough with the reasoning, get to code!

### Installing packages

```bash
yarn add -D chokidar
```
Chokidar is a library wrapping NodeJS's native fs.watch API. Nodemon also uses this library.

[commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/fd7e9af3c9b06dfcc2261aac38ddf8d80662dfed)

### Wrap the Express app in a function
If we create a new server instance upon restart, we want a new instance of the Express app as well. To avoid the
"singleton", we must wrap the definition of the Express app in a function, so that we get a new instance everytime 
the function is called.

In your `/src/server/app.js` - before
```
const app = new Express();
...
module.exports = app;
```

After:
```
module.exports = () => {
    const app = new Express();
    ...
    return app;
}
```

We must adapt our startup script to work with this change, so in your `/bin/www`:
```
    var app = require('../src/server/app')();
```
(Notice the trailing brackets)

[commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/ffdb66b549c5cf33aa658c83dd2e2997de30d5e1)

### Implement file watch and server restart

Next we'll make significant changes to `/bin/www`. This is how it looks:

```
#!/usr/bin/env node

/**
 * Module dependencies.
 */

var debug = require('debug')('express-hmr:server');
var http = require('http');
const path = require("path");
const config = require("../src/config");

function normalizePort(val) {
...
}

function onError(error) {
...
}

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');

/**
 * Create HTTP server.
 */

let server;
const sockets = [];
```
The `sockets` array will have a reference to each connection of the server. We'll need this to close them before closing
the server.

`server` will contain the active server instance.

```

function startServer() {
  return new Promise((resolve, reject) => {
    const app = require("../src/server/app")();
    app.set('port', normalizePort(process.env.PORT || '3000'));

    server = http.createServer(app);
    server.listen(app.get('port'));
    server.on('error', onError);
    server.on('connection', (socket) => {
      debug('Add socket', sockets.length + 1);
      sockets.push(socket);
    });
    server.on('listening', () => resolve());
  })
}
```
The code to start the http server is now wrapped in a promise inside this method. I also added a "connection" event
listener that pushes the socket to the `sockets` array. This will be used to destroy any open connections when we want
to shut down the server.

```
function clearCache() {
  // clean the cache
  Object.keys(require.cache).forEach((id) => {
    delete require.cache[id];
  });
}
```
This method will clear the require cache. Node caches each required module. This is good in general use, but when we're
listening for file changes, we want to actually reload the new version. Clearing the cache will force the server to
load a new version of every module being required.
```
function stopServer() {
  return new Promise((resolve, reject) => {
    while (sockets.length) {
      const socket = sockets.pop();
      if (socket.destroyed === false) {
        socket.destroy();
      }
    }

    server.close(() => {
      resolve();
    });
  })
}
```
Stop the server after destroying any open socket connections if any.
```

function restart() {
  return stopServer()
      .then(clearCache)
      .then(startServer)
}
```
Restart = stop + clear cache + start! 
```

startServer().then(() => {
  var addr = server.address();
  var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
  console.log('Listening on ' + bind);
});
```
This actually starts the server when the script is called.
```

if (!config.isProd) {
  const hmr = require("../src/server/hmr");
  const bundler = hmr.startWds();
```
Start up webpack-dev-server.
```
  const chokidar = require('chokidar');
  chokidar.watch(path.join(__dirname, "../src/server")).on('all', (event, at) => {
    if (event === 'change') {
      console.log('Restarting server...');
      restart();
    }
  });
```
Start watching the server files and call `restart()` when a file changed.
```
}
```

[commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/8d1a08f5465f204440c6fdb499aafb9cd06b3f2d)

## Conclusion

That's it! You should now be able to start your development server by running `yarn start` or `npm run start`. Whenever
you make a change to the server (routes, views, ...) it should automatically reload the server. However, you would
still need to refresh your browser manually. We'll put the icing on the cake in the next chapter!

After completing this chapter, your app should look like the sample app in the
[chapter-5](https://github.com/webberig/webpack-express-ultimate-sample/tree/chapter-5) tag.

[Continue to chapter 6 - Refresh browser upon server reload](/6-refresh-browser-upon-server-reload)

## Further reading
- [Medium article on nodeJS require cache](https://medium.com/@gattermeier/invalidate-node-js-require-cache-c2989af8f8b0)
- [Akshendra's blog post on reloading an Express server](https://blog.cloudboost.io/reloading-the-express-server-without-nodemon-e7fa69294a96)
- [Kevin's blog post on replacing Nodemon with a better alternative](https://codeburst.io/dont-use-nodemon-there-are-better-ways-fc016b50b45e)
