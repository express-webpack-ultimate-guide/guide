# Chapter IV - Setting up webpack-dev-server

Up until now we've used the regular webpack CLI to build or watch, in which the output is written to disk (in our case
the `/dist` folder).

Webpack-dev-server is an official development tool from the Webpack team. It works very different compared to the
 regular compiler:

- It keeps the build artifacts in memory, it doesn't actually write output to disk
- It works as a stand-alone web-server to serve the build artifacts
- It adds support to HMR (the cat's out of the bag!)

Behind the curtains it's actually just an Express app exposing the `webpack-dev-middleware`. Why don't we just
use that middleware directly, you wonder ? Later on, we want to be able to restart the Express app while the 
webpack-dev-middleware stays alive and connected to your browser. That way it can signal the browser for a refresh after
the app has been reloaded.

We'll also setup a proxy middleware so requests to `/assets` are forwarded to the `webpack-dev-server`. This needs to be
optional because using the webpack-dev-server in production is not recommended. How the assets are exposed is based on
the NODE_ENV environment variable.

- `NODE_ENV=production` > Static assets middleware exposing the `/dist` folder
- `NODE_ENV=development` (default) > Proxy middleware passing request to the webpack-dev-server

We'll create a new module (JS file) that will define a `startWds()` method to start the webpack-dev-server and
`createProxy()` will create a proxy middleware to be included in the Express app. I decided to put those methods in
 `/src/server/hmr.js`.

So, let's get started!

### Installing packages

```
yarn add -D http-proxy webpack-dev-server
```

[commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/e60bc70da6dfe12ccd3dce86785c7f472fcb70ff)

### Setting up webpack-dev-server

#### Changes /src/server/hmr.js

```
// /src/server/hmr.js
const Webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const webpackConfig = require("../../webpack.config.js");
const config = require("../config");
const httpProxy = require("http-proxy");

exports.startWds = () => {
    if (config.hmrEnabled) {
        Object.keys(webpackConfig.entry).forEach(name => {
            webpackConfig.entry[name] = typeof webpackConfig.entry[name] === "string" ?
                [webpackConfig.entry[name]] : webpackConfig.entry[name];

            webpackConfig.entry[name] = [
                "webpack/hot/dev-server",
                `webpack-dev-server/client?http://localhost:${config.wdsPort}`,
                ...webpackConfig.entry[name]
            ];
        });
    }
```
`webpackConfig` contains your webpack configuration (located in `webpack.config.js`. If hmr is enabled, this code will
 add extra modules to your entrypoints. These modules are the client-side implementation of HMR. They will take care 
 of pulling changes whenever webpack has re-built and refresh the browser. You'll see a mention of
  `localhost:${config.wdsPort}` in there. This is the host and port of the webpack-dev-server running (started below),
   so this must match the `bundler.listen` statement below. We added the port in our config file earlier.
```
    const compiler = Webpack(webpackConfig);
```
This will create an instance of the webpack compiler. The `webpack-dev-server` relies on this to perform the actual 
build.
```

    compiler.plugin("compile", function () {
        console.log("Bundling...");
    });

    compiler.plugin("done", function () {
        console.log("Bundling succeeded");
    });

    const bundler = new WebpackDevServer(compiler, {
        publicPath: config.publicPath,
        hot: config.hmrEnabled,
        quiet: false,
        noInfo: true,
        stats: {
            colors: true
        },
    });
```
Create an instance of the webpack-dev-server. We pass the webpack compiler instance and some options. The most
noteworthy option here is `hot: config.hmrEnabled`, this will enable HMR! Can you smell the scent of success
 already ? :-)
```

    bundler.listen(config.wdsPort, "localhost", function () {
        console.log("Bundling project, please wait...");
    });
```
This will start a webserver on the configured port (3001) which must be different than the Express app
 (3000 by default).
```
};

exports.createProxy = () => {
    const proxy = httpProxy.createProxyServer();
    return (req, res) => proxy.web(req, res, { target: "http://localhost:3001/assets" });
};

```
The `createProxy` method is pretty straightforward, it returns an Express middleware that passes each request to a proxy
 instance which forwards the requests to the wds (`localhost:3001/assets`).

#### Changes to /bin/www

Remember that `/bin/www` is the script being run to start the Express app ? Now it will also start the
 webpack-dev-server. Add following snippet to `/bin/www`:

```
const config = require("../src/config");

if (!config.isProd) {
    const hmr = require("../src/server/hmr");
    const bundler = hmr.startWds();
}
```

### Changes to /webpack.config.js

We also need to add a plugin to the webpack config: the
[HotModuleReplacementPlugin](https://webpack.js.org/plugins/hot-module-replacement-plugin/) which is
included in the `webpack` core package itself. We'll need to add the plugin dynamically based on
`config.hmrEnabled`:

```
const Webpack = require("webpack");

var webpackConfig = {
    ...
    plugins: [
    ]
};

if (config.hmrEnabled) {
    webpackConfig.plugins.push(new Webpack.HotModuleReplacementPlugin());
}
module.exports = webpackConfig;
```

#### Changes to /src/server/app.js

The last piece of the puzzle is the proxy middleware to the Express app. In your `/src/server/app.js` file,
 replace the static middleware with following snippet:

```
if (config.isProd) {
  app.use(config.publicPath, express.static(config.distFolder));
} else {
  const {createProxy} = require("./hmr");
  app.use(config.publicPath, createProxy());
}
```

If not in production, this will apply the middleware we created in the `hmr.js` module.

#### And... Done!
Whoa, that was a big change! Let's recap:

1. We created a module that helps up start up the webpack-dev-server
2. We added that to the startup script (if not production)
3. We added the hmr plugin in our webpack config (if hmr enabled)
4. We added a proxy middleware (if not production) in our Express app

Run `yarn start` and see if it works. Try to make changes to any of the frontend files, you should see hmr
kick in and reload your browser.

[commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/7e84bb73568a61bc492c5ce0b8ce6d34f8641702)

### Add npm scripts

We now have an Express app with 3 different modes
- `yarn start` Development server with webpack-dev-server and hmr enabled
- `NODE_ENV=production yarn start` Production server which uses static `/dist` folder to server the assets (Webpack must
have made a build first)
- `NO_HMR=1 yarn start` Development server with wds but hmr disabled

We can make that a bit easier by adding scripts to our package.json:
```
  "scripts": {
    "start": "node ./bin/www",
    "build": "NODE_ENV=production webpack",
    "start:prod": "NODE_ENV=production node .bin/www",
    "start:no-hmr": "NO_HMR=1 node .bin/www"
  },
```

[commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/8d26fe7f8d8939d45ae12e2f0e71d307b14093f5)

## Conclusion

We're getting really close to what we want to achieve in this book. You will now have an Express app in which the
frontend is being processed with webpack-dev-server.

Keep in mind that we're building towards a system that has 2 different modes: development and production. While we've
prepared a few things to make that distinction, our production build is not yet ready. We'll finish that in chapter 7.

After completing this chapter, your app should look like the sample app in the
 [chapter-4](https://github.com/webberig/webpack-express-ultimate-sample/tree/chapter-4) tag.

[Continue to chapter 5 - Reload server upon changes (the smart way)](/5-reload-server-upon-changes)
