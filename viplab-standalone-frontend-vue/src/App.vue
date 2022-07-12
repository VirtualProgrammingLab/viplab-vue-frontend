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
      //json: "{}", //'{ "identifier"  : "11483f23-95bf-424a-98a5-ee5868c85c3e","metadata": { "display_name" : "Aufgabe 1", "description" : "Schreiben Sie eine C-Funktion..."},"environment" : "C","files" : [{ "identifier": "22483f42-95bf-984a-98a5-ee9485c85c3e", "path"      : "code.c","metadata"  : {  "MIMEtype": "text/plain",  "syntaxHighlighting": "C" },"parts" :  [{ "identifier": "preamble","access"    : "visible",  "metadata"  : { "name"    : "Info: source before your code.","emphasis"  : "low"},"content"   : "I2luY2x1ZGUgPHN0ZGlvLmg-Cg" },{ "identifier": "codeFromStudent","access"    : "modifiable","metadata"  :{ "name"    : "Fill in your code!","emphasis"  : "medium"},"content" : "dm9pZCBiYXIoKSB7IC8qIFNjaHJlaWJlbiBTaWUgaGllciBDb2RlLCBkZXIgImJhciIgYXVzZ2lidC4gKi8KCn0K"},{ "identifier": "postscript","access"    : "visible","metadata"  :{ "name"      : "Info: source after your code calling bar() in it.", "emphasis"  : "low"}, "content" : "aW50IG1haW4oKSB7IGJhcigpOyByZXR1cm4gMDsgfQ" }] }],"parameters" : { "__checkbox__" : { "gui_type": "checkbox", "name": "options", "values": ["verbose", "debug", "make_plot"], "selected": ["verbose"]}, "__radioButton__" : { "gui_type": "radio", "name": "backend", "values": ["debug", "serial", "hpc", "test"], "selected": "serial", "disabled" : ["hpc"]}, "__dropdownSingle__" : { "gui_type": "dropdown", "name": "model", "values" : ["Please choose one", "1p", "1pnc", "1pncmin", "2p", "2p1c"], "selected" : "1p", "disabled" : ["Please choose one"], "multiple" : false }, "__dropdownMultiple__" : { "gui_type": "dropdown", "name": "model", "values" : ["Please choose multiple", "1p", "1pnc", "1pncmin", "2p", "2p1c"], "selected" : ["1p", "2p"], "disabled" : ["Please choose multiple", "2p1c"], "multiple" : true }, "__toggle__" : { "gui_type": "toggle", "name": "options", "values" : ["verbose", "debug", "make_plot"], "selected" : ["verbose"]}, "__sliderSingle__" : { "gui_type": "slider", "name": "temperature", "value" : 10, "min" : 0, "max" : 500, "step" : 10, "multiple" : false, "vertical" : false}, "__sliderMultiple__" : { "gui_type": "slider", "name": "temperature", "value" : [25, 50, 75], "min" : 0, "max" : 100, "step" : 5, "multiple" : true, "vertical" : true}, "__inputTextWMaxlength__" : { "gui_type": "input_field", "name": "file_name", "type" : "text", "maxlength" : 200}, "__inputTextWOMaxlangth__" : { "gui_type": "input_field", "name": "file_name", "type" : "text"}, "__inputNumber__" : { "gui_type": "input_field", "name": "time_delay", "type" : "number", "value" : 10, "min" : 0, "max" : 500, "step" : 0.1}, "__defaultJson__" : { "name": "code 1", "code" : "I2luY2x1ZGUgPHN0ZGlvLmg-Cg"}, "__defaultJava__" : { "name": "code 2", "code" : "dm9pZCBiYXIoKSB7IC8qIFNjaHJlaWJlbiBTaWUgaGllciBDb2RlLCBkZXIgImJhciIgYXVzZ2lidC4gKi8KCn0K"}, "__git__" :{ "gui_type" : "input_field","name"     : "stepwidth","type"     : "number","value"    : 0.001, "min"      : 0, "max"      : 1 ,"step"     : 0.001 ,"validation" : "range"}}, "configuration" : { "compiling.compiler" : "gcc", "compiling.flags"    : "-O2 -Wall" ,"checking.sources"   : ["codeFromStudent"], "checking.forbiddenCalls": "system execve" ,"linking.flags"      : "-lm" ,"running.commandLineArguments" : "--stepwidth {{ __STEPWIDTH__ }}"}}',
      //token: "",
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
    this.loadJsonFromFile();
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