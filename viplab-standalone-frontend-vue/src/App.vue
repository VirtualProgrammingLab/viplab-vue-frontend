<template>
  <div id="app" class="flex-container">

    <div class="flex-left m-2 p-2">
      
    <form>
      <div class="form-group mb-5 ml-5 mr-5">
        <h2 v-if="parsedFilesJson">InputFiles</h2>
        <div class="item-name" v-if="json.metadata">{{ json.metadata.display_name }}</div>
        <div class="item-name" v-if="json.metadata">{{ json.metadata.description }}</div>
        <div class="file" :id=file.identifier v-for="(file, fileParent_index) in parsedFilesJson" :key=file.identifier>
          <div class="part" v-for="(part, partParent_index) in file.parts" :key=part.identifier>
            <div class="partcontent" :id=part.identifier v-if="part.access !== 'template' && inputFiles_v_model.length > 0">
              <div v-if="part.access == 'visible'">
                <!-- v-bind:class="{ 'top-editor': (partParent_index==0), 'bottom-editor': (partParent_index==file.parts.length-1)}" -->
                <prism-editor class="my-editor editor-readonly" v-bind:class="{ 'top-editor': (partParent_index==0), 'bottom-editor': (partParent_index==file.parts.length-1)}" readonly="true" v-model="inputFiles_v_model[fileParent_index][partParent_index]" :highlight="highlighter" line-numbers></prism-editor>
              </div>
              <div v-else>
                <prism-editor class="my-editor" v-bind:class="{ 'top-editor': (partParent_index==0), 'bottom-editor': (partParent_index==file.parts.length-1)}" v-model="inputFiles_v_model[fileParent_index][partParent_index]" :highlight="highlighter" line-numbers></prism-editor>
              </div>
            </div>  
          </div>
        </div>
        <div class="m-5">
          <div v-for='m in inputFiles_v_model.length' :key=m>
            test: {{ inputFiles_v_model[m-1] }}
          </div>
        </div>
      </div>
    </form>

    <!-- render parameters section of the json -->
    <form>
      <div class="form-group mb-5 ml-5 mr-5">
        <h2 v-if="parsedParametersJson">Parameters</h2>
        <div v-for="(item, key, parent_index) in parsedParametersJson" :key=parent_index>
          <!-- render checkbox elements -->
          <!-- render after form_v_model[parent_index] is set, or else js error occurs (even though page looks perfectly fine) -->
          <div class="form-item" v-if="isCheckbox(item) && form_v_model[parent_index]">
            <check-box :item="item" :parent_index="parent_index"></check-box>
          </div>
          <!-- render radio button elements -->
          <div class="form-item" v-if="isRadio(item) && form_v_model[parent_index]">
            <radio-button :item="item" :parent_index="parent_index"></radio-button>
          </div>
          <!-- render dropdown elements -->
          <div class="form-item" v-if="isDropdown(item) && form_v_model[parent_index]">
            <drop-down :item="item" :parent_index="parent_index"></drop-down>
          </div>
          <!-- render toggle button elements -->
          <div class="form-item toggle" v-if="isToggle(item) && form_v_model[parent_index]">
            <toggle-button :item="item" :parent_index="parent_index"></toggle-button>
          </div>
          <!-- render slider elements -->
          <div class="form-item" v-if="isSlider(item)" :key="'slider'+parent_index">
            <slider-element :item="item" :parent_index="parent_index"></slider-element>
          </div>
          <!-- render input field elements -->
          <div class="form-item" v-if="isInputField(item)">
            <input-field :item="item" :parent_index="parent_index"></input-field>
          </div>
          <!-- render items with no gui-type as editor elements -->
          <div class="form-item" v-if="!item.gui_type && form_v_model[parent_index]">
            <div class ="item-name">{{item.name}}:</div>
            <prism-editor class="my-editor" v-model="form_v_model[parent_index]" :highlight="highlighter" line-numbers></prism-editor>
          </div>
        </div>
        <div class="m-5">
          <div v-for='n in form_v_model.length' :key=n>
            test: {{ form_v_model[n-1] }}
          </div>
        </div>
      </div>
    </form>
  </div>
  <div class="flex-right m-2 p-2">
    <div class="form-group mb-5 ml-5 mr-5">
      <h2>OutputFiles</h2>
    </div>
  </div>
</template>

<script>
// import Prism Editor
import { PrismEditor } from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css"; // import the styles somewhere

// import highlighting library (you can use any library you want just return html string)
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css"; // import syntax highlighting styles

//own components
import CheckBox from "./components/CheckBox.vue";
import RadioButton from "./components/RadioButton.vue";
import DropDown from "./components/DropDown.vue";
import ToggleButton from "./components/ToggleButton.vue";
import SliderElement from "./components/SliderElement.vue";
import InputField from "./components/InputField.vue";

