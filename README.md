# Facedash: Dashboard for Social Metrics

This is a simple example on how you could turn information from your facebook account into interesting and dynamic metric.

## How to use facedash

You definitely need a Facebook developer [account](https://developers.facebook.com/).

Then:
- Create an app
- Click Add a platform -> website
- Set the Site Url to http://localhost:3000/
- That's it but take notes of your APP ID and APP SECRET

Clone the repository, run `npm install` to grab the dependencies, and start hacking!

### Running the app

Runs like a typical express app but you need to pass the APP ID and APP SECRET to your server :

    APP_ID="YOUR_APP_ID" APP_SECRET="YOUR_APP_SECRET" node app.js
    or 
    APP_ID="YOUR_APP_ID" APP_SECRET="YOUR_APP_SECRET" nodemon app.js

### Running tests

Coming soon!

### Receiving updates from upstream

Just fetch the changes and merge them into your project with git.

## Directory Layout
This is still a basic node/expres app. Expect a basic out of the box express app folder structure.
The visual board and login are still express templates.
A backbone client is on progress

## Example App

A simple [blog](http://facedash.azurewebsites.net) based on this repo.


## Contact

hit me up here

## License
MIT
