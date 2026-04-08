# FERN Starter Backend

Welcome to this FERN boilerplate repo's backend. The backend is centered around the MVC (model-view-controller) design pattern, intended to decouple code and reduce potential errors with the system.

## Getting Started

Start off by copying `.envtemplate` and renaming the copy to `.env`. Configure the node env and mongo dev/prod URI's based on your current environment and secrets.

If you don't have npm and/or node on your system, run `brew install node`. Alternatively, if you already have node you can also run `ssudo npm install -g npm`.

Now, run `npm install` to install all dependencies. Once that finishes, you're all set to run the backend!

Simply use `npm run dev` to begin running the dev server locally
## MVC Design Pattern

This backend is centered around the Model-View-Controller design pattern, meaning that each "entity" of your application should have its own folder where necessary models, views, and controllers are specified.

The breakdown of these three types of functions/files is as follows:
- Models -- classes that define our DB schema and structure of our data
- Controllers -- functions that interact with the models to modify specific attributes/pieces of data
- Views -- routes that the user can interact with which make use of controllers to perform a specific action.

Structuring our code in this way decouples the system by introducing modularity. It ensures that we rarely encounter breaking changes and that we have a clean separation of duties for progrmamers. Moreover, it allows us to enforce a predictable design pattern that speeds up onboarding and development on a team.

## Using Docker
This backend can also be easily dockerized. Once you've created your env file, simply run `docker compose up -d` or `docker compose up` to start up the application (make sure the docker daemon is running).

If this fails, try running `docker system prune`. The application should begin running at port 3000 on your local machine.

## Database Structure

This backend makes use of Firestore, a NoSQL database that heavily emphasizes data nesting as opposed to data references. 
