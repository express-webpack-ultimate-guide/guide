# Preface

A few years ago I started replacing Grunt build steps with Webpack. It gave my team much more power and control over
 the JS build artifacts. I knew Webpack had much more potential but it's only recently that I started using Webpack
  for building CSS too. I couldn't resist running to my colleague's desks to show how CSS gets reloaded instantly
   without the browser having to reload!
 
I've also grown fond of Express and NodeJs. A tool called Nodemon was used to reload the app but I hadn't found a good 
solution to make the browser reload. After trying some solutions from others (even building the Express app as a
webpack bundle!), I finally ended up with the solution in this book.

The protagonists of the book are **Express** and **Webpack**. The chapters in this book will not just get you through
 the process of scaffolding a website project, it will provide insights to all steps taken.

I created a sample git repository with clean commits and branches for each step taken. Those will be used as a reference
in this book explaining each of the commits/branches.

## Goals

The goal is to scaffold an Express project and apply a modern workflow for client-side resources (JS and CSS)

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

## Table of contents

###### Getting started
1. Scaffold a new Express project
2. Setup Webpack for JS build with babel
3. Build SCSS using Webpack

###### Hot reloading
4. Webpack-dev-server with proxy
5. Implement hmr for ExpressJs code

###### Production
6. Extract CSS from webpack and manage assets

###### Linting
7. Add stylelint for CSS linting
8. Add eslint for ES linting

###### Testing
9. Setup Mocha/Chai for ExpressJs unit tests
10. Setup supertest for integration tests
11. Setup Karma for client-side unit tests

## About the author
**Mathieu Maes** is a front-end developer at [Zimmo.be](https://www.zimmo.be/), located in Leuven (Belgium). With over
15 years of experience in web development, he's built countless of websites and applications. Much too often he's
 responsible for the build stack of projects.
