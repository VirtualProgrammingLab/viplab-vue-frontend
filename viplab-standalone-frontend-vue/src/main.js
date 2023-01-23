import Vue from 'vue';
import App from './App.vue';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import VueWait from 'vue-wait';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';

// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faFastBackward, faBackward, faPause, faPlay, faForward, faFastForward, faDownload, faSave,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import VTooltip from 'v-tooltip';

import VueRouter from 'vue-router';

import BlockUI from 'vue-blockui';

import VueSimpleAlert from 'vue-simple-alert';

import VueTour from 'vue-tour';

// Setup vue-router

import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import ViPLab from './pages/viplab/App.vue';
import Teacher from './pages/teacher/App.vue';

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);

library.add(faFastBackward, faBackward, faPause, faPlay, faForward, faFastForward, faDownload, faSave);

Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.use(VTooltip);

Vue.use(VueRouter);

Vue.config.productionTip = false;

Vue.use(VueWait);
Vue.use(BlockUI);
Vue.use(VueSimpleAlert);
require('vue-tour/dist/vue-tour.css');

Vue.use(VueTour);
const routes = [
  { path: '/teacher', component: Teacher },
  { path: '/', component: ViPLab },
];

const router = new VueRouter({
  routes,
});
Vue.use(Vuex);
// import createMutationsSharer from "vuex-shared-mutations";

// Create a new store instance.
const store = new Vuex.Store({
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

fetch(`${process.env.BASE_URL}static/config.json?/t=currentTimestamp`)
  .then((response) => response.json())
  .then((config) => {
    Vue.prototype.$config = config;
    new Vue({
      wait: new VueWait({
        useVuex: false,
      }),
      router,
      store,
      render: (h) => h(App),
    }).$mount('#app');
  });
