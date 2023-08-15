import { createApp } from 'vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faFastBackward, faBackward, faPause, faPlay, faForward, faFastForward, faDownload, faSave,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// import FloatingVue from 'floating-vue';
import { createRouter, createWebHistory } from 'vue-router';

import VueSimpleAlert from 'vue3-simple-alert';

// import VueTour from 'vue-tour';

import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import { Quasar } from 'quasar';
import App from './App.vue';
import ViPLab from './pages/viplab/App.vue';
import Teacher from './pages/teacher/App.vue';
import quasarUserOptions from './quasar-user-options';

// require('vue-tour/dist/vue-tour.css');

// Setup vue-router
const routes = [
  { path: '/teacher', component: Teacher },
  { path: '/', component: ViPLab },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// import createMutationsSharer from "vuex-shared-mutations";

// Create a new store instance.
const store = createStore({
  state: {
    jsonTemplate: {},
    token: '',
    dataTemplate: '',
    ws: '',
    generatedComputationTemplate: {
      identifier: '',
      version: '3.0.0',
      metadata: { displayName: '', description: '' },
      environment: 'Container',
      configuration: {
        'running.timelimitInSeconds': 0,
        'running.commandLineArguments': '',
        'running.entrypoint': '',
        'running.intermediateFilesPattern': [''],
        'resources.image': '',
        'running.userId': 0,
        'resources.volume': '',
        'resources.memory': '64mb',
        'resources.numCPUs': 1,
      },
      files: [],
    },
    modifiedByTeacher: false,
  },
  mutations: {
    /* eslint no-param-reassign: ["error", { "props": false }] */
    updateJsonTemplate(state, newValue) {
      state.jsonTemplate = newValue;
    },
    updateToken(state, newValue) {
      state.token = newValue;
    },
    updateDataTemplate(state, newValue) {
      state.dataTemplate = newValue;
    },
    updateWebSocket(state, newValue) {
      state.ws = newValue;
    },
    updateGeneratedComputationTemplate(state, newValue) {
      state.generatedComputationTemplate = newValue;
    },
    updateModifiedByTeacher(state, newValue) {
      state.modifiedByTeacher = newValue;
    },
  },
  plugins: [
    createPersistedState({
      storage: window.sessionStorage,
    }),
  ],
});

library.add(faFastBackward, faBackward, faPause, faPlay, faForward, faFastForward, faDownload, faSave);

fetch(`${process.env.BASE_URL}static/config.json?/t=currentTimestamp`)
  .then((response) => response.json())
  .then((config) => {
    const app = createApp(App);
    app.config.globalProperties.$config = config;
    //
    app.use(store)
      .use(router)
      .component('font-awesome-icon', FontAwesomeIcon)

      .use(VueSimpleAlert)
      .use(Quasar, quasarUserOptions)
    // .use(VueTour)

      .mount('#app');
  });
