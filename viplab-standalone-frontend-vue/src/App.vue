<template>
  <div id="app" class="flex-container" :style="[maximized? {'flex-direction': 'column !important'} : null]">
    
    <!--<div class="m-2">
      <h1>Hello User</h1>
      I found the following templates in example folder: 
      
      <ul>
        <li v-for="temp in templates" :key=temp>
          <a type="button" :href=temp>{{temp}}</a>
        </li>
      </ul>
    </div>-->

    <div class="flex-left m-2 p-2">

      <form>
        <div class="form-group mb-5 ml-5 mr-5">
          <h2 v-if="parsedFilesJson">InputFiles</h2>

          <grid-plot class="border"/>

          <div class="item-name" v-if="json.metadata">{{ json.metadata.display_name }}</div>
          <div class="item-name" v-if="json.metadata">{{ json.metadata.description }}</div>
        
          <!-- 
            Aktuell kann man die cards auch sehen, wenn sie leer sind - Wie kann man das ändern?
          -->
          <b-card no-body v-if="inputFiles_v_model.length > 0">
            <b-tabs card class="files" content-class="m-2">
              <b-tab :title="'File ' + fileParent_index" ref="file" class="file" v-for="(file, fileParent_index) in parsedFilesJson" :key=file.identifier>
                <div class="part" v-for="(part, partParent_index) in file.parts" :key=part.identifier>
                  <div ref="partcontent" class="partcontent" :id=part.identifier v-if="part.access !== 'template' && inputFiles_v_model.length > 0">
                    <div v-if="part.access == 'visible'">
                      <!-- v-bind:class="{ 'top-editor': (partParent_index==0), 'bottom-editor': (partParent_index==file.parts.length-1)}" -->
                      <prism-editor class="my-editor editor-readonly" v-bind:class="{ 'top-editor': (partParent_index==0), 'bottom-editor': (partParent_index==file.parts.length-1)}" :readonly="true" v-model="inputFiles_v_model[fileParent_index][partParent_index]" :highlight="highlighter" line-numbers></prism-editor>
                    </div>
                    <div v-else>
                      <prism-editor class="my-editor" v-bind:class="{ 'top-editor': (partParent_index==0), 'bottom-editor': (partParent_index==file.parts.length-1)}" v-model="inputFiles_v_model[fileParent_index][partParent_index]" :highlight="highlighter" line-numbers></prism-editor>
                    </div>
                  </div>
                  <div class="part-parameters" v-if="part.parameters && part.access == 'template'">
                      <h2>Parameters</h2>
                      <parameters :parameters="part.parameters" :v_model_var="inputFilesPartsParameters_v_model"></parameters>
                  </div>
                </div>
              </b-tab>
            </b-tabs>
          </b-card>
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
          <parameters :parameters="parsedParametersJson" :v_model_var="form_v_model"></parameters>
          <div class="m-5">
            <div v-for='n in form_v_model.length' :key=n>
              test: {{ form_v_model[n-1] }}
            </div>
          </div>
        </div>
      </form>
      <div class="d-flex flex-row mb-5 ml-5 mr-5">
        <div class="mr-auto">
          <b-button class="btn mr-2">
            <b-icon icon="download" aria-hidden="true"></b-icon>
          </b-button>
          <b-button class="btn mr-2">
            <b-icon icon="upload" aria-hidden="true"></b-icon>
          </b-button>
          <b-button class="btn" variant="primary">
            <b-icon icon="play" aria-hidden="true"></b-icon>
          </b-button>
        </div>
        <div class="">
          <b-button class="btn mr-2" @click="maximize">
            <b-icon icon="fullscreen" aria-hidden="true"></b-icon>
          </b-button>
          <b-button class="btn" variant="success">
            <b-icon icon="cloud-arrow-down-fill" aria-hidden="true"></b-icon>
          </b-button>
        </div>
      </div>
    </div>

    <div class="flex-right m-2 p-2">
      <div class="form-group mb-5 ml-5 mr-5">
        <h2>OutputFiles</h2>

        <div class="my-2">
          <v-wait for="wait for ws response">
            <circles-to-rhombuses-spinner
              slot='waiting'
              :animation-duration="1200"
              :circles-num="3"
              :circle-size="15"
              color="#5bc0de"
            />
            <div id="stdout" v-if="outputFiles !== ''">
              <h3>Stdout</h3>
              <prism-editor class="my-editor output-editor" :readonly="true" v-model="outputFiles" :highlight="highlighter" line-numbers></prism-editor>
            </div>
            <div id="stderr" class="mt-2" v-if="outputFiles !== ''">
              <h3>Stderr</h3>
              <prism-editor class="my-editor output-editor" :readonly="true" v-model="errorFiles" :highlight="highlighter" line-numbers></prism-editor>
            </div>
            <div id="fileList" class="mt-2" v-if="outputFiles !== ''">
              <h3>Files to Download</h3>
              <div class="fileViewer">
                <b-card no-body v-if="returnedOutputJson.artifacts.length > 0">
                  <b-tabs card class="files" content-class="m-2">
                    <b-tab :title="'OutputFile ' + artifactParent_index" ref="artifact" class="artifact" v-for="(artifact, artifactParent_index) in returnedOutputJson.artifacts" :key=artifact.identifier>
                      <div v-if="artifact.MIMEtype !== 'image/png'" ref="outPartcontent" class="outPartcontent">
                        <prism-editor class="my-editor editor-readonly top-editor bottom-editor" :readonly="true" :value="decodeBase64(artifact.content)" :highlight="highlighter" line-numbers></prism-editor>   
                      </div>
                      <div v-if="artifact.MIMEtype === 'image/png'" ref="outPartcontent" class="outPartcontent">
                        <img :src="imagesrc(artifact.content)"/>   
                      </div>
                    </b-tab>
                  </b-tabs>
                </b-card>
              </div>
              <ul>
                <li v-for="artifact in returnedOutputJson.artifacts" :key=artifact.identifier>
                  <a href="#" @click="save(artifact.path, artifact.identifier, artifact.MIMEtype)">{{ artifact.path }}</a>
                </li>
              </ul>
            </div>
          </v-wait>
        </div>

      </div>
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
import Parameters from "./components/Parameters.vue";

