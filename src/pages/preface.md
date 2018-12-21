# Preface

This guide will not just get you through the process of scaffolding a website project,
 it will provide insights to all steps taken.

You can find a sample repo which has branches for each chapter in the book, with clean commits for each step. The book
 will often refer to those commits and explain them.

## Goals

The goal is to learn how to scaffold an Expressjs project and apply a modern workflow for client-side resources (JS and CSS).

- Integrate the **ExpressJs** app with **Webpack**'s dev server
- Build your CSS using webpack with **sass/scss** and **postcss**
- Build your client-side JS using webpack with **babel**

The development server should support HMR so the browser reloads
 if changes are made to:
- your (S)CSS source
- client-side JS
- expressJs source

## Prerequisites

This guide will assume some basic knowledge of ExpressJs and Webpack

## Table of contents

1. Scaffold a new Express project
2. Setup Webpack for JS build with babel
3. Build SCSS using Webpack
4. Webpack-dev-server with proxy
5. Extract CSS from webpack and manage assets

## Linting
6. Add stylelint for CSS linting
7. Add eslint for ES linting

## Testing
8. Setup Mocha/Chai for ExpressJs unit tests
9. Setup supertest for integration tests
10. Setup Karma for client-side unit tests