//import $ from 'jquery';

export default {
  name: "app",
  components: {
    PrismEditor,
    CheckBox,
    RadioButton,
    DropDown,
    ToggleButton,
    SliderElement,
    InputField,
  },
  data() {
    return {
      json: "{}", //'{ "identifier"  : "11483f23-95bf-424a-98a5-ee5868c85c3e","metadata": { "display_name" : "Aufgabe 1", "description" : "Schreiben Sie eine C-Funktion..."},"environment" : "C","files" : [{ "identifier": "22483f42-95bf-984a-98a5-ee9485c85c3e", "path"      : "code.c","metadata"  : {  "MIMEtype": "text/plain",  "syntaxHighlighting": "C" },"parts" :  [{ "identifier": "preamble","access"    : "visible",  "metadata"  : { "name"    : "Info: source before your code.","emphasis"  : "low"},"content"   : "I2luY2x1ZGUgPHN0ZGlvLmg-Cg" },{ "identifier": "codeFromStudent","access"    : "modifiable","metadata"  :{ "name"    : "Fill in your code!","emphasis"  : "medium"},"content" : "dm9pZCBiYXIoKSB7IC8qIFNjaHJlaWJlbiBTaWUgaGllciBDb2RlLCBkZXIgImJhciIgYXVzZ2lidC4gKi8KCn0K"},{ "identifier": "postscript","access"    : "visible","metadata"  :{ "name"      : "Info: source after your code calling bar() in it.", "emphasis"  : "low"}, "content" : "aW50IG1haW4oKSB7IGJhcigpOyByZXR1cm4gMDsgfQ" }] }],"parameters" : { "__checkbox__" : { "gui_type": "checkbox", "name": "options", "values": ["verbose", "debug", "make_plot"], "selected": ["verbose"]}, "__radioButton__" : { "gui_type": "radio", "name": "backend", "values": ["debug", "serial", "hpc", "test"], "selected": "serial", "disabled" : ["hpc"]}, "__dropdownSingle__" : { "gui_type": "dropdown", "name": "model", "values" : ["Please choose one", "1p", "1pnc", "1pncmin", "2p", "2p1c"], "selected" : "1p", "disabled" : ["Please choose one"], "multiple" : false }, "__dropdownMultiple__" : { "gui_type": "dropdown", "name": "model", "values" : ["Please choose multiple", "1p", "1pnc", "1pncmin", "2p", "2p1c"], "selected" : ["1p", "2p"], "disabled" : ["Please choose multiple", "2p1c"], "multiple" : true }, "__toggle__" : { "gui_type": "toggle", "name": "options", "values" : ["verbose", "debug", "make_plot"], "selected" : ["verbose"]}, "__sliderSingle__" : { "gui_type": "slider", "name": "temperature", "value" : 10, "min" : 0, "max" : 500, "step" : 10, "multiple" : false, "vertical" : false}, "__sliderMultiple__" : { "gui_type": "slider", "name": "temperature", "value" : [25, 50, 75], "min" : 0, "max" : 100, "step" : 5, "multiple" : true, "vertical" : true}, "__inputTextWMaxlength__" : { "gui_type": "input_field", "name": "file_name", "type" : "text", "maxlength" : 200}, "__inputTextWOMaxlangth__" : { "gui_type": "input_field", "name": "file_name", "type" : "text"}, "__inputNumber__" : { "gui_type": "input_field", "name": "time_delay", "type" : "number", "value" : 10, "min" : 0, "max" : 500, "step" : 0.1}, "__defaultJson__" : { "name": "code 1", "code" : "I2luY2x1ZGUgPHN0ZGlvLmg-Cg"}, "__defaultJava__" : { "name": "code 2", "code" : "dm9pZCBiYXIoKSB7IC8qIFNjaHJlaWJlbiBTaWUgaGllciBDb2RlLCBkZXIgImJhciIgYXVzZ2lidC4gKi8KCn0K"}, "__git__" :{ "gui_type" : "input_field","name"     : "stepwidth","type"     : "number","value"    : 0.001, "min"      : 0, "max"      : 1 ,"step"     : 0.001 ,"validation" : "range"}}, "configuration" : { "compiling.compiler" : "gcc", "compiling.flags"    : "-O2 -Wall" ,"checking.sources"   : ["codeFromStudent"], "checking.forbiddenCalls": "system execve" ,"linking.flags"      : "-lm" ,"running.commandLineArguments" : "--stepwidth {{ __STEPWIDTH__ }}"}}',
      token: "",
      templates: require.context("./input/", false, /^.*\.json$/).keys(), //get json file names from ./input folder
      form_v_model: [], // array for v-model: for all form elements to be able to access the changes made by the user
      inputFiles_v_model: [],
      ws: "",
      outputFiles: [],
    };
  },
  computed: {
    /* return parameters section of json file */
    parsedParametersJson: function () {
      var parsed = this.json.parameters;
      return parsed;
    },
    /* return files section of json file */
    parsedFilesJson: function () {
      var parsed = this.json.files;
      return parsed;
    },
  },
  methods: {
    /** pre-fill the array form_v_model with the values specified in the json file or if not specified add default values */
    fillForm_v_model: function () {
      var parsedParametersJson = this.json.parameters;
      for (var item in parsedParametersJson) {
        if (
          parsedParametersJson[item].gui_type == "checkbox" ||
          parsedParametersJson[item].gui_type == "toggle"
        ) {
          this.form_v_model.push([]);
          for (var i = 0; i < parsedParametersJson[item].values.length; i++) {
            var isChecked = false;
            if (
              parsedParametersJson[item].selected.includes(
                parsedParametersJson[item].values[i]
              )
            ) {
              isChecked = true;
            }
            this.form_v_model[this.form_v_model.length - 1].push(isChecked);
          }
        } else if (
          parsedParametersJson[item].gui_type == "radio" ||
          parsedParametersJson[item].gui_type == "dropdown"
        ) {
          this.form_v_model.push(parsedParametersJson[item].selected);
        } else if (
          parsedParametersJson[item].gui_type == "slider" ||
          (parsedParametersJson[item].gui_type == "input_field" &&
            parsedParametersJson[item].type == "number")
        ) {
          this.form_v_model.push(parsedParametersJson[item].value);
        } else if (
          parsedParametersJson[item].gui_type == "input_field" &&
          parsedParametersJson[item].type == "text"
        ) {
          this.form_v_model.push("");
        } else {
          // wie sieht das JSON f�r den Editor aus?
          this.form_v_model.push(
            this.decodeBase64(parsedParametersJson[item].code)
          );
        }
      }
    },
    fillInputFiles_v_model: function () {
      var files = this.json.files;
      for (var file in files) {
        var parts = files[file].parts;
        var array = [];
        for (var part in parts) {
          if(parts[part].access !== "template") {
            array.push(this.decodeBase64(parts[part].content));
          }
        }
        this.inputFiles_v_model.push(array);
      }
    },
    /** check gui-types of the items */
    isCheckbox: function (item) {
      return item.gui_type === "checkbox" ? true : false;
    },
    isRadio: function (item) {
      return item.gui_type === "radio" ? true : false;
    },
    isDropdown: function (item) {
      return item.gui_type === "dropdown" ? true : false;
    },
    isToggle: function (item) {
      return item.gui_type === "toggle" ? true : false;
    },
    isSlider: function (item) {
      return item.gui_type === "slider" ? true : false;
    },
    isInputField: function (item) {
      return item.gui_type === "input_field" ? true : false;
    },
    /** get all values of an item that are not disabled */
    itemWithoutDisabled: function (item) {
      var array = item.values;
      for (var i = 0; i < item.disabled.length; i++) {
        const indexOfItemToRemove = array.indexOf(item.disabled[i]);
        if (indexOfItemToRemove > -1) {
          array.splice(indexOfItemToRemove, 1);
        }
      }
      return array;
    },
    rewriteToBase64: function (base64urlEncodedString) {
      // Replace base64 characters with base64url characters
      base64urlEncodedString = base64urlEncodedString
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      // Pad for base64
      var padding = base64urlEncodedString.length % 4;
      if (padding) {
        if (padding === 1) {
          throw new Error(
            "InvalidLengthError: Input base64url string is the wrong length to determine padding"
          );
        }
        base64urlEncodedString += new Array(5 - padding).join("=");
      }
      return base64urlEncodedString;
    },
    decodeBase64: function (base64urlEncodedString) {
      var encodedString = this.rewriteToBase64(base64urlEncodedString);
      var decodedString = window.atob(encodedString);
      return decodedString;
    },
    /** load json from file with temp being the file name, set this.json to the content of the file and fill form_v_model */
    loadJsonFromFile: function () {
      /**temp = temp.substring(1);
      var container = require('./input' + temp);
      //var container = require("./input/container.computation-template2.json");
      this.json = container;
      console.log("load called");*/
      var appDiv = document.getElementById("app");
      var data = appDiv.getAttribute("data-template");
      this.json = JSON.parse(this.decodeBase64(data));
      this.token = appDiv.getAttribute("data-token");
      this.form_v_model = [];
      this.fillForm_v_model();
      this.fillInputFiles_v_model();
    },
    /** highlight the code in the editor */
    highlighter(code) {
      return highlight(code, languages.js); // languages.<insert language> to return html with markup
    }, 
    executeAfterDomLoaded: function(){
      this.ws = new WebSocket("ws://localhost:8083/computations");
      this.ws.onopen = () => {
        this.ws.send(JSON.stringify({"type":"authenticate","content":{"jwt":this.token}}));
          document.getElementById("submit").disabled = false;
      };
      this.ws.onmessage = function(event) {
        var data = JSON.parse(event.data);
        switch  (data.type) {
            case "computation":
                console.log("computation: " + data.content);
                this.displayComputation(data.content);
                break;
            case "result":
                console.log("result: " + data.content);
                this.displayResult(data.content);
                break;
            default:
                console.error(data);
        }
      }
      document.getElementById("submit").onclick = this.sendData;
    },
    uuid: function() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' + 
        s4() + '-' + s4() + s4() + s4();
    },
    sendData: function() {
      document.getElementById("submit").disabled = true;
      var task = {
        "type":"create-computation",
        "content":{
            "template": this.json,
            "task":{
                "template": this.json.identifier,
                "identifier": this.uuid(),
                "files": []
            }
            
        }
      };
      var i = 0;
      document.querySelectorAll('.file').forEach(function(filediv){
        let file = { 'identifier': filediv.id, 'parts': []};
        var j = 0;
        filediv.querySelectorAll('.partcontent').forEach(function(partcontent){
          file.parts.push({'identifier':partcontent.id, 'content':btoa(this.inputFiles_v_model[i][j])});
          j++;
        });
        task.content.task.files.push(file);
        i++;
      });
      document.querySelector('#stdout').value = '';
      document.querySelector('#stderr').value = '';
      document.getElementById("fileList").innerHTML = '';
      this.outputFiles = new Map();
      this.ws.send(JSON.stringify(task));
      return false;
    },
    displayComputation: function(computation){
      console.log(computation);
    },
    displayResult: function(result){
      console.log(result);
    },
    save: function(filename, identifier, mimetype){
      console.log("some day you can save stuff with this function" + filename + " " + identifier + " " + mimetype);
    }
  },
  created() {
    this.loadJsonFromFile();
    console.log(this.inputFiles_v_model);
  },
  mounted() {
    this.executeAfterDomLoaded();
    //this.loadJsonFromFile();
    //this.loadJsonFromFile("./container.computation-template2.json");
  },
};
</script>

