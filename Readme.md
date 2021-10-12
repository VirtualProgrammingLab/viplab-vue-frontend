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