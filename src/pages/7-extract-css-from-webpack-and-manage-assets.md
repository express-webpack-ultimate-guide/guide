# Chapter VII - Extract CSS from webpack and manage assets

Up until now we have focused on the developer-mode of the project. Now it's time to address the production build.

#### Extracting CSS (but not during development)

We already installed the `style-loader` that compiles CSS into JS and applies it to the page when loaded. It supports
HMR. Now we're adding the mini-css-extract-plugin and its included loader which will save the CSS to a separate CSS file
during buildtime. When the CSS is extracted, hmr is no longer possible.

This is why we must define which loader is used dynamically... In development we use `style-loader`, production build
will use `mini-css-extract-plugin`.

This also means that the `link` tag in the HTML must be present only when the CSS file is served!

#### Caching

Webpack also has a really good [caching mechanism](https://webpack.js.org/guides/caching/) by adding hashes to the
 outputted files. This means your production build will have "bundle.a34ef.js" and "vendor.b34a2.js". We must make sure
 that ExpressJS knows which filename we got during buildtime.

#### Minification

Webpack 4 has minification enabled by default. Unfortunately this only works for JS, not CSS. We'll need to configure
minification manually and add a plugin that minifies the CSS.

#### The challenge
This means you can't just add static `<script>` or `<link>` references in your HTML, webpack will decide what assets you 
need to bring to your page! Luckily, there's a quite easy solution for that. Webpack can export a "manifest" which is
a JSON file containing all assets it created for each entry. All we need to do is incorporate that manifest into the
Express app so it generates all necessary assets.

## Get started
### Addding packages

    yarn add -D assets-webpack-plugin express-webpack-assets mini-css-extract-plugin optimize-css-assets-webpack-plugin uglifyjs-webpack-plugin 

`assets-webpack-plugin` creates the manifest in JSON format
`express-webpack-assets` reads the manifest and exposes a utility you can use in the templates
`mini-css-extract-plugin` extracts styles to separate CSS files in your bundle
`optimize-css-assets-webpack-plugin` minimizes the CSS (using cssnano)
`uglifyjs-webpack-plugin` minimizes JS

### Configure manifest

Add the `assets-webpack-plugin` to your `webpack.config.js`

```javascript
const AssetsWebpackPlugin = require('assets-webpack-plugin');

module.exports = {
    plugins: [
        new AssetsWebpackPlugin({path: path.join(__dirname, 'dist')}),
    ]
}
```

This plugin will now generate a `/dist/webpack-assets.json` file during each build.

Take a look at the [commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/b47ed89318efaa40e447c612bccd0b46695d15a8)

### Implement assets in Express app

Now that we have a manifest, we can use that in our Express app. The `express-webpack-assets` library includes a
middleware that will take care of that. Let's add it to our `/src/server/app.js`:

```javascript
var webpackAssets = require('express-webpack-assets');

// ... 

  app.use(webpackAssets(path.join(__dirname, '../../dist/webpack-assets.json'), {
    devMode: process.env.NODE_ENV !== "production"
  }));
```
The middleware will expose a function `webpack_asset` to our template engine, so we replace our static reference to
`bundle.js` to the one defined in the manifest:

```twig
    <script src="{{ webpack_asset('main').js  }}"></script>
```

The Javascript will now be loaded no matter how webpack is naming our files, as long as we keep the name of the entry
"main".

Take a look at the [commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/1fcd85a82326c71636e2c498f0987cfad2f14399)

### Extract CSS during production build

The next step is to configure the plugins that will extract the CSS.

In `webpack.config.js`:

```javascript
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    plugins: [
        // ...
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
        }),
    ],
}
```
Next, we replace the `style-loader` during production builds:
```
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    devMode ? 'style-loader' : { loader: MiniCssExtractPlugin.loader },
                    'css-loader',
                    'postcss-loader',
                    'sass-loader'
                ],
            }
        ]
    },
```

You can now test the build by running following command:

    NODE_ENV=production webpack --prod
    
A wild `dist/main.css` appeared!

Take a look at the [commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/1fcd85a82326c71636e2c498f0987cfad2f14399)

### Add optimization

We can now add minification to our `webpack.config.js`:

```javascript
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
    optimization: {
        minimizer: [
            new UglifyJsPlugin(),
            new OptimizeCSSAssetsPlugin(),
        ]
    }
}
```

Even though Webpack 4 has UglifyJs built-in and enabled by default, we need to add it anyway because we're overriding
 the `optimization.minimizer` default configuration.

### Add npm scripts

Add new scripts in your `package.json`:
```
  "scripts": {
    "start": "node ./bin/dev.js",
    "start:prod": "NODE_ENV=production node ./bin/www",
    "build:prod": "NODE_ENV=production webpack --prod"
  },
```

## Conclusion

We now have a complete setup for both development and production. To summarize, these commands are now available to you:

`yarn start` Start Express app and wds, watch for changes and refresh your browser to apply them.

`yarn build:prod` Create your frontend bundle. Files are saved to the `dist/` folder.

`yarn start:prod` Run Express in production-mode, just serving the files from the `dist/` folder. Webpack is not
 running.
 
