import Vue from 'vue'
import App from './App.vue'
import "bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import VueWait from 'vue-wait';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faFastBackward, faBackward, faPause, faPlay, faForward, faFastForward, faDownload, faSave } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import VTooltip from 'v-tooltip'

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

library.add( faFastBackward, faBackward, faPause, faPlay, faForward, faFastForward, faDownload, faSave)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.use(VTooltip)

import VueRouter from 'vue-router'

Vue.use(VueRouter)

Vue.config.productionTip = false

Vue.use(VueWait);

import BlockUI from 'vue-blockui'
Vue.use(BlockUI)

import VueSimpleAlert from "vue-simple-alert";
Vue.use(VueSimpleAlert);

import VueTour from 'vue-tour'
require('vue-tour/dist/vue-tour.css')
Vue.use(VueTour)

// Setup vue-router
import Teacher from './pages/teacher/App.vue';
import ViPLab from './pages/viplab/App.vue';
const routes = [
  { path: '/teacher', component: Teacher },
  { path: '/', component: ViPLab }
]

const router = new VueRouter({
  routes 
})

import Vuex from 'vuex'
Vue.use(Vuex)
import createPersistedState from "vuex-persistedstate";
// import createMutationsSharer from "vuex-shared-mutations";

// Create a new store instance.
const store = new Vuex.Store({
  state: {
    jsonTemplate: {},
    token: "",
    dataTemplate: "",
    ws: ""
  },
  mutations: {
    updateJsonTemplate (state, newValue) {
      state.jsonTemplate = newValue;
    },
    updateToken (state, newValue) {
      state.token = newValue;
    },
    updateDataTemplate (state, newValue) {
      state.dataTemplate = newValue;
    },
    updateWebSocket (state, newValue) {
      state.ws = newValue;
    }
  },
  plugins: [
    createPersistedState({
      storage: window.sessionStorage,
    })
  ]
})

fetch(process.env.BASE_URL + "static/config.json?/t=currentTimestamp")
  .then((response) => response.json())
  .then((config) => {
    Vue.prototype.$config = config
    new Vue({
      wait: new VueWait({
        useVuex: false
      }),
      router,
      store: store,
      render: h => h(App)
    }).$mount('#app')
  })