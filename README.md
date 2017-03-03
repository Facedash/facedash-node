# Facedash: Dashboard for Social Metrics

* This is a simple example of how you could turn information from your facebook account, using the graph API, by accessing your friends public information, into interesting and dynamic metrics.
* The app is not storing any information on any database.
* No database connection is required since the intention is not to store the information provided by the user but just display what is provided taking an insightful and different approach.

## How to use Facedash


### Get a Facebook developer account
You definitely need a Facebook developer [account](https://developers.facebook.com/).

Once you have your developer account on facebook:
* create an app
* click Add a platform -> and choose website
* set the site url to `http://localhost:3000/` or wherever you have your app up
* write down your APP_ID and APP_SECRET

### Clone the App
* clone the repository
* run `npm install` to grab the dependencies (Make sure to edit the package.json if there is a particular library version you want to work with)

### Configure your app
* if your app is on a remote server just make sure to create 3 environment variables in your server settings: APP_ID, APP_SECRET, REDIRECT_URI
* APP_ID and APP_SECRET are the codes you got from facebook
* REDIRECT_URI should be http://your-site-address/auth/facebook

### Running the app
Runs like a typical express app, make to pass the APP ID and APP SECRET to your server :

    APP_ID="YOUR_APP_ID" APP_SECRET="YOUR_APP_SECRET" node app.js
    or 
    APP_ID="YOUR_APP_ID" APP_SECRET="YOUR_APP_SECRET" nodemon app.js
    
The app runs on `http://localhost:3000`

### Running tests

Coming soon!

### Receiving updates from upstream

Just fetch the changes and merge them into your project with git.

## App Structure
The Server:
- Node/express.
- Expect a basic out of the box express app folder structure.

The Client:
- A simple Backbone client.

## Example App

* A simple [Example](http://facedash.azurewebsites.net) based on this repo.
* Disclaimer: Since April 2015 and Facebook updates on permissions/scopes, request that to be able to access your friends public information they also need to be authorizing the app. Unfortunately for an experimental app like mine or any app in early development or launch, this makes the information you have access too completely null. Not sure why not being able to access your friends public information is better but it is the new rule.


## Contact

Hit me up here on github

## License
MIT
