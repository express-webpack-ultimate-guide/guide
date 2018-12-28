# Preface

A few years ago I started replacing Grunt build steps with Webpack. It gave my team much more power and control over
 the JS build artifacts. I knew Webpack had much more potential but only recently I've had a chance using Webpack
  for building CSS too. I couldn't resist running ecstatically to my colleague's desks with my laptop to show how
   CSS gets reloaded instantly without the browser having to reload!
 
I've also grown fond of Express and NodeJs. I sensed the possibility of giving the server-side code the same
developer experience. I've come close but never achieved the "holy grail" scaffold. After trying many different 
approaches from others (even building the Express app as a webpack bundle!), I finally ended up with the solution, the
holy grail, in this book.

The protagonists of the book are **Express** and **Webpack**. The chapters in this book aren't just a step-by-step guide
to get you through the process, it will provide insights to all steps taken. 
 
Keep in mind though that this book assumes some basic understanding of both protagonists and you have actually worked
 with an Express app.

## Goals

This is what defines the holy grail (at least, for me personally):

1. Build (client-side) JS
    - Client-side Javascript should be transpiled with **Babel**
    - **Webpack** should be configured to make a JS bundle
2. Build CSS
    - Compile **SASS/SCSS**
    - Pass through PostCSS, mainly to apply the **Autoprefixer** plugin
3. Hot module replacement
    - Instantly apply CSS changes without reloading the browser
    - Refresh the page upon JS changes
    - Refresh the page upon changes in the Express app

## Sample project

This book will often refer to a sample project on Github with clean commits and tags for each chapter.

https://github.com/webberig/webpack-express-ultimate-guide-sample

<img src="/sample-commits.png" alt="Sample git commit log" width="648" />

Each of those commits will be explained in detail in each of the corresponding chapter.

## Table of contents

#### Getting started
1. [Scaffold a new Express project](/1-scaffold-a-new-express-project)
2. [Setup Webpack for JS build with babel](/2-setup-webpack-build-with-babel)
3. [Build SCSS using Webpack](/3-build-scss-using-webpack)

#### Hot reloading
4. [Webpack-dev-server with proxy](/4-setting-up-webpack-dev-server)
5. [Reload server upon changes (the smart way)](/5-reload-server-upon-changes)
6. [Refresh browser upon server reload](/6-refresh-browser-upon-server-reload)

#### Production
7. [Extract CSS from webpack and manage assets](/7-extract-css-from-webpack-and-manage-assets)

## About the author
**Mathieu Maes** is a front-end developer at [Zimmo.be](https://www.zimmo.be/), located in Leuven (Belgium). With over
15 years of experience in web development, he's built countless of websites and applications. He could setup a good
 number of tools or frameworks in his sleep, which is why he's usually responsible for project scaffolding. That 
 doesn't mean he gets actual work done in his sleep, nor he sleeps at work!

Find me on
 - Twitter: https://twitter.com/webberig
 - LinkedIn: https://www.linkedin.com/in/webberig
 - GitHub: https://github.com/webberig

[Continue to chapter 1 - Scaffold a new Express project](/1-scaffold-a-new-express-project)