<style>
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 1s ease-in-out;
}

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

.flex-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.flex-left,
.flex-right {
  flex: 50%;
  background-color: #fff;
  border-radius: 25px;
}

/* Responsive layout - makes a one column-layout instead of two-column layout */
@media (max-width: 1170px) {
  .flex-container {
    flex-direction: column;
  }
}

.form-item {
  border: 1px solid #ddd;
  border-radius: 25px;
  padding: 10px;
  margin-bottom: 10px;
}

.item-name {
  font-weight: bold;
  font-size: 14pt;
}

.toggle label {
  position: relative;
  display: inline-block;
  width: 10em;
  height: 3.5em;
}

.toggle input {
  display: none;
}

.toggle .slider {
  /* Grundfl�che */
  position: absolute;
  cursor: pointer;
  top: 1.5em;
  left: 2em;
  width: 3.5em;
  height: 1.5em;
  background-color: #c32e04;
  border-radius: 1em;
  transition: all 0.3s ease-in-out;
}

.toggle .slider::before {
  /* verschiebbarer Button */
  position: absolute;
  content: "";
  height: 1.1em;
  width: 1.1em;
  left: 0.2em;
  bottom: 0.2em;
  background-color: white;
  border-radius: 50%;
  transition: all 0.3s ease-in-out;
}

.toggle input:checked + .slider {
  background-color: #5a9900;
}

.toggle input:checked + .slider::before {
  transform: translateX(1.9em);
}

/* for class surrounding editors to surround them with border, but if files empty, displays line
.file {
  border: 1px solid #ddd;
  border-radius: 25px;
  overflow: hidden;
}
*/

/* required class */
.my-editor {
  /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
  background: white;
  color: #ccc;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;

  /* you must provide font-family font-size line-height. Example: */
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
}

.top-editor {
  border-top-right-radius: 25px;
  border-top-left-radius: 25px;
  border-top: 1px solid #ddd;
}

.bottom-editor {
  border-bottom-right-radius: 25px;
  border-bottom-left-radius: 25px;
  border-bottom: 1px solid #ddd;
}

.editor-readonly {
  background: #ddd;
  /*border-left: 1px solid #888;
  border-right: 1px solid #888;
  opacity: 0.3;*/
}
</style>
