# Chapter I - Scaffolding a new project

There are many ways to create a new Express project, but in this book we'll use the official
 [Express generator tool](https://expressjs.com/en/starter/generator.html) to generate a new project:

```bash
$ npm i express-generator -g
$ express -v twig my-project
```

The generator will create a `my-project` folder and put a basic Express app in it. Let's go over the files created:

- `package.json` Define dependencies and scripts
- `public/` is the default static assets folder of Express. By default it contains a style.css file which we will replace in chapter 3
- `app.js` contains the actual Express application. This is where you generally define the middlewares of your Express app
- `routes/` contains Router instances that will be added to `app.js`
- `views/` contains a few twig templates. I prefer to use twig, but choosing another template system won't make much difference for this book
- `bin/www` this may look confusing, but it's actually just a JS file. It's used to start the server.

[Sample commit for this step](https://github.com/webberig/webpack-express-ultimate-guide-sample/commit/c3cf40a5795e820b267efca88f053b9c787108c1)

## Moving files

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

[Sample commit for this step](https://github.com/webberig/webpack-express-ultimate-guide-sample/commit/db51bfec6e09b3dbbbd491610e0d4db7120c5672)

## Adding it to git

If you want to use git in your project, consider making a `.gitignore` file first. I used the PHPStorm generator but
the most important rules are:

```ignore
/dist
/node_modules
```

[Sample commit for this step](https://github.com/webberig/webpack-express-ultimate-guide-sample/commit/b18b353501dc208b08dab9e9401304b1dbaa0302)

## Installing dependencies and starting it up

```
cd my-project
yarn install
yarn start
```

Point your browser to (http://localhost:3000) and see the app in action!

## Conclusion

We used the Express generator to create a new Express project and made a few preparations before we add the client-side
configuration. You should be able to start the app and see a test page.

After completing this chapter, your app should look like the sample app in the
 [1-express-scaffolding](https://github.com/webberig/webpack-express-ultimate-guide-sample/tree/1-express-scaffolding) branch.
