# Chapter II - Setup Webpack for JS build with babel

In this chapter we'll introduce Webpack to the project. It's main purpose is to bundle JS and CSS for the
frontend stack. Secondly we will exploit Webpack's HMR feature to the maximum to enhance the Developer experience. If
all goes according to plan, each change will almost instantly be reflected in youw browser without haven to manually
refresh!

## Housekeeping

With that goal in mind, the default folder structure of Express needs some improvements. Having a clear separation
 between code of the server and code of the frontend (which are both Javascript!) will simplify defining a watcher to
 detect changes to the server code. This is why we'll put all server-related code (views, routes, the Express app) in
  a single folder `/src/server`. In a nutshell:

- `/app.js` -> `/src/server/app.js`
- `/views/` -> `/src/server/views/`
- `/routes/` -> `/src/server/routes/`

You'll also need to update 2 references between those files:

- `/bin/www` requires `app.js`, this will become `../src/server/app.js`
- `/src/server/app.js` defines a pubic assets folder which we didn't move, this becomes `path.join(__dirname, '../../public')`

I suggest you restart the app by running `yarn start` and make sure it still works.

Take a look at the [commit for this step](https://github.com/webberig/webpack-express-ultimate-guide-sample/commit/db51bfec6e09b3dbbbd491610e0d4db7120c5672)


## Adding webpack

First, we add some dependencies to our project:

```
yarn add -D webpack webpack-cli
```

The `webpack` is the core package that does the actual compiling. `webpack-cli` is responsible for providing a CLI
interface. This doesn't do much as long as we don't have a configuration, so let's move on to the next step!

### Configuring Webpack

Create a `webpack.config.js` file containing following minimal configuration:

```
// webpack.config.js
var Webpack = require("webpack");
var path = require("path");
var buildPath = path.resolve(__dirname, "dist");
var mainPath = path.resolve(__dirname, "src/client", "main.js");
const devMode = process.env.NODE_ENV !== "production";

var config = {
    entry: [mainPath],
    output: {
        path: buildPath,
        filename: "bundle.js",
        publicPath: "/assets/"
    },
    mode: devMode ? "development" : "production",
};

module.exports = config;
```

The `entry` option contains the file that webpack uses as a starting point to detect the dependency tree of your
frontend bundle. This is exactly what webpack does: it parses your code, looks for dependencies (supporting multiple
ways to declare them) and compiles everything to a single 'bundle' which is usually a JS file.

If you add a dependency to a file other than JS, you can setup so-called 'loaders' that help Webpack to deal with those.
 Ie. if you add `require("style.css")` to your entry, you'll need to add the `style-loader` so webpack knows how to
 include the CSS into the bundle (and applying the styles upon loading).

`output` defines where Webpack can put the resulting bundle and how to name it. You can also see the `publicPath`
 option. This needs to be the URL path of where the bundle will be located inside your website. 

If `mode` is set to production, Webpack will pre-configure some plugins to optimize and minify your bundle.

As you can see, I've defined some variables `mainPath` and `buildPath` to help configure the `entry` and `output`
options: Webpack will use `/src/client/main.js` as an entry and will output `/dist/bundle.js`.

Speaking of which, we should now create that entry file:
```
// /src/client/main.js
console.log("Hello, from src/client/main.js with love");
```

Don't worry much about that content, we wil add more useful things later. This will be the file where you start coding
(or requiring) your frontend modules.

Take a look at the [commit for this step](https://github.com/webberig/webpack-express-ultimate-guide-sample/commit/f92183a1632276e16a3e8d89044401d2769466d2)

### Testing the build

We're ready to give Webpack a go. Run following command to build your frontend bundle:

```
./node_modules/.bin/webpack
```

You should see a result like this:

![Webpack run](/chapter-2/webpack-first-run.png)


### Adding the bundle to your HTML

After running the build, you should also see that `/dist/bundle.js` has appeared in your project. We'll add this file
to our website now.

First, we'll need to tell Express you want this folder to be exposed as "static assets". I suggest putting this line
after the already existing `express.static` statement.

```
// /src/server/app.js
app.use("/assets", express.static(path.join(__dirname, '../../dist')));
```
You don't need to delete the `/public` folder or remove the other `express.static` statement. This can still be used for
 other assets you don't want Webpack to process.
 
Now add the script tag to your website's HTML:

```
// /src/server/views/layout.twig
<script src="/assets/bundle.js"></script>
```

Make sure your app is running (`yarn start`), point your browser to the page http://localhost:3000 and open the dev
console in your browser. You should see the loving message appearing from our bundle.

![Browser with console output from bundle](/chapter-2/browser-with-bundle.png)

Take a look at the [commit for this step](https://github.com/webberig/webpack-express-ultimate-guide-sample/commit/f92183a1632276e16a3e8d89044401d2769466d2)

### Adding Babel

The last thing we want to do is add Babel. If you haven't heard of it, [Babel js](https://babeljs.io/) is a compiler
that supports the latest syntax and features (ES6, ES2015, ...) and transpiles it to older Javascript that browsers
can understand.

In Webpack, adding Babel is piece-of-cake. Just add the `babel-loader` plugin. First, we add depedencies to our project:
```bash
yarn add -D @babel/core @babel/preset-env babel-loader
```

- `@babel/core` is the actual compiler
- `@babel/preset-env` is a preset that automates configuration based on browsers you wish to support
- `babel-loader` is the Webpack 'loader' which will integrate Babel into your Babel stack

Finally, we configure the loader in our `webpack.config.js`
```
...
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
...
```

Webpack uses a rule-based architecture to determine which loaders are used for which regex matches. In this case, we
look for any `.js` or `.mjs` files, exclude dependencies in the `node_modules` folder and use the `babel-loader` for any
matching files.

You can test the setup by adding some ES6/7/2015 syntax in your `/src/client/main.js` and run webpack.

Take a look at the [commit for this step](https://github.com/webberig/webpack-express-ultimate-guide-sample/commit/7f70af4bab0eb2be5e7955b22d38be17a90eb2c4)

## Tip & Tricks

You can also install Webpack globally (`npm install -g webpack webpack-cli`). If you do that, you can simply run
the `webpack` command.

Keep in mind that the code in the bundle won't change by itself. You need to re-run the `webpack` command every time
you make a change.

Webpack also has a built-in watch feature. Just run `webpack -w` and it will watch all files in the dependency tree 
of your client code and rebuild when you make a change.

## Conclusion

Your app should look like the sample app in the
 [2-webpack-babel](https://github.com/webberig/webpack-express-ultimate-guide-sample/tree/1-express-scaffolding) branch.

You can now run Webpack manually to build your frontend bundle. This is a basic but workable setup. The focus of this book 
however is to add more automation to webpack and integrate it deeper in your app. We want webpack to build the bundle
upon start, trigger re-build automatically upon changes and signal the browser so it reloads. 

After completing this chapter, your app should look like the sample app in the
 [chapter-2](https://github.com/webberig/webpack-express-ultimate-guide-sample/tree/chapter-2) tag.

[Continue to chapter 3 - Build SCSS using Webpack](/3-build-scss-using-webpack)
