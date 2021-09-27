<template>
  <div
    id="app"
    class="flex-container"
    :style="[maximized ? { 'flex-direction': 'column !important' } : null]"
  >
    <!--<div class="m-2">
      <h1>Hello User</h1>
      I found the following templates in example folder: 
      
      <ul>
        <li v-for="temp in templates" :key=temp>
          <a type="button" :href=temp>{{temp}}</a>
        </li>
      </ul>
    </div>-->
    <!--<json-v-model-test/>-->

    <div class="side-to-side-div flex-left m-2 p-2">
      <validation-observer v-slot="{ invalid }">
        {{invalid}}
      <form @submit.prevent="sendData">
        <div class="form-group mb-5 ml-5 mr-5">
          <h2 v-if="parsedFilesJson">InputFiles</h2>

          <div class="item-name" v-if="json.metadata">
            {{ json.metadata.display_name }}
          </div>
          <div class="item-name" v-if="json.metadata">
            {{ json.metadata.description }}
          </div>

          <div class="cards" >
            <!-- 
            Aktuell kann man die cards auch sehen, wenn sie leer sind - Wie kann man das ändern?
          -->
            <b-card no-body v-if="numberOfInputFiles > 0">
              <b-tabs card class="files" content-class="m-2" fill>
                <b-tab
                  :title="'File ' + fileParent_index"
                  ref="file"
                  class="file"
                  v-for="(file, fileParent_index) in parsedFilesJson"
                  :key="file.identifier"
                  @click="tabClicked"
                >
                  <div
                    class="part mb-3"
                    v-for="part in file.parts"
                    :key="part.identifier"
                  >
                    <div
                      ref="partcontent"
                      class="partcontent"
                      :id="part.identifier"
                      v-if="
                        part.access !== 'template' && numberOfInputFiles > 0
                      "
                    >
                      <div v-if="part.access == 'visible'">
                        <editor-component
                          :item="part"
                          :readonly="true"
                          :isParameter="false"
                        ></editor-component>
                      </div>
                      <div v-else>
                        <editor-component
                          :item="part"
                          :readonly="false"
                          :isParameter="false"
                        ></editor-component>
                      </div>
                    </div>
                    <div
                      class="part-parameters"
                      v-if="part.parameters && part.access == 'template'"
                    >
                      <h2>Parameters</h2>
                      <parameters 
                        v-if="asForm"
                        :parameters="part.parameters">
                      </parameters>
                      <div v-else>
                        <prism-editor
                          class="my-editor editor-readonly"
                          :readonly="true"
                          :value=showMustacheTemplate(part)
                          :highlight="highlighter"
                          line-numbers
                        ></prism-editor>
                      </div>
                    </div>
                  </div>
                  <b-button v-if="isPartParameters > 0" class="btn mb-3 float-right" @click="switchParameterView()" v-tooltip.top-center="asForm? 'View File' : 'Modify Parameters'">
                    <b-icon v-if="asForm" icon="file-earmark-code" aria-hidden="true"></b-icon>
                    <b-icon v-else icon="file-earmark-diff" aria-hidden="true"></b-icon>
                  </b-button>
                </b-tab>
                <b-tab v-if="parsedParametersJson" title="Parameters">
                  <!-- render parameters section of the json -->
                  
                  <!--<form>-->
                    <div class="form-group mb-5 ml-5 mr-5">
                      <h2 v-if="parsedParametersJson">Parameters</h2>
                      <parameters
                        :parameters="parsedParametersJson"
                      ></parameters>
                    </div>
                  <!--</form>-->
                  
                </b-tab>
              </b-tabs>
            </b-card>
            <div class="sticky-button">
              <b-button class="btn" id="submit" variant="primary" :disabled="invalid" v-tooltip.top-center="'Run'">
                <b-icon icon="play" aria-hidden="true"></b-icon>
              </b-button>
            </div>
          </div>
        </div>
      </form>
      </validation-observer>

      <div class="d-flex flex-row mb-5 ml-5 mr-5">
        <div class="mr-auto">
          <b-button class="btn mr-2" v-tooltip.top-center="'Download backup of changes'">
            <b-icon
              icon="download"
              aria-hidden="true"
              @click="download"
            ></b-icon>
          </b-button>
          <input
            type="file"
            ref="upload"
            style="display: none"
            @change="upload"
            accept="application/JSON"
          />
          <b-button
            class="btn btn-secondary file"
            @click="$refs.upload.click()"
            v-tooltip.top-center="'Upload of previously downloaded backup'"
          >
            <b-icon icon="upload" aria-hidden="true"></b-icon>
          </b-button>
          <!--
          <b-button class="btn" variant="primary" id="submit" disabled>
            <b-icon icon="play" aria-hidden="true"></b-icon>
          </b-button>
          -->
        </div>
        <div class="">
          <b-button class="btn mr-2" id="maximize-button" @click="maximize" v-tooltip.top-center="maximized ? 'Minimize' : 'Maximize'">
            <b-icon v-if="!maximized" icon="fullscreen" aria-hidden="true"></b-icon>
            <b-icon v-else icon="fullscreen-exit" aria-hidden="true"></b-icon>
          </b-button>
          <b-button class="btn" style="width:62.5px" variant="success" btn-variant="white" v-tooltip.top-center="'Save'">
            <font-awesome-icon icon="save" />
          </b-button>
        </div>
      </div>
    </div>

    <div class="side-to-side-div flex-right m-2 p-2">
      <div class="form-group mb-5 ml-5 mr-5">
        <h2>OutputFiles</h2>

        <div class="my-2">
          <v-wait for="wait for ws response">
            <circles-to-rhombuses-spinner
              slot="waiting"
              :animation-duration="1200"
              :circles-num="3"
              :circle-size="15"
              color="#5bc0de"
            />
            <div id="stdout" v-if="outputFiles !== ''">
              <h3>Stdout</h3>
              <prism-editor
                class="my-editor output-editor"
                :readonly="true"
                v-model="outputFiles"
                :highlight="highlighter"
                line-numbers
              ></prism-editor>
            </div>
            <div id="stderr" class="mt-2" v-if="outputFiles !== ''">
              <h3>Stderr</h3>
              <prism-editor
                class="my-editor output-editor"
                :readonly="true"
                v-model="errorFiles"
                :highlight="highlighter"
                line-numbers
              ></prism-editor>
            </div>
            <div id="fileList" class="mt-2" v-if="outputFiles !== ''">
              <h3>Files to Download</h3>
              <div class="fileViewer">
                <b-card
                  no-body
                  v-if="returnedOutputJson.artifacts.length > 0"
                  fill
                >
                  <b-tabs card class="files" content-class="m-2" lazy>
                    <b-tab
                      :title="'OutputFile ' + artifactParent_index"
                      ref="artifact"
                      class="artifact"
                      v-for="(
                        artifact, artifactParent_index
                      ) in returnedOutputJson.artifacts"
                      :key="artifact.identifier"
                    >
                      <div v-if="artifact.type !== 's3file'">
                        <div
                          v-if="artifact.MIMEtype !== 'image/png'"
                          ref="outPartcontent"
                          class="outPartcontent"
                        >
                          <prism-editor
                            class="
                              my-editor
                              editor-readonly
                              top-editor
                              bottom-editor
                            "
                            :readonly="true"
                            :value="decodeBase64(artifact.content)"
                            :highlight="highlighter"
                            line-numbers
                          ></prism-editor>
                        </div>
                        <div
                          v-if="artifact.MIMEtype === 'image/png'"
                          ref="outPartcontent"
                          class="outPartcontent"
                        >
                          <img :src="imagesrc(artifact.content)" />
                        </div>
                      </div>
                      <!-- Render s3 files that have no content-element-->
                      <div v-else>
                        <div v-if="artifact.MIMEtype == 'application/vtu'">
                            <vtk-component
                                v-if="artifact.MIMEtype == 'application/vtu'"
                                :propFiles=artifact.urls
                            ></vtk-component>
                        </div>
                        <div
                          v-else-if="artifact.MIMEtype !== 'image/png' && artifact.MIMEtype == 'text/plain'"
                          ref="outPartcontent"
                          class="outPartcontent"
                        >
                          <Promised :promise="getContentFromS3(artifact.url, false)">
                            <!-- Use the "pending" slot to display a loading message -->
                            <template v-slot:pending>
                              <p>Loading...</p>
                            </template>
                            <!-- The default scoped slot will be used as the result -->
                            <template v-slot="data">
                              <div>
                              <prism-editor
                                v-if="artifact.MIMEtype == 'text/plain'"
                                class="
                                  my-editor
                                  editor-readonly
                                  top-editor
                                  bottom-editor
                                "
                                :readonly="true"
                                :value="data"
                                :highlight="highlighter"
                                line-numbers
                                :ref="artifact.path"
                              ></prism-editor>
                              </div>
                            </template>
                            <template v-slot:rejected="error">
                              <p>Error: {{ error.message }}</p>
                            </template>
                          </Promised>
                        </div>
                        <div v-else-if="artifact.MIMEtype == 'text/csv'">
                          <csv-plot 
                            :urlsProp=artifact.urls>
                          </csv-plot>
                        </div>
                        <div v-else>
                          <Promised :promise="getContentFromS3(artifact.url, true)">
                            <!-- Use the "pending" slot to display a loading message -->
                            <template v-slot:pending>
                              <p>Loading...</p>
                            </template>
                            <!-- The default scoped slot will be used as the result -->
                            <template v-slot="data">
                              <img 
                                :src="data" 
                                :ref="artifact.path"/>
                            </template>
                            <template v-slot:rejected="error">
                              <p>Error: {{ error.message }}</p>
                            </template>
                          </Promised>
                        </div>
                      </div>  
                    </b-tab>
                  </b-tabs>
                </b-card>
              </div>
              <ul>
                <li
                  v-for="artifact in returnedArtifactsWOvtkCsv"
                  :key="artifact.identifier"
                >
                  <a
                    href="#"
                    @click="
                      save(
                        artifact.path,
                        artifact.identifier,
                        artifact.MIMEtype
                      )
                    "
                    >{{ artifact.path }}</a
                  >
                </li>
              </ul>
            </div>
          </v-wait>
        </div>
        <grid-plot></grid-plot>
        <plot-2d></plot-2d>
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
import EditorComponent from "./components/EditorComponent.vue";

