<template>
  <div id="injected">
    <!-- header -->
    <!--
    <div class="header m-2">
      <img class="logo" src="./assets/viplab.png">
      <div class="header-right">
        <div class="item-name" v-if="json.metadata">
          {{ json.metadata.display_name }}
        </div>
        <div class="item-name" v-if="json.metadata">
          {{ json.metadata.description }}
        </div>
        <div class="item-name">
          Go To Teacher-View: 
          <router-link to="/teacher">Go to Teacher-View</router-link>
        </div>
        <div class="item-name">
          Go To ViPLab-View:
          <router-link to="/">Go to ViPLab-View</router-link>
        </div>
      </div>
    </div>
    -->

    <!-- content -->
    <!-- route outlet -->
    <!-- component matched by the route will render here -->
    <!--<keep-alive>-->
      <router-view></router-view>
    <!--</keep-alive>-->

  </div>
</template>

<script>
import base64url from "base64url";
//const Base64 = require('js-base64');

export default {
  name: "app",
  components: {
  },
  data() {
    return {
      templates: require.context("./input/", false, /^.*\.json$/).keys(), //get json file names from ./input folder
    };
  },
  computed: {
    json: {
      get () {
        this.$forceUpdate()
        return this.$store.state.jsonTemplate;
      },
      set (newValue) {
        this.$store.commit("updateJsonTemplate", newValue)
        this.$forceUpdate()
      }
    },
    token: {
      get () {
        this.$forceUpdate()
        return this.$store.state.token;
      },
      set (newValue) {
        this.$store.commit("updateToken", newValue)
        this.$forceUpdate()
      }
    },
    ws: {
      get () {
        this.$forceUpdate()
        return this.$store.state.ws;
      },
      set (newValue) {
        this.$store.commit("updateWebSocket", newValue)
        this.$forceUpdate()
      }
    },
  },
  methods: {
    /** load json from file with temp being the file name, set this.json to the content of the file and fill form_v_model */
    loadJsonFromFile: function () {
      let appDiv = document.body;
      let data = appDiv.getAttribute("data-template");
      let decodedjson = JSON.parse(base64url.decode(data));
      
      console.log(decodedjson)

      console.log(Object.keys(this.$store.state.jsonTemplate).length === 0)
      console.log(this.$store.state.jsonTemplate)
      if (data !== "{{ data }}" && Object.keys(this.$store.state.jsonTemplate).length === 0) {
        console.log("1")
        this.json = JSON.parse(base64url.decode(data));
        // store token in Vuex store
        this.$store.commit("updateToken", appDiv.getAttribute("data-token"));
      } else if (Object.keys(this.$store.state.jsonTemplate).length > 0) {
        console.log("2")
        this.json = this.$store.state.jsonTemplate;
        this.token = this.$store.state.token;
      } else {
        console.log(3)
        this.json = {};
        this.token = "";
      }
      
      // store json in Vuex store
      // this.$store.commit("updateJsonTemplate", decodedjson);
      
      //this.token = appDiv.getAttribute("data-token");
      

      // if there are parameters in parts, set var accordingly for rendering of button
      for(var file in this.json.files) {
        for(var part in this.json.files[file].parts) {
          var parti = this.json.files[file].parts[part]
          if(parti.access == "template" && parti.parameters) {
            this.isPartParameters++;
            break;
          }
        }
      }
    },
  },
  created() {
    //this.loadJsonFromFile();
  }
};
</script>

<style lang="scss">
body {
  /* Needed for the position sticky to work */
  overflow: unset !important;
}

#injected {

/*
  .header {
    overflow: hidden;
    position: relative;
  }

  .header img {
    float: left;
    border-radius: calc(0.25rem - 1px);
  }

  .header-right {
    text-align: center;
    font-size: 5vw;
    width: 50%;
    position: absolute;
    top: 50%;
    right: 0;
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
  }
  */

  .outer-div {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    padding: 10px;
    /*margin: 0 10px;
    border-radius: 25px;
    max-width: 1170px;
    margin: 0 auto;
    background-color: #fff;*/
  }

  .item-name {
    font-weight: bold;
    font-size: 14pt;
  }
  
}
</style>