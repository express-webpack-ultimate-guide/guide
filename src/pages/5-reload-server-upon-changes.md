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

## Wrap the Express app in a function
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

Take a look at the [commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/5e6cfa327e89eeccecf296f71662b01c66366049)

## Create a dev startup script

We'll add a new library called `chokidar` to our app which takes care of file watching:

```
yarn add -D chokidar
```

Since we have special needs during development, it seems best to create a separate boot script for development. I put
this in `/bin/dev.js`.

```
const chokidar = require('chokidar');
const path = require("path");
const hmr = require("../src/server/hmr");
const http = require('http');
const debug = require('debug')('express-hmr:server');

const sockets = [];
let server;
```
The `sockets` array will have a reference to each connection of the server. We'll need this to close them before closing
the server.

`server` will contain the active server instance.

```
function normalizePort(val) {
...
}

function onError(error) {
...
}

```
These methods were copied from the default boot script (`/bin/www`).
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
This is how Express starts a server instance. I wrapped this into a Promise which resolves as soon as the "listening"
event is fired. Later on this will allow us to trigger a browser reload at the proper moment.

I also added a "connection" event listener that pushes the socket to the `sockets` array. This will be used to destroy
 all connections when we want to shutdown the server.
```
function clearCache() {
    // clean the cache
    Object.keys(require.cache).forEach((id) => {
        delete require.cache[id];
    });
}
```
Node caches each required module. This is good in general use, but when we're listening for file changes, we want to
actually reload the new version. This is why we need to clear the cache, and this is
 [how you do it](https://medium.com/@gattermeier/invalidate-node-js-require-cache-c2989af8f8b0).
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
This method will destroy all remaining sockets if any, and close the server. I've also wrapped all this in a Promise
for easy chaining...
```

function restart() {
    return stopServer()
        .then(clearCache)
        .then(startServer)
}
```
The `restart` method will be called when the file watcher fires a change event. As you can see, I now benefit of the 
Promise chain to stop the server, clear cache and start a new server instance!
```

const bundler = hmr.start();
startServer().then(() => {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
});
```
Now it's time to actually start the server. Remember, `hmr.start()` starts the webpack-dev-server.
```
chokidar.watch(path.join(__dirname, "../src/server")).on('all', (event, at) => {
    if (event === 'change') {
        console.log('Restarting server...');
        restart();
    }
});
```
The `chokidar` module takes care of watching the files for changes. When the change event is fired, it runs the 
`restart` chain.

Take a look at the [commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/4090b56991aef00f397fd8d01c3b4420b437aac3)

## Create a npm script

The last (small) step of this chapter is to create a npm script for easy access to the dev startup script. Just add this
to the `scripts` property in your `package.json`:

```
    "dev": "node ./bin/dev.js"
``` 

Take a look at the [commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/e1dda8a8ec73e8b79d54d502876647d1b56249c2)

## Conclusion

That's it! You should now be able to start your server by running `yarn dev` or `npm run dev`. Whenever you make a change
to the server (routes, views, ...) it should automatically reload the server. However, you would still need to refresh your
browser manually. We'll put the icing on the cake in the next chapter!

After completing this chapter, your app should look like the sample app in the
 [chapter-5](https://github.com/webberig/webpack-express-ultimate-sample/tree/chapter-5) tag.

[Continue to chapter 6 - Refresh browser upon server reload](/6-refresh-browser-upon-server-reload)