import { CirclesToRhombusesSpinner } from "epic-spinners";

import GridPlot from "./components/viplab-plots/gridplot/GridPlot.vue";

//import $ from 'jquery';

import VtkComponent from "./components/vtk-plots/VtkComponent.vue";
import Plot2d from './components/viplab-plots/plot2d/plot2d.vue';
import CsvPlot from './components/csv-plots/CsvPlot.vue';

import {Promised} from "vue-promised";

var Mustache = require('mustache');

import {ValidationObserver} from "vee-validate";

export default {
  name: "app",
  components: {
    PrismEditor,
    CirclesToRhombusesSpinner,
    Parameters,
    GridPlot,
    VtkComponent,
    EditorComponent,
    Plot2d,
    CsvPlot,
    Promised,
    ValidationObserver
  },
  data() {
    return {
      json: "{}", //'{ "identifier"  : "11483f23-95bf-424a-98a5-ee5868c85c3e","metadata": { "display_name" : "Aufgabe 1", "description" : "Schreiben Sie eine C-Funktion..."},"environment" : "C","files" : [{ "identifier": "22483f42-95bf-984a-98a5-ee9485c85c3e", "path"      : "code.c","metadata"  : {  "MIMEtype": "text/plain",  "syntaxHighlighting": "C" },"parts" :  [{ "identifier": "preamble","access"    : "visible",  "metadata"  : { "name"    : "Info: source before your code.","emphasis"  : "low"},"content"   : "I2luY2x1ZGUgPHN0ZGlvLmg-Cg" },{ "identifier": "codeFromStudent","access"    : "modifiable","metadata"  :{ "name"    : "Fill in your code!","emphasis"  : "medium"},"content" : "dm9pZCBiYXIoKSB7IC8qIFNjaHJlaWJlbiBTaWUgaGllciBDb2RlLCBkZXIgImJhciIgYXVzZ2lidC4gKi8KCn0K"},{ "identifier": "postscript","access"    : "visible","metadata"  :{ "name"      : "Info: source after your code calling bar() in it.", "emphasis"  : "low"}, "content" : "aW50IG1haW4oKSB7IGJhcigpOyByZXR1cm4gMDsgfQ" }] }],"parameters" : { "__checkbox__" : { "gui_type": "checkbox", "name": "options", "values": ["verbose", "debug", "make_plot"], "selected": ["verbose"]}, "__radioButton__" : { "gui_type": "radio", "name": "backend", "values": ["debug", "serial", "hpc", "test"], "selected": "serial", "disabled" : ["hpc"]}, "__dropdownSingle__" : { "gui_type": "dropdown", "name": "model", "values" : ["Please choose one", "1p", "1pnc", "1pncmin", "2p", "2p1c"], "selected" : "1p", "disabled" : ["Please choose one"], "multiple" : false }, "__dropdownMultiple__" : { "gui_type": "dropdown", "name": "model", "values" : ["Please choose multiple", "1p", "1pnc", "1pncmin", "2p", "2p1c"], "selected" : ["1p", "2p"], "disabled" : ["Please choose multiple", "2p1c"], "multiple" : true }, "__toggle__" : { "gui_type": "toggle", "name": "options", "values" : ["verbose", "debug", "make_plot"], "selected" : ["verbose"]}, "__sliderSingle__" : { "gui_type": "slider", "name": "temperature", "value" : 10, "min" : 0, "max" : 500, "step" : 10, "multiple" : false, "vertical" : false}, "__sliderMultiple__" : { "gui_type": "slider", "name": "temperature", "value" : [25, 50, 75], "min" : 0, "max" : 100, "step" : 5, "multiple" : true, "vertical" : true}, "__inputTextWMaxlength__" : { "gui_type": "input_field", "name": "file_name", "type" : "text", "maxlength" : 200}, "__inputTextWOMaxlangth__" : { "gui_type": "input_field", "name": "file_name", "type" : "text"}, "__inputNumber__" : { "gui_type": "input_field", "name": "time_delay", "type" : "number", "value" : 10, "min" : 0, "max" : 500, "step" : 0.1}, "__defaultJson__" : { "name": "code 1", "code" : "I2luY2x1ZGUgPHN0ZGlvLmg-Cg"}, "__defaultJava__" : { "name": "code 2", "code" : "dm9pZCBiYXIoKSB7IC8qIFNjaHJlaWJlbiBTaWUgaGllciBDb2RlLCBkZXIgImJhciIgYXVzZ2lidC4gKi8KCn0K"}, "__git__" :{ "gui_type" : "input_field","name"     : "stepwidth","type"     : "number","value"    : 0.001, "min"      : 0, "max"      : 1 ,"step"     : 0.001 ,"validation" : "range"}}, "configuration" : { "compiling.compiler" : "gcc", "compiling.flags"    : "-O2 -Wall" ,"checking.sources"   : ["codeFromStudent"], "checking.forbiddenCalls": "system execve" ,"linking.flags"      : "-lm" ,"running.commandLineArguments" : "--stepwidth {{ __STEPWIDTH__ }}"}}',
      token: "",
      templates: require.context("./input/", false, /^.*\.json$/).keys(), //get json file names from ./input folder
      numberOfInputFiles: [],
      ws: "",
      returnedOutputJson: "",
      outputFiles: "",
      errorFiles: "",
      maximized: false,
      file: null,
      asForm: true,
      isPartParameters: 0
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
    /* return result artifacts for download-links without the csv and vtk files that are downloadable from their respectable view */
    returnedArtifactsWOvtkCsv: function() {
      let artifacts = this.returnedOutputJson.artifacts;
      let newArtifacts = [];
      for(var i = 0; i < artifacts.length; i++) {
        if(artifacts[i].MIMEtype != 'application/vtu' && artifacts[i].MIMEtype != 'text/csv') {
          newArtifacts.push(artifacts[i]);
        }
      }
      return newArtifacts;
    }
  },
  methods: {
    /* set the number of input files */
    setNumberOfInputFiles: function () {
      var files = this.json.files;
      for (var file in files) {
        var parts = files[file].parts;
        console.log(parts.length);
        this.numberOfInputFiles = parts.length;
      }
    },
    /* rewrite base64urlEncodedString to base64*/
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
    /** decode base64urlEncodedString to a normal string */
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

      console.log(this.json);

      this.setNumberOfInputFiles();
    },
    /** highlight the code in the editor */
    highlighter(code) {
      return highlight(code, languages.js); // languages.<insert language> to return html with markup
    },
    /** should be the first thing that is executed when DOM is loaded: setup connection to webserver */
    executeAfterDomLoaded: function () {
      //this.ws = new WebSocket("ws://192.168.195.128:8083/computations");
      this.ws = new WebSocket("ws://localhost:8083/computations");
      console.log("connect to ws");
      this.ws.onopen = () => {
        this.ws.send(
          JSON.stringify({ type: "authenticate", content: { jwt: this.token } })
        );
        // currently always enabled as soon as every part of form validates!!!
        document.getElementById("submit").disabled = false;
      };
      this.ws.onmessage = (event) => {
        var data = JSON.parse(event.data);
        switch (data.type) {
          case "computation":
            this.displayComputation(data.content);
            break;
          case "result":
            this.displayResult(data.content);
            break;
          default:
            console.error(data);
        }
        if (this.outputFiles !== "") {
          // stop waiting
          this.$wait.end("wait for ws response");
        }
      };
      document.getElementById("submit").onclick = this.sendData;
    },
    /** create uuid for the template to be sent as request */
    uuid: function () {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return (
        s4() +
        s4() +
        "-" +
        s4() +
        "-" +
        s4() +
        "-" +
        s4() +
        "-" +
        s4() +
        s4() +
        s4()
      );
    },
    /** send data to webserver for requesting the solution */
    sendData: function () {
      console.log("send data");

      // start waiting
      this.$wait.start("wait for ws response");

      document.getElementById("submit").disabled = true;
      var task = {
        type: "create-computation",
        content: {
          template: document.body.getAttribute("data-template"),
          task: {
            template: this.json.identifier,
            identifier: this.uuid(),
            files: [],
          },
        },
      };
      if (this.$refs.file != null) {
        for (var fileIndex in this.json.files) {
          let file = { identifier: this.json.files[fileIndex].identifier, parts: [] };
          for (var part in this.json.files[fileIndex].parts) {
            file.parts.push({
              identifier: this.json.files[fileIndex].parts[part].identifier,
              // TODO
              content: btoa(this.json.files[fileIndex].parts[part].content),
            });
          }
          task.content.task.files.push(file);
          console.log(task);
        }
        
        /*
        var i = 0;
        this.$refs.file.forEach((filediv) => {
          let file = { identifier: filediv.id, parts: [] };
          var j = 0;
          this.$refs.partcontent.forEach((partcontent) => {
            file.parts.push({
              identifier: partcontent.id,
              // TODO
              content: btoa(this.json.files[i][j].content),
            });
            console.log(file.parts.content);
            j++;
          });
          task.content.task.files.push(file);
          i++;
        });*/
      }
      //document.querySelector('#stdout').value = '';
      //document.querySelector('#stderr').value = '';
      //document.getElementById("fileList").innerHTML = '';
      //this.outputFiles = new Map();

      this.ws.send(JSON.stringify(task));

      return false;
    },
    /** log the computation */
    displayComputation: function (computation) {
      console.log("computation: " + computation);
    },
    /** process the result before displaying it in the DOM */
    displayResult: function (result) {
      console.log(result.result.output.stdout);
      if (result.result.status == "final") {
        document.getElementById("submit").disabled = false;
      }

      // if the first result came back, set the whole object, else, only add the new artifacts to the existing object
      if (this.returnedOutputJson === "") {
        this.returnedOutputJson = result.result;
      } else {
        this.returnedOutputJson.artifacts.push(result.result.artifacts);
      }
      
      // vtu with other path for testing
      /*
      this.returnedOutputJson.artifacts.unshift(
        {
      "type" : "s3file",
      "identifier" : "cc3c1cf9-c02d-4694-902c-93c298d68c63",
      "MIMEtype": "application/vtu",
      "path": "/vtu-collection2/case1_single_tracer_matrix-00000.vtu",
      "url": "http://localhost:8080/case1_single_tracer_matrix-00000.vtu",
      "size": "123456789",
      "hash": "sha512:hashcode_of_file"
    }
      );
      this.returnedOutputJson.artifacts.unshift(
        {
      "type" : "s3file",
      "identifier" : "cc3c1cf9-c02d-4694-902c-93c298d68c64",
      "MIMEtype": "application/vtu",
      "path": "/vtu-collection2/case1_single_tracer_matrix-00001.vtu",
      "url": "http://localhost:8080/case1_single_tracer_matrix-00001.vtu",
      "size": "123456789",
      "hash": "sha512:hashcode_of_file"
    }
      );
      this.returnedOutputJson.artifacts.unshift(
        {
      "type" : "s3file",
      "identifier" : "cc3c1cf9-c02d-4694-902c-93c298d68c64",
      "MIMEtype": "application/vtu",
      "path": "/vtu-collection2/case1_single_tracer_matrix-00002.vtu",
      "url": "http://localhost:8080/case1_single_tracer_matrix-00002.vtu",
      "size": "123456789",
      "hash": "sha512:hashcode_of_file"
    }
      );
      this.returnedOutputJson.artifacts.unshift(
        {
      "type" : "s3file",
      "identifier" : "cc3c1cf9-c02d-4694-902c-93c298d68c74",
      "MIMEtype": "application/vtu",
      "path": "/vtu-collection2/case1_single_tracer_matrix-00003.vtu",
      "url": "http://localhost:8080/case1_single_tracer_matrix-00003.vtu",
      "size": "123456789",
      "hash": "sha512:hashcode_of_file"
    }
      );
      this.returnedOutputJson.artifacts.unshift(
        {
      "type" : "s3file",
      "identifier" : "cc3c1cf9-c02d-4694-902c-93c298d68c75",
      "MIMEtype": "application/vtu",
      "path": "/vtu-collection2/case1_single_tracer_matrix-00030.vtu",
      "url": "http://localhost:8080/case1_single_tracer_matrix-00030.vtu",
      "size": "123456789",
      "hash": "sha512:hashcode_of_file"
    }
      );
      this.returnedOutputJson.artifacts.unshift(
        {
      "type" : "s3file",
      "identifier" : "cc3c1cf9-c02d-4694-902c-93c298d68c64",
      "MIMEtype": "application/vtu",
      "path": "/vtu-collection2/earth.vtp",
      "url": "http://localhost:8080/earth.vtp",
      "size": "123456789",
      "hash": "sha512:hashcode_of_file"
    }
      );
      this.returnedOutputJson.artifacts.push(
        {
      "type" : "s3file",
      "identifier" : "cc3c1cf9-c02d-4694-902c-93c298d68c65",
      "MIMEtype": "text/csv",
      "path": "/dataovertime/dataovertime-00003.csv",
      "url": "http://localhost:8080/dataovertime-00003.csv",
      "size": "123456789",
      "hash": "sha512:hashcode_of_file"
    }
      );
      this.returnedOutputJson.artifacts.push(
        {
      "type" : "s3file",
      "identifier" : "cc3c1cf9-c02d-4694-902c-93c298d68c66",
      "MIMEtype": "text/csv",
      "path": "/dataovertime/dataovertime-00004.csv",
      "url": "http://localhost:8080/dataovertime-00004.csv",
      "size": "123456789",
      "hash": "sha512:hashcode_of_file"
    }
      );
      this.returnedOutputJson.artifacts.push(
        {
      "type" : "s3file",
      "identifier" : "cc3c1cf9-c02d-4694-902c-93c298d68c67",
      "MIMEtype": "text/csv",
      "path": "/dataovertime/dataovertime-00005.csv",
      "url": "http://localhost:8080/dataovertime-00005.csv",
      "size": "123456789",
      "hash": "sha512:hashcode_of_file"
    }
      );*/

      console.log(this.returnedOutputJson);

      // process connected vtu/vtk files
      console.log(this.returnedOutputJson.artifacts)
      var collections = [];
      let connectedVtks = {};
      var artifacts = this.returnedOutputJson.artifacts;
      let created = false;
      for(var a = 0; a < artifacts.length; a++) {
        if((artifacts[a].MIMEtype == "application/vtu" || artifacts[a].MIMEtype == "text/csv") && !artifacts[a].artifacts){
          let path = artifacts[a].path;
          let lastIndex = path.lastIndexOf('/');
          let pathPart = path.substr(0, lastIndex + 1);
          
          if(!connectedVtks[pathPart]){
            connectedVtks[pathPart] = {};
            connectedVtks[pathPart].type = "s3file";
            connectedVtks[pathPart].MIMEtype = artifacts[a].MIMEtype;
            created = false;
            collections.push(pathPart);
          }
          if(created){
            connectedVtks[pathPart].urls.push(artifacts[a].url);
          } else {
            connectedVtks[pathPart].urls = [];
            connectedVtks[pathPart].urls.push(artifacts[a].url);
            created = true;
          }
        }
      }
      console.log(JSON.parse(JSON.stringify(connectedVtks)))

      // delete all vtk artifacts
      artifacts = this.returnedOutputJson.artifacts;
      var b = artifacts.length;
      while(b--){
        if((artifacts[b].MIMEtype == "application/vtu" || artifacts[b].MIMEtype == "text/csv")) {
          artifacts.splice(b, 1);
        }
      }
      
      // add vtk collections
      for(var c = 0; c < collections.length; c++){
        this.returnedOutputJson.artifacts.push(connectedVtks[collections[c]]);
      }
      console.log(this.returnedOutputJson);


      //TODO: Vars nicht überschreiben, sondern ergänzen für intermediate
      this.outputFiles = this.decodeBase64(result.result.output.stdout);
      this.errorFiles = this.decodeBase64(result.result.output.stderr);
      //console.log(this.outputFiles);
    }, 
    /** get content from s3 if it is an image, process differently */
    async getContentFromS3(url, image) {
      const response = await fetch(url, {
        method: 'GET',
      });
      var test = null;
      if (image) {
        test = await response.blob().then(imageBlob => {
          let imagesrc = URL.createObjectURL(imageBlob);
          return imagesrc;
        });
      } else {
        test = await response.text();
      }
      
      //console.log("Response from the fetch: ", test);

      if (response.status >= 200 && response.status < 300) {
          return Promise.resolve(test);
      } else {
          return Promise.reject(new Error("Unable to complete request for: " + url));
      }   
      
    }, 
    /**  */
    imagesrc: function (base64Image) {
      return "data:image/png;base64," + base64Image;
    },
    async save(filename, identifier, mimetype) {
      console.log(
        "save the following file: " +
          filename +
          " " +
          identifier +
          " " +
          mimetype
      );
      var content = "";
      this.returnedOutputJson.artifacts.forEach((item) => {
        if (item.identifier == identifier && item.content) {
          content = this.decodeBase64(item.content);
        } else if (item.identifier == identifier) {
          // handle files that were downloaded from s3
          var itemContent = "";
          if(item.MIMEtype === "text/plain") {
            itemContent = this.$refs[item.path][0].$el.lastElementChild.textContent;
          } else {
            var image = this.$refs[item.path][0].src;
            itemContent = image;
          }
          content = itemContent;
        }
      });
      var blob = "";
      if (mimetype === "image/png" && !(content.includes("blob:http"))) {
        // handle images that were not downloaded
        const byteNumbers = new Array(content.length);
        for (let i = 0; i < content.length; i++) {
          byteNumbers[i] = content.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], { type: mimetype });
        console.log(blob);
      } else if (mimetype === "image/png" && content.includes("blob:http")) {
        // handle files that were downloaded from s3
        blob = await fetch(content).then(r => r.blob());
      } else {
        blob = new Blob([content], { mimetype: mimetype });
      }
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
      } else {
        var elem = window.document.createElement("a");
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
      }
      return false;
    },
    downloadTaskJson: function () {},
    maximize: function () {
      this.maximized = !this.maximized;
    },
    /*download Computation Task JSON Message */
    download: function () {
      // first, generate the computation task json message
      var taskJson = new Object();
      taskJson.template = this.json.identifier;
      var args = [];
      for (var i in this.json.parameters) {
        var param = this.json.parameters[i];
        var arg = new Object();
        if (param.selected) {
          arg.identifier = param.identifier;
          arg.value = param.selected;
        } else if (param.value) {
          arg.identifier = param.identifier;
          arg.value = param.value;
        } else {
          arg.identifier = param.identifier;
          arg.value = "";
        }
        args.push(arg);
      }
      taskJson.arguments = args;
      var parts = [];
      for (var j in this.json.files) {
        for (var k in this.json.files[j].parts) {
          var currentPart = this.json.files[j].parts[k];
          if (currentPart.access != "visible") {
            parts.push(currentPart);
          }
        }
      }
      taskJson.parts = parts;

      // now download json
      var dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(taskJson));
      let exportName = this.json.identifier;
      var downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", exportName + ".json");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    },
    /*upload Computation Task JSON Message */
    upload: function (event) {
      var reader = new FileReader();
      reader.onload = this.onReaderLoad;
      reader.readAsText(event.target.files[0]);
    },
    /*get json from uploaded file und update DOM */
    onReaderLoad: function (event) {
      var obj = JSON.parse(event.target.result);
      console.log(obj);
      // apply changes to current json
      let templateId = obj.template;
      if (templateId == this.json.identifier) {
        
        // parse parameters/arguments
        for (let a in obj.arguments) {
          let currentArg = obj.arguments[a];
          let argId = currentArg.identifier;
          let argValue = currentArg.value;
          let currentParam = this.json.parameters[a];
          if (argId == currentParam.identifier) {
            if (currentParam.selected) {
              currentParam.selected = argValue;
            } else {
              currentParam.value = argValue;
            }
          }
        }

        // parse parts
        for (let p in obj.parts) {
          let currentPart = obj.parts[p];
          let partId = currentPart.identifier;
          for (let f in this.json.files) {
            for (let oldp in this.json.files[f].parts) {
              if (this.json.files[f].parts[oldp].identifier == partId) {
                // set content of parts
                this.json.files[f].parts[oldp].content = obj.parts[p].content;
                // set parameters of parts
                for(let oldPara in this.json.files[f].parts[oldp].parameters) {
                  let currentParamJson = this.json.files[f].parts[oldp].parameters[oldPara];
                  for(let newPara in obj.parts[p].parameters) {
                    let currentParamObj = obj.parts[p].parameters[newPara];
                    if (currentParamObj.identifier == currentParamJson.identifier) {
                      if (currentParamJson.selected) {
                        this.$set(currentParamJson, "selected", currentParamObj.selected);
                      } else {
                        this.$set(currentParamJson, "value", currentParamObj.value);
                        
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    /**For the sticky play button: emit a scroll event when files tab is changed, so that the sticky-button is reloaded in the right place */
    tabClicked: function () {
      window.scrollTo(window.scrollX, window.scrollY - 1);
      window.scrollTo(window.scrollX, window.scrollY + 1);
    },
    parseParametersForGuiGeneration: function(currentParameter) {
      var mode = currentParameter.mode;
      // add value-item to parameters with mode == any
      if (mode === "any") {
        //create reactive object value in curr with curr.default as content
        this.$set(currentParameter, "value", currentParameter.default);
      } else {
        // add selected-item to parameters with mode == fixed
        var arr = [];
        var options = currentParameter.options;
        for (var i in options) {
          if (options[i].selected) {
            arr.push(options[i].value);
          }
        }
        if (currentParameter.metadata.guiType === "radio" || (currentParameter.metadata.guiType === "dropdown" && !currentParameter.multiple) || (currentParameter.metadata.guiType === "input_field")) {
          //curr.selected = arr[0];
          this.$set(currentParameter, "selected", arr[0]);
        } else {
          //curr.selected = arr;
          this.$set(currentParameter, "selected", arr);
        }
        
      }
    },
    // switch between the form (to modify the parameters) and the mustache template with the filled out parameters
    switchParameterView: function() {
      this.asForm = !this.asForm;
      
    },
    // fill in content of mustache template with selected parameter values return it
    showMustacheTemplate(part){
      if(!this.asForm){
        var mustacheTemplate = this.decodeBase64(part.content);
        var view = {};
        for(var p in part.parameters) {
          var currentParam = part.parameters[p];
          view[currentParam.identifier] = currentParam.value || currentParam.selected;
        }
        var output = Mustache.render(mustacheTemplate, view);
        return output;
      }
    }
  },
  created() {
    this.loadJsonFromFile();
    for (var file in this.json.files) {
      for (var part in this.json.files[file].parts) {
        for (var param in this.json.files[file].parts[part].parameters) {
          var currentParam = this.json.files[file].parts[part].parameters[param];
          console.log(currentParam);
          //console.log("test" + JSON.parse(currentParam).mode);
        }
      }
    }
    // parse the parameters and add items for generating the gui and modifing the content
    // first: modify parameters section
    for (var parameter in this.json.parameters) {
      var curr = this.json.parameters[parameter];
      this.parseParametersForGuiGeneration(curr);
    }
    // then: modify the parameters inside the parts
    for (var fileInd in this.json.files) {
      for (var partInd in this.json.files[fileInd].parts) {
        for (var paramInd in this.json.files[fileInd].parts[partInd].parameters) {
          curr = this.json.files[fileInd].parts[partInd].parameters[paramInd];
          this.parseParametersForGuiGeneration(curr);
        }
      }
    }
  },
  mounted() {
    this.executeAfterDomLoaded();
    console.log(process.env.NODE_ENV);
    console.log(__dirname);
    //this.loadJsonFromFile();
    //this.loadJsonFromFile("./container.computation-template2.json");
  },
};
</script>

<style>
body {
  /* Needed for the position sticky to work */
  overflow: unset;
}

.sticky-button {
  position: -webkit-sticky;
  position: sticky;
  bottom: 50px;
  left: 74px;
  text-align: right;
}

#submit {
  float: right;
  margin-top: 5px;
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
  /*flex-direction: row;*/
  justify-content: center;
}

.flex-left,
.flex-right {
  flex: 50%;
  background-color: #fff;
  border-radius: 25px;
}

.side-to-side-div {
  /* make columns equal size when using minimize/maximize */
  flex: 1 1 0px;
  min-width: 0;
}

img {
  max-height: 100%;
  max-width: 100%;
}

/* Responsive layout - makes a one column-layout instead of two-column layout */
@media (max-width: 1170px) {
  .flex-container {
    flex-direction: column;
  }
  #maximize-button {
    /* hide Maximizing-button if the screen is too small to shwo two columns */
    display:none;
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
  border-radius: calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0 !important;
}

.nav-link {
  background-color: #ddd;
  margin-left: 2px;
  text-decoration: none !important;
  /*negative margin, so that there is no line under the currently selected tab*/
  margin-bottom: -0.05rem !important;
}

.btn {
  border-radius: 25px !important;
  padding-left: 20px !important;
  padding-right: 20px !important;
}

.tooltip {
  display: block !important;
  z-index: 10000;
}

.tooltip .tooltip-inner {
  background: black;
  color: white;
  border-radius: 16px;
  padding: 5px 10px 4px;
}

.tooltip .tooltip-arrow {
  width: 0;
  height: 0;
  border-style: solid;
  position: absolute;
  margin: 5px;
  border-color: black;
}

.tooltip[x-placement^="top"] {
  margin-bottom: 5px;
}

.tooltip[x-placement^="top"] .tooltip-arrow {
  border-width: 5px 5px 0 5px;
  border-left-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  bottom: -5px;
  left: calc(50% - 5px);
  margin-top: 0;
  margin-bottom: 0;
}

.tooltip[x-placement^="bottom"] {
  margin-top: 5px;
}

.tooltip[x-placement^="bottom"] .tooltip-arrow {
  border-width: 0 5px 5px 5px;
  border-left-color: transparent !important;
  border-right-color: transparent !important;
  border-top-color: transparent !important;
  top: -5px;
  left: calc(50% - 5px);
  margin-top: 0;
  margin-bottom: 0;
}

.tooltip[x-placement^="right"] {
  margin-left: 5px;
}

.tooltip[x-placement^="right"] .tooltip-arrow {
  border-width: 5px 5px 5px 0;
  border-left-color: transparent !important;
  border-top-color: transparent !important;
  border-bottom-color: transparent !important;
  left: -5px;
  top: calc(50% - 5px);
  margin-left: 0;
  margin-right: 0;
}

.tooltip[x-placement^="left"] {
  margin-right: 5px;
}

.tooltip[x-placement^="left"] .tooltip-arrow {
  border-width: 5px 0 5px 5px;
  border-top-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  right: -5px;
  top: calc(50% - 5px);
  margin-left: 0;
  margin-right: 0;
}

.tooltip[aria-hidden='true'] {
  visibility: hidden;
  opacity: 0;
  transition: opacity .15s, visibility .15s;
}

.tooltip[aria-hidden='false'] {
  visibility: visible;
  opacity: 1;
  transition: opacity .15s;
}
</style>
