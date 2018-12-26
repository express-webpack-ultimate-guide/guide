# Chapter VII - Extract CSS from webpack and manage assets

Up until now we have focused on the developer-mode of the project. Now it's time to address the production build.
Fortunately most of the hard work for the production build is being done by webpack automatically.

In version 4 of Webpack they introduced a `mode` option, combined with a good amount of pre-configuration based
 on that option (ie. minification). We already made the `mode` option dynamic, so we've got that covered.

### Code splitting

One of the features of Webpack is [code splitting](https://webpack.js.org/guides/code-splitting/). Webpack can be 
configured to create additional so-called "chunks" to avoid duplication of common code. This means that the output
may contain multiple "assets" for any given entry, ie. your "bundle.js" and a "vendor.js"

### Caching

Webpack also has a really good [caching mechanism](https://webpack.js.org/guides/caching/) by adding hashes to the outputted files. This means your production 
build will have "bundle.a34ef.js" and "vendor.b34a2.js".

### Extract CSS

As we don't want the CSS to live inside a Javascript file, we can add the `MiniExtractCssPlugin` which will do exactly
what its name says. So your output will be "bundle.a3fce.js", "bundle.ef31d.css" and "vendor.b34a2.js".

### The challenge
This means you can't just add static <script> or <link> references in your HTML, webpack will decide what assets you 
need to bring to your page! Luckily, there's a quite easy solution for that. Webpack can export a "manifest" which is
a JSON file containing all assets it created for each entry. All we need to do is incorporate that manifest into the
Express app so it generates all necessary assets.

## Add asset management to Express


