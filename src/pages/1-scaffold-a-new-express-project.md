# Chapter I - Scaffolding a new project

There are many ways to create a new Express project, but in this book we'll use the official
 [Express generator tool](https://expressjs.com/en/starter/generator.html) to generate a new project.
 
### Create a new Express project

Use the generator to create your project:

```bash
npm i express-generator -g
express -v twig my-project
cd my-project
```

The generator will create a `my-project` folder and put a basic Express app in it. Let's go over the files created:

- `package.json` Define dependencies and scripts
- `public/` is the default static assets folder of Express. By default it contains a style.css file which we will replace in chapter 3
- `app.js` contains the actual Express application. This is where you generally define the middlewares of your Express app
- `routes/` contains Router instances that will be added to `app.js`
- `views/` contains a few twig templates. I prefer to use twig, but choosing another template system won't make much difference for this book
- `bin/www` this may look confusing, but it's actually just a JS file. It's used to start the server.

Take a look at the [commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/9268371229c671d773e675ba5372edfaf6df6074)

### Housekeeping

The fact you're using Javascript for both server and client is pretty neat. However, it can become confusing if you
 don't keep things separated. Separating client and server will also make defining the watched files easier for the
  Express HMR in chapter 5.
  
This is why we'll move all Express-related files to a new folder `/src/server`:

- `app.js` > `src/server/app.js`
- `views/` > `src/server/views/`
- `routes` > `src/server/routes/`

You'll also have to update references to this file:

- `bin/www`: Reference to the `app.js` (`require('../src/server/app')`)
- `src/server/app.js`: Reference to the public folder (`path.join(__dirname, '../../public')`)

[commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/85714693f0b293d7b1c4b521c65d69f7e84cf3a1)

### Adding .gitignore

If you want to use git in your project, consider making a `.gitignore` file first. I used the PHPStorm generator but
the most important rules are:

```ignore
/dist
/node_modules
```

[commit for this step](https://github.com/webberig/webpack-express-ultimate-sample/commit/31a14e20d90f1817d35fbc2b70238bf400a592c8)

## Conclusion

We used the Express generator to create a new Express project and made a few preparations before we add the client-side
configuration. You should be able to start the app and see a test page.

```
yarn install
yarn start
```

Point your browser to (http://localhost:3000) and see the app in action!

After completing this chapter, your app should look like the sample app in the
 [chapter-1](https://github.com/webberig/webpack-express-ultimate-sample/tree/chapter-1) tag.

## Further reading
- https://expressjs.com/en/starter/generator.html
- https://www.gitignore.io/

[Continue to chapter 2 - Setup Webpack for JS build with babel](/2-setup-webpack-build-with-babel)
