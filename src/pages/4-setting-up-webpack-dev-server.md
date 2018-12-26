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
- `NODE_ENV=development` > Proxy middleware passing request to the webpack-dev-server

So, let's get started!

## Add the dependencies

```
yarn add -D http-proxy webpack-dev-server
```

## Create hmr module

We'll create a new module (JS file) that will define a `start()` method to start the webpack-dev-server and
`createProxy()` will create a proxy middleware to be included in the Express app.

I decided to put those methods in `/src/server/hmr.js`.

### hmr start method

The method looks like this:
```
const Webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const webpackConfig = require("../../webpack.config.js");

exports.start = () => {
    webpackConfig.entry = [
        "webpack/hot/dev-server",
        "webpack-dev-server/client?http://localhost:3001",
        ...webpackConfig.entry
    ];
    var compiler = Webpack(webpackConfig);

    compiler.plugin("compile", function () {
        console.log("Bundling...");
    });

    compiler.plugin("done", function () {
        console.log("Bundling succeeded");
    });

    var bundler = new WebpackDevServer(compiler, {
        publicPath: "/assets/",
        hot: true,
        quiet: false,
        noInfo: true,
        stats: {
            colors: true
        },
    });

    bundler.listen(3001, "localhost", function () {
        console.log("Bundling project, please wait...");
    });
    
    return bundler;
};
```

I'll explain what all of this does. First:
```
    webpackConfig.entry = [
        "webpack/hot/dev-server",
        "webpack-dev-server/client?http://localhost:3001",
        ...webpackConfig.entry
    ];
```
`webpackConfig` contains your webpack configuration (located in `webpack.config.js`. This code will add extra modules
to your frontend bundle. These modules are the client-side implementation of HMR. They will take care of pulling changes
whenever webpack has re-built and refresh the browser. You'll see a mention of `localhost:3001` in there. This is the
host and port of the webpack-dev-server running (started below), so this must match the `bundler.listen` statement 
below.

    var compiler = Webpack(webpackConfig);

This will create an instance of the webpack compiler. The `webpack-dev-server` relies on this to perform the actual 
build.

    var bundler = new WebpackDevServer(compiler, {
        publicPath: "/assets/",
        hot: true,
        quiet: false,
        noInfo: true,
        stats: {
            colors: true
        },
    });

Create an instance of the webpack-dev-server. We pass the webpack compiler instance and some options. The most
noteworthy option here is `hot: true`, this will enable HMR! Can you smell the scent of success already ? :-)

    bundler.listen(3001, "localhost", function () {
        console.log("Bundling project, please wait...");
    });

This will start a webserver on a port different than the Express app (which is 3000 by default).

### hmr createProxy method

Add this method in the same file (`/src/server/hmr.js`)
```
const httpProxy = require("http-proxy");

exports.createProxy = () => {
    const proxy = httpProxy.createProxyServer();
    return (req, res) => proxy.web(req, res, { target: "http://localhost:3001/assets" });
};
```

This method is pretty straightforward, it creates a proxy instance and returns a middleware that applies the proxy to
all requests if `/assets/*`

### Starting the webpack-dev-server

Add following snippet to `/bin/www`:
```
if (process.env.NODE_ENV !== "production") {
    const {start} = require("../src/server/hmr");
    start();
}
```

Remember that `/bin/www` is the script being run to start the Express app ? Now it will also start the
 webpack-dev-server.
 
### Proxy requests to webpack-dev-server

The last thing we need to do is add the proxy to the Express app.

In your `/src/server/app.js` file, replace the static middleware with following snippet:

```
if (process.env.NODE_ENV === "production") {
  app.use("/assets", express.static(path.join(__dirname, '../../dist')));
} else {
  const {createProxy} = require("./hmr");
  app.use("/assets", createProxy());
}
```

If not in production, this will apply the middleware we created in the `hmr.js` module.

### Add hmr plugin

The final piece of the puzzle is the [HotModuleReplacementPlugin](https://webpack.js.org/plugins/hot-module-replacement-plugin/).
 This plugin is included in the `webpack` package, but needs to be added in your `webpack.config.js`:

```
var config = {
    ...
    plugins: [
        new Webpack.HotModuleReplacementPlugin(),
    ]
};
```

That's it! run `yarn start` and see if it works. Try to make changes to any of the frontend files, you should see hmr
kick in and reload your browser.

All changes of this chapter can be found in [this commit](https://github.com/webberig/webpack-express-ultimate-guide-sample/commit/3eaa9eda6c7dd8011099cffa247ce095e91f5b36)

## Conclusion

We're getting really close to what we want to achieve in this book. You will now have an Express app in which the
frontend is being processed with webpack-dev-server.

Keep in mind that we're building towards a system that has 2 different modes: development and production. While we've
prepared a few things to make that distinction, our production build is not yet ready. We'll finish that in chapter 7.

After completing this chapter, your app should look like the sample app in the
 [chapter-4](https://github.com/webberig/webpack-express-ultimate-guide-sample/tree/chapter-4) tag.

[Continue to chapter 5 - Reload server upon changes (the smart way)](/5-reload-server-upon-changes)
