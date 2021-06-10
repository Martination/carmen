# Carmen Image Editor

A one-page app for locally editing pictures in the browser. No data is ever sent to a server.

The image editing library is [CamanJS](http://camanjs.com/). Yes, the Caman website doesn't use SSL and the library hasn't been updated since 2013, but it still does the trick. This page implements all of the basic filters (e.g. saturation and contrast) and the included presets (e.g. *Lomo* and *Hazy Days*) of the library.

The webpage is built using [React 17](https://reactjs.org/) & [Bootstrap 5](https://getbootstrap.com/). Other technologies include Sass, Lodash, and a lot of random Medium posts and Stack Overflow questions.

## Purpose

I built this app to gain hands-on experience with React and Bootstrap, some of the most prolific web technologies out there. I wanted to make a website that was easy to use, actually useful, and secure.
While there are many online photo editing websites, they are either clunky, hard to navigate, or insecure. Being a one-page app that is entirely run locally, that fixes the issues.

## To Do list

- Local file upload/download
- Imgur import and export using their API

## Deploying the App

1. Clone the [repository](https://github.com/Martination/carmen) and download the code.
2. Run `npm install`.
3. Run `npm start` to run a development server.
4. Build the code with `npm run build` to compile it.
5. Start a local static server with `npx serve -s build`.
6. Alternatively run `npm run deploy` to upload it to Github Pages.

## Acknowledgements

CamanJS is licensed under a BSD-3 License by Ryan LeFevre.
Test pictures from [Place Kitten](https://placekitten.com/) and Among Trees artist [Mikael Gustaffson](https://www.instagram.com/p/BXa3JfChZl2/).

---

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run deploy`

Builds the app for production and deploys it to Github Pages.\
Follows the tutorial on [gh-pages deploymnet](https://create-react-app.dev/docs/deployment/#github-pages) for `predeploy` and `deploy` scripts.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project. Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them.

---

## Documentation Links

- [Create React App documentation](https://create-react-app.dev/docs/getting-started)

- [React documentation](https://reactjs.org/)
- [CamanJS introduction](http://camanjs.com/guides/) and [documentation](http://camanjs.com/api/)
- [Bootstrap documentation](https://getbootstrap.com/docs/5.0/getting-started/introduction/)
- [Lodash documentation](https://lodash.com/docs/4.17.15)
- [Sass documentation](https://sass-lang.com/)
