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
import { faFastBackward, faBackward, faPause, faPlay, faForward, faFastForward, faDownload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import vuePositionSticky from 'vue-position-sticky'
Vue.use(vuePositionSticky)

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

library.add( faFastBackward, faBackward, faPause, faPlay, faForward, faFastForward, faDownload)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

Vue.use(VueWait);

new Vue({
  wait: new VueWait({
    useVuex: false
  }),
  render: h => h(App)
}).$mount('#app')