import { CirclesToRhombusesSpinner } from 'epic-spinners';

import GridPlot from "./components/viplab-plots/gridplot/GridPlot.vue";

//import $ from 'jquery';

export default {
  name: "app",
  components: {
    PrismEditor,
    CirclesToRhombusesSpinner,
    Parameters,
    GridPlot
  },
  data() {
    return {
      json: "{}", //'{ "identifier"  : "11483f23-95bf-424a-98a5-ee5868c85c3e","metadata": { "display_name" : "Aufgabe 1", "description" : "Schreiben Sie eine C-Funktion..."},"environment" : "C","files" : [{ "identifier": "22483f42-95bf-984a-98a5-ee9485c85c3e", "path"      : "code.c","metadata"  : {  "MIMEtype": "text/plain",  "syntaxHighlighting": "C" },"parts" :  [{ "identifier": "preamble","access"    : "visible",  "metadata"  : { "name"    : "Info: source before your code.","emphasis"  : "low"},"content"   : "I2luY2x1ZGUgPHN0ZGlvLmg-Cg" },{ "identifier": "codeFromStudent","access"    : "modifiable","metadata"  :{ "name"    : "Fill in your code!","emphasis"  : "medium"},"content" : "dm9pZCBiYXIoKSB7IC8qIFNjaHJlaWJlbiBTaWUgaGllciBDb2RlLCBkZXIgImJhciIgYXVzZ2lidC4gKi8KCn0K"},{ "identifier": "postscript","access"    : "visible","metadata"  :{ "name"      : "Info: source after your code calling bar() in it.", "emphasis"  : "low"}, "content" : "aW50IG1haW4oKSB7IGJhcigpOyByZXR1cm4gMDsgfQ" }] }],"parameters" : { "__checkbox__" : { "gui_type": "checkbox", "name": "options", "values": ["verbose", "debug", "make_plot"], "selected": ["verbose"]}, "__radioButton__" : { "gui_type": "radio", "name": "backend", "values": ["debug", "serial", "hpc", "test"], "selected": "serial", "disabled" : ["hpc"]}, "__dropdownSingle__" : { "gui_type": "dropdown", "name": "model", "values" : ["Please choose one", "1p", "1pnc", "1pncmin", "2p", "2p1c"], "selected" : "1p", "disabled" : ["Please choose one"], "multiple" : false }, "__dropdownMultiple__" : { "gui_type": "dropdown", "name": "model", "values" : ["Please choose multiple", "1p", "1pnc", "1pncmin", "2p", "2p1c"], "selected" : ["1p", "2p"], "disabled" : ["Please choose multiple", "2p1c"], "multiple" : true }, "__toggle__" : { "gui_type": "toggle", "name": "options", "values" : ["verbose", "debug", "make_plot"], "selected" : ["verbose"]}, "__sliderSingle__" : { "gui_type": "slider", "name": "temperature", "value" : 10, "min" : 0, "max" : 500, "step" : 10, "multiple" : false, "vertical" : false}, "__sliderMultiple__" : { "gui_type": "slider", "name": "temperature", "value" : [25, 50, 75], "min" : 0, "max" : 100, "step" : 5, "multiple" : true, "vertical" : true}, "__inputTextWMaxlength__" : { "gui_type": "input_field", "name": "file_name", "type" : "text", "maxlength" : 200}, "__inputTextWOMaxlangth__" : { "gui_type": "input_field", "name": "file_name", "type" : "text"}, "__inputNumber__" : { "gui_type": "input_field", "name": "time_delay", "type" : "number", "value" : 10, "min" : 0, "max" : 500, "step" : 0.1}, "__defaultJson__" : { "name": "code 1", "code" : "I2luY2x1ZGUgPHN0ZGlvLmg-Cg"}, "__defaultJava__" : { "name": "code 2", "code" : "dm9pZCBiYXIoKSB7IC8qIFNjaHJlaWJlbiBTaWUgaGllciBDb2RlLCBkZXIgImJhciIgYXVzZ2lidC4gKi8KCn0K"}, "__git__" :{ "gui_type" : "input_field","name"     : "stepwidth","type"     : "number","value"    : 0.001, "min"      : 0, "max"      : 1 ,"step"     : 0.001 ,"validation" : "range"}}, "configuration" : { "compiling.compiler" : "gcc", "compiling.flags"    : "-O2 -Wall" ,"checking.sources"   : ["codeFromStudent"], "checking.forbiddenCalls": "system execve" ,"linking.flags"      : "-lm" ,"running.commandLineArguments" : "--stepwidth {{ __STEPWIDTH__ }}"}}',
      token: "",
      templates: require.context("./input/", false, /^.*\.json$/).keys(), //get json file names from ./input folder
      form_v_model: [], // array for v-model: for all form elements to be able to access the changes made by the user
      inputFiles_v_model: [],
      inputFilesPartsParameters_v_model: [],
      ws: "",
      returnedOutputJson: "",
      outputFiles: "",
      errorFiles: "", 
      maximized: false,
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
    }
  },
  methods: {
    /** pre-fill the array form_v_model with the values specified in the json file or if not specified add default values */
    fillForm_v_model: function (toBeFilled) {
      var parsedParametersJson = [];
      if (toBeFilled === "form") {
        parsedParametersJson = this.json.parameters;
      } else {
        var array = [];
        for (var file in this.json.files) {
          for (var part in this.json.files[file].parts) {
            if (this.json.files[file].parts[part].parameters) {
              for (var param in this.json.files[file].parts[part].parameters) {
                array.push(this.json.files[file].parts[part].parameters[param]);
              }
            }
          }
        }
        parsedParametersJson = array;
      }
      console.log(parsedParametersJson);

      var vModel = [];
      for (var item in parsedParametersJson) {
        if (
          parsedParametersJson[item].metadata.guiType == "checkbox" ||
          parsedParametersJson[item].metadata.guiType == "toggle"
        ) {
          vModel.push([]);
          for (var i = 0; i < parsedParametersJson[item].values.length; i++) {
            var isChecked = false;
            if (parsedParametersJson[item].values[i].selected) {
              isChecked = true;
            }
            vModel[vModel.length - 1].push(isChecked);
          }
        } else if (
          parsedParametersJson[item].metadata.guiType == "radio" ||
          parsedParametersJson[item].metadata.guiType == "dropdown"
        ) {
          var a = [];
          for (i = 0; i < parsedParametersJson[item].values.length; i++) {
            if (parsedParametersJson[item].values[i].selected) {
              a.push(parsedParametersJson[item].values[i].value);
            }
          }
          if (a.length > 1) {
            vModel.push(a);
          } else {
            vModel.push(a[0]);
          }
        } else if (
          parsedParametersJson[item].metadata.display == "slider" ||
          (parsedParametersJson[item].metadata.display == "input_field" &&
            parsedParametersJson[item].metadata.type == "number")
        ) {
          vModel.push(parsedParametersJson[item].value);
        } else if (
          parsedParametersJson[item].metadata.display == "input_field" &&
          parsedParametersJson[item].metadata.type == "text"
        ) {
          vModel.push("");
        } else {
          vModel.push(
            this.decodeBase64(parsedParametersJson[item].value)
          );
        }
      }
      if (toBeFilled === "form") {
        this.form_v_model = vModel;
      } else {
        this.inputFilesPartsParameters_v_model = vModel;
      }
    },
    fillInputFiles_v_model: function () {
      var files = this.json.files;
      for (var file in files) {
        var parts = files[file].parts;
        var array = [];
        for (var part in parts) {
          //if(parts[part].access !== "template") {
            array.push(this.decodeBase64(parts[part].content));

            //var parametersArray = [];
            //if(parts[part].parameters){
            //  parametersArray.push(); //see above: the same as in fillFormModel
            //}
          //}
        }
        if (array.length > 0) {
          this.inputFiles_v_model.push(array);
        }
      }
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
      var appDiv = document.body;
      var data = appDiv.getAttribute("data-template");
      this.json = JSON.parse(this.decodeBase64(data));
      this.token = appDiv.getAttribute("data-token");

      console.log(this.json);

      this.form_v_model = [];
      this.fillForm_v_model("form");
      this.fillInputFiles_v_model();
      this.fillForm_v_model("parts");
    },
    /** highlight the code in the editor */
    highlighter(code) {
      return highlight(code, languages.js); // languages.<insert language> to return html with markup
    }, 
    executeAfterDomLoaded: function(){
      //this.ws = new WebSocket("ws://192.168.195.128:8083/computations");
      this.ws = new WebSocket("ws://localhost:8083/computations");
      console.log("connect to ws");
      this.ws.onopen = () => {
        this.ws.send(JSON.stringify({"type":"authenticate","content":{"jwt": this.token}}));
          document.getElementById("submit").disabled = false;
      };
      this.ws.onmessage = (event) => {
        var data = JSON.parse(event.data);
        switch  (data.type) {
            case "computation":
                this.displayComputation(data.content);
                break;
            case "result":
                this.displayResult(data.content);
                break;
            default:
                console.error(data);
        }
        if(this.outputFiles !== "") {
          // stop waiting
          this.$wait.end('wait for ws response');
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
      console.log("send data");
      
      // start waiting
      this.$wait.start('wait for ws response');

      document.getElementById("submit").disabled = true;
      var task = {
        "type":"create-computation",
        "content":{
            "template": document.body.getAttribute("data-template"),
            "task":{
                "template": this.json.identifier,
                "identifier": this.uuid(),
                "files": []
            }
            
        }
      };
      if(this.$refs.file != null){
        var i = 0;
        this.$refs.file.forEach((filediv) => {
          let file = { 'identifier': filediv.id, 'parts': []};
          var j = 0;
          this.$refs.partcontent.forEach((partcontent) => {
            file.parts.push({'identifier': partcontent.id, 'content': btoa(this.inputFiles_v_model[i][j])});
            j++;
          });
          task.content.task.files.push(file);
          i++;
        });
      }
      //document.querySelector('#stdout').value = '';
      //document.querySelector('#stderr').value = '';
      //document.getElementById("fileList").innerHTML = '';
      //this.outputFiles = new Map();
      
      this.ws.send(JSON.stringify(task));
      
      return false;
    },
    displayComputation: function(computation){
      console.log("computation: " + computation);
    },
    displayResult: function(result){
      console.log(result);
      if (result.result.status == "final") {
        document.getElementById("submit").disabled = false;
      }
      this.returnedOutputJson = result.result;
      //for testing add image to json:
      this.returnedOutputJson.artifacts.push({ "type" : "file", "identifier" : "de762095-6cd2-439f-80eb-313e85d3386a", "MIMEtype": "image/png", "path" : "/images/img.png", "content": "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAH0lEQVR42mOcx/C/noGKgHHUwFEDRw0cNXDUwJFqIAAJpipFpDW1EwAAAABJRU5ErkJggg=="});

      this.outputFiles = this.decodeBase64(result.result.output.stdout);
      this.errorFiles = this.decodeBase64(result.result.output.stderr);
      //console.log(this.outputFiles);
      
    }, 
    imagesrc: function(base64Image) {
      return "data:image/png;base64," + base64Image;
    }, 
    save: function(filename, identifier, mimetype){
      console.log("save the following file: " + filename + " " + identifier + " " + mimetype);
      var content = "";
      this.returnedOutputJson.artifacts.forEach(item => {
        if(item.identifier == identifier) {
          content = this.decodeBase64(item.content);
        }
      });
      var blob = "";
      if(mimetype === "image/png") {
          const byteNumbers = new Array(content.length);
          for (let i = 0; i < content.length; i++) {
            byteNumbers[i] = content.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          blob = new Blob([byteArray], {type: mimetype});
      } else {
        blob = new Blob([content], {mimetype: mimetype});
      }
      if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
      } else {
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
      }
      return false;
    }, 
    maximize: function() {
      this.maximized = !this.maximized;
    }
  },
  created() {
    this.loadJsonFromFile();
    //console.log(this.inputFiles_v_model);
  },
  mounted() {
    this.executeAfterDomLoaded();
    console.log(process.env.NODE_ENV);
    //this.loadJsonFromFile();
    //this.loadJsonFromFile("./container.computation-template2.json");
  },
};
</script>

<style>
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
  /*flex-direction: row;*/
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

.output-editor {
  border-radius: 25px;
  border: 1px solid #ddd;
}

.editor-readonly {
  background: #ddd;
  /*border-left: 1px solid #888;
  border-right: 1px solid #888;
  opacity: 0.3;*/
}

.card-header:nth-child(1) {
  background-color: white;
  border-radius: calc(.25rem - 1px) calc(.25rem - 1px) 0 0 !important;
}

.nav-link {
  background-color: #ddd;
  margin-left: 2px;
  text-decoration: none !important;
  /*negative margin, so that there is no line under the currently selected tab*/
  margin-bottom: -.05rem !important;
}

.btn {
  border-radius: 25px !important;
  padding-left: 20px !important;
  padding-right: 20px !important;
}

</style>
