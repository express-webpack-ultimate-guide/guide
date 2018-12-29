# Chapter III - Build SCSS using Webpack

CSS prepocessors have been around for quite some time. We used to setup build tasks using Grunt or Gulp to compile 
those files (SCSS, Less, Stylus, ...) back to CSS. Using Webpack for this job may seem a bit strange. After all, it
 compiles your CSS to JS and gets included in a Javascript bundle. Then we use an additional plugin to extract 
 the CSS and put it back in a CSS file. However, there are at least 2 good reasons why webpack is a good choice for the job.
  
Firstly, you can take advantage of the HMR feature. I can't think of any other alternative preprocessor setup that
 updates styles on the fly in your browser without a refresh.

Secondly, if you think about it, it makes a lot of sense to have your JS modules depend on your CSS files. If you 
properly structure your JS, you would often have a file for each component, and each component could have CSS. This 
way you keep all CSS being added to your application in check, have dependency reports and size analysis, etc...

We'll also add PostCSS to the stack. This will provide easy access to [autoprefixer](https://github.com/postcss/autoprefixer).
This tool will add vendor prefixes required to support older browsers.

The sample project uses SCSS, but you can pretty much do the same with any other preprocessor if you replace the 
`sass-loader` with the appropriate loader.

### Installing packages

To have your SCSS properly processed in Webpack, you'll need 4 different loaders. This is because Webpack recommends
a single responsibility principle for a loader, and there are actually 4 steps involved this time:

- `sass-loader` compiles your SASS/SCSS to CSS
- `css-loader` interprets any resources in the CSS and add those as dependencies
- `postcss-loader` applies PostCSS plugins (in our case, autoprefixer)
- `style-loader` compiles the CSS to JS and makes sure the CSS is applied during runtime or
 [on-demand](https://github.com/webpack-contrib/style-loader#useable)

Install the loaders in your project:
```
yarn add -D sass-loader node-sass css-loader postcss-loader postcss-preset-env style-loader
```

You will notice I also added `postcss-preset-env` and `node-sass`. This is because `sass-loader` requires you to add
`node-sass` as a dependency yourself, and `postcss-preset-env` helps us configuring postcss more easily.

[commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/593588627dbc11ed67c369e854987162d283b09c)

### Configure webpack

Just add a new rule to your `webpack.config.js` to use those loaders.

```
    module: {
        rules: [
            ...
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'postcss-loader',
                    'sass-loader'
                ],
            }
        ]
    }
```

[commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/9f08f8262a5f37bf09416f67ce74b58cf2f8c9b8)

### Create your first SCSS file

I moved the default CSS file `/pubilc/stylesheets/style.css` (created by the Express generator) and renamed it to
 `/src/client/main.scss`.
 
Then, I added it as a dependency in our entry file:
```javascript
// /src/client/main.js
require("./main.scss");
```
Don't forget to remove the old `stylesheets/style.css` reference in `/src/server/views/layout.twig`.

Finally, create a config file required by postCSS at `/src/client/postcss.config.js`:
```javascript
module.exports = () => {
    return {
        map: false,
        plugins: {
            "postcss-preset-env": {
                autoprefixer: {
                    grid: true
                }
            },
        }
    }
};
```

[commit for these steps](https://github.com/webberig/webpack-express-ultimate-sample/commit/1a6c2763de9c70d31d91c62db67b3d908663a4fc)

## Conclusion

And that's it! Run `webpack`, start the server (`yarn start`) and point your browser again to http://localhost:3000

You webpack bundle now includes the styles of the project. You should be aware that this setup is not production-ready,
because having your CSS inside the JS is not recommended. In chapter 7 we'll come back to the CSS and extract it from
the bundle during production build.

After completing this chapter, your app should look like the sample app in the
 [chapter-3](https://github.com/webberig/webpack-express-ultimate-sample/tree/chapter-3) tag.

[Continue to chapter 4 - Setting up webpack-dev-server](/4-setting-up-webpack-dev-server)
