# Vue-Frontend

---

## Prerequisites

- NodeJS ^18
- npm ^8

## Project setup

The code for the frontend is inside the `viplab-standalone-frontend`-folder. 
The first step ist to move inside that folder:
```
cd <path-to-Vue-Frontend-Repo>/viplab-standalone-frontend
```

## Download dependencies... 

...found in package.json and generate `node_modules`-folder

```
npm install
```

## Before running the Application

Before running the Application, specify the URL of the Websocket-API, the frontend should communicate with. 
The file you have to edit is `config.json` under path `public/static`. 
Here you can see the file, where a local instance of the API is being used: 
```
{
    "WEBSOCKET_API": "ws://localhost:8083/computations"
}
```

---

## Run the Application 

For running the application there are two possibilities: 

1. Run the Application to further develop it yourself
2. Build the Application to use it for production

Both possibilities are explained in the following sections.

### 1. Run the Application to further develop it yourself

#### To compile and hot-reload for development, run: 

```
npm run serve
```
Then open your browser on <http://localhost:8080>
(or the url specified on the console after successfully running the previous command)

Alternativly, you can use the viplab/npm-container (or build the Dockerfile-dev in this repository).
Ensure a clean project directory (without node_modules or dist folder) to be in sync with the container while developing. First, run the container with the 'install' command, mounting the working directory to your project directory.
```
docker run --rm -v <path-to-viplab-standalone-frontend-dir>:/app viplab/npm install
```
Then you can start the container with hot reloading or, use the viplab-docker-dev-env compose-file with profile "vue-mount". To see the frontend go to http://localhost:8081 in the first case, and http://localhost otherwise.
```
docker run -it -p 8081:8081 --rm -v <path-to-viplab-standalone-frontend-dir>:/app --name viplab-vue-frontend-dev viplab/npm run serve -- --host 0.0.0.0
```
When you need install further packages while to container is running (and you named it )viplab-vue-frontend-dev"), use:
```
docker exec viplab-vue-frontend-dev npm install XXX
```
or
```
docker-compose exec vue-frontend-dev npm install XXX
```
To see the linter output you can run ```npm run lint```, or if you use the docker setup:
```
docker run -it --rm -v <path-to-viplab-standalone-frontend-dir>:/app viplab/npm run lint
```

### 2. Build the Application to use it for production

#### To compile and minifiy for production, run: 

```
npm run build
```

#### If you need to include the frontend in your application...

... the following parts of the `index.ejs` (that is injected using webpack) have to be included, for it to work: 

```
...
<body data-template='<%= dataTemplate %>' data-token='<%= token %>'>
  ...
    <!-- built files will be auto injected in the div with id="app" -->
    <div id="app">
    </div>
  ...
</body>
...
```
The style can also be included, but is not a must. 
Changing the background color to something other than white enables you to see the two windows, one for the input and one for the output.
