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

fetch(process.env.BASE_URL + "static/config.json?/t=currentTimestamp")
  .then((response) => response.json())
  .then((config) => {
    Vue.prototype.$config = config
    new Vue({
      wait: new VueWait({
        useVuex: false
      }),
      router,
      render: h => h(App)
    }).$mount('#app')
  })