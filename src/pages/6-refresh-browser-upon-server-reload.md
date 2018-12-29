# Chapter VI - Refresh browser upon server reload

This is the final episode of the "hot relading saga". It's not big change though, since all previous chapters have put
everything in the right place to get this done quite easily.

We now have a startup script that starts both webpack-dev-server and the express app. It can also reload the server
instance, while the startup script stays alive. We can now talk to webpack-dev-server and trigger a browser reload.

I recently learned about a static site generator called [cogear.js](https://cogearjs.org/) which drew my attention
because it uses Webpack under the hood, and it works beautifully. The CSS and JS support hot reloading, and even though
 generating the static HTML is done outside Webpack, it manages to trigger a reload through wds - exactly what I want
  in my Express projects.

Cogear uses a slightly different approach, so I had to investigate if webpack-dev-server exposes a way to fire an event
to the browser. I came up with this line:

    bundler.sockWrite(bundler.sockets, "content-changed");

So, we add this to the chokidar change event listener in `bin/dev.js`, so we trigger a refresh after the server
 is restarted:

```
chokidar.watch(path.join(__dirname, "../src/server")).on('all', (event, at) => {
    if (event === 'change') {
        console.log('Restarting server...');
        restart().then(() => {
            bundler.sockWrite(bundler.sockets, "content-changed");
        });
    }
});
```

We use the `restart` promise so we trigger the refresh AFTER we made sure the server is up and running!

Take a look at the [commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/b5f17728e271c553195f0bf339e29a02f651581c)

## Conclusion

After completing this chapter, your app should look like the sample app in the
 [chapter-6](https://github.com/webberig/webpack-express-ultimate-sample/tree/chapter-6) tag.

This was the final step of getting ExpressJS and Webpack to join forces for the ultimate developer experience. When you
run the server (`yarn dev`), you can now do all the things I promised in the preface. Let me just copy/paste that to
be clear:

###### 1. Build (client-side) JS
- Client-side Javascript should be transpiled with **Babel**
- **Webpack** should be configured to make a JS bundle

###### 2. Build CSS
- Compile **SASS/SCSS**
- Pass through PostCSS, mainly to apply the **Autoprefixer** plugin

###### 3. Hot module replacement
- Instantly apply CSS changes without reloading the browser
- Refresh the page upon JS changes
- Refresh the page upon changes in the Express app

After you finish your glass of Cava (or whatever it is you do to celebrate victoriously), continue to the last chapter
 to complete the production-build!

[Continue to chapter 7 - Extract CSS from webpack and manage assets](/7-extract-css-from-webpack-and-manage-assets)
