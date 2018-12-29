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

### Installing packages

```
yarn add -D assets-webpack-plugin mini-css-extract-plugin optimize-css-assets-webpack-plugin uglifyjs-webpack-plugin
yarn add express-webpack-assets
```

- `assets-webpack-plugin` creates the manifest in JSON format
- `express-webpack-assets` reads the manifest and exposes a utility you can use in the templates
- `mini-css-extract-plugin` extracts styles to separate CSS files in your bundle
- `optimize-css-assets-webpack-plugin` minimizes the CSS (using cssnano)
- `uglifyjs-webpack-plugin` minimizes JS

[commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/e7498b7313058bff8658c4b744ce11adc2c34ad4)

### Configure manifest in Webpack

Add the `assets-webpack-plugin` to your `webpack.config.js`

```javascript
const AssetsWebpackPlugin = require('assets-webpack-plugin');

module.exports = {
    plugins: [
        new AssetsWebpackPlugin({path: config.distFolder}),
    ]
}
```

This plugin will now generate a `/dist/webpack-assets.json` file during each build.

[commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/1025a8bb13ec52327349319f13841aa418f6b8fe)

### Implement assets in Express app

Now that we have a manifest, we can use that in our Express app. The `express-webpack-assets` library includes a
middleware that will take care of that. Let's add it to our `/src/server/app.js`:

```javascript
const webpackAssets = require('express-webpack-assets');

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

[commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/1b6bf255a0188c862bd47946eb2d5286c8710d66)

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
                    config.isProd ? { loader: MiniCssExtractPlugin.loader } : 'style-loader',
                    'css-loader',
                    'postcss-loader',
                    'sass-loader'
                ],
            }
        ]
    },
```
You can now test the build by running following command:

    yarn build
    
A wild `dist/main.css` appeared!

Finally we can add the CSS file to our `layout.twig`:
```twig
    {% if webpack_asset('main').css is defined %}
    <link rel="stylesheet" href="{{ webpack_asset('main').css  }}" />
    {% endif %}
```
We add this conditionally because the CSS asset will not be present during development!

[commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/2a5e1b7867db66c4af90a64814245842eae27d57)

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

[commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/697db3d6c473dde6be221794360e660533d58f7e)

### Add hashes to asset filenames

As a final step we can configure webpack to use hashes in the output filenames:

```javascript
module.exports = {
    output: {
        path: config.distFolder,
        filename: '[name].[hash].js',
        publicPath: config.publicPath
    },
    plugins: [
        new AssetsWebpackPlugin({path: config.distFolder}),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
        }),
    ],
}
```

Since we already implemented the manifest, we don't need to do anything in our Express app.

## Conclusion

[commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/954c36d2a86382ba514983db3d17d290239761b7)

We now have a complete setup for both development and production. To summarize, these commands are now available to you:

`yarn start` Start Express app and wds, watch for changes and refresh your browser to apply them.

`yarn build` Create your frontend bundle. Files are saved to the `dist/` folder.

`yarn start:prod` Run Express in production-mode, just serving the files from the `dist/` folder. Webpack is not
 running.
 
