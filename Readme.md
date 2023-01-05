# Vue-Frontend

---

## Prerequisites

- NodeJS ^8.9
- npm ^5.6

## Project setup

The code for the frontend in inside the `viplab-standalone-frontend`-folder. 
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

Alternativly, you can build the node-dev container (Dockerfile-dev in this repository).
Ensure a clean project directory (without node_modules or dist folder) to be in sync with the container while developing. First, run the container with the 'install' command, mounting the working directory to your project directory.
```
docker build -f Dockerfile-dev -t viplab-vue-frontend:dev .
docker run --rm -v <path-to-project-dir>:/app viplab-vue-frontend:dev install
```
Then you can start the container with hot reloading or, use the viplab-docker-dev-env compose-file with profile "frontend-dev".
```
docker run -it -p 8081:8081 --rm -v <path-to-project-dir>:/app --name viplab-vue-frontend-dev viplab-vue-frontend:dev
```
When you need install further packages while to container is running use:
```
docker exec viplab-vue-frontend-dev npm install XXX
```
or
```
docker-compose exec vue-frontend-dev npm install XXX
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
