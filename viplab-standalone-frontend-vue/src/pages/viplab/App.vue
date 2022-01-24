<template>
    <!-- content -->
    <div
      id="app"
      class="flex-container"
      :style="[maximized ? { 'flex-direction': 'column !important' } : null]"
    >
      
      <div class="side-to-side-div flex-left m-2">

        <validation-observer v-slot="{ invalid }">
        <form @submit.prevent="sendData">
          <div class="form-group ml-5 mr-5">
            <h2 v-if="parsedFilesJson">InputFiles</h2>

            <div class="cards" >
              <!-- 
              Aktuell kann man die cards auch sehen, wenn sie leer sind - Wie kann man das ändern?
              -->
              <b-card no-body v-if="numberOfInputFiles > 0">
                <b-tabs card class="files" content-class="m-2" fill>
                  <b-tab
                    ref="file"
                    class="file"
                    v-for="(file, fileIndex) in parsedFilesJson"
                    :key="file.identifier"
                    :title="getFilename(file.path)"
                    @click="tabClicked"
                  >

                    <div
                      class="part mb-3"
                      v-for="(part, partIndex) in file.parts"
                      :key="part.identifier"
                    >
                      <div
                        ref="partcontent"
                        class="partcontent"
                        :id="part.identifier+'Part'"
                        v-if="
                          part.access !== 'template' && numberOfInputFiles > 0
                        "
                      >
                        <div v-if="part.access == 'visible'">
                          <ace-editor-component 
                            :isParameter="false" 
                            :isMustache="false"
                            :readonly="true"
                            :item="part"
                            :lang="file.metadata.syntaxHighlighting"
                            :startLineNumber="calculateFirstLineNumber(file.parts, partIndex)"
                            :key="part.identifier + calculateFirstLineNumber(file.parts, partIndex)"
                          ></ace-editor-component>
                        </div>
                        <div v-else-if="part.access == 'modifiable'">
                          <ace-editor-component 
                            :isParameter="false" 
                            :isMustache="false"
                            :readonly="false"
                            :item="part"
                            :lang="file.metadata.syntaxHighlighting"
                            :startLineNumber="calculateFirstLineNumber(file.parts, partIndex)"
                            :key="part.identifier + calculateFirstLineNumber(file.parts, partIndex)"
                            v-on:update:item="updateContent(fileIndex, partIndex, $event)"
                          ></ace-editor-component>
                        </div>
                      </div>
                      <div
                        class="part-parameters"
                        v-if="part.parameters && part.access == 'template'"
                      >
                        <!--<h2>Parameters</h2>-->
                        <parameters
                          :parameters="part.parameters">
                        </parameters>
                        
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
                      <div class="form-group">
                        <h2 v-if="parsedParametersJson">Commandline Parameters</h2>
                        <parameters
                          :parameters="parsedParametersJson"
                        ></parameters>
                      </div>
                    <!--</form>-->
                    
                  </b-tab>
                </b-tabs>
              </b-card>
            </div>
          </div>
        </form>
        <!-- sticky buttons -->
              <div class="sticky-button d-flex flex-row pl-5 pr-5">
                <div class="mr-auto">
                  <b-button class="btn mr-2 btn-row" v-tooltip.top-center="'Download backup of changes'">
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
                    class="btn btn-secondary file btn-row"
                    @click="$refs.upload.click()"
                    v-tooltip.top-center="'Upload of previously downloaded backup'"
                  >
                    <b-icon icon="upload" aria-hidden="true"></b-icon>
                  </b-button>
                </div>
                <div class="buttons">
                  <b-button class="btn mr-2 btn-row" id="maximize-button" @click="maximize" v-tooltip.top-center="maximized ? 'Minimize' : 'Maximize'" v-if="!asForm || outputFiles !== ''">
                    <b-icon v-if="!maximized" icon="fullscreen" aria-hidden="true"></b-icon>
                    <b-icon v-else icon="fullscreen-exit" aria-hidden="true"></b-icon>
                  </b-button>
                  <b-button class="btn mr-2 btn-row" style="width:62.5px" variant="success" btn-variant="white" v-tooltip.top-center="'Save'">
                    <font-awesome-icon icon="save" />
                  </b-button>
                  <b-button class="btn btn-row" id="submit" variant="primary" :disabled="invalid" v-tooltip.top-center="'Run'">
                    <b-icon icon="play" aria-hidden="true"></b-icon>
                  </b-button>
                </div>
              </div>
            
        </validation-observer>
      </div>

      <div 
        class="side-to-side-div flex-right m-2 p-2"
        v-if="!asForm || outputFiles !== ''"
        >
        <div class="sticky-div form-group mb-5 ml-5 mr-5">
          <h2>OutputFiles</h2>

          <!-- Render Mustache Templates with the filled in Parameters -->
          <div v-if="!asForm">
            <b-card no-body v-if="numberOfInputFiles > 0">
              <b-tabs card class="files" content-class="m-2" fill>
                <b-tab
                  :title="file.metadata.name"
                  ref="file"
                  class="file"
                  v-for="file in parsedFilesJson"
                  :key="file.identifier"
                  @click="tabClicked"
                >
                  <div class="item-name mb-2">
                    Adjust values using the form-fields
                  </div>
                  <div
                    class="part mb-3"
                    v-for="part in file.parts"
                    :key="part.identifier"
                  >
                    <div v-if="part.parameters && part.access == 'template'">
                      <ace-editor-component 
                        :isParameter="false" 
                        :isMustache="true"
                        :readonly="true"
                        :item='{
                            "identifier" : generateMustacheDivId(part.identifier),
                            "content" : showMustacheTemplate(part)
                          }'
                        :lang="'matlab'"
                        :key="showMustacheTemplate(part)"
                      ></ace-editor-component>
                    </div>
                  </div>
                </b-tab>
              </b-tabs>
            </b-card>
          </div>

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
                <ace-editor-component 
                  :isParameter="false" 
                  :isMustache="false"
                  :readonly="true"
                  :item='{
                    "identifier" : "outputFiles",
                    "content" : convertToBase64(outputFiles)
                  }'
                ></ace-editor-component>
              </div>
              <div id="stderr" class="mt-2" v-if="outputFiles !== ''">
                <h3>Stderr</h3>
                <ace-editor-component 
                  :isParameter="false" 
                  :isMustache="false"
                  :readonly="true"
                  :item='{
                    "identifier" : "errorFiles",
                    "content" : convertToBase64(errorFiles)
                  }'
                ></ace-editor-component>
              </div>
              <div id="fileList" class="mt-2" v-if="outputFiles !== ''">
                <h3>Files</h3>
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
                            v-if="artifact.MIMEtype == 'text/plain'"
                            ref="outPartcontent"
                            class="outPartcontent"
                          >
                            <ace-editor-component 
                              :isParameter="false" 
                              :isMustache="false"
                              :readonly="true"
                              :item='{
                                "identifier" : "Editor" + artifact.identifier,
                                "content" : artifact.content,
                                "path" : artifact.path
                              }'
                            ></ace-editor-component>
                          </div>
                          <div
                            v-if="artifact.MIMEtype === 'image/png'"
                            ref="outPartcontent"
                            class="outPartcontent"
                          >
                            <img :src="imagesrc(artifact.content)" />
                          </div>
                          <div
                            v-if="artifact.MIMEtype === 'text/csv'"
                            ref="outPartcontent"
                            class="outPartcontent"
                          >

                            <div v-if="artifact.datasets">
                              <div v-for="dataset in artifact.datasets" :key="dataset.key">
                                <csv-plot 
                                  :csvsProp=artifact.urlsOrContents
                                  :areUrlsProp="false"
                                  :datasetProp=dataset
                                  :labelProp="artifact.labels">
                                </csv-plot>
                              </div>
                            </div>
                            <div v-else>
                              <csv-plot 
                                :csvsProp=[artifact.content]
                                :areUrlsProp="false"
                                :datasetProp={}
                                :labelProp={}>
                              </csv-plot>
                            </div>

                          </div>

                          <!-- show viplab grid plot -->
                          <div
                            v-if="artifact.MIMEtype === 'application/x-vgfc'"
                            ref="outPartcontent"
                            class="outPartcontent"
                          >
                            <grid-plot :plotData="decodeBase64(artifact.content)"></grid-plot>
                          </div>
                          <!-- show viplab 2d plot -->
                          <div
                            v-if="artifact.MIMEtype === 'application/x-vgf'"
                            ref="outPartcontent"
                            class="outPartcontent"
                          >
                            <plot-2d :plotData="decodeBase64(artifact.content)"></plot-2d>
                          </div>

                        </div>
                        <!-- Render s3 files that have no content-element-->
                        <div v-else>
                          <div v-if="artifact.MIMEtype == 'application/vtu'">
                              <vtk-component
                                  v-if="artifact.urlsOrContents"
                                  :propFiles=artifact.urlsOrContents
                              ></vtk-component>
                              <vtk-component
                                  v-else-if="!artifact.urlsOrContents"
                                  :propFiles=[artifact.url]
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
                                <ace-editor-component 
                                  :isParameter="false" 
                                  :isMustache="false"
                                  :readonly="true"
                                  :item='{
                                    "identifier" : "Editor" + artifact.identifier,
                                    "content" : convertToBase64(data),
                                    "path" : artifact.path
                                  }'
                                  :ref="artifact.path"
                                ></ace-editor-component>
                                </div>
                              </template>
                              <template v-slot:rejected="error">
                                <p>Error: {{ error.message }}</p>
                              </template>
                            </Promised>
                          </div>
                          <div v-else-if="artifact.MIMEtype == 'text/csv'">
                            <div v-if="artifact.datasets">
                              <div v-for="dataset in artifact.datasets" :key="dataset.key">
                                <csv-plot 
                                  :csvsProp=artifact.urlsOrContents
                                  :areUrlsProp="true"
                                  :datasetProp=dataset
                                  :labelProp="artifact.labels">
                                </csv-plot>
                              </div>
                            </div>
                            <div v-else>
                              <csv-plot 
                                :csvsProp=[artifact.url]
                                :areUrlsProp="true"
                                :datasetProp={}
                                :labelProp={}>
                              </csv-plot>
                            </div>
                          </div>
                          <div v-else-if="artifact.MIMEtype == 'image/png'">
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
                          <div v-else>
                            <Promised :promise="getContentFromS3(artifact.url, false)">
                              <!-- Use the "pending" slot to display a loading message -->
                              <template v-slot:pending>
                                <p>Loading...</p>
                              </template>
                              <!-- The default scoped slot will be used as the result -->
                              <template v-slot="data">
                                <!-- Render ViPLabGraphics whose files need to be downloaded from S3 -->
                                <!-- show viplab grid plot -->
                                <div>
                                  <div
                                    v-if="artifact.MIMEtype === 'application/x-vgfc'"
                                    ref="outPartcontent"
                                    class="outPartcontent"
                                  >
                                    
                                    <grid-plot :plotData="data"></grid-plot>
                                  </div>
                                  <!-- show viplab 2d plot -->
                                  <div
                                    v-if="artifact.MIMEtype === 'application/x-vgf'"
                                    ref="outPartcontent"
                                    class="outPartcontent"
                                  >
                                    <plot-2d :plotData="data"></plot-2d>
                                  </div>
                                </div>
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
                <h3>Files to Download</h3>
                <ul>
                  <li
                    v-for="artifact in returnedUnmodifiedArtifacts.artifacts"
                    :key="artifact.identifier+'Download'"
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
        </div>
      </div>
    </div>
</template>

<script>
// import Ace
import AceEditorComponent from "../../components/EditorComponent-Ace.vue"

//own components
import Parameters from "../../components/Parameters.vue";

import { CirclesToRhombusesSpinner } from "epic-spinners";

import GridPlot from "../../components/viplab-plots/gridplot/GridPlot.vue";

//import $ from 'jquery';

import VtkComponent from "../../components/vtk-plots/VtkComponent.vue";
import Plot2d from '../../components/viplab-plots/plot2d/plot2d.vue';
import CsvPlot from '../../components/csv-plots/CsvPlot.vue';

import {Promised} from "vue-promised";

var Mustache = require('mustache');

import {ValidationObserver} from "vee-validate";

export default {
  name: "app",
  components: {
    CirclesToRhombusesSpinner,
    Parameters,
    GridPlot,
    VtkComponent,
    Plot2d,
    CsvPlot,
    Promised,
    ValidationObserver,
    AceEditorComponent,
  },
  data() {
    return {
      json: "{}", 
      token: "",
      templates: require.context("../../input/", false, /^.*\.json$/).keys(), //get json file names from ./input folder
      numberOfInputFiles: [],
      ws: "",
      returnedOutputJson: "",
      returnedUnmodifiedArtifacts: "",
      outputFiles: "",
      errorFiles: "",
      maximized: false,
      file: null,
      asForm: true,
      isPartParameters: 0
    };
  },
  watch: {
    json: {
      handler: function (val) {
        this.json = val;
        //console.log(this.json.files[0].parts[0].parameters[0].selected);
        this.$forceUpdate();
      },
      deep: true
    }
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
    /*returnedArtifactsWOvtkCsv: function() {
      let artifacts = this.returnedOutputJson.artifacts;
      let newArtifacts = [];
      for(var i = 0; i < artifacts.length; i++) {
        if(artifacts[i].MIMEtype != 'application/vtu' && artifacts[i].MIMEtype != 'text/csv') {
          newArtifacts.push(artifacts[i]);
        }
      }
      return newArtifacts;
    }*/
  },
  methods: {
    /* set the number of input files */
    setNumberOfInputFiles: function () {
      var files = this.json.files;
      for (var file in files) {
        var parts = files[file].parts;
        //console.log(parts.length);
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
    convertToBase64: function (stringToConvert) {
      return window.btoa(stringToConvert);
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

      //console.log(this.json);

      this.setNumberOfInputFiles();
    },
    /** should be the first thing that is executed when DOM is loaded: setup connection to webserver */
    executeAfterDomLoaded: function () {
      //this.ws = new WebSocket("ws://192.168.195.128:8083/computations");
      this.ws = new WebSocket(this.$config.WEBSOCKET_API);
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
            // for access modifiable or access template, where the content is available
            if (this.json.files[fileIndex].parts[part].access === "modifiable") {
              file.parts.push({
                identifier: this.json.files[fileIndex].parts[part].identifier,
                content: this.json.files[fileIndex].parts[part].content,
              });
            // Generate json for access template parameters, if there is no content given
            } else if (this.json.files[fileIndex].parts[part].access === "template") {
              var generatedContent = JSON.parse("{}");
              for (var paramIndex in this.json.files[fileIndex].parts[part].parameters) {
                var currentParam = this.json.files[fileIndex].parts[part].parameters[paramIndex];
                var value = currentParam.value || currentParam.selected;
                if (Array.isArray(value)) {
                  value = value.toString();
                }
                generatedContent[currentParam.identifier] = value;
              }
              var contentBase64 = window.btoa(JSON.stringify(generatedContent));
              //console.log(contentBase64);
              file.parts.push({
                identifier: this.json.files[fileIndex].parts[part].identifier,
                content: contentBase64,
              });
            }
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
      //console.log(result.result.output.stdout);
      if (result.result.status == "final") {
        document.getElementById("submit").disabled = false;
      }

      // if the first result came back, set the whole object, else, only add the new artifacts to the existing object
      // use JSON.parse(JSON.stringify(...)) to make sure a copy of the data is made, such that not only a reference is used
      if (this.returnedOutputJson === "") {
        this.returnedOutputJson = JSON.parse(JSON.stringify(result.result))
        this.returnedUnmodifiedArtifacts = JSON.parse(JSON.stringify(result.result))
      } else {
        this.returnedOutputJson.artifacts.push(JSON.parse(JSON.stringify(result.result.artifacts)));
        this.returnedUnmodifiedArtifacts.artifacts.push(JSON.parse(JSON.stringify(result.result.artifacts)))
      }

      // additional results for testing
      this.returnedOutputJson.artifacts.push(
        {
          "type" : "s3file",
          "identifier" : "aa3c1cf9-c02d-4694-902c-93c298d68d02",
          "MIMEtype": "application/x-vgfc",
          "path": "/test/vipplot.vgfc",
          "url": "http://localhost:4040/vipplot.vgfc"
        }
      );
      this.returnedOutputJson.artifacts.push(
        {
          "type" : "s3file",
          "identifier" : "bb3c1cf9-c02d-4694-902c-93c298d68d02",
          "MIMEtype": "application/x-vgf",
          "path": "/test/vipplot.vgf",
          "url": "http://localhost:4040/vipplot.vgf"
        }
      );
      this.returnedOutputJson.artifacts.push(
        {
          "type" : "file",
          "identifier" : "cc3c1cf9-c02d-4694-902c-93c298d68d02",
          "MIMEtype": "text/plain",
          "path": "/test/text.c",
          "content": "dm9pZCBiYXIoKSB7IC8qIFNjaHJlaWJlbiBTaWUgaGllciBDb2RlLCBkZXIgImJhciIgYXVzZ2lidC4gKi8KCn0K"
        }
      );
      this.returnedOutputJson.artifacts.push(
        {
          "type" : "file",
          "identifier" : "ac3c1cf9-c02d-4694-902c-93c298d68d02",
          "MIMEtype": "application/x-vgf",
          "path": "/test/vipplot.vgf",
          "content": "eyJpZGVudGlmaWVyIiA6ICJ2aXBwbG90LnZnZiIsICJ2YWx1ZSIgOiAiIyBjb2xvciAwIDIwMCAxNTBcbiMgc3ltYm9sIG5vbmVcbiMgbGluZXN0eWxlIHNvbGlkXG4jIGxlZ2VuZCBleHBsaWNpdCBldWxlclxuIDAuMDAwMDAwIDAuMDAwMDAwIDAuMDIwMDAwIDAuMDAwMDAwXG4gMC4wMjAwMDAgMC4wMDAwMDAgMC4wNDAwMDAgMC4wMDAyNzlcbiAwLjA0MDAwMCAwLjAwMDI3OSAwLjA2MDAwMCAwLjAwMDI1NVxuIDAuMDYwMDAwIDAuMDAwMjU1IDAuMDgwMDAwIC0wLjAwMDYzMFxuIDAuMDgwMDAwIC0wLjAwMDYzMCAwLjEwMDAwMCAtMC4wMDIyMjdcbiAwLjEwMDAwMCAtMC4wMDIyMjcgMC4xMjAwMDAgLTAuMDAzNTM0XG4gMC4xMjAwMDAgLTAuMDAzNTM0IDAuMTQwMDAwIC0wLjAwMzMyNFxuIDAuMTQwMDAwIC0wLjAwMzMyNCAwLjE2MDAwMCAtMC4wMDExNTNcbiAwLjE2MDAwMCAtMC4wMDExNTMgMC4xODAwMDAgMC4wMDIwMjZcbiAwLjE4MDAwMCAwLjAwMjAyNiAwLjIwMDAwMCAwLjAwNDIxNlxuIDAuMjAwMDAwIDAuMDA0MjE2IDAuMjIwMDAwIDAuMDAzNjM0XG4gMC4yMjAwMDAgMC4wMDM2MzQgMC4yNDAwMDAgMC4wMDAwNjVcbiAwLjI0MDAwMCAwLjAwMDA2NSAwLjI2MDAwMCAtMC4wMDQ2NjJcbiAwLjI2MDAwMCAtMC4wMDQ2NjIgMC4yODAwMDAgLTAuMDA3NTc5XG4gMC4yODAwMDAgLTAuMDA3NTc5IDAuMzAwMDAwIC0wLjAwNjQ0MlxuIDAuMzAwMDAwIC0wLjAwNjQ0MiAwLjMyMDAwMCAtMC4wMDEzNzlcbiAwLjMyMDAwMCAtMC4wMDEzNzkgMC4zNDAwMDAgMC4wMDQ4NDdcbiAwLjM0MDAwMCAwLjAwNDg0NyAwLjM2MDAwMCAwLjAwODMyN1xuIDAuMzYwMDAwIDAuMDA4MzI3IDAuMzgwMDAwIDAuMDA2NDU2XG4gMC4zODAwMDAgMC4wMDY0NTYgMC40MDAwMDAgLTAuMDAwMTg0XG4gMC40MDAwMDAgLTAuMDAwMTg0IDAuNDIwMDAwIC0wLjAwNzg0NVxuIDAuNDIwMDAwIC0wLjAwNzg0NSAwLjQ0MDAwMCAtMC4wMTE3MTVcbiAwLjQ0MDAwMCAtMC4wMTE3MTUgMC40NjAwMDAgLTAuMDA4OTM3XG4gMC40NjAwMDAgLTAuMDA4OTM3IDAuNDgwMDAwIC0wLjAwMDY1MVxuIDAuNDgwMDAwIC0wLjAwMDY1MSAwLjUwMDAwMCAwLjAwODM2NlxuIDAuNTAwMDAwIDAuMDA4MzY2IDAuNTIwMDAwIDAuMDEyNDQ3XG4gMC41MjAwMDAgMC4wMTI0NDcgMC41NDAwMDAgMC4wMDg1OTNcbiAwLjU0MDAwMCAwLjAwODU5MyAwLjU2MDAwMCAtMC4wMDEzOTJcbiAwLjU2MDAwMCAtMC4wMDEzOTIgMC41ODAwMDAgLTAuMDExNjY5XG4gMC41ODAwMDAgLTAuMDExNjY5IDAuNjAwMDAwIC0wLjAxNTc3NlxuIDAuNjAwMDAwIC0wLjAxNTc3NiAwLjYyMDAwMCAtMC4wMTA2ODZcbiAwLjYyMDAwMCAtMC4wMTA2ODYgMC42NDAwMDAgMC4wMDEwMzRcbiAwLjY0MDAwMCAwLjAwMTAzNCAwLjY2MDAwMCAwLjAxMjQ2MlxuIDAuNjYwMDAwIDAuMDEyNDYyIDAuNjgwMDAwIDAuMDE2NDA3XG4gMC42ODAwMDAgMC4wMTY0MDcgMC43MDAwMDAgMC4wMDk5MjlcbiAwLjcwMDAwMCAwLjAwOTkyOSAwLjcyMDAwMCAtMC4wMDM1NDdcbiAwLjcyMDAwMCAtMC4wMDM1NDcgMC43NDAwMDAgLTAuMDE2MDAzXG4gMC43NDAwMDAgLTAuMDE2MDAzIDAuNzYwMDAwIC0wLjAxOTU5NVxuIDAuNzYwMDAwIC0wLjAxOTU5NSAwLjc4MDAwMCAtMC4wMTE1ODdcbiAwLjc4MDAwMCAtMC4wMTE1ODcgMC44MDAwMDAgMC4wMDM2NTFcbiAwLjgwMDAwMCAwLjAwMzY1MSAwLjgyMDAwMCAwLjAxNjk5OFxuIDAuODIwMDAwIDAuMDE2OTk4IDAuODQwMDAwIDAuMDIwMDQzXG4gMC44NDAwMDAgMC4wMjAwNDMgMC44NjAwMDAgMC4wMTAzNzRcbiAwLjg2MDAwMCAwLjAxMDM3NCAwLjg4MDAwMCAtMC4wMDY2MTNcbiAwLjg4MDAwMCAtMC4wMDY2MTMgMC45MDAwMDAgLTAuMDIwNzA0XG4gMC45MDAwMDAgLTAuMDIwNzA0IDAuOTIwMDAwIC0wLjAyMzAwN1xuIDAuOTIwMDAwIC0wLjAyMzAwNyAwLjk0MDAwMCAtMC4wMTE1NTdcbiAwLjk0MDAwMCAtMC4wMTE1NTcgMC45NjAwMDAgMC4wMDcxNTFcbiAwLjk2MDAwMCAwLjAwNzE1MSAwLjk4MDAwMCAwLjAyMTgyNVxuIDAuOTgwMDAwIDAuMDIxODI1IDEuMDAwMDAwIDAuMDIzMTk0XG4jIGNvbG9yIDIwMCAxNTAgMFxuIyBzeW1ib2wgbm9uZVxuIyBsaW5lc3R5bGUgc29saWRcbiMgbGVnZW5kIGhldW5cbiAwLjAwMDAwMCAwLjAwMDAwMCAwLjAyMDAwMCAwLjAwMDEzOVxuIDAuMDIwMDAwIDAuMDAwMTM5IDAuMDQwMDAwIDAuMDAwMjY3XG4gMC4wNDAwMDAgMC4wMDAyNjcgMC4wNjAwMDAgLTAuMDAwMTg3XG4gMC4wNjAwMDAgLTAuMDAwMTg3IDAuMDgwMDAwIC0wLjAwMTQyOFxuIDAuMDgwMDAwIC0wLjAwMTQyOCAwLjEwMDAwMCAtMC4wMDI4ODBcbiAwLjEwMDAwMCAtMC4wMDI4ODAgMC4xMjAwMDAgLTAuMDAzNDI5XG4gMC4xMjAwMDAgLTAuMDAzNDI5IDAuMTQwMDAwIC0wLjAwMjIzOFxuIDAuMTQwMDAwIC0wLjAwMjIzOCAwLjE2MDAwMCAwLjAwMDQzN1xuIDAuMTYwMDAwIDAuMDAwNDM3IDAuMTgwMDAwIDAuMDAzMTIxXG4gMC4xODAwMDAgMC4wMDMxMjEgMC4yMDAwMDAgMC4wMDM5MjVcbiAwLjIwMDAwMCAwLjAwMzkyNSAwLjIyMDAwMCAwLjAwMTg0OVxuIDAuMjIwMDAwIDAuMDAxODQ5IDAuMjQwMDAwIC0wLjAwMjI5OFxuIDAuMjQwMDAwIC0wLjAwMjI5OCAwLjI2MDAwMCAtMC4wMDYxMjBcbiAwLjI2MDAwMCAtMC4wMDYxMjAgMC4yODAwMDAgLTAuMDA3MDEwXG4gMC4yODAwMDAgLTAuMDA3MDEwIDAuMzAwMDAwIC0wLjAwMzkxMFxuIDAuMzAwMDAwIC0wLjAwMzkxMCAwLjMyMDAwMCAwLjAwMTczNFxuIDAuMzIwMDAwIDAuMDAxNzM0IDAuMzQwMDAwIDAuMDA2NTg3XG4gMC4zNDAwMDAgMC4wMDY1ODcgMC4zNjAwMDAgMC4wMDczOTJcbiAwLjM2MDAwMCAwLjAwNzM5MiAwLjM4MDAwMCAwLjAwMzEzNlxuIDAuMzgwMDAwIDAuMDAzMTM2IDAuNDAwMDAwIC0wLjAwNDAxNVxuIDAuNDAwMDAwIC0wLjAwNDAxNSAwLjQyMDAwMCAtMC4wMDk3ODBcbiAwLjQyMDAwMCAtMC4wMDk3ODAgMC40NDAwMDAgLTAuMDEwMzI2XG4gMC40NDAwMDAgLTAuMDEwMzI2IDAuNDYwMDAwIC0wLjAwNDc5NFxuIDAuNDYwMDAwIC0wLjAwNDc5NCAwLjQ4MDAwMCAwLjAwMzg1OFxuIDAuNDgwMDAwIDAuMDAzODU4IDAuNTAwMDAwIDAuMDEwNDA2XG4gMC41MDAwMDAgMC4wMTA0MDYgMC41MjAwMDAgMC4wMTA1MjBcbiAwLjUyMDAwMCAwLjAxMDUyMCAwLjU0MDAwMCAwLjAwMzYwMFxuIDAuNTQwMDAwIDAuMDAzNjAwIDAuNTYwMDAwIC0wLjAwNjUzMFxuIDAuNTYwMDAwIC0wLjAwNjUzMCAwLjU4MDAwMCAtMC4wMTM3MjJcbiAwLjU4MDAwMCAtMC4wMTM3MjIgMC42MDAwMDAgLTAuMDEzMjMxXG4gMC42MDAwMDAgLTAuMDEzMjMxIDAuNjIwMDAwIC0wLjAwNDgyNlxuIDAuNjIwMDAwIC0wLjAwNDgyNiAwLjY0MDAwMCAwLjAwNjc0OFxuIDAuNjQwMDAwIDAuMDA2NzQ4IDAuNjYwMDAwIDAuMDE0NDM1XG4gMC42NjAwMDAgMC4wMTQ0MzUgMC42ODAwMDAgMC4wMTMxNjhcbiAwLjY4MDAwMCAwLjAxMzE2OCAwLjcwMDAwMCAwLjAwMzE5MVxuIDAuNzAwMDAwIDAuMDAzMTkxIDAuNzIwMDAwIC0wLjAwOTc3NVxuIDAuNzIwMDAwIC0wLjAwOTc3NSAwLjc0MDAwMCAtMC4wMTc3OTlcbiAwLjc0MDAwMCAtMC4wMTc3OTkgMC43NjAwMDAgLTAuMDE1NTkxXG4gMC43NjAwMDAgLTAuMDE1NTkxIDAuNzgwMDAwIC0wLjAwMzk2OFxuIDAuNzgwMDAwIC0wLjAwMzk2OCAwLjgwMDAwMCAwLjAxMDMyNVxuIDAuODAwMDAwIDAuMDEwMzI1IDAuODIwMDAwIDAuMDE4NTIxXG4gMC44MjAwMDAgMC4wMTg1MjEgMC44NDAwMDAgMC4wMTUyMDhcbiAwLjg0MDAwMCAwLjAxNTIwOCAwLjg2MDAwMCAwLjAwMTg4MFxuIDAuODYwMDAwIDAuMDAxODgwIDAuODgwMDAwIC0wLjAxMzY1OVxuIDAuODgwMDAwIC0wLjAxMzY1OSAwLjkwMDAwMCAtMC4wMjE4NTZcbiAwLjkwMDAwMCAtMC4wMjE4NTYgMC45MjAwMDAgLTAuMDE3MjgyXG4gMC45MjAwMDAgLTAuMDE3MjgyIDAuOTQwMDAwIC0wLjAwMjIwM1xuIDAuOTQwMDAwIC0wLjAwMjIwMyAwLjk2MDAwMCAwLjAxNDQ4OFxuIDAuOTYwMDAwIDAuMDE0NDg4IDAuOTgwMDAwIDAuMDIyNTA5XG4gMC45ODAwMDAgMC4wMjI1MDkgMS4wMDAwMDAgMC4wMTY1MjRcbiMgY29sb3IgMjAwIDAgMTUwXG4jIHN5bWJvbCBub25lXG4jIGxpbmVzdHlsZSBzb2xpZFxuIyBsZWdlbmQgUnVuZ2UtS3V0dGEgNFxuIDAuMDAwMDAwIDAuMDAwMDAwIDAuMDIwMDAwIDAuMDAwMTY5XG4gMC4wMjAwMDAgMC4wMDAxNjkgMC4wNDAwMDAgMC4wMDAzNTdcbiAwLjA0MDAwMCAwLjAwMDM1NyAwLjA2MDAwMCAtMC4wMDAwNzJcbiAwLjA2MDAwMCAtMC4wMDAwNzIgMC4wODAwMDAgLTAuMDAxMzY1XG4gMC4wODAwMDAgLTAuMDAxMzY1IDAuMTAwMDAwIC0wLjAwMjkyNVxuIDAuMTAwMDAwIC0wLjAwMjkyNSAwLjEyMDAwMCAtMC4wMDM1NTlcbiAwLjEyMDAwMCAtMC4wMDM1NTkgMC4xNDAwMDAgLTAuMDAyMzUwXG4gMC4xNDAwMDAgLTAuMDAyMzUwIDAuMTYwMDAwIDAuMDAwNDYyXG4gMC4xNjAwMDAgMC4wMDA0NjIgMC4xODAwMDAgMC4wMDMzMjdcbiAwLjE4MDAwMCAwLjAwMzMyNyAwLjIwMDAwMCAwLjAwNDIzMlxuIDAuMjAwMDAwIDAuMDA0MjMyIDAuMjIwMDAwIDAuMDAyMDg2XG4gMC4yMjAwMDAgMC4wMDIwODYgMC4yNDAwMDAgLTAuMDAyMjg2XG4gMC4yNDAwMDAgLTAuMDAyMjg2IDAuMjYwMDAwIC0wLjAwNjM1N1xuIDAuMjYwMDAwIC0wLjAwNjM1NyAwLjI4MDAwMCAtMC4wMDczNTNcbiAwLjI4MDAwMCAtMC4wMDczNTMgMC4zMDAwMDAgLTAuMDA0MTIyXG4gMC4zMDAwMDAgLTAuMDA0MTIyIDAuMzIwMDAwIDAuMDAxODM1XG4gMC4zMjAwMDAgMC4wMDE4MzUgMC4zNDAwMDAgMC4wMDY5OTlcbiAwLjM0MDAwMCAwLjAwNjk5OSAwLjM2MDAwMCAwLjAwNzkwNVxuIDAuMzYwMDAwIDAuMDA3OTA1IDAuMzgwMDAwIDAuMDAzNDUxXG4gMC4zODAwMDAgMC4wMDM0NTEgMC40MDAwMDAgLTAuMDA0MTAyXG4gMC40MDAwMDAgLTAuMDA0MTAyIDAuNDIwMDAwIC0wLjAxMDIzM1xuIDAuNDIwMDAwIC0wLjAxMDIzMyAwLjQ0MDAwMCAtMC4wMTA4NjZcbiAwLjQ0MDAwMCAtMC4wMTA4NjYgMC40NjAwMDAgLTAuMDA1MDYwXG4gMC40NjAwMDAgLTAuMDA1MDYwIDAuNDgwMDAwIDAuMDA0MDgyXG4gMC40ODAwMDAgMC4wMDQwODIgMC41MDAwMDAgMC4wMTEwNDRcbiAwLjUwMDAwMCAwLjAxMTA0NCAwLjUyMDAwMCAwLjAxMTIyMFxuIDAuNTIwMDAwIDAuMDExMjIwIDAuNTQwMDAwIDAuMDAzOTQ1XG4gMC41NDAwMDAgMC4wMDM5NDUgMC41NjAwMDAgLTAuMDA2NzY1XG4gMC41NjAwMDAgLTAuMDA2NzY1IDAuNTgwMDAwIC0wLjAxNDQwOFxuIDAuNTgwMDAwIC0wLjAxNDQwOCAwLjYwMDAwMCAtMC4wMTM5NDVcbiAwLjYwMDAwMCAtMC4wMTM5NDUgMC42MjAwMDAgLTAuMDA1MDk4XG4gMC42MjAwMDAgLTAuMDA1MDk4IDAuNjQwMDAwIDAuMDA3MTQxXG4gMC42NDAwMDAgMC4wMDcxNDEgMC42NjAwMDAgMC4wMTUzMTBcbiAwLjY2MDAwMCAwLjAxNTMxMCAwLjY4MDAwMCAwLjAxNDAyOFxuIDAuNjgwMDAwIDAuMDE0MDI4IDAuNzAwMDAwIDAuMDAzNTE1XG4gMC43MDAwMDAgMC4wMDM1MTUgMC43MjAwMDAgLTAuMDEwMTk5XG4gMC43MjAwMDAgLTAuMDEwMTk5IDAuNzQwMDAwIC0wLjAxODcyNlxuIDAuNzQwMDAwIC0wLjAxODcyNiAwLjc2MDAwMCAtMC4wMTY0NDdcbiAwLjc2MDAwMCAtMC4wMTY0NDcgMC43ODAwMDAgLTAuMDA0MTkzXG4gMC43ODAwMDAgLTAuMDA0MTkzIDAuODAwMDAwIDAuMDEwOTI3XG4gMC44MDAwMDAgMC4wMTA5MjcgMC44MjAwMDAgMC4wMTk2MzhcbiAwLjgyMDAwMCAwLjAxOTYzOCAwLjg0MDAwMCAwLjAxNjE5MVxuIDAuODQwMDAwIDAuMDE2MTkxIDAuODYwMDAwIDAuMDAyMTMxXG4gMC44NjAwMDAgMC4wMDIxMzEgMC44ODAwMDAgLTAuMDE0MzA5XG4gMC44ODAwMDAgLTAuMDE0MzA5IDAuOTAwMDAwIC0wLjAyMzAyM1xuIDAuOTAwMDAwIC0wLjAyMzAyMyAwLjkyMDAwMCAtMC4wMTgyNDJcbiAwLjkyMDAwMCAtMC4wMTgyNDIgMC45NDAwMDAgLTAuMDAyMzI5XG4gMC45NDAwMDAgLTAuMDAyMzI5IDAuOTYwMDAwIDAuMDE1MzMyXG4gMC45NjAwMDAgMC4wMTUzMzIgMC45ODAwMDAgMC4wMjM4NjNcbiAwLjk4MDAwMCAwLjAyMzg2MyAxLjAwMDAwMCAwLjAxNzU4OVxuIyBjb2xvciAwIDAgMjU1XG4jIHN5bWJvbCBub25lXG4jIGxpbmVzdHlsZSBzb2xpZFxuIyBsZWdlbmQgZXhhY3RcbiAwLjAwMDAwMCAwLjAwMDAwMCAwLjAyMDAwMCAwLjAwMDE2OVxuIDAuMDIwMDAwIDAuMDAwMTY5IDAuMDQwMDAwIDAuMDAwMzU2XG4gMC4wNDAwMDAgMC4wMDAzNTYgMC4wNjAwMDAgLTAuMDAwMDczXG4gMC4wNjAwMDAgLTAuMDAwMDczIDAuMDgwMDAwIC0wLjAwMTM2NlxuIDAuMDgwMDAwIC0wLjAwMTM2NiAwLjEwMDAwMCAtMC4wMDI5MjZcbiAwLjEwMDAwMCAtMC4wMDI5MjYgMC4xMjAwMDAgLTAuMDAzNTU5XG4gMC4xMjAwMDAgLTAuMDAzNTU5IDAuMTQwMDAwIC0wLjAwMjM1MFxuIDAuMTQwMDAwIC0wLjAwMjM1MCAwLjE2MDAwMCAwLjAwMDQ2MlxuIDAuMTYwMDAwIDAuMDAwNDYyIDAuMTgwMDAwIDAuMDAzMzI3XG4gMC4xODAwMDAgMC4wMDMzMjcgMC4yMDAwMDAgMC4wMDQyMzFcbiAwLjIwMDAwMCAwLjAwNDIzMSAwLjIyMDAwMCAwLjAwMjA4NVxuIDAuMjIwMDAwIDAuMDAyMDg1IDAuMjQwMDAwIC0wLjAwMjI4NlxuIDAuMjQwMDAwIC0wLjAwMjI4NiAwLjI2MDAwMCAtMC4wMDYzNTZcbiAwLjI2MDAwMCAtMC4wMDYzNTYgMC4yODAwMDAgLTAuMDA3MzUyXG4gMC4yODAwMDAgLTAuMDA3MzUyIDAuMzAwMDAwIC0wLjAwNDEyMlxuIDAuMzAwMDAwIC0wLjAwNDEyMiAwLjMyMDAwMCAwLjAwMTgzNVxuIDAuMzIwMDAwIDAuMDAxODM1IDAuMzQwMDAwIDAuMDA2OTk4XG4gMC4zNDAwMDAgMC4wMDY5OTggMC4zNjAwMDAgMC4wMDc5MDRcbiAwLjM2MDAwMCAwLjAwNzkwNCAwLjM4MDAwMCAwLjAwMzQ1MFxuIDAuMzgwMDAwIDAuMDAzNDUwIDAuNDAwMDAwIC0wLjAwNDEwM1xuIDAuNDAwMDAwIC0wLjAwNDEwMyAwLjQyMDAwMCAtMC4wMTAyMzJcbiAwLjQyMDAwMCAtMC4wMTAyMzIgMC40NDAwMDAgLTAuMDEwODY1XG4gMC40NDAwMDAgLTAuMDEwODY1IDAuNDYwMDAwIC0wLjAwNTA2MFxuIDAuNDYwMDAwIC0wLjAwNTA2MCAwLjQ4MDAwMCAwLjAwNDA4MlxuIDAuNDgwMDAwIDAuMDA0MDgyIDAuNTAwMDAwIDAuMDExMDQyXG4gMC41MDAwMDAgMC4wMTEwNDIgMC41MjAwMDAgMC4wMTEyMThcbiAwLjUyMDAwMCAwLjAxMTIxOCAwLjU0MDAwMCAwLjAwMzk0NFxuIDAuNTQwMDAwIDAuMDAzOTQ0IDAuNTYwMDAwIC0wLjAwNjc2NFxuIDAuNTYwMDAwIC0wLjAwNjc2NCAwLjU4MDAwMCAtMC4wMTQ0MDdcbiAwLjU4MDAwMCAtMC4wMTQ0MDcgMC42MDAwMDAgLTAuMDEzOTQ0XG4gMC42MDAwMDAgLTAuMDEzOTQ0IDAuNjIwMDAwIC0wLjAwNTA5N1xuIDAuNjIwMDAwIC0wLjAwNTA5NyAwLjY0MDAwMCAwLjAwNzE0MFxuIDAuNjQwMDAwIDAuMDA3MTQwIDAuNjYwMDAwIDAuMDE1MzA4XG4gMC42NjAwMDAgMC4wMTUzMDggMC42ODAwMDAgMC4wMTQwMjVcbiAwLjY4MDAwMCAwLjAxNDAyNSAwLjcwMDAwMCAwLjAwMzUxNFxuIDAuNzAwMDAwIDAuMDAzNTE0IDAuNzIwMDAwIC0wLjAxMDE5OFxuIDAuNzIwMDAwIC0wLjAxMDE5OCAwLjc0MDAwMCAtMC4wMTg3MjRcbiAwLjc0MDAwMCAtMC4wMTg3MjQgMC43NjAwMDAgLTAuMDE2NDQ1XG4gMC43NjAwMDAgLTAuMDE2NDQ1IDAuNzgwMDAwIC0wLjAwNDE5MlxuIDAuNzgwMDAwIC0wLjAwNDE5MiAwLjgwMDAwMCAwLjAxMDkyNVxuIDAuODAwMDAwIDAuMDEwOTI1IDAuODIwMDAwIDAuMDE5NjM1XG4gMC44MjAwMDAgMC4wMTk2MzUgMC44NDAwMDAgMC4wMTYxODhcbiAwLjg0MDAwMCAwLjAxNjE4OCAwLjg2MDAwMCAwLjAwMjEzMFxuIDAuODYwMDAwIDAuMDAyMTMwIDAuODgwMDAwIC0wLjAxNDMwN1xuIDAuODgwMDAwIC0wLjAxNDMwNyAwLjkwMDAwMCAtMC4wMjMwMjBcbiAwLjkwMDAwMCAtMC4wMjMwMjAgMC45MjAwMDAgLTAuMDE4MjQwXG4gMC45MjAwMDAgLTAuMDE4MjQwIDAuOTQwMDAwIC0wLjAwMjMyOFxuIDAuOTQwMDAwIC0wLjAwMjMyOCAwLjk2MDAwMCAwLjAxNTMzMFxuIDAuOTYwMDAwIDAuMDE1MzMwIDAuOTgwMDAwIDAuMDIzODU5XG4gMC45ODAwMDAgMC4wMjM4NTkgMS4wMDAwMDAgMC4wMTc1ODZcbiMgbmV3ZnJhbWVcbiMgdGl0bGUgYWJzb2x1dGUgZXJyb3JcbiMgeC1sYWJlbCB4XG4jIHktbGFiZWwgZXJyb3JcbiMgc2NhbGUgXG4jIGNvbG9yIDAgMjAwIDE1MFxuIyBzeW1ib2wgbm9uZVxuIyBsaW5lc3R5bGUgc29saWRcbiMgbGVnZW5kIGV4cGxpY2l0IGV1bGVyXG4gMC4wMDAwMDAgMC4wMDAwMDAgMC4wMjAwMDAgMC4wMDAxNjlcbiAwLjAyMDAwMCAwLjAwMDE2OSAwLjA0MDAwMCAwLjAwMDA3OFxuIDAuMDQwMDAwIDAuMDAwMDc4IDAuMDYwMDAwIDAuMDAwMzI4XG4gMC4wNjAwMDAgMC4wMDAzMjggMC4wODAwMDAgMC4wMDA3MzZcbiAwLjA4MDAwMCAwLjAwMDczNiAwLjEwMDAwMCAwLjAwMDY5OVxuIDAuMTAwMDAwIDAuMDAwNjk5IDAuMTIwMDAwIDAuMDAwMDI1XG4gMC4xMjAwMDAgMC4wMDAwMjUgMC4xNDAwMDAgMC4wMDA5NzRcbiAwLjE0MDAwMCAwLjAwMDk3NCAwLjE2MDAwMCAwLjAwMTYxNFxuIDAuMTYwMDAwIDAuMDAxNjE0IDAuMTgwMDAwIDAuMDAxMzAxXG4gMC4xODAwMDAgMC4wMDEzMDEgMC4yMDAwMDAgMC4wMDAwMTVcbiAwLjIwMDAwMCAwLjAwMDAxNSAwLjIyMDAwMCAwLjAwMTU0OVxuIDAuMjIwMDAwIDAuMDAxNTQ5IDAuMjQwMDAwIDAuMDAyMzUxXG4gMC4yNDAwMDAgMC4wMDIzNTEgMC4yNjAwMDAgMC4wMDE2OTVcbiAwLjI2MDAwMCAwLjAwMTY5NSAwLjI4MDAwMCAwLjAwMDIyNlxuIDAuMjgwMDAwIDAuMDAwMjI2IDAuMzAwMDAwIDAuMDAyMzIwXG4gMC4zMDAwMDAgMC4wMDIzMjAgMC4zMjAwMDAgMC4wMDMyMTRcbiAwLjMyMDAwMCAwLjAwMzIxNCAwLjM0MDAwMCAwLjAwMjE1MFxuIDAuMzQwMDAwIDAuMDAyMTUwIDAuMzYwMDAwIDAuMDAwNDIzXG4gMC4zNjAwMDAgMC4wMDA0MjMgMC4zODAwMDAgMC4wMDMwMDdcbiAwLjM4MDAwMCAwLjAwMzAwNyAwLjQwMDAwMCAwLjAwMzkxOFxuIDAuNDAwMDAwIDAuMDAzOTE4IDAuNDIwMDAwIDAuMDAyMzg3XG4gMC40MjAwMDAgMC4wMDIzODcgMC40NDAwMDAgMC4wMDA4NTBcbiAwLjQ0MDAwMCAwLjAwMDg1MCAwLjQ2MDAwMCAwLjAwMzg3N1xuIDAuNDYwMDAwIDAuMDAzODc3IDAuNDgwMDAwIDAuMDA0NzMyXG4gMC40ODAwMDAgMC4wMDQ3MzIgMC41MDAwMDAgMC4wMDI2NzZcbiAwLjUwMDAwMCAwLjAwMjY3NiAwLjUyMDAwMCAwLjAwMTIyOVxuIDAuNTIwMDAwIDAuMDAxMjI5IDAuNTQwMDAwIDAuMDA0NjQ4XG4gMC41NDAwMDAgMC4wMDQ2NDggMC41NjAwMDAgMC4wMDUzNzJcbiAwLjU2MDAwMCAwLjAwNTM3MiAwLjU4MDAwMCAwLjAwMjczOFxuIDAuNTgwMDAwIDAuMDAyNzM4IDAuNjAwMDAwIDAuMDAxODMzXG4gMC42MDAwMDAgMC4wMDE4MzMgMC42MjAwMDAgMC4wMDU1ODlcbiAwLjYyMDAwMCAwLjAwNTU4OSAwLjY0MDAwMCAwLjAwNjEwNlxuIDAuNjQwMDAwIDAuMDA2MTA2IDAuNjYwMDAwIDAuMDAyODQ2XG4gMC42NjAwMDAgMC4wMDI4NDYgMC42ODAwMDAgMC4wMDIzODJcbiAwLjY4MDAwMCAwLjAwMjM4MiAwLjcwMDAwMCAwLjAwNjQxNVxuIDAuNzAwMDAwIDAuMDA2NDE1IDAuNzIwMDAwIDAuMDA2NjUxXG4gMC43MjAwMDAgMC4wMDY2NTEgMC43NDAwMDAgMC4wMDI3MjFcbiAwLjc0MDAwMCAwLjAwMjcyMSAwLjc2MDAwMCAwLjAwMzE1MFxuIDAuNzYwMDAwIDAuMDAzMTUwIDAuNzgwMDAwIDAuMDA3Mzk0XG4gMC43ODAwMDAgMC4wMDczOTQgMC44MDAwMDAgMC4wMDcyNzRcbiAwLjgwMDAwMCAwLjAwNzI3NCAwLjgyMDAwMCAwLjAwMjYzNlxuIDAuODIwMDAwIDAuMDAyNjM2IDAuODQwMDAwIDAuMDAzODU1XG4gMC44NDAwMDAgMC4wMDM4NTUgMC44NjAwMDAgMC4wMDgyNDNcbiAwLjg2MDAwMCAwLjAwODI0MyAwLjg4MDAwMCAwLjAwNzY5NFxuIDAuODgwMDAwIDAuMDA3Njk0IDAuOTAwMDAwIDAuMDAyMzE2XG4gMC45MDAwMDAgMC4wMDIzMTYgMC45MjAwMDAgMC4wMDQ3NjhcbiAwLjkyMDAwMCAwLjAwNDc2OCAwLjk0MDAwMCAwLjAwOTIyOVxuIDAuOTQwMDAwIDAuMDA5MjI5IDAuOTYwMDAwIDAuMDA4MTgwXG4gMC45NjAwMDAgMC4wMDgxODAgMC45ODAwMDAgMC4wMDIwMzRcbiAwLjk4MDAwMCAwLjAwMjAzNCAxLjAwMDAwMCAwLjAwNTYwOFxuIyBjb2xvciAyMDAgMTUwIDBcbiMgc3ltYm9sIG5vbmVcbiMgbGluZXN0eWxlIHNvbGlkXG4jIGxlZ2VuZCBoZXVuXG4gMC4wMDAwMDAgMC4wMDAwMDAgMC4wMjAwMDAgMC4wMDAwMzBcbiAwLjAyMDAwMCAwLjAwMDAzMCAwLjA0MDAwMCAwLjAwMDA4OVxuIDAuMDQwMDAwIDAuMDAwMDg5IDAuMDYwMDAwIDAuMDAwMTE0XG4gMC4wNjAwMDAgMC4wMDAxMTQgMC4wODAwMDAgMC4wMDAwNjNcbiAwLjA4MDAwMCAwLjAwMDA2MyAwLjEwMDAwMCAwLjAwMDA0NVxuIDAuMTAwMDAwIDAuMDAwMDQ1IDAuMTIwMDAwIDAuMDAwMTMwXG4gMC4xMjAwMDAgMC4wMDAxMzAgMC4xNDAwMDAgMC4wMDAxMTFcbiAwLjE0MDAwMCAwLjAwMDExMSAwLjE2MDAwMCAwLjAwMDAyNVxuIDAuMTYwMDAwIDAuMDAwMDI1IDAuMTgwMDAwIDAuMDAwMjA2XG4gMC4xODAwMDAgMC4wMDAyMDYgMC4yMDAwMDAgMC4wMDAzMDZcbiAwLjIwMDAwMCAwLjAwMDMwNiAwLjIyMDAwMCAwLjAwMDIzNlxuIDAuMjIwMDAwIDAuMDAwMjM2IDAuMjQwMDAwIDAuMDAwMDEyXG4gMC4yNDAwMDAgMC4wMDAwMTIgMC4yNjAwMDAgMC4wMDAyMzZcbiAwLjI2MDAwMCAwLjAwMDIzNiAwLjI4MDAwMCAwLjAwMDM0MlxuIDAuMjgwMDAwIDAuMDAwMzQyIDAuMzAwMDAwIDAuMDAwMjEyXG4gMC4zMDAwMDAgMC4wMDAyMTIgMC4zMjAwMDAgMC4wMDAxMDFcbiAwLjMyMDAwMCAwLjAwMDEwMSAwLjM0MDAwMCAwLjAwMDQxMVxuIDAuMzQwMDAwIDAuMDAwNDExIDAuMzYwMDAwIDAuMDAwNTEyXG4gMC4zNjAwMDAgMC4wMDA1MTIgMC4zODAwMDAgMC4wMDAzMTRcbiAwLjM4MDAwMCAwLjAwMDMxNCAwLjQwMDAwMCAwLjAwMDA4OFxuIDAuNDAwMDAwIDAuMDAwMDg4IDAuNDIwMDAwIDAuMDAwNDUyXG4gMC40MjAwMDAgMC4wMDA0NTIgMC40NDAwMDAgMC4wMDA1MzlcbiAwLjQ0MDAwMCAwLjAwMDUzOSAwLjQ2MDAwMCAwLjAwMDI2NlxuIDAuNDYwMDAwIDAuMDAwMjY2IDAuNDgwMDAwIDAuMDAwMjI0XG4gMC40ODAwMDAgMC4wMDAyMjQgMC41MDAwMDAgMC4wMDA2MzZcbiAwLjUwMDAwMCAwLjAwMDYzNiAwLjUyMDAwMCAwLjAwMDY5OFxuIDAuNTIwMDAwIDAuMDAwNjk4IDAuNTQwMDAwIDAuMDAwMzQ0XG4gMC41NDAwMDAgMC4wMDAzNDQgMC41NjAwMDAgMC4wMDAyMzRcbiAwLjU2MDAwMCAwLjAwMDIzNCAwLjU4MDAwMCAwLjAwMDY4NFxuIDAuNTgwMDAwIDAuMDAwNjg0IDAuNjAwMDAwIDAuMDAwNzEyXG4gMC42MDAwMDAgMC4wMDA3MTIgMC42MjAwMDAgMC4wMDAyNzFcbiAwLjYyMDAwMCAwLjAwMDI3MSAwLjY0MDAwMCAwLjAwMDM5MlxuIDAuNjQwMDAwIDAuMDAwMzkyIDAuNjYwMDAwIDAuMDAwODczXG4gMC42NjAwMDAgMC4wMDA4NzMgMC42ODAwMDAgMC4wMDA4NTdcbiAwLjY4MDAwMCAwLjAwMDg1NyAwLjcwMDAwMCAwLjAwMDMyM1xuIDAuNzAwMDAwIDAuMDAwMzIzIDAuNzIwMDAwIDAuMDAwNDIzXG4gMC43MjAwMDAgMC4wMDA0MjMgMC43NDAwMDAgMC4wMDA5MjVcbiAwLjc0MDAwMCAwLjAwMDkyNSAwLjc2MDAwMCAwLjAwMDg1NFxuIDAuNzYwMDAwIDAuMDAwODU0IDAuNzgwMDAwIDAuMDAwMjI0XG4gMC43ODAwMDAgMC4wMDAyMjQgMC44MDAwMDAgMC4wMDA2MDBcbiAwLjgwMDAwMCAwLjAwMDYwMCAwLjgyMDAwMCAwLjAwMTExNFxuIDAuODIwMDAwIDAuMDAxMTE0IDAuODQwMDAwIDAuMDAwOTgwXG4gMC44NDAwMDAgMC4wMDA5ODAgMC44NjAwMDAgMC4wMDAyNTBcbiAwLjg2MDAwMCAwLjAwMDI1MCAwLjg4MDAwMCAwLjAwMDY0OVxuIDAuODgwMDAwIDAuMDAwNjQ5IDAuOTAwMDAwIDAuMDAxMTY0XG4gMC45MDAwMDAgMC4wMDExNjQgMC45MjAwMDAgMC4wMDA5NThcbiAwLjkyMDAwMCAwLjAwMDk1OCAwLjk0MDAwMCAwLjAwMDEyNVxuIDAuOTQwMDAwIDAuMDAwMTI1IDAuOTYwMDAwIDAuMDAwODQzXG4gMC45NjAwMDAgMC4wMDA4NDMgMC45ODAwMDAgMC4wMDEzNTBcbiAwLjk4MDAwMCAwLjAwMTM1MCAxLjAwMDAwMCAwLjAwMTA2MlxuIyBjb2xvciAyMDAgMCAxNTBcbiMgc3ltYm9sIG5vbmVcbiMgbGluZXN0eWxlIHNvbGlkXG4jIGxlZ2VuZCBSdW5nZS1LdXR0YSA0XG4gMC4wMDAwMDAgMC4wMDAwMDAgMC4wMjAwMDAgMC4wMDAwMDBcbiAwLjAyMDAwMCAwLjAwMDAwMCAwLjA0MDAwMCAwLjAwMDAwMFxuIDAuMDQwMDAwIDAuMDAwMDAwIDAuMDYwMDAwIDAuMDAwMDAxXG4gMC4wNjAwMDAgMC4wMDAwMDEgMC4wODAwMDAgMC4wMDAwMDFcbiAwLjA4MDAwMCAwLjAwMDAwMSAwLjEwMDAwMCAwLjAwMDAwMFxuIDAuMTAwMDAwIDAuMDAwMDAwIDAuMTIwMDAwIDAuMDAwMDAwXG4gMC4xMjAwMDAgMC4wMDAwMDAgMC4xNDAwMDAgMC4wMDAwMDBcbiAwLjE0MDAwMCAwLjAwMDAwMCAwLjE2MDAwMCAwLjAwMDAwMFxuIDAuMTYwMDAwIDAuMDAwMDAwIDAuMTgwMDAwIDAuMDAwMDAxXG4gMC4xODAwMDAgMC4wMDAwMDEgMC4yMDAwMDAgMC4wMDAwMDFcbiAwLjIwMDAwMCAwLjAwMDAwMSAwLjIyMDAwMCAwLjAwMDAwMVxuIDAuMjIwMDAwIDAuMDAwMDAxIDAuMjQwMDAwIDAuMDAwMDAwXG4gMC4yNDAwMDAgMC4wMDAwMDAgMC4yNjAwMDAgMC4wMDAwMDBcbiAwLjI2MDAwMCAwLjAwMDAwMCAwLjI4MDAwMCAwLjAwMDAwMVxuIDAuMjgwMDAwIDAuMDAwMDAxIDAuMzAwMDAwIDAuMDAwMDAxXG4gMC4zMDAwMDAgMC4wMDAwMDEgMC4zMjAwMDAgMC4wMDAwMDBcbiAwLjMyMDAwMCAwLjAwMDAwMCAwLjM0MDAwMCAwLjAwMDAwMVxuIDAuMzQwMDAwIDAuMDAwMDAxIDAuMzYwMDAwIDAuMDAwMDAyXG4gMC4zNjAwMDAgMC4wMDAwMDIgMC4zODAwMDAgMC4wMDAwMDFcbiAwLjM4MDAwMCAwLjAwMDAwMSAwLjQwMDAwMCAwLjAwMDAwMFxuIDAuNDAwMDAwIDAuMDAwMDAwIDAuNDIwMDAwIDAuMDAwMDAxXG4gMC40MjAwMDAgMC4wMDAwMDEgMC40NDAwMDAgMC4wMDAwMDFcbiAwLjQ0MDAwMCAwLjAwMDAwMSAwLjQ2MDAwMCAwLjAwMDAwMVxuIDAuNDYwMDAwIDAuMDAwMDAxIDAuNDgwMDAwIDAuMDAwMDAxXG4gMC40ODAwMDAgMC4wMDAwMDEgMC41MDAwMDAgMC4wMDAwMDJcbiAwLjUwMDAwMCAwLjAwMDAwMiAwLjUyMDAwMCAwLjAwMDAwMlxuIDAuNTIwMDAwIDAuMDAwMDAyIDAuNTQwMDAwIDAuMDAwMDAxXG4gMC41NDAwMDAgMC4wMDAwMDEgMC41NjAwMDAgMC4wMDAwMDBcbiAwLjU2MDAwMCAwLjAwMDAwMCAwLjU4MDAwMCAwLjAwMDAwMlxuIDAuNTgwMDAwIDAuMDAwMDAyIDAuNjAwMDAwIDAuMDAwMDAyXG4gMC42MDAwMDAgMC4wMDAwMDIgMC42MjAwMDAgMC4wMDAwMDFcbiAwLjYyMDAwMCAwLjAwMDAwMSAwLjY0MDAwMCAwLjAwMDAwMVxuIDAuNjQwMDAwIDAuMDAwMDAxIDAuNjYwMDAwIDAuMDAwMDAyXG4gMC42NjAwMDAgMC4wMDAwMDIgMC42ODAwMDAgMC4wMDAwMDNcbiAwLjY4MDAwMCAwLjAwMDAwMyAwLjcwMDAwMCAwLjAwMDAwMVxuIDAuNzAwMDAwIDAuMDAwMDAxIDAuNzIwMDAwIDAuMDAwMDAxXG4gMC43MjAwMDAgMC4wMDAwMDEgMC43NDAwMDAgMC4wMDAwMDJcbiAwLjc0MDAwMCAwLjAwMDAwMiAwLjc2MDAwMCAwLjAwMDAwMlxuIDAuNzYwMDAwIDAuMDAwMDAyIDAuNzgwMDAwIDAuMDAwMDAxXG4gMC43ODAwMDAgMC4wMDAwMDEgMC44MDAwMDAgMC4wMDAwMDJcbiAwLjgwMDAwMCAwLjAwMDAwMiAwLjgyMDAwMCAwLjAwMDAwM1xuIDAuODIwMDAwIDAuMDAwMDAzIDAuODQwMDAwIDAuMDAwMDAzXG4gMC44NDAwMDAgMC4wMDAwMDMgMC44NjAwMDAgMC4wMDAwMDFcbiAwLjg2MDAwMCAwLjAwMDAwMSAwLjg4MDAwMCAwLjAwMDAwMVxuIDAuODgwMDAwIDAuMDAwMDAxIDAuOTAwMDAwIDAuMDAwMDAzXG4gMC45MDAwMDAgMC4wMDAwMDMgMC45MjAwMDAgMC4wMDAwMDNcbiAwLjkyMDAwMCAwLjAwMDAwMyAwLjk0MDAwMCAwLjAwMDAwMFxuIDAuOTQwMDAwIDAuMDAwMDAwIDAuOTYwMDAwIDAuMDAwMDAyXG4gMC45NjAwMDAgMC4wMDAwMDIgMC45ODAwMDAgMC4wMDAwMDRcbiAwLjk4MDAwMCAwLjAwMDAwNCAxLjAwMDAwMCAwLjAwMDAwM1xuIyBuZXdmcmFtZVxuIyB0aXRsZSBhYnNvbHV0ZSBlcnJvclxuIyB4LWxhYmVsIHhcbiMgeS1sYWJlbCBlcnJvclxuIyBzY2FsZSBcbiMgY29sb3IgMTkxIDM0IDM0XG4jIHN5bWJvbCBub25lXG4jIGxpbmVzdHlsZSBzb2xpZFxuIyBsZWdlbmQgZXhwbGljaXQgZXVsZXJcbiAwLjAwMDAwMCAwLjAwMDAwMCAwLjAyMDAwMCAwLjAwMDE2OVxuIDAuMDIwMDAwIDAuMDAwMTY5IDAuMDQwMDAwIDAuMDAwMDc4XG4gMC4wNDAwMDAgMC4wMDAwNzggMC4wNjAwMDAgMC4wMDAzMjhcbiAwLjA2MDAwMCAwLjAwMDMyOCAwLjA4MDAwMCAwLjAwMDczNlxuIDAuMDgwMDAwIDAuMDAwNzM2IDAuMTAwMDAwIDAuMDAwNjk5XG4gMC4xMDAwMDAgMC4wMDA2OTkgMC4xMjAwMDAgMC4wMDAwMjVcbiAwLjEyMDAwMCAwLjAwMDAyNSAwLjE0MDAwMCAwLjAwMDk3NFxuIDAuMTQwMDAwIDAuMDAwOTc0IDAuMTYwMDAwIDAuMDAxNjE0XG4gMC4xNjAwMDAgMC4wMDE2MTQgMC4xODAwMDAgMC4wMDEzMDFcbiAwLjE4MDAwMCAwLjAwMTMwMSAwLjIwMDAwMCAwLjAwMDAxNVxuIDAuMjAwMDAwIDAuMDAwMDE1IDAuMjIwMDAwIDAuMDAxNTQ5XG4gMC4yMjAwMDAgMC4wMDE1NDkgMC4yNDAwMDAgMC4wMDIzNTFcbiAwLjI0MDAwMCAwLjAwMjM1MSAwLjI2MDAwMCAwLjAwMTY5NVxuIDAuMjYwMDAwIDAuMDAxNjk1IDAuMjgwMDAwIDAuMDAwMjI2XG4gMC4yODAwMDAgMC4wMDAyMjYgMC4zMDAwMDAgMC4wMDIzMjBcbiAwLjMwMDAwMCAwLjAwMjMyMCAwLjMyMDAwMCAwLjAwMzIxNFxuIDAuMzIwMDAwIDAuMDAzMjE0IDAuMzQwMDAwIDAuMDAyMTUwXG4gMC4zNDAwMDAgMC4wMDIxNTAgMC4zNjAwMDAgMC4wMDA0MjNcbiAwLjM2MDAwMCAwLjAwMDQyMyAwLjM4MDAwMCAwLjAwMzAwN1xuIDAuMzgwMDAwIDAuMDAzMDA3IDAuNDAwMDAwIDAuMDAzOTE4XG4gMC40MDAwMDAgMC4wMDM5MTggMC40MjAwMDAgMC4wMDIzODdcbiAwLjQyMDAwMCAwLjAwMjM4NyAwLjQ0MDAwMCAwLjAwMDg1MFxuIDAuNDQwMDAwIDAuMDAwODUwIDAuNDYwMDAwIDAuMDAzODc3XG4gMC40NjAwMDAgMC4wMDM4NzcgMC40ODAwMDAgMC4wMDQ3MzJcbiAwLjQ4MDAwMCAwLjAwNDczMiAwLjUwMDAwMCAwLjAwMjY3NlxuIDAuNTAwMDAwIDAuMDAyNjc2IDAuNTIwMDAwIDAuMDAxMjI5XG4gMC41MjAwMDAgMC4wMDEyMjkgMC41NDAwMDAgMC4wMDQ2NDhcbiAwLjU0MDAwMCAwLjAwNDY0OCAwLjU2MDAwMCAwLjAwNTM3MlxuIDAuNTYwMDAwIDAuMDA1MzcyIDAuNTgwMDAwIDAuMDAyNzM4XG4gMC41ODAwMDAgMC4wMDI3MzggMC42MDAwMDAgMC4wMDE4MzNcbiAwLjYwMDAwMCAwLjAwMTgzMyAwLjYyMDAwMCAwLjAwNTU4OVxuIDAuNjIwMDAwIDAuMDA1NTg5IDAuNjQwMDAwIDAuMDA2MTA2XG4gMC42NDAwMDAgMC4wMDYxMDYgMC42NjAwMDAgMC4wMDI4NDZcbiAwLjY2MDAwMCAwLjAwMjg0NiAwLjY4MDAwMCAwLjAwMjM4MlxuIDAuNjgwMDAwIDAuMDAyMzgyIDAuNzAwMDAwIDAuMDA2NDE1XG4gMC43MDAwMDAgMC4wMDY0MTUgMC43MjAwMDAgMC4wMDY2NTFcbiAwLjcyMDAwMCAwLjAwNjY1MSAwLjc0MDAwMCAwLjAwMjcyMVxuIDAuNzQwMDAwIDAuMDAyNzIxIDAuNzYwMDAwIDAuMDAzMTUwXG4gMC43NjAwMDAgMC4wMDMxNTAgMC43ODAwMDAgMC4wMDczOTRcbiAwLjc4MDAwMCAwLjAwNzM5NCAwLjgwMDAwMCAwLjAwNzI3NFxuIDAuODAwMDAwIDAuMDA3Mjc0IDAuODIwMDAwIDAuMDAyNjM2XG4gMC44MjAwMDAgMC4wMDI2MzYgMC44NDAwMDAgMC4wMDM4NTVcbiAwLjg0MDAwMCAwLjAwMzg1NSAwLjg2MDAwMCAwLjAwODI0M1xuIDAuODYwMDAwIDAuMDA4MjQzIDAuODgwMDAwIDAuMDA3Njk0XG4gMC44ODAwMDAgMC4wMDc2OTQgMC45MDAwMDAgMC4wMDIzMTZcbiAwLjkwMDAwMCAwLjAwMjMxNiAwLjkyMDAwMCAwLjAwNDc2OFxuIDAuOTIwMDAwIDAuMDA0NzY4IDAuOTQwMDAwIDAuMDA5MjI5XG4gMC45NDAwMDAgMC4wMDkyMjkgMC45NjAwMDAgMC4wMDgxODBcbiAwLjk2MDAwMCAwLjAwODE4MCAwLjk4MDAwMCAwLjAwMjAzNFxuIDAuOTgwMDAwIDAuMDAyMDM0IDEuMDAwMDAwIDAuMDA1NjA4XG4iLCAiTUlNRXR5cGUiIDogImFwcGxpY2F0aW9uL3gtdmdmIn0="
        }
      );
      this.returnedOutputJson.artifacts.push(
        {
          "type" : "file",
          "identifier" : "cc3c1cf9-c02d-4694-902c-93c298d68d03",
          "MIMEtype": "application/x-vgfc",
          "path": "/mode/gridplotTest.vgfc",
          "content": "eyAiaWRlbnRpZmllciIgOiAidmlwcGxvdC52Z2ZjIiwgInZhbHVlIiA6ICJHcmlkcGxvdFxuIyB4LXJhbmdlIC0zLjAwMDAwMCAzLjAwMDAwMFxuIyB5LXJhbmdlIC0zLjAwMDAwMCAzLjAwMDAwMFxuIyB4LWNvdW50IDUwXG4jIHktY291bnQgNTBcbiMgc2NhbGUgMSAxIDFcbiMgbWluLWNvbG9yIDI1NSAwIDBcbiMgbWF4LWNvbG9yIDAgMCAyNTVcbiMgdGltZSAwXG4jIGxhYmVsIHBpZXpvbWV0cmljIGhlYWRcbi0wLjA0MTcyMiAtMC4wNTc4NjkgLTAuMDQ2NTU3IC0wLjAxMzg3NiAwLjAyNTg2MSAwLjA1NzQ3OCAwLjA3MDc2MiAwLjA2MjkwMiAwLjAzNzY5NSAwLjAwMjg0NiAtMC4wMzMwOTcgLTAuMDYzMTEyIC0wLjA4MjkwMSAtMC4wOTEwNDMgLTAuMDg4NDE3IC0wLjA3NzMzNSAtMC4wNjA2ODkgLTAuMDQxMjk3IC0wLjAyMTUwOCAtMC4wMDMwNDQgMC4wMTI5OTAgMC4wMjYwMDAgMC4wMzU3NDUgMC4wNDIxOTIgMC4wNDUzOTIgMC4wNDUzOTIgMC4wNDIxOTIgMC4wMzU3NDUgMC4wMjYwMDAgMC4wMTI5OTAgLTAuMDAzMDQ0IC0wLjAyMTUwOCAtMC4wNDEyOTcgLTAuMDYwNjg5IC0wLjA3NzMzNSAtMC4wODg0MTcgLTAuMDkxMDQzIC0wLjA4MjkwMSAtMC4wNjMxMTIgLTAuMDMzMDk3IDAuMDAyODQ2IDAuMDM3Njk1IDAuMDYyOTAyIDAuMDcwNzYyIDAuMDU3NDc4IDAuMDI1ODYxIC0wLjAxMzg3NiAtMC4wNDY1NTcgLTAuMDU3ODY5IC0wLjA0MTcyMiBcbi0wLjA1Nzg2OSAtMC4wNDU0NzAgLTAuMDEwMjIwIDAuMDMxMzMzIDAuMDYxOTIzIDAuMDcwNjU5IDAuMDU1Nzk2IDAuMDIzMzg2IC0wLjAxNjM4OSAtMC4wNTMxNjcgLTAuMDc5MjQyIC0wLjA5MDc4OSAtMC4wODc2NzkgLTAuMDcyNDUzIC0wLjA0OTAyMSAtMC4wMjE1MDggMC4wMDY1MzAgMC4wMzI1MDMgMC4wNTQ4NjQgMC4wNzI5NjIgMC4wODY4MTUgMC4wOTY4NDAgMC4xMDM2MzEgMC4xMDc3NzMgMC4xMDk3MjEgMC4xMDk3MjEgMC4xMDc3NzMgMC4xMDM2MzEgMC4wOTY4NDAgMC4wODY4MTUgMC4wNzI5NjIgMC4wNTQ4NjQgMC4wMzI1MDMgMC4wMDY1MzAgLTAuMDIxNTA4IC0wLjA0OTAyMSAtMC4wNzI0NTMgLTAuMDg3Njc5IC0wLjA5MDc4OSAtMC4wNzkyNDIgLTAuMDUzMTY3IC0wLjAxNjM4OSAwLjAyMzM4NiAwLjA1NTc5NiAwLjA3MDY1OSAwLjA2MTkyMyAwLjAzMTMzMyAtMC4wMTAyMjAgLTAuMDQ1NDcwIC0wLjA1Nzg2OSBcbi0wLjA0NjU1NyAtMC4wMTAyMjAgMC4wMzMxMTcgMC4wNjM4NDEgMC4wNjk4MjggMC4wNDk5MjMgMC4wMTIxOTkgLTAuMDMwNzQ4IC0wLjA2Njc3MyAtMC4wODc2MTAgLTAuMDkwMTMxIC0wLjA3NTc4NSAtMC4wNDkwMjEgLTAuMDE1NDc5IDAuMDE5NDg4IDAuMDUxNzMxIDAuMDc4NjYwIDAuMDk5MTc3IDAuMTEzMzYyIDAuMTIyMDczIDAuMTI2NTczIDAuMTI4MjIxIDAuMTI4MjY3IDAuMTI3NzE1IDAuMTI3MjYzIDAuMTI3MjYzIDAuMTI3NzE1IDAuMTI4MjY3IDAuMTI4MjIxIDAuMTI2NTczIDAuMTIyMDczIDAuMTEzMzYyIDAuMDk5MTc3IDAuMDc4NjYwIDAuMDUxNzMxIDAuMDE5NDg4IC0wLjAxNTQ3OSAtMC4wNDkwMjEgLTAuMDc1Nzg1IC0wLjA5MDEzMSAtMC4wODc2MTAgLTAuMDY2NzczIC0wLjAzMDc0OCAwLjAxMjE5OSAwLjA0OTkyMyAwLjA2OTgyOCAwLjA2Mzg0MSAwLjAzMzExNyAtMC4wMTAyMjAgLTAuMDQ2NTU3IFxuLTAuMDEzODc2IDAuMDMxMzMzIDAuMDYzODQxIDAuMDY5NDIyIDAuMDQ2NjcxIDAuMDA1MjEwIC0wLjA0MDAyOCAtMC4wNzUwMDUgLTAuMDkwNzg5IC0wLjA4NDk2NiAtMC4wNjA2ODkgLTAuMDI0NDY3IDAuMDE2MjM2IDAuMDU0ODY0IDAuMDg2ODE1IDAuMTA5NzIxIDAuMTIzMTgyIDAuMTI4MjIxIDAuMTI2NjkzIDAuMTIwNzYzIDAuMTEyNTQwIDAuMTAzODUwIDAuMDk2MTM2IDAuMDkwNDQyIDAuMDg3NDM0IDAuMDg3NDM0IDAuMDkwNDQyIDAuMDk2MTM2IDAuMTAzODUwIDAuMTEyNTQwIDAuMTIwNzYzIDAuMTI2NjkzIDAuMTI4MjIxIDAuMTIzMTgyIDAuMTA5NzIxIDAuMDg2ODE1IDAuMDU0ODY0IDAuMDE2MjM2IC0wLjAyNDQ2NyAtMC4wNjA2ODkgLTAuMDg0OTY2IC0wLjA5MDc4OSAtMC4wNzUwMDUgLTAuMDQwMDI4IDAuMDA1MjEwIDAuMDQ2NjcxIDAuMDY5NDIyIDAuMDYzODQxIDAuMDMxMzMzIC0wLjAxMzg3NiBcbjAuMDI1ODYxIDAuMDYxOTIzIDAuMDY5ODI4IDAuMDQ2NjcxIDAuMDAyODQ2IC0wLjA0NDUyOSAtMC4wNzkyNDIgLTAuMDkxMzIwIC0wLjA3ODgwNyAtMC4wNDY1MDMgLTAuMDAzMDQ0IDAuMDQyMTkyIDAuMDgxNDM0IDAuMTA5NzIxIDAuMTI1MDg5IDAuMTI4MDUwIDAuMTIwNzYzIDAuMTA2MTk1IDAuMDg3NDM0IDAuMDY3MjQ2IDAuMDQ3ODUyIDAuMDMwODgwIDAuMDE3NDIzIDAuMDA4MTU0IDAuMDAzNDQwIDAuMDAzNDQwIDAuMDA4MTU0IDAuMDE3NDIzIDAuMDMwODgwIDAuMDQ3ODUyIDAuMDY3MjQ2IDAuMDg3NDM0IDAuMTA2MTk1IDAuMTIwNzYzIDAuMTI4MDUwIDAuMTI1MDg5IDAuMTA5NzIxIDAuMDgxNDM0IDAuMDQyMTkyIC0wLjAwMzA0NCAtMC4wNDY1MDMgLTAuMDc4ODA3IC0wLjA5MTMyMCAtMC4wNzkyNDIgLTAuMDQ0NTI5IDAuMDAyODQ2IDAuMDQ2NjcxIDAuMDY5ODI4IDAuMDYxOTIzIDAuMDI1ODYxIFxuMC4wNTc0NzggMC4wNzA2NTkgMC4wNDk5MjMgMC4wMDUyMTAgLTAuMDQ0NTI5IC0wLjA4MDUyOCAtMC4wOTEwOTMgLTAuMDc0MTU3IC0wLjAzNTg3OCAwLjAxMjk5MCAwLjA2MTA0MSAwLjA5OTE3NyAwLjEyMjA3MyAwLjEyODI2NyAwLjExOTM1NyAwLjA5ODgxOSAwLjA3MDg1NSAwLjAzOTUxNSAwLjAwODE1NCAtMC4wMjA3ODAgLTAuMDQ1NzMxIC0wLjA2NTg3OSAtMC4wODA5MjIgLTAuMDkwODUyIC0wLjA5NTc3NCAtMC4wOTU3NzQgLTAuMDkwODUyIC0wLjA4MDkyMiAtMC4wNjU4NzkgLTAuMDQ1NzMxIC0wLjAyMDc4MCAwLjAwODE1NCAwLjAzOTUxNSAwLjA3MDg1NSAwLjA5ODgxOSAwLjExOTM1NyAwLjEyODI2NyAwLjEyMjA3MyAwLjA5OTE3NyAwLjA2MTA0MSAwLjAxMjk5MCAtMC4wMzU4NzggLTAuMDc0MTU3IC0wLjA5MTA5MyAtMC4wODA1MjggLTAuMDQ0NTI5IDAuMDA1MjEwIDAuMDQ5OTIzIDAuMDcwNjU5IDAuMDU3NDc4IFxuMC4wNzA3NjIgMC4wNTU3OTYgMC4wMTIxOTkgLTAuMDQwMDI4IC0wLjA3OTI0MiAtMC4wOTEwOTMgLTAuMDcyNDUzIC0wLjAzMDI2MiAwLjAyMjc0NCAwLjA3Mjk2MiAwLjEwOTcyMSAwLjEyNzE1MSAwLjEyNDI2NiAwLjEwMzg1MCAwLjA3MDg1NSAwLjAzMDg4MCAtMC4wMTA5NzcgLTAuMDUwNzY1IC0wLjA4NTkwMCAtMC4xMTUwNzIgLTAuMTM3OTc1IC0wLjE1NDk2OCAtMC4xNjY3NDcgLTAuMTc0MDc1IC0wLjE3NzU2OCAtMC4xNzc1NjggLTAuMTc0MDc1IC0wLjE2Njc0NyAtMC4xNTQ5NjggLTAuMTM3OTc1IC0wLjExNTA3MiAtMC4wODU5MDAgLTAuMDUwNzY1IC0wLjAxMDk3NyAwLjAzMDg4MCAwLjA3MDg1NSAwLjEwMzg1MCAwLjEyNDI2NiAwLjEyNzE1MSAwLjEwOTcyMSAwLjA3Mjk2MiAwLjAyMjc0NCAtMC4wMzAyNjIgLTAuMDcyNDUzIC0wLjA5MTA5MyAtMC4wNzkyNDIgLTAuMDQwMDI4IDAuMDEyMTk5IDAuMDU1Nzk2IDAuMDcwNzYyIFxuMC4wNjI5MDIgMC4wMjMzODYgLTAuMDMwNzQ4IC0wLjA3NTAwNSAtMC4wOTEzMjAgLTAuMDc0MTU3IC0wLjAzMDI2MiAwLjAyNjAwMCAwLjA3ODY2MCAwLjExNTA0OSAwLjEyODM1MSAwLjExNzgzMCAwLjA4NzQzNCAwLjA0MzcyMiAtMC4wMDYxMjkgLTAuMDU1ODA0IC0wLjEwMDY2MiAtMC4xMzc5NzUgLTAuMTY2NzQ3IC0wLjE4NzMxMiAtMC4yMDA4NTcgLTAuMjA4OTg1IC0wLjIxMzM0NSAtMC4yMTUzNzUgLTAuMjE2MTE3IC0wLjIxNjExNyAtMC4yMTUzNzUgLTAuMjEzMzQ1IC0wLjIwODk4NSAtMC4yMDA4NTcgLTAuMTg3MzEyIC0wLjE2Njc0NyAtMC4xMzc5NzUgLTAuMTAwNjYyIC0wLjA1NTgwNCAtMC4wMDYxMjkgMC4wNDM3MjIgMC4wODc0MzQgMC4xMTc4MzAgMC4xMjgzNTEgMC4xMTUwNDkgMC4wNzg2NjAgMC4wMjYwMDAgLTAuMDMwMjYyIC0wLjA3NDE1NyAtMC4wOTEzMjAgLTAuMDc1MDA1IC0wLjAzMDc0OCAwLjAyMzM4NiAwLjA2MjkwMiBcbjAuMDM3Njk1IC0wLjAxNjM4OSAtMC4wNjY3NzMgLTAuMDkwNzg5IC0wLjA3ODgwNyAtMC4wMzU4NzggMC4wMjI3NDQgMC4wNzg2NjAgMC4xMTY2NDUgMC4xMjgyNjcgMC4xMTI1NDAgMC4wNzQzNzAgMC4wMjE5NzIgLTAuMDM1Njk0IC0wLjA5MDg1MiAtMC4xMzc5NzUgLTAuMTc0MDc1IC0wLjE5ODQzNyAtMC4yMTIwNjQgLTAuMjE3MDQxIC0wLjIxNTk1MyAtMC4yMTE0MjggLTAuMjA1ODE2IC0wLjIwMDk5NCAtMC4xOTgyNTUgLTAuMTk4MjU1IC0wLjIwMDk5NCAtMC4yMDU4MTYgLTAuMjExNDI4IC0wLjIxNTk1MyAtMC4yMTcwNDEgLTAuMjEyMDY0IC0wLjE5ODQzNyAtMC4xNzQwNzUgLTAuMTM3OTc1IC0wLjA5MDg1MiAtMC4wMzU2OTQgMC4wMjE5NzIgMC4wNzQzNzAgMC4xMTI1NDAgMC4xMjgyNjcgMC4xMTY2NDUgMC4wNzg2NjAgMC4wMjI3NDQgLTAuMDM1ODc4IC0wLjA3ODgwNyAtMC4wOTA3ODkgLTAuMDY2NzczIC0wLjAxNjM4OSAwLjAzNzY5NSBcbjAuMDAyODQ2IC0wLjA1MzE2NyAtMC4wODc2MTAgLTAuMDg0OTY2IC0wLjA0NjUwMyAwLjAxMjk5MCAwLjA3Mjk2MiAwLjExNTA0OSAwLjEyODI2NyAwLjExMDU0MiAwLjA2NzI0NiAwLjAwODE1NCAtMC4wNTU4MDQgLTAuMTE1MDcyIC0wLjE2MjkyMiAtMC4xOTU4NjggLTAuMjEzMzQ1IC0wLjIxNjk4NCAtMC4yMDk3NzEgLTAuMTk1Mjk2IC0wLjE3NzE3NCAtMC4xNTg2NTcgLTAuMTQyNDI3IC0wLjEzMDUwMCAtMC4xMjQyMDcgLTAuMTI0MjA3IC0wLjEzMDUwMCAtMC4xNDI0MjcgLTAuMTU4NjU3IC0wLjE3NzE3NCAtMC4xOTUyOTYgLTAuMjA5NzcxIC0wLjIxNjk4NCAtMC4yMTMzNDUgLTAuMTk1ODY4IC0wLjE2MjkyMiAtMC4xMTUwNzIgLTAuMDU1ODA0IDAuMDA4MTU0IDAuMDY3MjQ2IDAuMTEwNTQyIDAuMTI4MjY3IDAuMTE1MDQ5IDAuMDcyOTYyIDAuMDEyOTkwIC0wLjA0NjUwMyAtMC4wODQ5NjYgLTAuMDg3NjEwIC0wLjA1MzE2NyAwLjAwMjg0NiBcbi0wLjAzMzA5NyAtMC4wNzkyNDIgLTAuMDkwMTMxIC0wLjA2MDY4OSAtMC4wMDMwNDQgMC4wNjEwNDEgMC4xMDk3MjEgMC4xMjgzNTEgMC4xMTI1NDAgMC4wNjcyNDYgMC4wMDM0NDAgLTAuMDY1ODc5IC0wLjEyOTAwOCAtMC4xNzc1NjggLTAuMjA3MTk0IC0wLjIxNzIxNyAtMC4yMDk3NzEgLTAuMTg4NzE1IC0wLjE1ODY1NyAtMC4xMjQyMDcgLTAuMDg5NDk4IC0wLjA1Nzk0MCAtMC4wMzIxNTAgLTAuMDEzOTg3IC0wLjAwNDYyMyAtMC4wMDQ2MjMgLTAuMDEzOTg3IC0wLjAzMjE1MCAtMC4wNTc5NDAgLTAuMDg5NDk4IC0wLjEyNDIwNyAtMC4xNTg2NTcgLTAuMTg4NzE1IC0wLjIwOTc3MSAtMC4yMTcyMTcgLTAuMjA3MTk0IC0wLjE3NzU2OCAtMC4xMjkwMDggLTAuMDY1ODc5IDAuMDAzNDQwIDAuMDY3MjQ2IDAuMTEyNTQwIDAuMTI4MzUxIDAuMTA5NzIxIDAuMDYxMDQxIC0wLjAwMzA0NCAtMC4wNjA2ODkgLTAuMDkwMTMxIC0wLjA3OTI0MiAtMC4wMzMwOTcgXG4tMC4wNjMxMTIgLTAuMDkwNzg5IC0wLjA3NTc4NSAtMC4wMjQ0NjcgMC4wNDIxOTIgMC4wOTkxNzcgMC4xMjcxNTEgMC4xMTc4MzAgMC4wNzQzNzAgMC4wMDgxNTQgLTAuMDY1ODc5IC0wLjEzMzUyNyAtMC4xODQxOTAgLTAuMjEyMDY0IC0wLjIxNTk1MyAtMC4xOTgyNTUgLTAuMTYzNjIxIC0wLjExNzY5NiAtMC4wNjYxMzcgLTAuMDEzOTg3IDAuMDM0NjM2IDAuMDc2NjA2IDAuMTA5NzA5IDAuMTMyNDg1IDAuMTQ0MDcyIDAuMTQ0MDcyIDAuMTMyNDg1IDAuMTA5NzA5IDAuMDc2NjA2IDAuMDM0NjM2IC0wLjAxMzk4NyAtMC4wNjYxMzcgLTAuMTE3Njk2IC0wLjE2MzYyMSAtMC4xOTgyNTUgLTAuMjE1OTUzIC0wLjIxMjA2NCAtMC4xODQxOTAgLTAuMTMzNTI3IC0wLjA2NTg3OSAwLjAwODE1NCAwLjA3NDM3MCAwLjExNzgzMCAwLjEyNzE1MSAwLjA5OTE3NyAwLjA0MjE5MiAtMC4wMjQ0NjcgLTAuMDc1Nzg1IC0wLjA5MDc4OSAtMC4wNjMxMTIgXG4tMC4wODI5MDEgLTAuMDg3Njc5IC0wLjA0OTAyMSAwLjAxNjIzNiAwLjA4MTQzNCAwLjEyMjA3MyAwLjEyNDI2NiAwLjA4NzQzNCAwLjAyMTk3MiAtMC4wNTU4MDQgLTAuMTI5MDA4IC0wLjE4NDE5MCAtMC4yMTMzNDUgLTAuMjE0MTA3IC0wLjE4ODcxNSAtMC4xNDI0MjcgLTAuMDgxOTE4IC0wLjAxMzk4NyAwLjA1NTI5OCAwLjEyMTAzMCAwLjE3OTU2NiAwLjIyODQxNSAwLjI2NjAwNSAwLjI5MTQzNCAwLjMwNDI0MyAwLjMwNDI0MyAwLjI5MTQzNCAwLjI2NjAwNSAwLjIyODQxNSAwLjE3OTU2NiAwLjEyMTAzMCAwLjA1NTI5OCAtMC4wMTM5ODcgLTAuMDgxOTE4IC0wLjE0MjQyNyAtMC4xODg3MTUgLTAuMjE0MTA3IC0wLjIxMzM0NSAtMC4xODQxOTAgLTAuMTI5MDA4IC0wLjA1NTgwNCAwLjAyMTk3MiAwLjA4NzQzNCAwLjEyNDI2NiAwLjEyMjA3MyAwLjA4MTQzNCAwLjAxNjIzNiAtMC4wNDkwMjEgLTAuMDg3Njc5IC0wLjA4MjkwMSBcbi0wLjA5MTA0MyAtMC4wNzI0NTMgLTAuMDE1NDc5IDAuMDU0ODY0IDAuMTA5NzIxIDAuMTI4MjY3IDAuMTAzODUwIDAuMDQzNzIyIC0wLjAzNTY5NCAtMC4xMTUwNzIgLTAuMTc3NTY4IC0wLjIxMjA2NCAtMC4yMTQxMDcgLTAuMTg1MDkxIC0wLjEzMDUwMCAtMC4wNTc5NDAgMC4wMjQ1NTggMC4xMDk3MDkgMC4xOTE2MjYgMC4yNjYwMDUgMC4zMzAwMTggMC4zODIwMjcgMC40MjEyNDMgMC40NDczOTMgMC40NjA0NTAgMC40NjA0NTAgMC40NDczOTMgMC40MjEyNDMgMC4zODIwMjcgMC4zMzAwMTggMC4yNjYwMDUgMC4xOTE2MjYgMC4xMDk3MDkgMC4wMjQ1NTggLTAuMDU3OTQwIC0wLjEzMDUwMCAtMC4xODUwOTEgLTAuMjE0MTA3IC0wLjIxMjA2NCAtMC4xNzc1NjggLTAuMTE1MDcyIC0wLjAzNTY5NCAwLjA0MzcyMiAwLjEwMzg1MCAwLjEyODI2NyAwLjEwOTcyMSAwLjA1NDg2NCAtMC4wMTU0NzkgLTAuMDcyNDUzIC0wLjA5MTA0MyBcbi0wLjA4ODQxNyAtMC4wNDkwMjEgMC4wMTk0ODggMC4wODY4MTUgMC4xMjUwODkgMC4xMTkzNTcgMC4wNzA4NTUgLTAuMDA2MTI5IC0wLjA5MDg1MiAtMC4xNjI5MjIgLTAuMjA3MTk0IC0wLjIxNTk1MyAtMC4xODg3MTUgLTAuMTMwNTAwIC0wLjA0OTU0MSAwLjA0NDg4NCAwLjE0NDA3MiAwLjI0MDg2MyAwLjMzMDAxOCAwLjQwODE2NCAwLjQ3MzQ4NyAwLjUyNTMwNSAwLjU2MzY0MyAwLjU4ODg1NSAwLjYwMTMzOCAwLjYwMTMzOCAwLjU4ODg1NSAwLjU2MzY0MyAwLjUyNTMwNSAwLjQ3MzQ4NyAwLjQwODE2NCAwLjMzMDAxOCAwLjI0MDg2MyAwLjE0NDA3MiAwLjA0NDg4NCAtMC4wNDk1NDEgLTAuMTMwNTAwIC0wLjE4ODcxNSAtMC4yMTU5NTMgLTAuMjA3MTk0IC0wLjE2MjkyMiAtMC4wOTA4NTIgLTAuMDA2MTI5IDAuMDcwODU1IDAuMTE5MzU3IDAuMTI1MDg5IDAuMDg2ODE1IDAuMDE5NDg4IC0wLjA0OTAyMSAtMC4wODg0MTcgXG4tMC4wNzczMzUgLTAuMDIxNTA4IDAuMDUxNzMxIDAuMTA5NzIxIDAuMTI4MDUwIDAuMDk4ODE5IDAuMDMwODgwIC0wLjA1NTgwNCAtMC4xMzc5NzUgLTAuMTk1ODY4IC0wLjIxNzIxNyAtMC4xOTgyNTUgLTAuMTQyNDI3IC0wLjA1Nzk0MCAwLjA0NDg4NCAwLjE1NTc4NCAwLjI2NjAwNSAwLjM2ODk4MyAwLjQ2MDQ1MCAwLjUzODE0NSAwLjYwMTMzOCAwLjY1MDMwMyAwLjY4NTgzNiAwLjcwODg2NyAwLjcyMDE2NiAwLjcyMDE2NiAwLjcwODg2NyAwLjY4NTgzNiAwLjY1MDMwMyAwLjYwMTMzOCAwLjUzODE0NSAwLjQ2MDQ1MCAwLjM2ODk4MyAwLjI2NjAwNSAwLjE1NTc4NCAwLjA0NDg4NCAtMC4wNTc5NDAgLTAuMTQyNDI3IC0wLjE5ODI1NSAtMC4yMTcyMTcgLTAuMTk1ODY4IC0wLjEzNzk3NSAtMC4wNTU4MDQgMC4wMzA4ODAgMC4wOTg4MTkgMC4xMjgwNTAgMC4xMDk3MjEgMC4wNTE3MzEgLTAuMDIxNTA4IC0wLjA3NzMzNSBcbi0wLjA2MDY4OSAwLjAwNjUzMCAwLjA3ODY2MCAwLjEyMzE4MiAwLjEyMDc2MyAwLjA3MDg1NSAtMC4wMTA5NzcgLTAuMTAwNjYyIC0wLjE3NDA3NSAtMC4yMTMzNDUgLTAuMjA5NzcxIC0wLjE2MzYyMSAtMC4wODE5MTggMC4wMjQ1NTggMC4xNDQwNzIgMC4yNjYwMDUgMC4zODIwMjcgMC40ODY0OTcgMC41NzYyODggMC42NTAzMDMgMC43MDg4NjcgMC43NTMxMzQgMC43ODQ1ODQgMC44MDQ2MzQgMC44MTQzNjkgMC44MTQzNjkgMC44MDQ2MzQgMC43ODQ1ODQgMC43NTMxMzQgMC43MDg4NjcgMC42NTAzMDMgMC41NzYyODggMC40ODY0OTcgMC4zODIwMjcgMC4yNjYwMDUgMC4xNDQwNzIgMC4wMjQ1NTggLTAuMDgxOTE4IC0wLjE2MzYyMSAtMC4yMDk3NzEgLTAuMjEzMzQ1IC0wLjE3NDA3NSAtMC4xMDA2NjIgLTAuMDEwOTc3IDAuMDcwODU1IDAuMTIwNzYzIDAuMTIzMTgyIDAuMDc4NjYwIDAuMDA2NTMwIC0wLjA2MDY4OSBcbi0wLjA0MTI5NyAwLjAzMjUwMyAwLjA5OTE3NyAwLjEyODIyMSAwLjEwNjE5NSAwLjAzOTUxNSAtMC4wNTA3NjUgLTAuMTM3OTc1IC0wLjE5ODQzNyAtMC4yMTY5ODQgLTAuMTg4NzE1IC0wLjExNzY5NiAtMC4wMTM5ODcgMC4xMDk3MDkgMC4yNDA4NjMgMC4zNjg5ODMgMC40ODY0OTcgMC41ODg4NTUgMC42NzQxMTcgMC43NDIzMDYgMC43OTQ3MDQgMC44MzMyMzEgMC44NTk5MzEgMC44NzY2MTYgMC44ODQ2MTAgMC44ODQ2MTAgMC44NzY2MTYgMC44NTk5MzEgMC44MzMyMzEgMC43OTQ3MDQgMC43NDIzMDYgMC42NzQxMTcgMC41ODg4NTUgMC40ODY0OTcgMC4zNjg5ODMgMC4yNDA4NjMgMC4xMDk3MDkgLTAuMDEzOTg3IC0wLjExNzY5NiAtMC4xODg3MTUgLTAuMjE2OTg0IC0wLjE5ODQzNyAtMC4xMzc5NzUgLTAuMDUwNzY1IDAuMDM5NTE1IDAuMTA2MTk1IDAuMTI4MjIxIDAuMDk5MTc3IDAuMDMyNTAzIC0wLjA0MTI5NyBcbi0wLjAyMTUwOCAwLjA1NDg2NCAwLjExMzM2MiAwLjEyNjY5MyAwLjA4NzQzNCAwLjAwODE1NCAtMC4wODU5MDAgLTAuMTY2NzQ3IC0wLjIxMjA2NCAtMC4yMDk3NzEgLTAuMTU4NjU3IC0wLjA2NjEzNyAwLjA1NTI5OCAwLjE5MTYyNiAwLjMzMDAxOCAwLjQ2MDQ1MCAwLjU3NjI4OCAwLjY3NDExNyAwLjc1MzEzNCAwLjgxNDM2OSAwLjg1OTkzMSAwLjg5MjM2NiAwLjkxNDE2NSAwLjkyNzQzNyAwLjkzMzY4MyAwLjkzMzY4MyAwLjkyNzQzNyAwLjkxNDE2NSAwLjg5MjM2NiAwLjg1OTkzMSAwLjgxNDM2OSAwLjc1MzEzNCAwLjY3NDExNyAwLjU3NjI4OCAwLjQ2MDQ1MCAwLjMzMDAxOCAwLjE5MTYyNiAwLjA1NTI5OCAtMC4wNjYxMzcgLTAuMTU4NjU3IC0wLjIwOTc3MSAtMC4yMTIwNjQgLTAuMTY2NzQ3IC0wLjA4NTkwMCAwLjAwODE1NCAwLjA4NzQzNCAwLjEyNjY5MyAwLjExMzM2MiAwLjA1NDg2NCAtMC4wMjE1MDggXG4tMC4wMDMwNDQgMC4wNzI5NjIgMC4xMjIwNzMgMC4xMjA3NjMgMC4wNjcyNDYgLTAuMDIwNzgwIC0wLjExNTA3MiAtMC4xODczMTIgLTAuMjE3MDQxIC0wLjE5NTI5NiAtMC4xMjQyMDcgLTAuMDEzOTg3IDAuMTIxMDMwIDAuMjY2MDA1IDAuNDA4MTY0IDAuNTM4MTQ1IDAuNjUwMzAzIDAuNzQyMzA2IDAuODE0MzY5IDAuODY4Mzg4IDAuOTA3MTQ3IDAuOTMzNjgzIDAuOTUwODI0IDAuOTYwODkxIDAuOTY1NTA3IDAuOTY1NTA3IDAuOTYwODkxIDAuOTUwODI0IDAuOTMzNjgzIDAuOTA3MTQ3IDAuODY4Mzg4IDAuODE0MzY5IDAuNzQyMzA2IDAuNjUwMzAzIDAuNTM4MTQ1IDAuNDA4MTY0IDAuMjY2MDA1IDAuMTIxMDMwIC0wLjAxMzk4NyAtMC4xMjQyMDcgLTAuMTk1Mjk2IC0wLjIxNzA0MSAtMC4xODczMTIgLTAuMTE1MDcyIC0wLjAyMDc4MCAwLjA2NzI0NiAwLjEyMDc2MyAwLjEyMjA3MyAwLjA3Mjk2MiAtMC4wMDMwNDQgXG4wLjAxMjk5MCAwLjA4NjgxNSAwLjEyNjU3MyAwLjExMjU0MCAwLjA0Nzg1MiAtMC4wNDU3MzEgLTAuMTM3OTc1IC0wLjIwMDg1NyAtMC4yMTU5NTMgLTAuMTc3MTc0IC0wLjA4OTQ5OCAwLjAzNDYzNiAwLjE3OTU2NiAwLjMzMDAxOCAwLjQ3MzQ4NyAwLjYwMTMzOCAwLjcwODg2NyAwLjc5NDcwNCAwLjg1OTkzMSAwLjkwNzE0NyAwLjkzOTY2NSAwLjk2MDg5MSAwLjk3Mzg5NCAwLjk4MTEzOSAwLjk4NDMyOCAwLjk4NDMyOCAwLjk4MTEzOSAwLjk3Mzg5NCAwLjk2MDg5MSAwLjkzOTY2NSAwLjkwNzE0NyAwLjg1OTkzMSAwLjc5NDcwNCAwLjcwODg2NyAwLjYwMTMzOCAwLjQ3MzQ4NyAwLjMzMDAxOCAwLjE3OTU2NiAwLjAzNDYzNiAtMC4wODk0OTggLTAuMTc3MTc0IC0wLjIxNTk1MyAtMC4yMDA4NTcgLTAuMTM3OTc1IC0wLjA0NTczMSAwLjA0Nzg1MiAwLjExMjU0MCAwLjEyNjU3MyAwLjA4NjgxNSAwLjAxMjk5MCBcbjAuMDI2MDAwIDAuMDk2ODQwIDAuMTI4MjIxIDAuMTAzODUwIDAuMDMwODgwIC0wLjA2NTg3OSAtMC4xNTQ5NjggLTAuMjA4OTg1IC0wLjIxMTQyOCAtMC4xNTg2NTcgLTAuMDU3OTQwIDAuMDc2NjA2IDAuMjI4NDE1IDAuMzgyMDI3IDAuNTI1MzA1IDAuNjUwMzAzIDAuNzUzMTM0IDAuODMzMjMxIDAuODkyMzY2IDAuOTMzNjgzIDAuOTYwODkxIDAuOTc3NjYxIDAuOTg3MjI2IDAuOTkyMTQxIDAuOTk0MTU2IDAuOTk0MTU2IDAuOTkyMTQxIDAuOTg3MjI2IDAuOTc3NjYxIDAuOTYwODkxIDAuOTMzNjgzIDAuODkyMzY2IDAuODMzMjMxIDAuNzUzMTM0IDAuNjUwMzAzIDAuNTI1MzA1IDAuMzgyMDI3IDAuMjI4NDE1IDAuMDc2NjA2IC0wLjA1Nzk0MCAtMC4xNTg2NTcgLTAuMjExNDI4IC0wLjIwODk4NSAtMC4xNTQ5NjggLTAuMDY1ODc5IDAuMDMwODgwIDAuMTAzODUwIDAuMTI4MjIxIDAuMDk2ODQwIDAuMDI2MDAwIFxuMC4wMzU3NDUgMC4xMDM2MzEgMC4xMjgyNjcgMC4wOTYxMzYgMC4wMTc0MjMgLTAuMDgwOTIyIC0wLjE2Njc0NyAtMC4yMTMzNDUgLTAuMjA1ODE2IC0wLjE0MjQyNyAtMC4wMzIxNTAgMC4xMDk3MDkgMC4yNjYwMDUgMC40MjEyNDMgMC41NjM2NDMgMC42ODU4MzYgMC43ODQ1ODQgMC44NTk5MzEgMC45MTQxNjUgMC45NTA4MjQgMC45NzM4OTQgMC45ODcyMjYgMC45OTQxNTYgMC45OTcyOTUgMC45OTg0MTggMC45OTg0MTggMC45OTcyOTUgMC45OTQxNTYgMC45ODcyMjYgMC45NzM4OTQgMC45NTA4MjQgMC45MTQxNjUgMC44NTk5MzEgMC43ODQ1ODQgMC42ODU4MzYgMC41NjM2NDMgMC40MjEyNDMgMC4yNjYwMDUgMC4xMDk3MDkgLTAuMDMyMTUwIC0wLjE0MjQyNyAtMC4yMDU4MTYgLTAuMjEzMzQ1IC0wLjE2Njc0NyAtMC4wODA5MjIgMC4wMTc0MjMgMC4wOTYxMzYgMC4xMjgyNjcgMC4xMDM2MzEgMC4wMzU3NDUgXG4wLjA0MjE5MiAwLjEwNzc3MyAwLjEyNzcxNSAwLjA5MDQ0MiAwLjAwODE1NCAtMC4wOTA4NTIgLTAuMTc0MDc1IC0wLjIxNTM3NSAtMC4yMDA5OTQgLTAuMTMwNTAwIC0wLjAxMzk4NyAwLjEzMjQ4NSAwLjI5MTQzNCAwLjQ0NzM5MyAwLjU4ODg1NSAwLjcwODg2NyAwLjgwNDYzNCAwLjg3NjYxNiAwLjkyNzQzNyAwLjk2MDg5MSAwLjk4MTEzOSAwLjk5MjE0MSAwLjk5NzI5NSAwLjk5OTI0MSAwLjk5OTc2NiAwLjk5OTc2NiAwLjk5OTI0MSAwLjk5NzI5NSAwLjk5MjE0MSAwLjk4MTEzOSAwLjk2MDg5MSAwLjkyNzQzNyAwLjg3NjYxNiAwLjgwNDYzNCAwLjcwODg2NyAwLjU4ODg1NSAwLjQ0NzM5MyAwLjI5MTQzNCAwLjEzMjQ4NSAtMC4wMTM5ODcgLTAuMTMwNTAwIC0wLjIwMDk5NCAtMC4yMTUzNzUgLTAuMTc0MDc1IC0wLjA5MDg1MiAwLjAwODE1NCAwLjA5MDQ0MiAwLjEyNzcxNSAwLjEwNzc3MyAwLjA0MjE5MiBcbjAuMDQ1MzkyIDAuMTA5NzIxIDAuMTI3MjYzIDAuMDg3NDM0IDAuMDAzNDQwIC0wLjA5NTc3NCAtMC4xNzc1NjggLTAuMjE2MTE3IC0wLjE5ODI1NSAtMC4xMjQyMDcgLTAuMDA0NjIzIDAuMTQ0MDcyIDAuMzA0MjQzIDAuNDYwNDUwIDAuNjAxMzM4IDAuNzIwMTY2IDAuODE0MzY5IDAuODg0NjEwIDAuOTMzNjgzIDAuOTY1NTA3IDAuOTg0MzI4IDAuOTk0MTU2IDAuOTk4NDE4IDAuOTk5NzY2IDAuOTk5OTkxIDAuOTk5OTkxIDAuOTk5NzY2IDAuOTk4NDE4IDAuOTk0MTU2IDAuOTg0MzI4IDAuOTY1NTA3IDAuOTMzNjgzIDAuODg0NjEwIDAuODE0MzY5IDAuNzIwMTY2IDAuNjAxMzM4IDAuNDYwNDUwIDAuMzA0MjQzIDAuMTQ0MDcyIC0wLjAwNDYyMyAtMC4xMjQyMDcgLTAuMTk4MjU1IC0wLjIxNjExNyAtMC4xNzc1NjggLTAuMDk1Nzc0IDAuMDAzNDQwIDAuMDg3NDM0IDAuMTI3MjYzIDAuMTA5NzIxIDAuMDQ1MzkyIFxuMC4wNDUzOTIgMC4xMDk3MjEgMC4xMjcyNjMgMC4wODc0MzQgMC4wMDM0NDAgLTAuMDk1Nzc0IC0wLjE3NzU2OCAtMC4yMTYxMTcgLTAuMTk4MjU1IC0wLjEyNDIwNyAtMC4wMDQ2MjMgMC4xNDQwNzIgMC4zMDQyNDMgMC40NjA0NTAgMC42MDEzMzggMC43MjAxNjYgMC44MTQzNjkgMC44ODQ2MTAgMC45MzM2ODMgMC45NjU1MDcgMC45ODQzMjggMC45OTQxNTYgMC45OTg0MTggMC45OTk3NjYgMC45OTk5OTEgMC45OTk5OTEgMC45OTk3NjYgMC45OTg0MTggMC45OTQxNTYgMC45ODQzMjggMC45NjU1MDcgMC45MzM2ODMgMC44ODQ2MTAgMC44MTQzNjkgMC43MjAxNjYgMC42MDEzMzggMC40NjA0NTAgMC4zMDQyNDMgMC4xNDQwNzIgLTAuMDA0NjIzIC0wLjEyNDIwNyAtMC4xOTgyNTUgLTAuMjE2MTE3IC0wLjE3NzU2OCAtMC4wOTU3NzQgMC4wMDM0NDAgMC4wODc0MzQgMC4xMjcyNjMgMC4xMDk3MjEgMC4wNDUzOTIgXG4wLjA0MjE5MiAwLjEwNzc3MyAwLjEyNzcxNSAwLjA5MDQ0MiAwLjAwODE1NCAtMC4wOTA4NTIgLTAuMTc0MDc1IC0wLjIxNTM3NSAtMC4yMDA5OTQgLTAuMTMwNTAwIC0wLjAxMzk4NyAwLjEzMjQ4NSAwLjI5MTQzNCAwLjQ0NzM5MyAwLjU4ODg1NSAwLjcwODg2NyAwLjgwNDYzNCAwLjg3NjYxNiAwLjkyNzQzNyAwLjk2MDg5MSAwLjk4MTEzOSAwLjk5MjE0MSAwLjk5NzI5NSAwLjk5OTI0MSAwLjk5OTc2NiAwLjk5OTc2NiAwLjk5OTI0MSAwLjk5NzI5NSAwLjk5MjE0MSAwLjk4MTEzOSAwLjk2MDg5MSAwLjkyNzQzNyAwLjg3NjYxNiAwLjgwNDYzNCAwLjcwODg2NyAwLjU4ODg1NSAwLjQ0NzM5MyAwLjI5MTQzNCAwLjEzMjQ4NSAtMC4wMTM5ODcgLTAuMTMwNTAwIC0wLjIwMDk5NCAtMC4yMTUzNzUgLTAuMTc0MDc1IC0wLjA5MDg1MiAwLjAwODE1NCAwLjA5MDQ0MiAwLjEyNzcxNSAwLjEwNzc3MyAwLjA0MjE5MiBcbjAuMDM1NzQ1IDAuMTAzNjMxIDAuMTI4MjY3IDAuMDk2MTM2IDAuMDE3NDIzIC0wLjA4MDkyMiAtMC4xNjY3NDcgLTAuMjEzMzQ1IC0wLjIwNTgxNiAtMC4xNDI0MjcgLTAuMDMyMTUwIDAuMTA5NzA5IDAuMjY2MDA1IDAuNDIxMjQzIDAuNTYzNjQzIDAuNjg1ODM2IDAuNzg0NTg0IDAuODU5OTMxIDAuOTE0MTY1IDAuOTUwODI0IDAuOTczODk0IDAuOTg3MjI2IDAuOTk0MTU2IDAuOTk3Mjk1IDAuOTk4NDE4IDAuOTk4NDE4IDAuOTk3Mjk1IDAuOTk0MTU2IDAuOTg3MjI2IDAuOTczODk0IDAuOTUwODI0IDAuOTE0MTY1IDAuODU5OTMxIDAuNzg0NTg0IDAuNjg1ODM2IDAuNTYzNjQzIDAuNDIxMjQzIDAuMjY2MDA1IDAuMTA5NzA5IC0wLjAzMjE1MCAtMC4xNDI0MjcgLTAuMjA1ODE2IC0wLjIxMzM0NSAtMC4xNjY3NDcgLTAuMDgwOTIyIDAuMDE3NDIzIDAuMDk2MTM2IDAuMTI4MjY3IDAuMTAzNjMxIDAuMDM1NzQ1IFxuMC4wMjYwMDAgMC4wOTY4NDAgMC4xMjgyMjEgMC4xMDM4NTAgMC4wMzA4ODAgLTAuMDY1ODc5IC0wLjE1NDk2OCAtMC4yMDg5ODUgLTAuMjExNDI4IC0wLjE1ODY1NyAtMC4wNTc5NDAgMC4wNzY2MDYgMC4yMjg0MTUgMC4zODIwMjcgMC41MjUzMDUgMC42NTAzMDMgMC43NTMxMzQgMC44MzMyMzEgMC44OTIzNjYgMC45MzM2ODMgMC45NjA4OTEgMC45Nzc2NjEgMC45ODcyMjYgMC45OTIxNDEgMC45OTQxNTYgMC45OTQxNTYgMC45OTIxNDEgMC45ODcyMjYgMC45Nzc2NjEgMC45NjA4OTEgMC45MzM2ODMgMC44OTIzNjYgMC44MzMyMzEgMC43NTMxMzQgMC42NTAzMDMgMC41MjUzMDUgMC4zODIwMjcgMC4yMjg0MTUgMC4wNzY2MDYgLTAuMDU3OTQwIC0wLjE1ODY1NyAtMC4yMTE0MjggLTAuMjA4OTg1IC0wLjE1NDk2OCAtMC4wNjU4NzkgMC4wMzA4ODAgMC4xMDM4NTAgMC4xMjgyMjEgMC4wOTY4NDAgMC4wMjYwMDAgXG4wLjAxMjk5MCAwLjA4NjgxNSAwLjEyNjU3MyAwLjExMjU0MCAwLjA0Nzg1MiAtMC4wNDU3MzEgLTAuMTM3OTc1IC0wLjIwMDg1NyAtMC4yMTU5NTMgLTAuMTc3MTc0IC0wLjA4OTQ5OCAwLjAzNDYzNiAwLjE3OTU2NiAwLjMzMDAxOCAwLjQ3MzQ4NyAwLjYwMTMzOCAwLjcwODg2NyAwLjc5NDcwNCAwLjg1OTkzMSAwLjkwNzE0NyAwLjkzOTY2NSAwLjk2MDg5MSAwLjk3Mzg5NCAwLjk4MTEzOSAwLjk4NDMyOCAwLjk4NDMyOCAwLjk4MTEzOSAwLjk3Mzg5NCAwLjk2MDg5MSAwLjkzOTY2NSAwLjkwNzE0NyAwLjg1OTkzMSAwLjc5NDcwNCAwLjcwODg2NyAwLjYwMTMzOCAwLjQ3MzQ4NyAwLjMzMDAxOCAwLjE3OTU2NiAwLjAzNDYzNiAtMC4wODk0OTggLTAuMTc3MTc0IC0wLjIxNTk1MyAtMC4yMDA4NTcgLTAuMTM3OTc1IC0wLjA0NTczMSAwLjA0Nzg1MiAwLjExMjU0MCAwLjEyNjU3MyAwLjA4NjgxNSAwLjAxMjk5MCBcbi0wLjAwMzA0NCAwLjA3Mjk2MiAwLjEyMjA3MyAwLjEyMDc2MyAwLjA2NzI0NiAtMC4wMjA3ODAgLTAuMTE1MDcyIC0wLjE4NzMxMiAtMC4yMTcwNDEgLTAuMTk1Mjk2IC0wLjEyNDIwNyAtMC4wMTM5ODcgMC4xMjEwMzAgMC4yNjYwMDUgMC40MDgxNjQgMC41MzgxNDUgMC42NTAzMDMgMC43NDIzMDYgMC44MTQzNjkgMC44NjgzODggMC45MDcxNDcgMC45MzM2ODMgMC45NTA4MjQgMC45NjA4OTEgMC45NjU1MDcgMC45NjU1MDcgMC45NjA4OTEgMC45NTA4MjQgMC45MzM2ODMgMC45MDcxNDcgMC44NjgzODggMC44MTQzNjkgMC43NDIzMDYgMC42NTAzMDMgMC41MzgxNDUgMC40MDgxNjQgMC4yNjYwMDUgMC4xMjEwMzAgLTAuMDEzOTg3IC0wLjEyNDIwNyAtMC4xOTUyOTYgLTAuMjE3MDQxIC0wLjE4NzMxMiAtMC4xMTUwNzIgLTAuMDIwNzgwIDAuMDY3MjQ2IDAuMTIwNzYzIDAuMTIyMDczIDAuMDcyOTYyIC0wLjAwMzA0NCBcbi0wLjAyMTUwOCAwLjA1NDg2NCAwLjExMzM2MiAwLjEyNjY5MyAwLjA4NzQzNCAwLjAwODE1NCAtMC4wODU5MDAgLTAuMTY2NzQ3IC0wLjIxMjA2NCAtMC4yMDk3NzEgLTAuMTU4NjU3IC0wLjA2NjEzNyAwLjA1NTI5OCAwLjE5MTYyNiAwLjMzMDAxOCAwLjQ2MDQ1MCAwLjU3NjI4OCAwLjY3NDExNyAwLjc1MzEzNCAwLjgxNDM2OSAwLjg1OTkzMSAwLjg5MjM2NiAwLjkxNDE2NSAwLjkyNzQzNyAwLjkzMzY4MyAwLjkzMzY4MyAwLjkyNzQzNyAwLjkxNDE2NSAwLjg5MjM2NiAwLjg1OTkzMSAwLjgxNDM2OSAwLjc1MzEzNCAwLjY3NDExNyAwLjU3NjI4OCAwLjQ2MDQ1MCAwLjMzMDAxOCAwLjE5MTYyNiAwLjA1NTI5OCAtMC4wNjYxMzcgLTAuMTU4NjU3IC0wLjIwOTc3MSAtMC4yMTIwNjQgLTAuMTY2NzQ3IC0wLjA4NTkwMCAwLjAwODE1NCAwLjA4NzQzNCAwLjEyNjY5MyAwLjExMzM2MiAwLjA1NDg2NCAtMC4wMjE1MDggXG4tMC4wNDEyOTcgMC4wMzI1MDMgMC4wOTkxNzcgMC4xMjgyMjEgMC4xMDYxOTUgMC4wMzk1MTUgLTAuMDUwNzY1IC0wLjEzNzk3NSAtMC4xOTg0MzcgLTAuMjE2OTg0IC0wLjE4ODcxNSAtMC4xMTc2OTYgLTAuMDEzOTg3IDAuMTA5NzA5IDAuMjQwODYzIDAuMzY4OTgzIDAuNDg2NDk3IDAuNTg4ODU1IDAuNjc0MTE3IDAuNzQyMzA2IDAuNzk0NzA0IDAuODMzMjMxIDAuODU5OTMxIDAuODc2NjE2IDAuODg0NjEwIDAuODg0NjEwIDAuODc2NjE2IDAuODU5OTMxIDAuODMzMjMxIDAuNzk0NzA0IDAuNzQyMzA2IDAuNjc0MTE3IDAuNTg4ODU1IDAuNDg2NDk3IDAuMzY4OTgzIDAuMjQwODYzIDAuMTA5NzA5IC0wLjAxMzk4NyAtMC4xMTc2OTYgLTAuMTg4NzE1IC0wLjIxNjk4NCAtMC4xOTg0MzcgLTAuMTM3OTc1IC0wLjA1MDc2NSAwLjAzOTUxNSAwLjEwNjE5NSAwLjEyODIyMSAwLjA5OTE3NyAwLjAzMjUwMyAtMC4wNDEyOTcgXG4tMC4wNjA2ODkgMC4wMDY1MzAgMC4wNzg2NjAgMC4xMjMxODIgMC4xMjA3NjMgMC4wNzA4NTUgLTAuMDEwOTc3IC0wLjEwMDY2MiAtMC4xNzQwNzUgLTAuMjEzMzQ1IC0wLjIwOTc3MSAtMC4xNjM2MjEgLTAuMDgxOTE4IDAuMDI0NTU4IDAuMTQ0MDcyIDAuMjY2MDA1IDAuMzgyMDI3IDAuNDg2NDk3IDAuNTc2Mjg4IDAuNjUwMzAzIDAuNzA4ODY3IDAuNzUzMTM0IDAuNzg0NTg0IDAuODA0NjM0IDAuODE0MzY5IDAuODE0MzY5IDAuODA0NjM0IDAuNzg0NTg0IDAuNzUzMTM0IDAuNzA4ODY3IDAuNjUwMzAzIDAuNTc2Mjg4IDAuNDg2NDk3IDAuMzgyMDI3IDAuMjY2MDA1IDAuMTQ0MDcyIDAuMDI0NTU4IC0wLjA4MTkxOCAtMC4xNjM2MjEgLTAuMjA5NzcxIC0wLjIxMzM0NSAtMC4xNzQwNzUgLTAuMTAwNjYyIC0wLjAxMDk3NyAwLjA3MDg1NSAwLjEyMDc2MyAwLjEyMzE4MiAwLjA3ODY2MCAwLjAwNjUzMCAtMC4wNjA2ODkgXG4tMC4wNzczMzUgLTAuMDIxNTA4IDAuMDUxNzMxIDAuMTA5NzIxIDAuMTI4MDUwIDAuMDk4ODE5IDAuMDMwODgwIC0wLjA1NTgwNCAtMC4xMzc5NzUgLTAuMTk1ODY4IC0wLjIxNzIxNyAtMC4xOTgyNTUgLTAuMTQyNDI3IC0wLjA1Nzk0MCAwLjA0NDg4NCAwLjE1NTc4NCAwLjI2NjAwNSAwLjM2ODk4MyAwLjQ2MDQ1MCAwLjUzODE0NSAwLjYwMTMzOCAwLjY1MDMwMyAwLjY4NTgzNiAwLjcwODg2NyAwLjcyMDE2NiAwLjcyMDE2NiAwLjcwODg2NyAwLjY4NTgzNiAwLjY1MDMwMyAwLjYwMTMzOCAwLjUzODE0NSAwLjQ2MDQ1MCAwLjM2ODk4MyAwLjI2NjAwNSAwLjE1NTc4NCAwLjA0NDg4NCAtMC4wNTc5NDAgLTAuMTQyNDI3IC0wLjE5ODI1NSAtMC4yMTcyMTcgLTAuMTk1ODY4IC0wLjEzNzk3NSAtMC4wNTU4MDQgMC4wMzA4ODAgMC4wOTg4MTkgMC4xMjgwNTAgMC4xMDk3MjEgMC4wNTE3MzEgLTAuMDIxNTA4IC0wLjA3NzMzNSBcbi0wLjA4ODQxNyAtMC4wNDkwMjEgMC4wMTk0ODggMC4wODY4MTUgMC4xMjUwODkgMC4xMTkzNTcgMC4wNzA4NTUgLTAuMDA2MTI5IC0wLjA5MDg1MiAtMC4xNjI5MjIgLTAuMjA3MTk0IC0wLjIxNTk1MyAtMC4xODg3MTUgLTAuMTMwNTAwIC0wLjA0OTU0MSAwLjA0NDg4NCAwLjE0NDA3MiAwLjI0MDg2MyAwLjMzMDAxOCAwLjQwODE2NCAwLjQ3MzQ4NyAwLjUyNTMwNSAwLjU2MzY0MyAwLjU4ODg1NSAwLjYwMTMzOCAwLjYwMTMzOCAwLjU4ODg1NSAwLjU2MzY0MyAwLjUyNTMwNSAwLjQ3MzQ4NyAwLjQwODE2NCAwLjMzMDAxOCAwLjI0MDg2MyAwLjE0NDA3MiAwLjA0NDg4NCAtMC4wNDk1NDEgLTAuMTMwNTAwIC0wLjE4ODcxNSAtMC4yMTU5NTMgLTAuMjA3MTk0IC0wLjE2MjkyMiAtMC4wOTA4NTIgLTAuMDA2MTI5IDAuMDcwODU1IDAuMTE5MzU3IDAuMTI1MDg5IDAuMDg2ODE1IDAuMDE5NDg4IC0wLjA0OTAyMSAtMC4wODg0MTcgXG4tMC4wOTEwNDMgLTAuMDcyNDUzIC0wLjAxNTQ3OSAwLjA1NDg2NCAwLjEwOTcyMSAwLjEyODI2NyAwLjEwMzg1MCAwLjA0MzcyMiAtMC4wMzU2OTQgLTAuMTE1MDcyIC0wLjE3NzU2OCAtMC4yMTIwNjQgLTAuMjE0MTA3IC0wLjE4NTA5MSAtMC4xMzA1MDAgLTAuMDU3OTQwIDAuMDI0NTU4IDAuMTA5NzA5IDAuMTkxNjI2IDAuMjY2MDA1IDAuMzMwMDE4IDAuMzgyMDI3IDAuNDIxMjQzIDAuNDQ3MzkzIDAuNDYwNDUwIDAuNDYwNDUwIDAuNDQ3MzkzIDAuNDIxMjQzIDAuMzgyMDI3IDAuMzMwMDE4IDAuMjY2MDA1IDAuMTkxNjI2IDAuMTA5NzA5IDAuMDI0NTU4IC0wLjA1Nzk0MCAtMC4xMzA1MDAgLTAuMTg1MDkxIC0wLjIxNDEwNyAtMC4yMTIwNjQgLTAuMTc3NTY4IC0wLjExNTA3MiAtMC4wMzU2OTQgMC4wNDM3MjIgMC4xMDM4NTAgMC4xMjgyNjcgMC4xMDk3MjEgMC4wNTQ4NjQgLTAuMDE1NDc5IC0wLjA3MjQ1MyAtMC4wOTEwNDMgXG4tMC4wODI5MDEgLTAuMDg3Njc5IC0wLjA0OTAyMSAwLjAxNjIzNiAwLjA4MTQzNCAwLjEyMjA3MyAwLjEyNDI2NiAwLjA4NzQzNCAwLjAyMTk3MiAtMC4wNTU4MDQgLTAuMTI5MDA4IC0wLjE4NDE5MCAtMC4yMTMzNDUgLTAuMjE0MTA3IC0wLjE4ODcxNSAtMC4xNDI0MjcgLTAuMDgxOTE4IC0wLjAxMzk4NyAwLjA1NTI5OCAwLjEyMTAzMCAwLjE3OTU2NiAwLjIyODQxNSAwLjI2NjAwNSAwLjI5MTQzNCAwLjMwNDI0MyAwLjMwNDI0MyAwLjI5MTQzNCAwLjI2NjAwNSAwLjIyODQxNSAwLjE3OTU2NiAwLjEyMTAzMCAwLjA1NTI5OCAtMC4wMTM5ODcgLTAuMDgxOTE4IC0wLjE0MjQyNyAtMC4xODg3MTUgLTAuMjE0MTA3IC0wLjIxMzM0NSAtMC4xODQxOTAgLTAuMTI5MDA4IC0wLjA1NTgwNCAwLjAyMTk3MiAwLjA4NzQzNCAwLjEyNDI2NiAwLjEyMjA3MyAwLjA4MTQzNCAwLjAxNjIzNiAtMC4wNDkwMjEgLTAuMDg3Njc5IC0wLjA4MjkwMSBcbi0wLjA2MzExMiAtMC4wOTA3ODkgLTAuMDc1Nzg1IC0wLjAyNDQ2NyAwLjA0MjE5MiAwLjA5OTE3NyAwLjEyNzE1MSAwLjExNzgzMCAwLjA3NDM3MCAwLjAwODE1NCAtMC4wNjU4NzkgLTAuMTMzNTI3IC0wLjE4NDE5MCAtMC4yMTIwNjQgLTAuMjE1OTUzIC0wLjE5ODI1NSAtMC4xNjM2MjEgLTAuMTE3Njk2IC0wLjA2NjEzNyAtMC4wMTM5ODcgMC4wMzQ2MzYgMC4wNzY2MDYgMC4xMDk3MDkgMC4xMzI0ODUgMC4xNDQwNzIgMC4xNDQwNzIgMC4xMzI0ODUgMC4xMDk3MDkgMC4wNzY2MDYgMC4wMzQ2MzYgLTAuMDEzOTg3IC0wLjA2NjEzNyAtMC4xMTc2OTYgLTAuMTYzNjIxIC0wLjE5ODI1NSAtMC4yMTU5NTMgLTAuMjEyMDY0IC0wLjE4NDE5MCAtMC4xMzM1MjcgLTAuMDY1ODc5IDAuMDA4MTU0IDAuMDc0MzcwIDAuMTE3ODMwIDAuMTI3MTUxIDAuMDk5MTc3IDAuMDQyMTkyIC0wLjAyNDQ2NyAtMC4wNzU3ODUgLTAuMDkwNzg5IC0wLjA2MzExMiBcbi0wLjAzMzA5NyAtMC4wNzkyNDIgLTAuMDkwMTMxIC0wLjA2MDY4OSAtMC4wMDMwNDQgMC4wNjEwNDEgMC4xMDk3MjEgMC4xMjgzNTEgMC4xMTI1NDAgMC4wNjcyNDYgMC4wMDM0NDAgLTAuMDY1ODc5IC0wLjEyOTAwOCAtMC4xNzc1NjggLTAuMjA3MTk0IC0wLjIxNzIxNyAtMC4yMDk3NzEgLTAuMTg4NzE1IC0wLjE1ODY1NyAtMC4xMjQyMDcgLTAuMDg5NDk4IC0wLjA1Nzk0MCAtMC4wMzIxNTAgLTAuMDEzOTg3IC0wLjAwNDYyMyAtMC4wMDQ2MjMgLTAuMDEzOTg3IC0wLjAzMjE1MCAtMC4wNTc5NDAgLTAuMDg5NDk4IC0wLjEyNDIwNyAtMC4xNTg2NTcgLTAuMTg4NzE1IC0wLjIwOTc3MSAtMC4yMTcyMTcgLTAuMjA3MTk0IC0wLjE3NzU2OCAtMC4xMjkwMDggLTAuMDY1ODc5IDAuMDAzNDQwIDAuMDY3MjQ2IDAuMTEyNTQwIDAuMTI4MzUxIDAuMTA5NzIxIDAuMDYxMDQxIC0wLjAwMzA0NCAtMC4wNjA2ODkgLTAuMDkwMTMxIC0wLjA3OTI0MiAtMC4wMzMwOTcgXG4wLjAwMjg0NiAtMC4wNTMxNjcgLTAuMDg3NjEwIC0wLjA4NDk2NiAtMC4wNDY1MDMgMC4wMTI5OTAgMC4wNzI5NjIgMC4xMTUwNDkgMC4xMjgyNjcgMC4xMTA1NDIgMC4wNjcyNDYgMC4wMDgxNTQgLTAuMDU1ODA0IC0wLjExNTA3MiAtMC4xNjI5MjIgLTAuMTk1ODY4IC0wLjIxMzM0NSAtMC4yMTY5ODQgLTAuMjA5NzcxIC0wLjE5NTI5NiAtMC4xNzcxNzQgLTAuMTU4NjU3IC0wLjE0MjQyNyAtMC4xMzA1MDAgLTAuMTI0MjA3IC0wLjEyNDIwNyAtMC4xMzA1MDAgLTAuMTQyNDI3IC0wLjE1ODY1NyAtMC4xNzcxNzQgLTAuMTk1Mjk2IC0wLjIwOTc3MSAtMC4yMTY5ODQgLTAuMjEzMzQ1IC0wLjE5NTg2OCAtMC4xNjI5MjIgLTAuMTE1MDcyIC0wLjA1NTgwNCAwLjAwODE1NCAwLjA2NzI0NiAwLjExMDU0MiAwLjEyODI2NyAwLjExNTA0OSAwLjA3Mjk2MiAwLjAxMjk5MCAtMC4wNDY1MDMgLTAuMDg0OTY2IC0wLjA4NzYxMCAtMC4wNTMxNjcgMC4wMDI4NDYgXG4wLjAzNzY5NSAtMC4wMTYzODkgLTAuMDY2NzczIC0wLjA5MDc4OSAtMC4wNzg4MDcgLTAuMDM1ODc4IDAuMDIyNzQ0IDAuMDc4NjYwIDAuMTE2NjQ1IDAuMTI4MjY3IDAuMTEyNTQwIDAuMDc0MzcwIDAuMDIxOTcyIC0wLjAzNTY5NCAtMC4wOTA4NTIgLTAuMTM3OTc1IC0wLjE3NDA3NSAtMC4xOTg0MzcgLTAuMjEyMDY0IC0wLjIxNzA0MSAtMC4yMTU5NTMgLTAuMjExNDI4IC0wLjIwNTgxNiAtMC4yMDA5OTQgLTAuMTk4MjU1IC0wLjE5ODI1NSAtMC4yMDA5OTQgLTAuMjA1ODE2IC0wLjIxMTQyOCAtMC4yMTU5NTMgLTAuMjE3MDQxIC0wLjIxMjA2NCAtMC4xOTg0MzcgLTAuMTc0MDc1IC0wLjEzNzk3NSAtMC4wOTA4NTIgLTAuMDM1Njk0IDAuMDIxOTcyIDAuMDc0MzcwIDAuMTEyNTQwIDAuMTI4MjY3IDAuMTE2NjQ1IDAuMDc4NjYwIDAuMDIyNzQ0IC0wLjAzNTg3OCAtMC4wNzg4MDcgLTAuMDkwNzg5IC0wLjA2Njc3MyAtMC4wMTYzODkgMC4wMzc2OTUgXG4wLjA2MjkwMiAwLjAyMzM4NiAtMC4wMzA3NDggLTAuMDc1MDA1IC0wLjA5MTMyMCAtMC4wNzQxNTcgLTAuMDMwMjYyIDAuMDI2MDAwIDAuMDc4NjYwIDAuMTE1MDQ5IDAuMTI4MzUxIDAuMTE3ODMwIDAuMDg3NDM0IDAuMDQzNzIyIC0wLjAwNjEyOSAtMC4wNTU4MDQgLTAuMTAwNjYyIC0wLjEzNzk3NSAtMC4xNjY3NDcgLTAuMTg3MzEyIC0wLjIwMDg1NyAtMC4yMDg5ODUgLTAuMjEzMzQ1IC0wLjIxNTM3NSAtMC4yMTYxMTcgLTAuMjE2MTE3IC0wLjIxNTM3NSAtMC4yMTMzNDUgLTAuMjA4OTg1IC0wLjIwMDg1NyAtMC4xODczMTIgLTAuMTY2NzQ3IC0wLjEzNzk3NSAtMC4xMDA2NjIgLTAuMDU1ODA0IC0wLjAwNjEyOSAwLjA0MzcyMiAwLjA4NzQzNCAwLjExNzgzMCAwLjEyODM1MSAwLjExNTA0OSAwLjA3ODY2MCAwLjAyNjAwMCAtMC4wMzAyNjIgLTAuMDc0MTU3IC0wLjA5MTMyMCAtMC4wNzUwMDUgLTAuMDMwNzQ4IDAuMDIzMzg2IDAuMDYyOTAyIFxuMC4wNzA3NjIgMC4wNTU3OTYgMC4wMTIxOTkgLTAuMDQwMDI4IC0wLjA3OTI0MiAtMC4wOTEwOTMgLTAuMDcyNDUzIC0wLjAzMDI2MiAwLjAyMjc0NCAwLjA3Mjk2MiAwLjEwOTcyMSAwLjEyNzE1MSAwLjEyNDI2NiAwLjEwMzg1MCAwLjA3MDg1NSAwLjAzMDg4MCAtMC4wMTA5NzcgLTAuMDUwNzY1IC0wLjA4NTkwMCAtMC4xMTUwNzIgLTAuMTM3OTc1IC0wLjE1NDk2OCAtMC4xNjY3NDcgLTAuMTc0MDc1IC0wLjE3NzU2OCAtMC4xNzc1NjggLTAuMTc0MDc1IC0wLjE2Njc0NyAtMC4xNTQ5NjggLTAuMTM3OTc1IC0wLjExNTA3MiAtMC4wODU5MDAgLTAuMDUwNzY1IC0wLjAxMDk3NyAwLjAzMDg4MCAwLjA3MDg1NSAwLjEwMzg1MCAwLjEyNDI2NiAwLjEyNzE1MSAwLjEwOTcyMSAwLjA3Mjk2MiAwLjAyMjc0NCAtMC4wMzAyNjIgLTAuMDcyNDUzIC0wLjA5MTA5MyAtMC4wNzkyNDIgLTAuMDQwMDI4IDAuMDEyMTk5IDAuMDU1Nzk2IDAuMDcwNzYyIFxuMC4wNTc0NzggMC4wNzA2NTkgMC4wNDk5MjMgMC4wMDUyMTAgLTAuMDQ0NTI5IC0wLjA4MDUyOCAtMC4wOTEwOTMgLTAuMDc0MTU3IC0wLjAzNTg3OCAwLjAxMjk5MCAwLjA2MTA0MSAwLjA5OTE3NyAwLjEyMjA3MyAwLjEyODI2NyAwLjExOTM1NyAwLjA5ODgxOSAwLjA3MDg1NSAwLjAzOTUxNSAwLjAwODE1NCAtMC4wMjA3ODAgLTAuMDQ1NzMxIC0wLjA2NTg3OSAtMC4wODA5MjIgLTAuMDkwODUyIC0wLjA5NTc3NCAtMC4wOTU3NzQgLTAuMDkwODUyIC0wLjA4MDkyMiAtMC4wNjU4NzkgLTAuMDQ1NzMxIC0wLjAyMDc4MCAwLjAwODE1NCAwLjAzOTUxNSAwLjA3MDg1NSAwLjA5ODgxOSAwLjExOTM1NyAwLjEyODI2NyAwLjEyMjA3MyAwLjA5OTE3NyAwLjA2MTA0MSAwLjAxMjk5MCAtMC4wMzU4NzggLTAuMDc0MTU3IC0wLjA5MTA5MyAtMC4wODA1MjggLTAuMDQ0NTI5IDAuMDA1MjEwIDAuMDQ5OTIzIDAuMDcwNjU5IDAuMDU3NDc4IFxuMC4wMjU4NjEgMC4wNjE5MjMgMC4wNjk4MjggMC4wNDY2NzEgMC4wMDI4NDYgLTAuMDQ0NTI5IC0wLjA3OTI0MiAtMC4wOTEzMjAgLTAuMDc4ODA3IC0wLjA0NjUwMyAtMC4wMDMwNDQgMC4wNDIxOTIgMC4wODE0MzQgMC4xMDk3MjEgMC4xMjUwODkgMC4xMjgwNTAgMC4xMjA3NjMgMC4xMDYxOTUgMC4wODc0MzQgMC4wNjcyNDYgMC4wNDc4NTIgMC4wMzA4ODAgMC4wMTc0MjMgMC4wMDgxNTQgMC4wMDM0NDAgMC4wMDM0NDAgMC4wMDgxNTQgMC4wMTc0MjMgMC4wMzA4ODAgMC4wNDc4NTIgMC4wNjcyNDYgMC4wODc0MzQgMC4xMDYxOTUgMC4xMjA3NjMgMC4xMjgwNTAgMC4xMjUwODkgMC4xMDk3MjEgMC4wODE0MzQgMC4wNDIxOTIgLTAuMDAzMDQ0IC0wLjA0NjUwMyAtMC4wNzg4MDcgLTAuMDkxMzIwIC0wLjA3OTI0MiAtMC4wNDQ1MjkgMC4wMDI4NDYgMC4wNDY2NzEgMC4wNjk4MjggMC4wNjE5MjMgMC4wMjU4NjEgXG4tMC4wMTM4NzYgMC4wMzEzMzMgMC4wNjM4NDEgMC4wNjk0MjIgMC4wNDY2NzEgMC4wMDUyMTAgLTAuMDQwMDI4IC0wLjA3NTAwNSAtMC4wOTA3ODkgLTAuMDg0OTY2IC0wLjA2MDY4OSAtMC4wMjQ0NjcgMC4wMTYyMzYgMC4wNTQ4NjQgMC4wODY4MTUgMC4xMDk3MjEgMC4xMjMxODIgMC4xMjgyMjEgMC4xMjY2OTMgMC4xMjA3NjMgMC4xMTI1NDAgMC4xMDM4NTAgMC4wOTYxMzYgMC4wOTA0NDIgMC4wODc0MzQgMC4wODc0MzQgMC4wOTA0NDIgMC4wOTYxMzYgMC4xMDM4NTAgMC4xMTI1NDAgMC4xMjA3NjMgMC4xMjY2OTMgMC4xMjgyMjEgMC4xMjMxODIgMC4xMDk3MjEgMC4wODY4MTUgMC4wNTQ4NjQgMC4wMTYyMzYgLTAuMDI0NDY3IC0wLjA2MDY4OSAtMC4wODQ5NjYgLTAuMDkwNzg5IC0wLjA3NTAwNSAtMC4wNDAwMjggMC4wMDUyMTAgMC4wNDY2NzEgMC4wNjk0MjIgMC4wNjM4NDEgMC4wMzEzMzMgLTAuMDEzODc2IFxuLTAuMDQ2NTU3IC0wLjAxMDIyMCAwLjAzMzExNyAwLjA2Mzg0MSAwLjA2OTgyOCAwLjA0OTkyMyAwLjAxMjE5OSAtMC4wMzA3NDggLTAuMDY2NzczIC0wLjA4NzYxMCAtMC4wOTAxMzEgLTAuMDc1Nzg1IC0wLjA0OTAyMSAtMC4wMTU0NzkgMC4wMTk0ODggMC4wNTE3MzEgMC4wNzg2NjAgMC4wOTkxNzcgMC4xMTMzNjIgMC4xMjIwNzMgMC4xMjY1NzMgMC4xMjgyMjEgMC4xMjgyNjcgMC4xMjc3MTUgMC4xMjcyNjMgMC4xMjcyNjMgMC4xMjc3MTUgMC4xMjgyNjcgMC4xMjgyMjEgMC4xMjY1NzMgMC4xMjIwNzMgMC4xMTMzNjIgMC4wOTkxNzcgMC4wNzg2NjAgMC4wNTE3MzEgMC4wMTk0ODggLTAuMDE1NDc5IC0wLjA0OTAyMSAtMC4wNzU3ODUgLTAuMDkwMTMxIC0wLjA4NzYxMCAtMC4wNjY3NzMgLTAuMDMwNzQ4IDAuMDEyMTk5IDAuMDQ5OTIzIDAuMDY5ODI4IDAuMDYzODQxIDAuMDMzMTE3IC0wLjAxMDIyMCAtMC4wNDY1NTcgXG4tMC4wNTc4NjkgLTAuMDQ1NDcwIC0wLjAxMDIyMCAwLjAzMTMzMyAwLjA2MTkyMyAwLjA3MDY1OSAwLjA1NTc5NiAwLjAyMzM4NiAtMC4wMTYzODkgLTAuMDUzMTY3IC0wLjA3OTI0MiAtMC4wOTA3ODkgLTAuMDg3Njc5IC0wLjA3MjQ1MyAtMC4wNDkwMjEgLTAuMDIxNTA4IDAuMDA2NTMwIDAuMDMyNTAzIDAuMDU0ODY0IDAuMDcyOTYyIDAuMDg2ODE1IDAuMDk2ODQwIDAuMTAzNjMxIDAuMTA3NzczIDAuMTA5NzIxIDAuMTA5NzIxIDAuMTA3NzczIDAuMTAzNjMxIDAuMDk2ODQwIDAuMDg2ODE1IDAuMDcyOTYyIDAuMDU0ODY0IDAuMDMyNTAzIDAuMDA2NTMwIC0wLjAyMTUwOCAtMC4wNDkwMjEgLTAuMDcyNDUzIC0wLjA4NzY3OSAtMC4wOTA3ODkgLTAuMDc5MjQyIC0wLjA1MzE2NyAtMC4wMTYzODkgMC4wMjMzODYgMC4wNTU3OTYgMC4wNzA2NTkgMC4wNjE5MjMgMC4wMzEzMzMgLTAuMDEwMjIwIC0wLjA0NTQ3MCAtMC4wNTc4NjkgXG4tMC4wNDE3MjIgLTAuMDU3ODY5IC0wLjA0NjU1NyAtMC4wMTM4NzYgMC4wMjU4NjEgMC4wNTc0NzggMC4wNzA3NjIgMC4wNjI5MDIgMC4wMzc2OTUgMC4wMDI4NDYgLTAuMDMzMDk3IC0wLjA2MzExMiAtMC4wODI5MDEgLTAuMDkxMDQzIC0wLjA4ODQxNyAtMC4wNzczMzUgLTAuMDYwNjg5IC0wLjA0MTI5NyAtMC4wMjE1MDggLTAuMDAzMDQ0IDAuMDEyOTkwIDAuMDI2MDAwIDAuMDM1NzQ1IDAuMDQyMTkyIDAuMDQ1MzkyIDAuMDQ1MzkyIDAuMDQyMTkyIDAuMDM1NzQ1IDAuMDI2MDAwIDAuMDEyOTkwIC0wLjAwMzA0NCAtMC4wMjE1MDggLTAuMDQxMjk3IC0wLjA2MDY4OSAtMC4wNzczMzUgLTAuMDg4NDE3IC0wLjA5MTA0MyAtMC4wODI5MDEgLTAuMDYzMTEyIC0wLjAzMzA5NyAwLjAwMjg0NiAwLjAzNzY5NSAwLjA2MjkwMiAwLjA3MDc2MiAwLjA1NzQ3OCAwLjAyNTg2MSAtMC4wMTM4NzYgLTAuMDQ2NTU3IC0wLjA1Nzg2OSAtMC4wNDE3MjIgXG4iLCAiTUlNRXR5cGUiIDogImFwcGxpY2F0aW9uL3gtdmdmYyJ9"
        }
      );
      this.returnedUnmodifiedArtifacts.artifacts.push(
        {
          "type" : "file",
          "identifier" : "cc3c1cf9-c02d-4694-902c-93c298d68d02",
          "MIMEtype": "text/plain",
          "path": "/test/text.c",
          "content": "dm9pZCBiYXIoKSB7IC8qIFNjaHJlaWJlbiBTaWUgaGllciBDb2RlLCBkZXIgImJhciIgYXVzZ2lidC4gKi8KCn0K"
        }
      );
      this.returnedUnmodifiedArtifacts.artifacts.push(
        {
          "type" : "file",
          "identifier" : "ac3c1cf9-c02d-4694-902c-93c298d68d02",
          "MIMEtype": "application/x-vgf",
          "path": "/test/vipplot.vgf",
          "content": "eyJpZGVudGlmaWVyIiA6ICJ2aXBwbG90LnZnZiIsICJ2YWx1ZSIgOiAiIyBjb2xvciAwIDIwMCAxNTBcbiMgc3ltYm9sIG5vbmVcbiMgbGluZXN0eWxlIHNvbGlkXG4jIGxlZ2VuZCBleHBsaWNpdCBldWxlclxuIDAuMDAwMDAwIDAuMDAwMDAwIDAuMDIwMDAwIDAuMDAwMDAwXG4gMC4wMjAwMDAgMC4wMDAwMDAgMC4wNDAwMDAgMC4wMDAyNzlcbiAwLjA0MDAwMCAwLjAwMDI3OSAwLjA2MDAwMCAwLjAwMDI1NVxuIDAuMDYwMDAwIDAuMDAwMjU1IDAuMDgwMDAwIC0wLjAwMDYzMFxuIDAuMDgwMDAwIC0wLjAwMDYzMCAwLjEwMDAwMCAtMC4wMDIyMjdcbiAwLjEwMDAwMCAtMC4wMDIyMjcgMC4xMjAwMDAgLTAuMDAzNTM0XG4gMC4xMjAwMDAgLTAuMDAzNTM0IDAuMTQwMDAwIC0wLjAwMzMyNFxuIDAuMTQwMDAwIC0wLjAwMzMyNCAwLjE2MDAwMCAtMC4wMDExNTNcbiAwLjE2MDAwMCAtMC4wMDExNTMgMC4xODAwMDAgMC4wMDIwMjZcbiAwLjE4MDAwMCAwLjAwMjAyNiAwLjIwMDAwMCAwLjAwNDIxNlxuIDAuMjAwMDAwIDAuMDA0MjE2IDAuMjIwMDAwIDAuMDAzNjM0XG4gMC4yMjAwMDAgMC4wMDM2MzQgMC4yNDAwMDAgMC4wMDAwNjVcbiAwLjI0MDAwMCAwLjAwMDA2NSAwLjI2MDAwMCAtMC4wMDQ2NjJcbiAwLjI2MDAwMCAtMC4wMDQ2NjIgMC4yODAwMDAgLTAuMDA3NTc5XG4gMC4yODAwMDAgLTAuMDA3NTc5IDAuMzAwMDAwIC0wLjAwNjQ0MlxuIDAuMzAwMDAwIC0wLjAwNjQ0MiAwLjMyMDAwMCAtMC4wMDEzNzlcbiAwLjMyMDAwMCAtMC4wMDEzNzkgMC4zNDAwMDAgMC4wMDQ4NDdcbiAwLjM0MDAwMCAwLjAwNDg0NyAwLjM2MDAwMCAwLjAwODMyN1xuIDAuMzYwMDAwIDAuMDA4MzI3IDAuMzgwMDAwIDAuMDA2NDU2XG4gMC4zODAwMDAgMC4wMDY0NTYgMC40MDAwMDAgLTAuMDAwMTg0XG4gMC40MDAwMDAgLTAuMDAwMTg0IDAuNDIwMDAwIC0wLjAwNzg0NVxuIDAuNDIwMDAwIC0wLjAwNzg0NSAwLjQ0MDAwMCAtMC4wMTE3MTVcbiAwLjQ0MDAwMCAtMC4wMTE3MTUgMC40NjAwMDAgLTAuMDA4OTM3XG4gMC40NjAwMDAgLTAuMDA4OTM3IDAuNDgwMDAwIC0wLjAwMDY1MVxuIDAuNDgwMDAwIC0wLjAwMDY1MSAwLjUwMDAwMCAwLjAwODM2NlxuIDAuNTAwMDAwIDAuMDA4MzY2IDAuNTIwMDAwIDAuMDEyNDQ3XG4gMC41MjAwMDAgMC4wMTI0NDcgMC41NDAwMDAgMC4wMDg1OTNcbiAwLjU0MDAwMCAwLjAwODU5MyAwLjU2MDAwMCAtMC4wMDEzOTJcbiAwLjU2MDAwMCAtMC4wMDEzOTIgMC41ODAwMDAgLTAuMDExNjY5XG4gMC41ODAwMDAgLTAuMDExNjY5IDAuNjAwMDAwIC0wLjAxNTc3NlxuIDAuNjAwMDAwIC0wLjAxNTc3NiAwLjYyMDAwMCAtMC4wMTA2ODZcbiAwLjYyMDAwMCAtMC4wMTA2ODYgMC42NDAwMDAgMC4wMDEwMzRcbiAwLjY0MDAwMCAwLjAwMTAzNCAwLjY2MDAwMCAwLjAxMjQ2MlxuIDAuNjYwMDAwIDAuMDEyNDYyIDAuNjgwMDAwIDAuMDE2NDA3XG4gMC42ODAwMDAgMC4wMTY0MDcgMC43MDAwMDAgMC4wMDk5MjlcbiAwLjcwMDAwMCAwLjAwOTkyOSAwLjcyMDAwMCAtMC4wMDM1NDdcbiAwLjcyMDAwMCAtMC4wMDM1NDcgMC43NDAwMDAgLTAuMDE2MDAzXG4gMC43NDAwMDAgLTAuMDE2MDAzIDAuNzYwMDAwIC0wLjAxOTU5NVxuIDAuNzYwMDAwIC0wLjAxOTU5NSAwLjc4MDAwMCAtMC4wMTE1ODdcbiAwLjc4MDAwMCAtMC4wMTE1ODcgMC44MDAwMDAgMC4wMDM2NTFcbiAwLjgwMDAwMCAwLjAwMzY1MSAwLjgyMDAwMCAwLjAxNjk5OFxuIDAuODIwMDAwIDAuMDE2OTk4IDAuODQwMDAwIDAuMDIwMDQzXG4gMC44NDAwMDAgMC4wMjAwNDMgMC44NjAwMDAgMC4wMTAzNzRcbiAwLjg2MDAwMCAwLjAxMDM3NCAwLjg4MDAwMCAtMC4wMDY2MTNcbiAwLjg4MDAwMCAtMC4wMDY2MTMgMC45MDAwMDAgLTAuMDIwNzA0XG4gMC45MDAwMDAgLTAuMDIwNzA0IDAuOTIwMDAwIC0wLjAyMzAwN1xuIDAuOTIwMDAwIC0wLjAyMzAwNyAwLjk0MDAwMCAtMC4wMTE1NTdcbiAwLjk0MDAwMCAtMC4wMTE1NTcgMC45NjAwMDAgMC4wMDcxNTFcbiAwLjk2MDAwMCAwLjAwNzE1MSAwLjk4MDAwMCAwLjAyMTgyNVxuIDAuOTgwMDAwIDAuMDIxODI1IDEuMDAwMDAwIDAuMDIzMTk0XG4jIGNvbG9yIDIwMCAxNTAgMFxuIyBzeW1ib2wgbm9uZVxuIyBsaW5lc3R5bGUgc29saWRcbiMgbGVnZW5kIGhldW5cbiAwLjAwMDAwMCAwLjAwMDAwMCAwLjAyMDAwMCAwLjAwMDEzOVxuIDAuMDIwMDAwIDAuMDAwMTM5IDAuMDQwMDAwIDAuMDAwMjY3XG4gMC4wNDAwMDAgMC4wMDAyNjcgMC4wNjAwMDAgLTAuMDAwMTg3XG4gMC4wNjAwMDAgLTAuMDAwMTg3IDAuMDgwMDAwIC0wLjAwMTQyOFxuIDAuMDgwMDAwIC0wLjAwMTQyOCAwLjEwMDAwMCAtMC4wMDI4ODBcbiAwLjEwMDAwMCAtMC4wMDI4ODAgMC4xMjAwMDAgLTAuMDAzNDI5XG4gMC4xMjAwMDAgLTAuMDAzNDI5IDAuMTQwMDAwIC0wLjAwMjIzOFxuIDAuMTQwMDAwIC0wLjAwMjIzOCAwLjE2MDAwMCAwLjAwMDQzN1xuIDAuMTYwMDAwIDAuMDAwNDM3IDAuMTgwMDAwIDAuMDAzMTIxXG4gMC4xODAwMDAgMC4wMDMxMjEgMC4yMDAwMDAgMC4wMDM5MjVcbiAwLjIwMDAwMCAwLjAwMzkyNSAwLjIyMDAwMCAwLjAwMTg0OVxuIDAuMjIwMDAwIDAuMDAxODQ5IDAuMjQwMDAwIC0wLjAwMjI5OFxuIDAuMjQwMDAwIC0wLjAwMjI5OCAwLjI2MDAwMCAtMC4wMDYxMjBcbiAwLjI2MDAwMCAtMC4wMDYxMjAgMC4yODAwMDAgLTAuMDA3MDEwXG4gMC4yODAwMDAgLTAuMDA3MDEwIDAuMzAwMDAwIC0wLjAwMzkxMFxuIDAuMzAwMDAwIC0wLjAwMzkxMCAwLjMyMDAwMCAwLjAwMTczNFxuIDAuMzIwMDAwIDAuMDAxNzM0IDAuMzQwMDAwIDAuMDA2NTg3XG4gMC4zNDAwMDAgMC4wMDY1ODcgMC4zNjAwMDAgMC4wMDczOTJcbiAwLjM2MDAwMCAwLjAwNzM5MiAwLjM4MDAwMCAwLjAwMzEzNlxuIDAuMzgwMDAwIDAuMDAzMTM2IDAuNDAwMDAwIC0wLjAwNDAxNVxuIDAuNDAwMDAwIC0wLjAwNDAxNSAwLjQyMDAwMCAtMC4wMDk3ODBcbiAwLjQyMDAwMCAtMC4wMDk3ODAgMC40NDAwMDAgLTAuMDEwMzI2XG4gMC40NDAwMDAgLTAuMDEwMzI2IDAuNDYwMDAwIC0wLjAwNDc5NFxuIDAuNDYwMDAwIC0wLjAwNDc5NCAwLjQ4MDAwMCAwLjAwMzg1OFxuIDAuNDgwMDAwIDAuMDAzODU4IDAuNTAwMDAwIDAuMDEwNDA2XG4gMC41MDAwMDAgMC4wMTA0MDYgMC41MjAwMDAgMC4wMTA1MjBcbiAwLjUyMDAwMCAwLjAxMDUyMCAwLjU0MDAwMCAwLjAwMzYwMFxuIDAuNTQwMDAwIDAuMDAzNjAwIDAuNTYwMDAwIC0wLjAwNjUzMFxuIDAuNTYwMDAwIC0wLjAwNjUzMCAwLjU4MDAwMCAtMC4wMTM3MjJcbiAwLjU4MDAwMCAtMC4wMTM3MjIgMC42MDAwMDAgLTAuMDEzMjMxXG4gMC42MDAwMDAgLTAuMDEzMjMxIDAuNjIwMDAwIC0wLjAwNDgyNlxuIDAuNjIwMDAwIC0wLjAwNDgyNiAwLjY0MDAwMCAwLjAwNjc0OFxuIDAuNjQwMDAwIDAuMDA2NzQ4IDAuNjYwMDAwIDAuMDE0NDM1XG4gMC42NjAwMDAgMC4wMTQ0MzUgMC42ODAwMDAgMC4wMTMxNjhcbiAwLjY4MDAwMCAwLjAxMzE2OCAwLjcwMDAwMCAwLjAwMzE5MVxuIDAuNzAwMDAwIDAuMDAzMTkxIDAuNzIwMDAwIC0wLjAwOTc3NVxuIDAuNzIwMDAwIC0wLjAwOTc3NSAwLjc0MDAwMCAtMC4wMTc3OTlcbiAwLjc0MDAwMCAtMC4wMTc3OTkgMC43NjAwMDAgLTAuMDE1NTkxXG4gMC43NjAwMDAgLTAuMDE1NTkxIDAuNzgwMDAwIC0wLjAwMzk2OFxuIDAuNzgwMDAwIC0wLjAwMzk2OCAwLjgwMDAwMCAwLjAxMDMyNVxuIDAuODAwMDAwIDAuMDEwMzI1IDAuODIwMDAwIDAuMDE4NTIxXG4gMC44MjAwMDAgMC4wMTg1MjEgMC44NDAwMDAgMC4wMTUyMDhcbiAwLjg0MDAwMCAwLjAxNTIwOCAwLjg2MDAwMCAwLjAwMTg4MFxuIDAuODYwMDAwIDAuMDAxODgwIDAuODgwMDAwIC0wLjAxMzY1OVxuIDAuODgwMDAwIC0wLjAxMzY1OSAwLjkwMDAwMCAtMC4wMjE4NTZcbiAwLjkwMDAwMCAtMC4wMjE4NTYgMC45MjAwMDAgLTAuMDE3MjgyXG4gMC45MjAwMDAgLTAuMDE3MjgyIDAuOTQwMDAwIC0wLjAwMjIwM1xuIDAuOTQwMDAwIC0wLjAwMjIwMyAwLjk2MDAwMCAwLjAxNDQ4OFxuIDAuOTYwMDAwIDAuMDE0NDg4IDAuOTgwMDAwIDAuMDIyNTA5XG4gMC45ODAwMDAgMC4wMjI1MDkgMS4wMDAwMDAgMC4wMTY1MjRcbiMgY29sb3IgMjAwIDAgMTUwXG4jIHN5bWJvbCBub25lXG4jIGxpbmVzdHlsZSBzb2xpZFxuIyBsZWdlbmQgUnVuZ2UtS3V0dGEgNFxuIDAuMDAwMDAwIDAuMDAwMDAwIDAuMDIwMDAwIDAuMDAwMTY5XG4gMC4wMjAwMDAgMC4wMDAxNjkgMC4wNDAwMDAgMC4wMDAzNTdcbiAwLjA0MDAwMCAwLjAwMDM1NyAwLjA2MDAwMCAtMC4wMDAwNzJcbiAwLjA2MDAwMCAtMC4wMDAwNzIgMC4wODAwMDAgLTAuMDAxMzY1XG4gMC4wODAwMDAgLTAuMDAxMzY1IDAuMTAwMDAwIC0wLjAwMjkyNVxuIDAuMTAwMDAwIC0wLjAwMjkyNSAwLjEyMDAwMCAtMC4wMDM1NTlcbiAwLjEyMDAwMCAtMC4wMDM1NTkgMC4xNDAwMDAgLTAuMDAyMzUwXG4gMC4xNDAwMDAgLTAuMDAyMzUwIDAuMTYwMDAwIDAuMDAwNDYyXG4gMC4xNjAwMDAgMC4wMDA0NjIgMC4xODAwMDAgMC4wMDMzMjdcbiAwLjE4MDAwMCAwLjAwMzMyNyAwLjIwMDAwMCAwLjAwNDIzMlxuIDAuMjAwMDAwIDAuMDA0MjMyIDAuMjIwMDAwIDAuMDAyMDg2XG4gMC4yMjAwMDAgMC4wMDIwODYgMC4yNDAwMDAgLTAuMDAyMjg2XG4gMC4yNDAwMDAgLTAuMDAyMjg2IDAuMjYwMDAwIC0wLjAwNjM1N1xuIDAuMjYwMDAwIC0wLjAwNjM1NyAwLjI4MDAwMCAtMC4wMDczNTNcbiAwLjI4MDAwMCAtMC4wMDczNTMgMC4zMDAwMDAgLTAuMDA0MTIyXG4gMC4zMDAwMDAgLTAuMDA0MTIyIDAuMzIwMDAwIDAuMDAxODM1XG4gMC4zMjAwMDAgMC4wMDE4MzUgMC4zNDAwMDAgMC4wMDY5OTlcbiAwLjM0MDAwMCAwLjAwNjk5OSAwLjM2MDAwMCAwLjAwNzkwNVxuIDAuMzYwMDAwIDAuMDA3OTA1IDAuMzgwMDAwIDAuMDAzNDUxXG4gMC4zODAwMDAgMC4wMDM0NTEgMC40MDAwMDAgLTAuMDA0MTAyXG4gMC40MDAwMDAgLTAuMDA0MTAyIDAuNDIwMDAwIC0wLjAxMDIzM1xuIDAuNDIwMDAwIC0wLjAxMDIzMyAwLjQ0MDAwMCAtMC4wMTA4NjZcbiAwLjQ0MDAwMCAtMC4wMTA4NjYgMC40NjAwMDAgLTAuMDA1MDYwXG4gMC40NjAwMDAgLTAuMDA1MDYwIDAuNDgwMDAwIDAuMDA0MDgyXG4gMC40ODAwMDAgMC4wMDQwODIgMC41MDAwMDAgMC4wMTEwNDRcbiAwLjUwMDAwMCAwLjAxMTA0NCAwLjUyMDAwMCAwLjAxMTIyMFxuIDAuNTIwMDAwIDAuMDExMjIwIDAuNTQwMDAwIDAuMDAzOTQ1XG4gMC41NDAwMDAgMC4wMDM5NDUgMC41NjAwMDAgLTAuMDA2NzY1XG4gMC41NjAwMDAgLTAuMDA2NzY1IDAuNTgwMDAwIC0wLjAxNDQwOFxuIDAuNTgwMDAwIC0wLjAxNDQwOCAwLjYwMDAwMCAtMC4wMTM5NDVcbiAwLjYwMDAwMCAtMC4wMTM5NDUgMC42MjAwMDAgLTAuMDA1MDk4XG4gMC42MjAwMDAgLTAuMDA1MDk4IDAuNjQwMDAwIDAuMDA3MTQxXG4gMC42NDAwMDAgMC4wMDcxNDEgMC42NjAwMDAgMC4wMTUzMTBcbiAwLjY2MDAwMCAwLjAxNTMxMCAwLjY4MDAwMCAwLjAxNDAyOFxuIDAuNjgwMDAwIDAuMDE0MDI4IDAuNzAwMDAwIDAuMDAzNTE1XG4gMC43MDAwMDAgMC4wMDM1MTUgMC43MjAwMDAgLTAuMDEwMTk5XG4gMC43MjAwMDAgLTAuMDEwMTk5IDAuNzQwMDAwIC0wLjAxODcyNlxuIDAuNzQwMDAwIC0wLjAxODcyNiAwLjc2MDAwMCAtMC4wMTY0NDdcbiAwLjc2MDAwMCAtMC4wMTY0NDcgMC43ODAwMDAgLTAuMDA0MTkzXG4gMC43ODAwMDAgLTAuMDA0MTkzIDAuODAwMDAwIDAuMDEwOTI3XG4gMC44MDAwMDAgMC4wMTA5MjcgMC44MjAwMDAgMC4wMTk2MzhcbiAwLjgyMDAwMCAwLjAxOTYzOCAwLjg0MDAwMCAwLjAxNjE5MVxuIDAuODQwMDAwIDAuMDE2MTkxIDAuODYwMDAwIDAuMDAyMTMxXG4gMC44NjAwMDAgMC4wMDIxMzEgMC44ODAwMDAgLTAuMDE0MzA5XG4gMC44ODAwMDAgLTAuMDE0MzA5IDAuOTAwMDAwIC0wLjAyMzAyM1xuIDAuOTAwMDAwIC0wLjAyMzAyMyAwLjkyMDAwMCAtMC4wMTgyNDJcbiAwLjkyMDAwMCAtMC4wMTgyNDIgMC45NDAwMDAgLTAuMDAyMzI5XG4gMC45NDAwMDAgLTAuMDAyMzI5IDAuOTYwMDAwIDAuMDE1MzMyXG4gMC45NjAwMDAgMC4wMTUzMzIgMC45ODAwMDAgMC4wMjM4NjNcbiAwLjk4MDAwMCAwLjAyMzg2MyAxLjAwMDAwMCAwLjAxNzU4OVxuIyBjb2xvciAwIDAgMjU1XG4jIHN5bWJvbCBub25lXG4jIGxpbmVzdHlsZSBzb2xpZFxuIyBsZWdlbmQgZXhhY3RcbiAwLjAwMDAwMCAwLjAwMDAwMCAwLjAyMDAwMCAwLjAwMDE2OVxuIDAuMDIwMDAwIDAuMDAwMTY5IDAuMDQwMDAwIDAuMDAwMzU2XG4gMC4wNDAwMDAgMC4wMDAzNTYgMC4wNjAwMDAgLTAuMDAwMDczXG4gMC4wNjAwMDAgLTAuMDAwMDczIDAuMDgwMDAwIC0wLjAwMTM2NlxuIDAuMDgwMDAwIC0wLjAwMTM2NiAwLjEwMDAwMCAtMC4wMDI5MjZcbiAwLjEwMDAwMCAtMC4wMDI5MjYgMC4xMjAwMDAgLTAuMDAzNTU5XG4gMC4xMjAwMDAgLTAuMDAzNTU5IDAuMTQwMDAwIC0wLjAwMjM1MFxuIDAuMTQwMDAwIC0wLjAwMjM1MCAwLjE2MDAwMCAwLjAwMDQ2MlxuIDAuMTYwMDAwIDAuMDAwNDYyIDAuMTgwMDAwIDAuMDAzMzI3XG4gMC4xODAwMDAgMC4wMDMzMjcgMC4yMDAwMDAgMC4wMDQyMzFcbiAwLjIwMDAwMCAwLjAwNDIzMSAwLjIyMDAwMCAwLjAwMjA4NVxuIDAuMjIwMDAwIDAuMDAyMDg1IDAuMjQwMDAwIC0wLjAwMjI4NlxuIDAuMjQwMDAwIC0wLjAwMjI4NiAwLjI2MDAwMCAtMC4wMDYzNTZcbiAwLjI2MDAwMCAtMC4wMDYzNTYgMC4yODAwMDAgLTAuMDA3MzUyXG4gMC4yODAwMDAgLTAuMDA3MzUyIDAuMzAwMDAwIC0wLjAwNDEyMlxuIDAuMzAwMDAwIC0wLjAwNDEyMiAwLjMyMDAwMCAwLjAwMTgzNVxuIDAuMzIwMDAwIDAuMDAxODM1IDAuMzQwMDAwIDAuMDA2OTk4XG4gMC4zNDAwMDAgMC4wMDY5OTggMC4zNjAwMDAgMC4wMDc5MDRcbiAwLjM2MDAwMCAwLjAwNzkwNCAwLjM4MDAwMCAwLjAwMzQ1MFxuIDAuMzgwMDAwIDAuMDAzNDUwIDAuNDAwMDAwIC0wLjAwNDEwM1xuIDAuNDAwMDAwIC0wLjAwNDEwMyAwLjQyMDAwMCAtMC4wMTAyMzJcbiAwLjQyMDAwMCAtMC4wMTAyMzIgMC40NDAwMDAgLTAuMDEwODY1XG4gMC40NDAwMDAgLTAuMDEwODY1IDAuNDYwMDAwIC0wLjAwNTA2MFxuIDAuNDYwMDAwIC0wLjAwNTA2MCAwLjQ4MDAwMCAwLjAwNDA4MlxuIDAuNDgwMDAwIDAuMDA0MDgyIDAuNTAwMDAwIDAuMDExMDQyXG4gMC41MDAwMDAgMC4wMTEwNDIgMC41MjAwMDAgMC4wMTEyMThcbiAwLjUyMDAwMCAwLjAxMTIxOCAwLjU0MDAwMCAwLjAwMzk0NFxuIDAuNTQwMDAwIDAuMDAzOTQ0IDAuNTYwMDAwIC0wLjAwNjc2NFxuIDAuNTYwMDAwIC0wLjAwNjc2NCAwLjU4MDAwMCAtMC4wMTQ0MDdcbiAwLjU4MDAwMCAtMC4wMTQ0MDcgMC42MDAwMDAgLTAuMDEzOTQ0XG4gMC42MDAwMDAgLTAuMDEzOTQ0IDAuNjIwMDAwIC0wLjAwNTA5N1xuIDAuNjIwMDAwIC0wLjAwNTA5NyAwLjY0MDAwMCAwLjAwNzE0MFxuIDAuNjQwMDAwIDAuMDA3MTQwIDAuNjYwMDAwIDAuMDE1MzA4XG4gMC42NjAwMDAgMC4wMTUzMDggMC42ODAwMDAgMC4wMTQwMjVcbiAwLjY4MDAwMCAwLjAxNDAyNSAwLjcwMDAwMCAwLjAwMzUxNFxuIDAuNzAwMDAwIDAuMDAzNTE0IDAuNzIwMDAwIC0wLjAxMDE5OFxuIDAuNzIwMDAwIC0wLjAxMDE5OCAwLjc0MDAwMCAtMC4wMTg3MjRcbiAwLjc0MDAwMCAtMC4wMTg3MjQgMC43NjAwMDAgLTAuMDE2NDQ1XG4gMC43NjAwMDAgLTAuMDE2NDQ1IDAuNzgwMDAwIC0wLjAwNDE5MlxuIDAuNzgwMDAwIC0wLjAwNDE5MiAwLjgwMDAwMCAwLjAxMDkyNVxuIDAuODAwMDAwIDAuMDEwOTI1IDAuODIwMDAwIDAuMDE5NjM1XG4gMC44MjAwMDAgMC4wMTk2MzUgMC44NDAwMDAgMC4wMTYxODhcbiAwLjg0MDAwMCAwLjAxNjE4OCAwLjg2MDAwMCAwLjAwMjEzMFxuIDAuODYwMDAwIDAuMDAyMTMwIDAuODgwMDAwIC0wLjAxNDMwN1xuIDAuODgwMDAwIC0wLjAxNDMwNyAwLjkwMDAwMCAtMC4wMjMwMjBcbiAwLjkwMDAwMCAtMC4wMjMwMjAgMC45MjAwMDAgLTAuMDE4MjQwXG4gMC45MjAwMDAgLTAuMDE4MjQwIDAuOTQwMDAwIC0wLjAwMjMyOFxuIDAuOTQwMDAwIC0wLjAwMjMyOCAwLjk2MDAwMCAwLjAxNTMzMFxuIDAuOTYwMDAwIDAuMDE1MzMwIDAuOTgwMDAwIDAuMDIzODU5XG4gMC45ODAwMDAgMC4wMjM4NTkgMS4wMDAwMDAgMC4wMTc1ODZcbiMgbmV3ZnJhbWVcbiMgdGl0bGUgYWJzb2x1dGUgZXJyb3JcbiMgeC1sYWJlbCB4XG4jIHktbGFiZWwgZXJyb3JcbiMgc2NhbGUgXG4jIGNvbG9yIDAgMjAwIDE1MFxuIyBzeW1ib2wgbm9uZVxuIyBsaW5lc3R5bGUgc29saWRcbiMgbGVnZW5kIGV4cGxpY2l0IGV1bGVyXG4gMC4wMDAwMDAgMC4wMDAwMDAgMC4wMjAwMDAgMC4wMDAxNjlcbiAwLjAyMDAwMCAwLjAwMDE2OSAwLjA0MDAwMCAwLjAwMDA3OFxuIDAuMDQwMDAwIDAuMDAwMDc4IDAuMDYwMDAwIDAuMDAwMzI4XG4gMC4wNjAwMDAgMC4wMDAzMjggMC4wODAwMDAgMC4wMDA3MzZcbiAwLjA4MDAwMCAwLjAwMDczNiAwLjEwMDAwMCAwLjAwMDY5OVxuIDAuMTAwMDAwIDAuMDAwNjk5IDAuMTIwMDAwIDAuMDAwMDI1XG4gMC4xMjAwMDAgMC4wMDAwMjUgMC4xNDAwMDAgMC4wMDA5NzRcbiAwLjE0MDAwMCAwLjAwMDk3NCAwLjE2MDAwMCAwLjAwMTYxNFxuIDAuMTYwMDAwIDAuMDAxNjE0IDAuMTgwMDAwIDAuMDAxMzAxXG4gMC4xODAwMDAgMC4wMDEzMDEgMC4yMDAwMDAgMC4wMDAwMTVcbiAwLjIwMDAwMCAwLjAwMDAxNSAwLjIyMDAwMCAwLjAwMTU0OVxuIDAuMjIwMDAwIDAuMDAxNTQ5IDAuMjQwMDAwIDAuMDAyMzUxXG4gMC4yNDAwMDAgMC4wMDIzNTEgMC4yNjAwMDAgMC4wMDE2OTVcbiAwLjI2MDAwMCAwLjAwMTY5NSAwLjI4MDAwMCAwLjAwMDIyNlxuIDAuMjgwMDAwIDAuMDAwMjI2IDAuMzAwMDAwIDAuMDAyMzIwXG4gMC4zMDAwMDAgMC4wMDIzMjAgMC4zMjAwMDAgMC4wMDMyMTRcbiAwLjMyMDAwMCAwLjAwMzIxNCAwLjM0MDAwMCAwLjAwMjE1MFxuIDAuMzQwMDAwIDAuMDAyMTUwIDAuMzYwMDAwIDAuMDAwNDIzXG4gMC4zNjAwMDAgMC4wMDA0MjMgMC4zODAwMDAgMC4wMDMwMDdcbiAwLjM4MDAwMCAwLjAwMzAwNyAwLjQwMDAwMCAwLjAwMzkxOFxuIDAuNDAwMDAwIDAuMDAzOTE4IDAuNDIwMDAwIDAuMDAyMzg3XG4gMC40MjAwMDAgMC4wMDIzODcgMC40NDAwMDAgMC4wMDA4NTBcbiAwLjQ0MDAwMCAwLjAwMDg1MCAwLjQ2MDAwMCAwLjAwMzg3N1xuIDAuNDYwMDAwIDAuMDAzODc3IDAuNDgwMDAwIDAuMDA0NzMyXG4gMC40ODAwMDAgMC4wMDQ3MzIgMC41MDAwMDAgMC4wMDI2NzZcbiAwLjUwMDAwMCAwLjAwMjY3NiAwLjUyMDAwMCAwLjAwMTIyOVxuIDAuNTIwMDAwIDAuMDAxMjI5IDAuNTQwMDAwIDAuMDA0NjQ4XG4gMC41NDAwMDAgMC4wMDQ2NDggMC41NjAwMDAgMC4wMDUzNzJcbiAwLjU2MDAwMCAwLjAwNTM3MiAwLjU4MDAwMCAwLjAwMjczOFxuIDAuNTgwMDAwIDAuMDAyNzM4IDAuNjAwMDAwIDAuMDAxODMzXG4gMC42MDAwMDAgMC4wMDE4MzMgMC42MjAwMDAgMC4wMDU1ODlcbiAwLjYyMDAwMCAwLjAwNTU4OSAwLjY0MDAwMCAwLjAwNjEwNlxuIDAuNjQwMDAwIDAuMDA2MTA2IDAuNjYwMDAwIDAuMDAyODQ2XG4gMC42NjAwMDAgMC4wMDI4NDYgMC42ODAwMDAgMC4wMDIzODJcbiAwLjY4MDAwMCAwLjAwMjM4MiAwLjcwMDAwMCAwLjAwNjQxNVxuIDAuNzAwMDAwIDAuMDA2NDE1IDAuNzIwMDAwIDAuMDA2NjUxXG4gMC43MjAwMDAgMC4wMDY2NTEgMC43NDAwMDAgMC4wMDI3MjFcbiAwLjc0MDAwMCAwLjAwMjcyMSAwLjc2MDAwMCAwLjAwMzE1MFxuIDAuNzYwMDAwIDAuMDAzMTUwIDAuNzgwMDAwIDAuMDA3Mzk0XG4gMC43ODAwMDAgMC4wMDczOTQgMC44MDAwMDAgMC4wMDcyNzRcbiAwLjgwMDAwMCAwLjAwNzI3NCAwLjgyMDAwMCAwLjAwMjYzNlxuIDAuODIwMDAwIDAuMDAyNjM2IDAuODQwMDAwIDAuMDAzODU1XG4gMC44NDAwMDAgMC4wMDM4NTUgMC44NjAwMDAgMC4wMDgyNDNcbiAwLjg2MDAwMCAwLjAwODI0MyAwLjg4MDAwMCAwLjAwNzY5NFxuIDAuODgwMDAwIDAuMDA3Njk0IDAuOTAwMDAwIDAuMDAyMzE2XG4gMC45MDAwMDAgMC4wMDIzMTYgMC45MjAwMDAgMC4wMDQ3NjhcbiAwLjkyMDAwMCAwLjAwNDc2OCAwLjk0MDAwMCAwLjAwOTIyOVxuIDAuOTQwMDAwIDAuMDA5MjI5IDAuOTYwMDAwIDAuMDA4MTgwXG4gMC45NjAwMDAgMC4wMDgxODAgMC45ODAwMDAgMC4wMDIwMzRcbiAwLjk4MDAwMCAwLjAwMjAzNCAxLjAwMDAwMCAwLjAwNTYwOFxuIyBjb2xvciAyMDAgMTUwIDBcbiMgc3ltYm9sIG5vbmVcbiMgbGluZXN0eWxlIHNvbGlkXG4jIGxlZ2VuZCBoZXVuXG4gMC4wMDAwMDAgMC4wMDAwMDAgMC4wMjAwMDAgMC4wMDAwMzBcbiAwLjAyMDAwMCAwLjAwMDAzMCAwLjA0MDAwMCAwLjAwMDA4OVxuIDAuMDQwMDAwIDAuMDAwMDg5IDAuMDYwMDAwIDAuMDAwMTE0XG4gMC4wNjAwMDAgMC4wMDAxMTQgMC4wODAwMDAgMC4wMDAwNjNcbiAwLjA4MDAwMCAwLjAwMDA2MyAwLjEwMDAwMCAwLjAwMDA0NVxuIDAuMTAwMDAwIDAuMDAwMDQ1IDAuMTIwMDAwIDAuMDAwMTMwXG4gMC4xMjAwMDAgMC4wMDAxMzAgMC4xNDAwMDAgMC4wMDAxMTFcbiAwLjE0MDAwMCAwLjAwMDExMSAwLjE2MDAwMCAwLjAwMDAyNVxuIDAuMTYwMDAwIDAuMDAwMDI1IDAuMTgwMDAwIDAuMDAwMjA2XG4gMC4xODAwMDAgMC4wMDAyMDYgMC4yMDAwMDAgMC4wMDAzMDZcbiAwLjIwMDAwMCAwLjAwMDMwNiAwLjIyMDAwMCAwLjAwMDIzNlxuIDAuMjIwMDAwIDAuMDAwMjM2IDAuMjQwMDAwIDAuMDAwMDEyXG4gMC4yNDAwMDAgMC4wMDAwMTIgMC4yNjAwMDAgMC4wMDAyMzZcbiAwLjI2MDAwMCAwLjAwMDIzNiAwLjI4MDAwMCAwLjAwMDM0MlxuIDAuMjgwMDAwIDAuMDAwMzQyIDAuMzAwMDAwIDAuMDAwMjEyXG4gMC4zMDAwMDAgMC4wMDAyMTIgMC4zMjAwMDAgMC4wMDAxMDFcbiAwLjMyMDAwMCAwLjAwMDEwMSAwLjM0MDAwMCAwLjAwMDQxMVxuIDAuMzQwMDAwIDAuMDAwNDExIDAuMzYwMDAwIDAuMDAwNTEyXG4gMC4zNjAwMDAgMC4wMDA1MTIgMC4zODAwMDAgMC4wMDAzMTRcbiAwLjM4MDAwMCAwLjAwMDMxNCAwLjQwMDAwMCAwLjAwMDA4OFxuIDAuNDAwMDAwIDAuMDAwMDg4IDAuNDIwMDAwIDAuMDAwNDUyXG4gMC40MjAwMDAgMC4wMDA0NTIgMC40NDAwMDAgMC4wMDA1MzlcbiAwLjQ0MDAwMCAwLjAwMDUzOSAwLjQ2MDAwMCAwLjAwMDI2NlxuIDAuNDYwMDAwIDAuMDAwMjY2IDAuNDgwMDAwIDAuMDAwMjI0XG4gMC40ODAwMDAgMC4wMDAyMjQgMC41MDAwMDAgMC4wMDA2MzZcbiAwLjUwMDAwMCAwLjAwMDYzNiAwLjUyMDAwMCAwLjAwMDY5OFxuIDAuNTIwMDAwIDAuMDAwNjk4IDAuNTQwMDAwIDAuMDAwMzQ0XG4gMC41NDAwMDAgMC4wMDAzNDQgMC41NjAwMDAgMC4wMDAyMzRcbiAwLjU2MDAwMCAwLjAwMDIzNCAwLjU4MDAwMCAwLjAwMDY4NFxuIDAuNTgwMDAwIDAuMDAwNjg0IDAuNjAwMDAwIDAuMDAwNzEyXG4gMC42MDAwMDAgMC4wMDA3MTIgMC42MjAwMDAgMC4wMDAyNzFcbiAwLjYyMDAwMCAwLjAwMDI3MSAwLjY0MDAwMCAwLjAwMDM5MlxuIDAuNjQwMDAwIDAuMDAwMzkyIDAuNjYwMDAwIDAuMDAwODczXG4gMC42NjAwMDAgMC4wMDA4NzMgMC42ODAwMDAgMC4wMDA4NTdcbiAwLjY4MDAwMCAwLjAwMDg1NyAwLjcwMDAwMCAwLjAwMDMyM1xuIDAuNzAwMDAwIDAuMDAwMzIzIDAuNzIwMDAwIDAuMDAwNDIzXG4gMC43MjAwMDAgMC4wMDA0MjMgMC43NDAwMDAgMC4wMDA5MjVcbiAwLjc0MDAwMCAwLjAwMDkyNSAwLjc2MDAwMCAwLjAwMDg1NFxuIDAuNzYwMDAwIDAuMDAwODU0IDAuNzgwMDAwIDAuMDAwMjI0XG4gMC43ODAwMDAgMC4wMDAyMjQgMC44MDAwMDAgMC4wMDA2MDBcbiAwLjgwMDAwMCAwLjAwMDYwMCAwLjgyMDAwMCAwLjAwMTExNFxuIDAuODIwMDAwIDAuMDAxMTE0IDAuODQwMDAwIDAuMDAwOTgwXG4gMC44NDAwMDAgMC4wMDA5ODAgMC44NjAwMDAgMC4wMDAyNTBcbiAwLjg2MDAwMCAwLjAwMDI1MCAwLjg4MDAwMCAwLjAwMDY0OVxuIDAuODgwMDAwIDAuMDAwNjQ5IDAuOTAwMDAwIDAuMDAxMTY0XG4gMC45MDAwMDAgMC4wMDExNjQgMC45MjAwMDAgMC4wMDA5NThcbiAwLjkyMDAwMCAwLjAwMDk1OCAwLjk0MDAwMCAwLjAwMDEyNVxuIDAuOTQwMDAwIDAuMDAwMTI1IDAuOTYwMDAwIDAuMDAwODQzXG4gMC45NjAwMDAgMC4wMDA4NDMgMC45ODAwMDAgMC4wMDEzNTBcbiAwLjk4MDAwMCAwLjAwMTM1MCAxLjAwMDAwMCAwLjAwMTA2MlxuIyBjb2xvciAyMDAgMCAxNTBcbiMgc3ltYm9sIG5vbmVcbiMgbGluZXN0eWxlIHNvbGlkXG4jIGxlZ2VuZCBSdW5nZS1LdXR0YSA0XG4gMC4wMDAwMDAgMC4wMDAwMDAgMC4wMjAwMDAgMC4wMDAwMDBcbiAwLjAyMDAwMCAwLjAwMDAwMCAwLjA0MDAwMCAwLjAwMDAwMFxuIDAuMDQwMDAwIDAuMDAwMDAwIDAuMDYwMDAwIDAuMDAwMDAxXG4gMC4wNjAwMDAgMC4wMDAwMDEgMC4wODAwMDAgMC4wMDAwMDFcbiAwLjA4MDAwMCAwLjAwMDAwMSAwLjEwMDAwMCAwLjAwMDAwMFxuIDAuMTAwMDAwIDAuMDAwMDAwIDAuMTIwMDAwIDAuMDAwMDAwXG4gMC4xMjAwMDAgMC4wMDAwMDAgMC4xNDAwMDAgMC4wMDAwMDBcbiAwLjE0MDAwMCAwLjAwMDAwMCAwLjE2MDAwMCAwLjAwMDAwMFxuIDAuMTYwMDAwIDAuMDAwMDAwIDAuMTgwMDAwIDAuMDAwMDAxXG4gMC4xODAwMDAgMC4wMDAwMDEgMC4yMDAwMDAgMC4wMDAwMDFcbiAwLjIwMDAwMCAwLjAwMDAwMSAwLjIyMDAwMCAwLjAwMDAwMVxuIDAuMjIwMDAwIDAuMDAwMDAxIDAuMjQwMDAwIDAuMDAwMDAwXG4gMC4yNDAwMDAgMC4wMDAwMDAgMC4yNjAwMDAgMC4wMDAwMDBcbiAwLjI2MDAwMCAwLjAwMDAwMCAwLjI4MDAwMCAwLjAwMDAwMVxuIDAuMjgwMDAwIDAuMDAwMDAxIDAuMzAwMDAwIDAuMDAwMDAxXG4gMC4zMDAwMDAgMC4wMDAwMDEgMC4zMjAwMDAgMC4wMDAwMDBcbiAwLjMyMDAwMCAwLjAwMDAwMCAwLjM0MDAwMCAwLjAwMDAwMVxuIDAuMzQwMDAwIDAuMDAwMDAxIDAuMzYwMDAwIDAuMDAwMDAyXG4gMC4zNjAwMDAgMC4wMDAwMDIgMC4zODAwMDAgMC4wMDAwMDFcbiAwLjM4MDAwMCAwLjAwMDAwMSAwLjQwMDAwMCAwLjAwMDAwMFxuIDAuNDAwMDAwIDAuMDAwMDAwIDAuNDIwMDAwIDAuMDAwMDAxXG4gMC40MjAwMDAgMC4wMDAwMDEgMC40NDAwMDAgMC4wMDAwMDFcbiAwLjQ0MDAwMCAwLjAwMDAwMSAwLjQ2MDAwMCAwLjAwMDAwMVxuIDAuNDYwMDAwIDAuMDAwMDAxIDAuNDgwMDAwIDAuMDAwMDAxXG4gMC40ODAwMDAgMC4wMDAwMDEgMC41MDAwMDAgMC4wMDAwMDJcbiAwLjUwMDAwMCAwLjAwMDAwMiAwLjUyMDAwMCAwLjAwMDAwMlxuIDAuNTIwMDAwIDAuMDAwMDAyIDAuNTQwMDAwIDAuMDAwMDAxXG4gMC41NDAwMDAgMC4wMDAwMDEgMC41NjAwMDAgMC4wMDAwMDBcbiAwLjU2MDAwMCAwLjAwMDAwMCAwLjU4MDAwMCAwLjAwMDAwMlxuIDAuNTgwMDAwIDAuMDAwMDAyIDAuNjAwMDAwIDAuMDAwMDAyXG4gMC42MDAwMDAgMC4wMDAwMDIgMC42MjAwMDAgMC4wMDAwMDFcbiAwLjYyMDAwMCAwLjAwMDAwMSAwLjY0MDAwMCAwLjAwMDAwMVxuIDAuNjQwMDAwIDAuMDAwMDAxIDAuNjYwMDAwIDAuMDAwMDAyXG4gMC42NjAwMDAgMC4wMDAwMDIgMC42ODAwMDAgMC4wMDAwMDNcbiAwLjY4MDAwMCAwLjAwMDAwMyAwLjcwMDAwMCAwLjAwMDAwMVxuIDAuNzAwMDAwIDAuMDAwMDAxIDAuNzIwMDAwIDAuMDAwMDAxXG4gMC43MjAwMDAgMC4wMDAwMDEgMC43NDAwMDAgMC4wMDAwMDJcbiAwLjc0MDAwMCAwLjAwMDAwMiAwLjc2MDAwMCAwLjAwMDAwMlxuIDAuNzYwMDAwIDAuMDAwMDAyIDAuNzgwMDAwIDAuMDAwMDAxXG4gMC43ODAwMDAgMC4wMDAwMDEgMC44MDAwMDAgMC4wMDAwMDJcbiAwLjgwMDAwMCAwLjAwMDAwMiAwLjgyMDAwMCAwLjAwMDAwM1xuIDAuODIwMDAwIDAuMDAwMDAzIDAuODQwMDAwIDAuMDAwMDAzXG4gMC44NDAwMDAgMC4wMDAwMDMgMC44NjAwMDAgMC4wMDAwMDFcbiAwLjg2MDAwMCAwLjAwMDAwMSAwLjg4MDAwMCAwLjAwMDAwMVxuIDAuODgwMDAwIDAuMDAwMDAxIDAuOTAwMDAwIDAuMDAwMDAzXG4gMC45MDAwMDAgMC4wMDAwMDMgMC45MjAwMDAgMC4wMDAwMDNcbiAwLjkyMDAwMCAwLjAwMDAwMyAwLjk0MDAwMCAwLjAwMDAwMFxuIDAuOTQwMDAwIDAuMDAwMDAwIDAuOTYwMDAwIDAuMDAwMDAyXG4gMC45NjAwMDAgMC4wMDAwMDIgMC45ODAwMDAgMC4wMDAwMDRcbiAwLjk4MDAwMCAwLjAwMDAwNCAxLjAwMDAwMCAwLjAwMDAwM1xuIyBuZXdmcmFtZVxuIyB0aXRsZSBhYnNvbHV0ZSBlcnJvclxuIyB4LWxhYmVsIHhcbiMgeS1sYWJlbCBlcnJvclxuIyBzY2FsZSBcbiMgY29sb3IgMTkxIDM0IDM0XG4jIHN5bWJvbCBub25lXG4jIGxpbmVzdHlsZSBzb2xpZFxuIyBsZWdlbmQgZXhwbGljaXQgZXVsZXJcbiAwLjAwMDAwMCAwLjAwMDAwMCAwLjAyMDAwMCAwLjAwMDE2OVxuIDAuMDIwMDAwIDAuMDAwMTY5IDAuMDQwMDAwIDAuMDAwMDc4XG4gMC4wNDAwMDAgMC4wMDAwNzggMC4wNjAwMDAgMC4wMDAzMjhcbiAwLjA2MDAwMCAwLjAwMDMyOCAwLjA4MDAwMCAwLjAwMDczNlxuIDAuMDgwMDAwIDAuMDAwNzM2IDAuMTAwMDAwIDAuMDAwNjk5XG4gMC4xMDAwMDAgMC4wMDA2OTkgMC4xMjAwMDAgMC4wMDAwMjVcbiAwLjEyMDAwMCAwLjAwMDAyNSAwLjE0MDAwMCAwLjAwMDk3NFxuIDAuMTQwMDAwIDAuMDAwOTc0IDAuMTYwMDAwIDAuMDAxNjE0XG4gMC4xNjAwMDAgMC4wMDE2MTQgMC4xODAwMDAgMC4wMDEzMDFcbiAwLjE4MDAwMCAwLjAwMTMwMSAwLjIwMDAwMCAwLjAwMDAxNVxuIDAuMjAwMDAwIDAuMDAwMDE1IDAuMjIwMDAwIDAuMDAxNTQ5XG4gMC4yMjAwMDAgMC4wMDE1NDkgMC4yNDAwMDAgMC4wMDIzNTFcbiAwLjI0MDAwMCAwLjAwMjM1MSAwLjI2MDAwMCAwLjAwMTY5NVxuIDAuMjYwMDAwIDAuMDAxNjk1IDAuMjgwMDAwIDAuMDAwMjI2XG4gMC4yODAwMDAgMC4wMDAyMjYgMC4zMDAwMDAgMC4wMDIzMjBcbiAwLjMwMDAwMCAwLjAwMjMyMCAwLjMyMDAwMCAwLjAwMzIxNFxuIDAuMzIwMDAwIDAuMDAzMjE0IDAuMzQwMDAwIDAuMDAyMTUwXG4gMC4zNDAwMDAgMC4wMDIxNTAgMC4zNjAwMDAgMC4wMDA0MjNcbiAwLjM2MDAwMCAwLjAwMDQyMyAwLjM4MDAwMCAwLjAwMzAwN1xuIDAuMzgwMDAwIDAuMDAzMDA3IDAuNDAwMDAwIDAuMDAzOTE4XG4gMC40MDAwMDAgMC4wMDM5MTggMC40MjAwMDAgMC4wMDIzODdcbiAwLjQyMDAwMCAwLjAwMjM4NyAwLjQ0MDAwMCAwLjAwMDg1MFxuIDAuNDQwMDAwIDAuMDAwODUwIDAuNDYwMDAwIDAuMDAzODc3XG4gMC40NjAwMDAgMC4wMDM4NzcgMC40ODAwMDAgMC4wMDQ3MzJcbiAwLjQ4MDAwMCAwLjAwNDczMiAwLjUwMDAwMCAwLjAwMjY3NlxuIDAuNTAwMDAwIDAuMDAyNjc2IDAuNTIwMDAwIDAuMDAxMjI5XG4gMC41MjAwMDAgMC4wMDEyMjkgMC41NDAwMDAgMC4wMDQ2NDhcbiAwLjU0MDAwMCAwLjAwNDY0OCAwLjU2MDAwMCAwLjAwNTM3MlxuIDAuNTYwMDAwIDAuMDA1MzcyIDAuNTgwMDAwIDAuMDAyNzM4XG4gMC41ODAwMDAgMC4wMDI3MzggMC42MDAwMDAgMC4wMDE4MzNcbiAwLjYwMDAwMCAwLjAwMTgzMyAwLjYyMDAwMCAwLjAwNTU4OVxuIDAuNjIwMDAwIDAuMDA1NTg5IDAuNjQwMDAwIDAuMDA2MTA2XG4gMC42NDAwMDAgMC4wMDYxMDYgMC42NjAwMDAgMC4wMDI4NDZcbiAwLjY2MDAwMCAwLjAwMjg0NiAwLjY4MDAwMCAwLjAwMjM4MlxuIDAuNjgwMDAwIDAuMDAyMzgyIDAuNzAwMDAwIDAuMDA2NDE1XG4gMC43MDAwMDAgMC4wMDY0MTUgMC43MjAwMDAgMC4wMDY2NTFcbiAwLjcyMDAwMCAwLjAwNjY1MSAwLjc0MDAwMCAwLjAwMjcyMVxuIDAuNzQwMDAwIDAuMDAyNzIxIDAuNzYwMDAwIDAuMDAzMTUwXG4gMC43NjAwMDAgMC4wMDMxNTAgMC43ODAwMDAgMC4wMDczOTRcbiAwLjc4MDAwMCAwLjAwNzM5NCAwLjgwMDAwMCAwLjAwNzI3NFxuIDAuODAwMDAwIDAuMDA3Mjc0IDAuODIwMDAwIDAuMDAyNjM2XG4gMC44MjAwMDAgMC4wMDI2MzYgMC44NDAwMDAgMC4wMDM4NTVcbiAwLjg0MDAwMCAwLjAwMzg1NSAwLjg2MDAwMCAwLjAwODI0M1xuIDAuODYwMDAwIDAuMDA4MjQzIDAuODgwMDAwIDAuMDA3Njk0XG4gMC44ODAwMDAgMC4wMDc2OTQgMC45MDAwMDAgMC4wMDIzMTZcbiAwLjkwMDAwMCAwLjAwMjMxNiAwLjkyMDAwMCAwLjAwNDc2OFxuIDAuOTIwMDAwIDAuMDA0NzY4IDAuOTQwMDAwIDAuMDA5MjI5XG4gMC45NDAwMDAgMC4wMDkyMjkgMC45NjAwMDAgMC4wMDgxODBcbiAwLjk2MDAwMCAwLjAwODE4MCAwLjk4MDAwMCAwLjAwMjAzNFxuIDAuOTgwMDAwIDAuMDAyMDM0IDEuMDAwMDAwIDAuMDA1NjA4XG4iLCAiTUlNRXR5cGUiIDogImFwcGxpY2F0aW9uL3gtdmdmIn0="
        }
      );
      this.returnedUnmodifiedArtifacts.artifacts.push(
        {
          "type" : "file",
          "identifier" : "cc3c1cf9-c02d-4694-902c-93c298d68d03",
          "MIMEtype": "application/x-vgfc",
          "path": "/mode/gridplotTest.vgfc",
          "content": "eyAiaWRlbnRpZmllciIgOiAidmlwcGxvdC52Z2ZjIiwgInZhbHVlIiA6ICJHcmlkcGxvdFxuIyB4LXJhbmdlIC0zLjAwMDAwMCAzLjAwMDAwMFxuIyB5LXJhbmdlIC0zLjAwMDAwMCAzLjAwMDAwMFxuIyB4LWNvdW50IDUwXG4jIHktY291bnQgNTBcbiMgc2NhbGUgMSAxIDFcbiMgbWluLWNvbG9yIDI1NSAwIDBcbiMgbWF4LWNvbG9yIDAgMCAyNTVcbiMgdGltZSAwXG4jIGxhYmVsIHBpZXpvbWV0cmljIGhlYWRcbi0wLjA0MTcyMiAtMC4wNTc4NjkgLTAuMDQ2NTU3IC0wLjAxMzg3NiAwLjAyNTg2MSAwLjA1NzQ3OCAwLjA3MDc2MiAwLjA2MjkwMiAwLjAzNzY5NSAwLjAwMjg0NiAtMC4wMzMwOTcgLTAuMDYzMTEyIC0wLjA4MjkwMSAtMC4wOTEwNDMgLTAuMDg4NDE3IC0wLjA3NzMzNSAtMC4wNjA2ODkgLTAuMDQxMjk3IC0wLjAyMTUwOCAtMC4wMDMwNDQgMC4wMTI5OTAgMC4wMjYwMDAgMC4wMzU3NDUgMC4wNDIxOTIgMC4wNDUzOTIgMC4wNDUzOTIgMC4wNDIxOTIgMC4wMzU3NDUgMC4wMjYwMDAgMC4wMTI5OTAgLTAuMDAzMDQ0IC0wLjAyMTUwOCAtMC4wNDEyOTcgLTAuMDYwNjg5IC0wLjA3NzMzNSAtMC4wODg0MTcgLTAuMDkxMDQzIC0wLjA4MjkwMSAtMC4wNjMxMTIgLTAuMDMzMDk3IDAuMDAyODQ2IDAuMDM3Njk1IDAuMDYyOTAyIDAuMDcwNzYyIDAuMDU3NDc4IDAuMDI1ODYxIC0wLjAxMzg3NiAtMC4wNDY1NTcgLTAuMDU3ODY5IC0wLjA0MTcyMiBcbi0wLjA1Nzg2OSAtMC4wNDU0NzAgLTAuMDEwMjIwIDAuMDMxMzMzIDAuMDYxOTIzIDAuMDcwNjU5IDAuMDU1Nzk2IDAuMDIzMzg2IC0wLjAxNjM4OSAtMC4wNTMxNjcgLTAuMDc5MjQyIC0wLjA5MDc4OSAtMC4wODc2NzkgLTAuMDcyNDUzIC0wLjA0OTAyMSAtMC4wMjE1MDggMC4wMDY1MzAgMC4wMzI1MDMgMC4wNTQ4NjQgMC4wNzI5NjIgMC4wODY4MTUgMC4wOTY4NDAgMC4xMDM2MzEgMC4xMDc3NzMgMC4xMDk3MjEgMC4xMDk3MjEgMC4xMDc3NzMgMC4xMDM2MzEgMC4wOTY4NDAgMC4wODY4MTUgMC4wNzI5NjIgMC4wNTQ4NjQgMC4wMzI1MDMgMC4wMDY1MzAgLTAuMDIxNTA4IC0wLjA0OTAyMSAtMC4wNzI0NTMgLTAuMDg3Njc5IC0wLjA5MDc4OSAtMC4wNzkyNDIgLTAuMDUzMTY3IC0wLjAxNjM4OSAwLjAyMzM4NiAwLjA1NTc5NiAwLjA3MDY1OSAwLjA2MTkyMyAwLjAzMTMzMyAtMC4wMTAyMjAgLTAuMDQ1NDcwIC0wLjA1Nzg2OSBcbi0wLjA0NjU1NyAtMC4wMTAyMjAgMC4wMzMxMTcgMC4wNjM4NDEgMC4wNjk4MjggMC4wNDk5MjMgMC4wMTIxOTkgLTAuMDMwNzQ4IC0wLjA2Njc3MyAtMC4wODc2MTAgLTAuMDkwMTMxIC0wLjA3NTc4NSAtMC4wNDkwMjEgLTAuMDE1NDc5IDAuMDE5NDg4IDAuMDUxNzMxIDAuMDc4NjYwIDAuMDk5MTc3IDAuMTEzMzYyIDAuMTIyMDczIDAuMTI2NTczIDAuMTI4MjIxIDAuMTI4MjY3IDAuMTI3NzE1IDAuMTI3MjYzIDAuMTI3MjYzIDAuMTI3NzE1IDAuMTI4MjY3IDAuMTI4MjIxIDAuMTI2NTczIDAuMTIyMDczIDAuMTEzMzYyIDAuMDk5MTc3IDAuMDc4NjYwIDAuMDUxNzMxIDAuMDE5NDg4IC0wLjAxNTQ3OSAtMC4wNDkwMjEgLTAuMDc1Nzg1IC0wLjA5MDEzMSAtMC4wODc2MTAgLTAuMDY2NzczIC0wLjAzMDc0OCAwLjAxMjE5OSAwLjA0OTkyMyAwLjA2OTgyOCAwLjA2Mzg0MSAwLjAzMzExNyAtMC4wMTAyMjAgLTAuMDQ2NTU3IFxuLTAuMDEzODc2IDAuMDMxMzMzIDAuMDYzODQxIDAuMDY5NDIyIDAuMDQ2NjcxIDAuMDA1MjEwIC0wLjA0MDAyOCAtMC4wNzUwMDUgLTAuMDkwNzg5IC0wLjA4NDk2NiAtMC4wNjA2ODkgLTAuMDI0NDY3IDAuMDE2MjM2IDAuMDU0ODY0IDAuMDg2ODE1IDAuMTA5NzIxIDAuMTIzMTgyIDAuMTI4MjIxIDAuMTI2NjkzIDAuMTIwNzYzIDAuMTEyNTQwIDAuMTAzODUwIDAuMDk2MTM2IDAuMDkwNDQyIDAuMDg3NDM0IDAuMDg3NDM0IDAuMDkwNDQyIDAuMDk2MTM2IDAuMTAzODUwIDAuMTEyNTQwIDAuMTIwNzYzIDAuMTI2NjkzIDAuMTI4MjIxIDAuMTIzMTgyIDAuMTA5NzIxIDAuMDg2ODE1IDAuMDU0ODY0IDAuMDE2MjM2IC0wLjAyNDQ2NyAtMC4wNjA2ODkgLTAuMDg0OTY2IC0wLjA5MDc4OSAtMC4wNzUwMDUgLTAuMDQwMDI4IDAuMDA1MjEwIDAuMDQ2NjcxIDAuMDY5NDIyIDAuMDYzODQxIDAuMDMxMzMzIC0wLjAxMzg3NiBcbjAuMDI1ODYxIDAuMDYxOTIzIDAuMDY5ODI4IDAuMDQ2NjcxIDAuMDAyODQ2IC0wLjA0NDUyOSAtMC4wNzkyNDIgLTAuMDkxMzIwIC0wLjA3ODgwNyAtMC4wNDY1MDMgLTAuMDAzMDQ0IDAuMDQyMTkyIDAuMDgxNDM0IDAuMTA5NzIxIDAuMTI1MDg5IDAuMTI4MDUwIDAuMTIwNzYzIDAuMTA2MTk1IDAuMDg3NDM0IDAuMDY3MjQ2IDAuMDQ3ODUyIDAuMDMwODgwIDAuMDE3NDIzIDAuMDA4MTU0IDAuMDAzNDQwIDAuMDAzNDQwIDAuMDA4MTU0IDAuMDE3NDIzIDAuMDMwODgwIDAuMDQ3ODUyIDAuMDY3MjQ2IDAuMDg3NDM0IDAuMTA2MTk1IDAuMTIwNzYzIDAuMTI4MDUwIDAuMTI1MDg5IDAuMTA5NzIxIDAuMDgxNDM0IDAuMDQyMTkyIC0wLjAwMzA0NCAtMC4wNDY1MDMgLTAuMDc4ODA3IC0wLjA5MTMyMCAtMC4wNzkyNDIgLTAuMDQ0NTI5IDAuMDAyODQ2IDAuMDQ2NjcxIDAuMDY5ODI4IDAuMDYxOTIzIDAuMDI1ODYxIFxuMC4wNTc0NzggMC4wNzA2NTkgMC4wNDk5MjMgMC4wMDUyMTAgLTAuMDQ0NTI5IC0wLjA4MDUyOCAtMC4wOTEwOTMgLTAuMDc0MTU3IC0wLjAzNTg3OCAwLjAxMjk5MCAwLjA2MTA0MSAwLjA5OTE3NyAwLjEyMjA3MyAwLjEyODI2NyAwLjExOTM1NyAwLjA5ODgxOSAwLjA3MDg1NSAwLjAzOTUxNSAwLjAwODE1NCAtMC4wMjA3ODAgLTAuMDQ1NzMxIC0wLjA2NTg3OSAtMC4wODA5MjIgLTAuMDkwODUyIC0wLjA5NTc3NCAtMC4wOTU3NzQgLTAuMDkwODUyIC0wLjA4MDkyMiAtMC4wNjU4NzkgLTAuMDQ1NzMxIC0wLjAyMDc4MCAwLjAwODE1NCAwLjAzOTUxNSAwLjA3MDg1NSAwLjA5ODgxOSAwLjExOTM1NyAwLjEyODI2NyAwLjEyMjA3MyAwLjA5OTE3NyAwLjA2MTA0MSAwLjAxMjk5MCAtMC4wMzU4NzggLTAuMDc0MTU3IC0wLjA5MTA5MyAtMC4wODA1MjggLTAuMDQ0NTI5IDAuMDA1MjEwIDAuMDQ5OTIzIDAuMDcwNjU5IDAuMDU3NDc4IFxuMC4wNzA3NjIgMC4wNTU3OTYgMC4wMTIxOTkgLTAuMDQwMDI4IC0wLjA3OTI0MiAtMC4wOTEwOTMgLTAuMDcyNDUzIC0wLjAzMDI2MiAwLjAyMjc0NCAwLjA3Mjk2MiAwLjEwOTcyMSAwLjEyNzE1MSAwLjEyNDI2NiAwLjEwMzg1MCAwLjA3MDg1NSAwLjAzMDg4MCAtMC4wMTA5NzcgLTAuMDUwNzY1IC0wLjA4NTkwMCAtMC4xMTUwNzIgLTAuMTM3OTc1IC0wLjE1NDk2OCAtMC4xNjY3NDcgLTAuMTc0MDc1IC0wLjE3NzU2OCAtMC4xNzc1NjggLTAuMTc0MDc1IC0wLjE2Njc0NyAtMC4xNTQ5NjggLTAuMTM3OTc1IC0wLjExNTA3MiAtMC4wODU5MDAgLTAuMDUwNzY1IC0wLjAxMDk3NyAwLjAzMDg4MCAwLjA3MDg1NSAwLjEwMzg1MCAwLjEyNDI2NiAwLjEyNzE1MSAwLjEwOTcyMSAwLjA3Mjk2MiAwLjAyMjc0NCAtMC4wMzAyNjIgLTAuMDcyNDUzIC0wLjA5MTA5MyAtMC4wNzkyNDIgLTAuMDQwMDI4IDAuMDEyMTk5IDAuMDU1Nzk2IDAuMDcwNzYyIFxuMC4wNjI5MDIgMC4wMjMzODYgLTAuMDMwNzQ4IC0wLjA3NTAwNSAtMC4wOTEzMjAgLTAuMDc0MTU3IC0wLjAzMDI2MiAwLjAyNjAwMCAwLjA3ODY2MCAwLjExNTA0OSAwLjEyODM1MSAwLjExNzgzMCAwLjA4NzQzNCAwLjA0MzcyMiAtMC4wMDYxMjkgLTAuMDU1ODA0IC0wLjEwMDY2MiAtMC4xMzc5NzUgLTAuMTY2NzQ3IC0wLjE4NzMxMiAtMC4yMDA4NTcgLTAuMjA4OTg1IC0wLjIxMzM0NSAtMC4yMTUzNzUgLTAuMjE2MTE3IC0wLjIxNjExNyAtMC4yMTUzNzUgLTAuMjEzMzQ1IC0wLjIwODk4NSAtMC4yMDA4NTcgLTAuMTg3MzEyIC0wLjE2Njc0NyAtMC4xMzc5NzUgLTAuMTAwNjYyIC0wLjA1NTgwNCAtMC4wMDYxMjkgMC4wNDM3MjIgMC4wODc0MzQgMC4xMTc4MzAgMC4xMjgzNTEgMC4xMTUwNDkgMC4wNzg2NjAgMC4wMjYwMDAgLTAuMDMwMjYyIC0wLjA3NDE1NyAtMC4wOTEzMjAgLTAuMDc1MDA1IC0wLjAzMDc0OCAwLjAyMzM4NiAwLjA2MjkwMiBcbjAuMDM3Njk1IC0wLjAxNjM4OSAtMC4wNjY3NzMgLTAuMDkwNzg5IC0wLjA3ODgwNyAtMC4wMzU4NzggMC4wMjI3NDQgMC4wNzg2NjAgMC4xMTY2NDUgMC4xMjgyNjcgMC4xMTI1NDAgMC4wNzQzNzAgMC4wMjE5NzIgLTAuMDM1Njk0IC0wLjA5MDg1MiAtMC4xMzc5NzUgLTAuMTc0MDc1IC0wLjE5ODQzNyAtMC4yMTIwNjQgLTAuMjE3MDQxIC0wLjIxNTk1MyAtMC4yMTE0MjggLTAuMjA1ODE2IC0wLjIwMDk5NCAtMC4xOTgyNTUgLTAuMTk4MjU1IC0wLjIwMDk5NCAtMC4yMDU4MTYgLTAuMjExNDI4IC0wLjIxNTk1MyAtMC4yMTcwNDEgLTAuMjEyMDY0IC0wLjE5ODQzNyAtMC4xNzQwNzUgLTAuMTM3OTc1IC0wLjA5MDg1MiAtMC4wMzU2OTQgMC4wMjE5NzIgMC4wNzQzNzAgMC4xMTI1NDAgMC4xMjgyNjcgMC4xMTY2NDUgMC4wNzg2NjAgMC4wMjI3NDQgLTAuMDM1ODc4IC0wLjA3ODgwNyAtMC4wOTA3ODkgLTAuMDY2NzczIC0wLjAxNjM4OSAwLjAzNzY5NSBcbjAuMDAyODQ2IC0wLjA1MzE2NyAtMC4wODc2MTAgLTAuMDg0OTY2IC0wLjA0NjUwMyAwLjAxMjk5MCAwLjA3Mjk2MiAwLjExNTA0OSAwLjEyODI2NyAwLjExMDU0MiAwLjA2NzI0NiAwLjAwODE1NCAtMC4wNTU4MDQgLTAuMTE1MDcyIC0wLjE2MjkyMiAtMC4xOTU4NjggLTAuMjEzMzQ1IC0wLjIxNjk4NCAtMC4yMDk3NzEgLTAuMTk1Mjk2IC0wLjE3NzE3NCAtMC4xNTg2NTcgLTAuMTQyNDI3IC0wLjEzMDUwMCAtMC4xMjQyMDcgLTAuMTI0MjA3IC0wLjEzMDUwMCAtMC4xNDI0MjcgLTAuMTU4NjU3IC0wLjE3NzE3NCAtMC4xOTUyOTYgLTAuMjA5NzcxIC0wLjIxNjk4NCAtMC4yMTMzNDUgLTAuMTk1ODY4IC0wLjE2MjkyMiAtMC4xMTUwNzIgLTAuMDU1ODA0IDAuMDA4MTU0IDAuMDY3MjQ2IDAuMTEwNTQyIDAuMTI4MjY3IDAuMTE1MDQ5IDAuMDcyOTYyIDAuMDEyOTkwIC0wLjA0NjUwMyAtMC4wODQ5NjYgLTAuMDg3NjEwIC0wLjA1MzE2NyAwLjAwMjg0NiBcbi0wLjAzMzA5NyAtMC4wNzkyNDIgLTAuMDkwMTMxIC0wLjA2MDY4OSAtMC4wMDMwNDQgMC4wNjEwNDEgMC4xMDk3MjEgMC4xMjgzNTEgMC4xMTI1NDAgMC4wNjcyNDYgMC4wMDM0NDAgLTAuMDY1ODc5IC0wLjEyOTAwOCAtMC4xNzc1NjggLTAuMjA3MTk0IC0wLjIxNzIxNyAtMC4yMDk3NzEgLTAuMTg4NzE1IC0wLjE1ODY1NyAtMC4xMjQyMDcgLTAuMDg5NDk4IC0wLjA1Nzk0MCAtMC4wMzIxNTAgLTAuMDEzOTg3IC0wLjAwNDYyMyAtMC4wMDQ2MjMgLTAuMDEzOTg3IC0wLjAzMjE1MCAtMC4wNTc5NDAgLTAuMDg5NDk4IC0wLjEyNDIwNyAtMC4xNTg2NTcgLTAuMTg4NzE1IC0wLjIwOTc3MSAtMC4yMTcyMTcgLTAuMjA3MTk0IC0wLjE3NzU2OCAtMC4xMjkwMDggLTAuMDY1ODc5IDAuMDAzNDQwIDAuMDY3MjQ2IDAuMTEyNTQwIDAuMTI4MzUxIDAuMTA5NzIxIDAuMDYxMDQxIC0wLjAwMzA0NCAtMC4wNjA2ODkgLTAuMDkwMTMxIC0wLjA3OTI0MiAtMC4wMzMwOTcgXG4tMC4wNjMxMTIgLTAuMDkwNzg5IC0wLjA3NTc4NSAtMC4wMjQ0NjcgMC4wNDIxOTIgMC4wOTkxNzcgMC4xMjcxNTEgMC4xMTc4MzAgMC4wNzQzNzAgMC4wMDgxNTQgLTAuMDY1ODc5IC0wLjEzMzUyNyAtMC4xODQxOTAgLTAuMjEyMDY0IC0wLjIxNTk1MyAtMC4xOTgyNTUgLTAuMTYzNjIxIC0wLjExNzY5NiAtMC4wNjYxMzcgLTAuMDEzOTg3IDAuMDM0NjM2IDAuMDc2NjA2IDAuMTA5NzA5IDAuMTMyNDg1IDAuMTQ0MDcyIDAuMTQ0MDcyIDAuMTMyNDg1IDAuMTA5NzA5IDAuMDc2NjA2IDAuMDM0NjM2IC0wLjAxMzk4NyAtMC4wNjYxMzcgLTAuMTE3Njk2IC0wLjE2MzYyMSAtMC4xOTgyNTUgLTAuMjE1OTUzIC0wLjIxMjA2NCAtMC4xODQxOTAgLTAuMTMzNTI3IC0wLjA2NTg3OSAwLjAwODE1NCAwLjA3NDM3MCAwLjExNzgzMCAwLjEyNzE1MSAwLjA5OTE3NyAwLjA0MjE5MiAtMC4wMjQ0NjcgLTAuMDc1Nzg1IC0wLjA5MDc4OSAtMC4wNjMxMTIgXG4tMC4wODI5MDEgLTAuMDg3Njc5IC0wLjA0OTAyMSAwLjAxNjIzNiAwLjA4MTQzNCAwLjEyMjA3MyAwLjEyNDI2NiAwLjA4NzQzNCAwLjAyMTk3MiAtMC4wNTU4MDQgLTAuMTI5MDA4IC0wLjE4NDE5MCAtMC4yMTMzNDUgLTAuMjE0MTA3IC0wLjE4ODcxNSAtMC4xNDI0MjcgLTAuMDgxOTE4IC0wLjAxMzk4NyAwLjA1NTI5OCAwLjEyMTAzMCAwLjE3OTU2NiAwLjIyODQxNSAwLjI2NjAwNSAwLjI5MTQzNCAwLjMwNDI0MyAwLjMwNDI0MyAwLjI5MTQzNCAwLjI2NjAwNSAwLjIyODQxNSAwLjE3OTU2NiAwLjEyMTAzMCAwLjA1NTI5OCAtMC4wMTM5ODcgLTAuMDgxOTE4IC0wLjE0MjQyNyAtMC4xODg3MTUgLTAuMjE0MTA3IC0wLjIxMzM0NSAtMC4xODQxOTAgLTAuMTI5MDA4IC0wLjA1NTgwNCAwLjAyMTk3MiAwLjA4NzQzNCAwLjEyNDI2NiAwLjEyMjA3MyAwLjA4MTQzNCAwLjAxNjIzNiAtMC4wNDkwMjEgLTAuMDg3Njc5IC0wLjA4MjkwMSBcbi0wLjA5MTA0MyAtMC4wNzI0NTMgLTAuMDE1NDc5IDAuMDU0ODY0IDAuMTA5NzIxIDAuMTI4MjY3IDAuMTAzODUwIDAuMDQzNzIyIC0wLjAzNTY5NCAtMC4xMTUwNzIgLTAuMTc3NTY4IC0wLjIxMjA2NCAtMC4yMTQxMDcgLTAuMTg1MDkxIC0wLjEzMDUwMCAtMC4wNTc5NDAgMC4wMjQ1NTggMC4xMDk3MDkgMC4xOTE2MjYgMC4yNjYwMDUgMC4zMzAwMTggMC4zODIwMjcgMC40MjEyNDMgMC40NDczOTMgMC40NjA0NTAgMC40NjA0NTAgMC40NDczOTMgMC40MjEyNDMgMC4zODIwMjcgMC4zMzAwMTggMC4yNjYwMDUgMC4xOTE2MjYgMC4xMDk3MDkgMC4wMjQ1NTggLTAuMDU3OTQwIC0wLjEzMDUwMCAtMC4xODUwOTEgLTAuMjE0MTA3IC0wLjIxMjA2NCAtMC4xNzc1NjggLTAuMTE1MDcyIC0wLjAzNTY5NCAwLjA0MzcyMiAwLjEwMzg1MCAwLjEyODI2NyAwLjEwOTcyMSAwLjA1NDg2NCAtMC4wMTU0NzkgLTAuMDcyNDUzIC0wLjA5MTA0MyBcbi0wLjA4ODQxNyAtMC4wNDkwMjEgMC4wMTk0ODggMC4wODY4MTUgMC4xMjUwODkgMC4xMTkzNTcgMC4wNzA4NTUgLTAuMDA2MTI5IC0wLjA5MDg1MiAtMC4xNjI5MjIgLTAuMjA3MTk0IC0wLjIxNTk1MyAtMC4xODg3MTUgLTAuMTMwNTAwIC0wLjA0OTU0MSAwLjA0NDg4NCAwLjE0NDA3MiAwLjI0MDg2MyAwLjMzMDAxOCAwLjQwODE2NCAwLjQ3MzQ4NyAwLjUyNTMwNSAwLjU2MzY0MyAwLjU4ODg1NSAwLjYwMTMzOCAwLjYwMTMzOCAwLjU4ODg1NSAwLjU2MzY0MyAwLjUyNTMwNSAwLjQ3MzQ4NyAwLjQwODE2NCAwLjMzMDAxOCAwLjI0MDg2MyAwLjE0NDA3MiAwLjA0NDg4NCAtMC4wNDk1NDEgLTAuMTMwNTAwIC0wLjE4ODcxNSAtMC4yMTU5NTMgLTAuMjA3MTk0IC0wLjE2MjkyMiAtMC4wOTA4NTIgLTAuMDA2MTI5IDAuMDcwODU1IDAuMTE5MzU3IDAuMTI1MDg5IDAuMDg2ODE1IDAuMDE5NDg4IC0wLjA0OTAyMSAtMC4wODg0MTcgXG4tMC4wNzczMzUgLTAuMDIxNTA4IDAuMDUxNzMxIDAuMTA5NzIxIDAuMTI4MDUwIDAuMDk4ODE5IDAuMDMwODgwIC0wLjA1NTgwNCAtMC4xMzc5NzUgLTAuMTk1ODY4IC0wLjIxNzIxNyAtMC4xOTgyNTUgLTAuMTQyNDI3IC0wLjA1Nzk0MCAwLjA0NDg4NCAwLjE1NTc4NCAwLjI2NjAwNSAwLjM2ODk4MyAwLjQ2MDQ1MCAwLjUzODE0NSAwLjYwMTMzOCAwLjY1MDMwMyAwLjY4NTgzNiAwLjcwODg2NyAwLjcyMDE2NiAwLjcyMDE2NiAwLjcwODg2NyAwLjY4NTgzNiAwLjY1MDMwMyAwLjYwMTMzOCAwLjUzODE0NSAwLjQ2MDQ1MCAwLjM2ODk4MyAwLjI2NjAwNSAwLjE1NTc4NCAwLjA0NDg4NCAtMC4wNTc5NDAgLTAuMTQyNDI3IC0wLjE5ODI1NSAtMC4yMTcyMTcgLTAuMTk1ODY4IC0wLjEzNzk3NSAtMC4wNTU4MDQgMC4wMzA4ODAgMC4wOTg4MTkgMC4xMjgwNTAgMC4xMDk3MjEgMC4wNTE3MzEgLTAuMDIxNTA4IC0wLjA3NzMzNSBcbi0wLjA2MDY4OSAwLjAwNjUzMCAwLjA3ODY2MCAwLjEyMzE4MiAwLjEyMDc2MyAwLjA3MDg1NSAtMC4wMTA5NzcgLTAuMTAwNjYyIC0wLjE3NDA3NSAtMC4yMTMzNDUgLTAuMjA5NzcxIC0wLjE2MzYyMSAtMC4wODE5MTggMC4wMjQ1NTggMC4xNDQwNzIgMC4yNjYwMDUgMC4zODIwMjcgMC40ODY0OTcgMC41NzYyODggMC42NTAzMDMgMC43MDg4NjcgMC43NTMxMzQgMC43ODQ1ODQgMC44MDQ2MzQgMC44MTQzNjkgMC44MTQzNjkgMC44MDQ2MzQgMC43ODQ1ODQgMC43NTMxMzQgMC43MDg4NjcgMC42NTAzMDMgMC41NzYyODggMC40ODY0OTcgMC4zODIwMjcgMC4yNjYwMDUgMC4xNDQwNzIgMC4wMjQ1NTggLTAuMDgxOTE4IC0wLjE2MzYyMSAtMC4yMDk3NzEgLTAuMjEzMzQ1IC0wLjE3NDA3NSAtMC4xMDA2NjIgLTAuMDEwOTc3IDAuMDcwODU1IDAuMTIwNzYzIDAuMTIzMTgyIDAuMDc4NjYwIDAuMDA2NTMwIC0wLjA2MDY4OSBcbi0wLjA0MTI5NyAwLjAzMjUwMyAwLjA5OTE3NyAwLjEyODIyMSAwLjEwNjE5NSAwLjAzOTUxNSAtMC4wNTA3NjUgLTAuMTM3OTc1IC0wLjE5ODQzNyAtMC4yMTY5ODQgLTAuMTg4NzE1IC0wLjExNzY5NiAtMC4wMTM5ODcgMC4xMDk3MDkgMC4yNDA4NjMgMC4zNjg5ODMgMC40ODY0OTcgMC41ODg4NTUgMC42NzQxMTcgMC43NDIzMDYgMC43OTQ3MDQgMC44MzMyMzEgMC44NTk5MzEgMC44NzY2MTYgMC44ODQ2MTAgMC44ODQ2MTAgMC44NzY2MTYgMC44NTk5MzEgMC44MzMyMzEgMC43OTQ3MDQgMC43NDIzMDYgMC42NzQxMTcgMC41ODg4NTUgMC40ODY0OTcgMC4zNjg5ODMgMC4yNDA4NjMgMC4xMDk3MDkgLTAuMDEzOTg3IC0wLjExNzY5NiAtMC4xODg3MTUgLTAuMjE2OTg0IC0wLjE5ODQzNyAtMC4xMzc5NzUgLTAuMDUwNzY1IDAuMDM5NTE1IDAuMTA2MTk1IDAuMTI4MjIxIDAuMDk5MTc3IDAuMDMyNTAzIC0wLjA0MTI5NyBcbi0wLjAyMTUwOCAwLjA1NDg2NCAwLjExMzM2MiAwLjEyNjY5MyAwLjA4NzQzNCAwLjAwODE1NCAtMC4wODU5MDAgLTAuMTY2NzQ3IC0wLjIxMjA2NCAtMC4yMDk3NzEgLTAuMTU4NjU3IC0wLjA2NjEzNyAwLjA1NTI5OCAwLjE5MTYyNiAwLjMzMDAxOCAwLjQ2MDQ1MCAwLjU3NjI4OCAwLjY3NDExNyAwLjc1MzEzNCAwLjgxNDM2OSAwLjg1OTkzMSAwLjg5MjM2NiAwLjkxNDE2NSAwLjkyNzQzNyAwLjkzMzY4MyAwLjkzMzY4MyAwLjkyNzQzNyAwLjkxNDE2NSAwLjg5MjM2NiAwLjg1OTkzMSAwLjgxNDM2OSAwLjc1MzEzNCAwLjY3NDExNyAwLjU3NjI4OCAwLjQ2MDQ1MCAwLjMzMDAxOCAwLjE5MTYyNiAwLjA1NTI5OCAtMC4wNjYxMzcgLTAuMTU4NjU3IC0wLjIwOTc3MSAtMC4yMTIwNjQgLTAuMTY2NzQ3IC0wLjA4NTkwMCAwLjAwODE1NCAwLjA4NzQzNCAwLjEyNjY5MyAwLjExMzM2MiAwLjA1NDg2NCAtMC4wMjE1MDggXG4tMC4wMDMwNDQgMC4wNzI5NjIgMC4xMjIwNzMgMC4xMjA3NjMgMC4wNjcyNDYgLTAuMDIwNzgwIC0wLjExNTA3MiAtMC4xODczMTIgLTAuMjE3MDQxIC0wLjE5NTI5NiAtMC4xMjQyMDcgLTAuMDEzOTg3IDAuMTIxMDMwIDAuMjY2MDA1IDAuNDA4MTY0IDAuNTM4MTQ1IDAuNjUwMzAzIDAuNzQyMzA2IDAuODE0MzY5IDAuODY4Mzg4IDAuOTA3MTQ3IDAuOTMzNjgzIDAuOTUwODI0IDAuOTYwODkxIDAuOTY1NTA3IDAuOTY1NTA3IDAuOTYwODkxIDAuOTUwODI0IDAuOTMzNjgzIDAuOTA3MTQ3IDAuODY4Mzg4IDAuODE0MzY5IDAuNzQyMzA2IDAuNjUwMzAzIDAuNTM4MTQ1IDAuNDA4MTY0IDAuMjY2MDA1IDAuMTIxMDMwIC0wLjAxMzk4NyAtMC4xMjQyMDcgLTAuMTk1Mjk2IC0wLjIxNzA0MSAtMC4xODczMTIgLTAuMTE1MDcyIC0wLjAyMDc4MCAwLjA2NzI0NiAwLjEyMDc2MyAwLjEyMjA3MyAwLjA3Mjk2MiAtMC4wMDMwNDQgXG4wLjAxMjk5MCAwLjA4NjgxNSAwLjEyNjU3MyAwLjExMjU0MCAwLjA0Nzg1MiAtMC4wNDU3MzEgLTAuMTM3OTc1IC0wLjIwMDg1NyAtMC4yMTU5NTMgLTAuMTc3MTc0IC0wLjA4OTQ5OCAwLjAzNDYzNiAwLjE3OTU2NiAwLjMzMDAxOCAwLjQ3MzQ4NyAwLjYwMTMzOCAwLjcwODg2NyAwLjc5NDcwNCAwLjg1OTkzMSAwLjkwNzE0NyAwLjkzOTY2NSAwLjk2MDg5MSAwLjk3Mzg5NCAwLjk4MTEzOSAwLjk4NDMyOCAwLjk4NDMyOCAwLjk4MTEzOSAwLjk3Mzg5NCAwLjk2MDg5MSAwLjkzOTY2NSAwLjkwNzE0NyAwLjg1OTkzMSAwLjc5NDcwNCAwLjcwODg2NyAwLjYwMTMzOCAwLjQ3MzQ4NyAwLjMzMDAxOCAwLjE3OTU2NiAwLjAzNDYzNiAtMC4wODk0OTggLTAuMTc3MTc0IC0wLjIxNTk1MyAtMC4yMDA4NTcgLTAuMTM3OTc1IC0wLjA0NTczMSAwLjA0Nzg1MiAwLjExMjU0MCAwLjEyNjU3MyAwLjA4NjgxNSAwLjAxMjk5MCBcbjAuMDI2MDAwIDAuMDk2ODQwIDAuMTI4MjIxIDAuMTAzODUwIDAuMDMwODgwIC0wLjA2NTg3OSAtMC4xNTQ5NjggLTAuMjA4OTg1IC0wLjIxMTQyOCAtMC4xNTg2NTcgLTAuMDU3OTQwIDAuMDc2NjA2IDAuMjI4NDE1IDAuMzgyMDI3IDAuNTI1MzA1IDAuNjUwMzAzIDAuNzUzMTM0IDAuODMzMjMxIDAuODkyMzY2IDAuOTMzNjgzIDAuOTYwODkxIDAuOTc3NjYxIDAuOTg3MjI2IDAuOTkyMTQxIDAuOTk0MTU2IDAuOTk0MTU2IDAuOTkyMTQxIDAuOTg3MjI2IDAuOTc3NjYxIDAuOTYwODkxIDAuOTMzNjgzIDAuODkyMzY2IDAuODMzMjMxIDAuNzUzMTM0IDAuNjUwMzAzIDAuNTI1MzA1IDAuMzgyMDI3IDAuMjI4NDE1IDAuMDc2NjA2IC0wLjA1Nzk0MCAtMC4xNTg2NTcgLTAuMjExNDI4IC0wLjIwODk4NSAtMC4xNTQ5NjggLTAuMDY1ODc5IDAuMDMwODgwIDAuMTAzODUwIDAuMTI4MjIxIDAuMDk2ODQwIDAuMDI2MDAwIFxuMC4wMzU3NDUgMC4xMDM2MzEgMC4xMjgyNjcgMC4wOTYxMzYgMC4wMTc0MjMgLTAuMDgwOTIyIC0wLjE2Njc0NyAtMC4yMTMzNDUgLTAuMjA1ODE2IC0wLjE0MjQyNyAtMC4wMzIxNTAgMC4xMDk3MDkgMC4yNjYwMDUgMC40MjEyNDMgMC41NjM2NDMgMC42ODU4MzYgMC43ODQ1ODQgMC44NTk5MzEgMC45MTQxNjUgMC45NTA4MjQgMC45NzM4OTQgMC45ODcyMjYgMC45OTQxNTYgMC45OTcyOTUgMC45OTg0MTggMC45OTg0MTggMC45OTcyOTUgMC45OTQxNTYgMC45ODcyMjYgMC45NzM4OTQgMC45NTA4MjQgMC45MTQxNjUgMC44NTk5MzEgMC43ODQ1ODQgMC42ODU4MzYgMC41NjM2NDMgMC40MjEyNDMgMC4yNjYwMDUgMC4xMDk3MDkgLTAuMDMyMTUwIC0wLjE0MjQyNyAtMC4yMDU4MTYgLTAuMjEzMzQ1IC0wLjE2Njc0NyAtMC4wODA5MjIgMC4wMTc0MjMgMC4wOTYxMzYgMC4xMjgyNjcgMC4xMDM2MzEgMC4wMzU3NDUgXG4wLjA0MjE5MiAwLjEwNzc3MyAwLjEyNzcxNSAwLjA5MDQ0MiAwLjAwODE1NCAtMC4wOTA4NTIgLTAuMTc0MDc1IC0wLjIxNTM3NSAtMC4yMDA5OTQgLTAuMTMwNTAwIC0wLjAxMzk4NyAwLjEzMjQ4NSAwLjI5MTQzNCAwLjQ0NzM5MyAwLjU4ODg1NSAwLjcwODg2NyAwLjgwNDYzNCAwLjg3NjYxNiAwLjkyNzQzNyAwLjk2MDg5MSAwLjk4MTEzOSAwLjk5MjE0MSAwLjk5NzI5NSAwLjk5OTI0MSAwLjk5OTc2NiAwLjk5OTc2NiAwLjk5OTI0MSAwLjk5NzI5NSAwLjk5MjE0MSAwLjk4MTEzOSAwLjk2MDg5MSAwLjkyNzQzNyAwLjg3NjYxNiAwLjgwNDYzNCAwLjcwODg2NyAwLjU4ODg1NSAwLjQ0NzM5MyAwLjI5MTQzNCAwLjEzMjQ4NSAtMC4wMTM5ODcgLTAuMTMwNTAwIC0wLjIwMDk5NCAtMC4yMTUzNzUgLTAuMTc0MDc1IC0wLjA5MDg1MiAwLjAwODE1NCAwLjA5MDQ0MiAwLjEyNzcxNSAwLjEwNzc3MyAwLjA0MjE5MiBcbjAuMDQ1MzkyIDAuMTA5NzIxIDAuMTI3MjYzIDAuMDg3NDM0IDAuMDAzNDQwIC0wLjA5NTc3NCAtMC4xNzc1NjggLTAuMjE2MTE3IC0wLjE5ODI1NSAtMC4xMjQyMDcgLTAuMDA0NjIzIDAuMTQ0MDcyIDAuMzA0MjQzIDAuNDYwNDUwIDAuNjAxMzM4IDAuNzIwMTY2IDAuODE0MzY5IDAuODg0NjEwIDAuOTMzNjgzIDAuOTY1NTA3IDAuOTg0MzI4IDAuOTk0MTU2IDAuOTk4NDE4IDAuOTk5NzY2IDAuOTk5OTkxIDAuOTk5OTkxIDAuOTk5NzY2IDAuOTk4NDE4IDAuOTk0MTU2IDAuOTg0MzI4IDAuOTY1NTA3IDAuOTMzNjgzIDAuODg0NjEwIDAuODE0MzY5IDAuNzIwMTY2IDAuNjAxMzM4IDAuNDYwNDUwIDAuMzA0MjQzIDAuMTQ0MDcyIC0wLjAwNDYyMyAtMC4xMjQyMDcgLTAuMTk4MjU1IC0wLjIxNjExNyAtMC4xNzc1NjggLTAuMDk1Nzc0IDAuMDAzNDQwIDAuMDg3NDM0IDAuMTI3MjYzIDAuMTA5NzIxIDAuMDQ1MzkyIFxuMC4wNDUzOTIgMC4xMDk3MjEgMC4xMjcyNjMgMC4wODc0MzQgMC4wMDM0NDAgLTAuMDk1Nzc0IC0wLjE3NzU2OCAtMC4yMTYxMTcgLTAuMTk4MjU1IC0wLjEyNDIwNyAtMC4wMDQ2MjMgMC4xNDQwNzIgMC4zMDQyNDMgMC40NjA0NTAgMC42MDEzMzggMC43MjAxNjYgMC44MTQzNjkgMC44ODQ2MTAgMC45MzM2ODMgMC45NjU1MDcgMC45ODQzMjggMC45OTQxNTYgMC45OTg0MTggMC45OTk3NjYgMC45OTk5OTEgMC45OTk5OTEgMC45OTk3NjYgMC45OTg0MTggMC45OTQxNTYgMC45ODQzMjggMC45NjU1MDcgMC45MzM2ODMgMC44ODQ2MTAgMC44MTQzNjkgMC43MjAxNjYgMC42MDEzMzggMC40NjA0NTAgMC4zMDQyNDMgMC4xNDQwNzIgLTAuMDA0NjIzIC0wLjEyNDIwNyAtMC4xOTgyNTUgLTAuMjE2MTE3IC0wLjE3NzU2OCAtMC4wOTU3NzQgMC4wMDM0NDAgMC4wODc0MzQgMC4xMjcyNjMgMC4xMDk3MjEgMC4wNDUzOTIgXG4wLjA0MjE5MiAwLjEwNzc3MyAwLjEyNzcxNSAwLjA5MDQ0MiAwLjAwODE1NCAtMC4wOTA4NTIgLTAuMTc0MDc1IC0wLjIxNTM3NSAtMC4yMDA5OTQgLTAuMTMwNTAwIC0wLjAxMzk4NyAwLjEzMjQ4NSAwLjI5MTQzNCAwLjQ0NzM5MyAwLjU4ODg1NSAwLjcwODg2NyAwLjgwNDYzNCAwLjg3NjYxNiAwLjkyNzQzNyAwLjk2MDg5MSAwLjk4MTEzOSAwLjk5MjE0MSAwLjk5NzI5NSAwLjk5OTI0MSAwLjk5OTc2NiAwLjk5OTc2NiAwLjk5OTI0MSAwLjk5NzI5NSAwLjk5MjE0MSAwLjk4MTEzOSAwLjk2MDg5MSAwLjkyNzQzNyAwLjg3NjYxNiAwLjgwNDYzNCAwLjcwODg2NyAwLjU4ODg1NSAwLjQ0NzM5MyAwLjI5MTQzNCAwLjEzMjQ4NSAtMC4wMTM5ODcgLTAuMTMwNTAwIC0wLjIwMDk5NCAtMC4yMTUzNzUgLTAuMTc0MDc1IC0wLjA5MDg1MiAwLjAwODE1NCAwLjA5MDQ0MiAwLjEyNzcxNSAwLjEwNzc3MyAwLjA0MjE5MiBcbjAuMDM1NzQ1IDAuMTAzNjMxIDAuMTI4MjY3IDAuMDk2MTM2IDAuMDE3NDIzIC0wLjA4MDkyMiAtMC4xNjY3NDcgLTAuMjEzMzQ1IC0wLjIwNTgxNiAtMC4xNDI0MjcgLTAuMDMyMTUwIDAuMTA5NzA5IDAuMjY2MDA1IDAuNDIxMjQzIDAuNTYzNjQzIDAuNjg1ODM2IDAuNzg0NTg0IDAuODU5OTMxIDAuOTE0MTY1IDAuOTUwODI0IDAuOTczODk0IDAuOTg3MjI2IDAuOTk0MTU2IDAuOTk3Mjk1IDAuOTk4NDE4IDAuOTk4NDE4IDAuOTk3Mjk1IDAuOTk0MTU2IDAuOTg3MjI2IDAuOTczODk0IDAuOTUwODI0IDAuOTE0MTY1IDAuODU5OTMxIDAuNzg0NTg0IDAuNjg1ODM2IDAuNTYzNjQzIDAuNDIxMjQzIDAuMjY2MDA1IDAuMTA5NzA5IC0wLjAzMjE1MCAtMC4xNDI0MjcgLTAuMjA1ODE2IC0wLjIxMzM0NSAtMC4xNjY3NDcgLTAuMDgwOTIyIDAuMDE3NDIzIDAuMDk2MTM2IDAuMTI4MjY3IDAuMTAzNjMxIDAuMDM1NzQ1IFxuMC4wMjYwMDAgMC4wOTY4NDAgMC4xMjgyMjEgMC4xMDM4NTAgMC4wMzA4ODAgLTAuMDY1ODc5IC0wLjE1NDk2OCAtMC4yMDg5ODUgLTAuMjExNDI4IC0wLjE1ODY1NyAtMC4wNTc5NDAgMC4wNzY2MDYgMC4yMjg0MTUgMC4zODIwMjcgMC41MjUzMDUgMC42NTAzMDMgMC43NTMxMzQgMC44MzMyMzEgMC44OTIzNjYgMC45MzM2ODMgMC45NjA4OTEgMC45Nzc2NjEgMC45ODcyMjYgMC45OTIxNDEgMC45OTQxNTYgMC45OTQxNTYgMC45OTIxNDEgMC45ODcyMjYgMC45Nzc2NjEgMC45NjA4OTEgMC45MzM2ODMgMC44OTIzNjYgMC44MzMyMzEgMC43NTMxMzQgMC42NTAzMDMgMC41MjUzMDUgMC4zODIwMjcgMC4yMjg0MTUgMC4wNzY2MDYgLTAuMDU3OTQwIC0wLjE1ODY1NyAtMC4yMTE0MjggLTAuMjA4OTg1IC0wLjE1NDk2OCAtMC4wNjU4NzkgMC4wMzA4ODAgMC4xMDM4NTAgMC4xMjgyMjEgMC4wOTY4NDAgMC4wMjYwMDAgXG4wLjAxMjk5MCAwLjA4NjgxNSAwLjEyNjU3MyAwLjExMjU0MCAwLjA0Nzg1MiAtMC4wNDU3MzEgLTAuMTM3OTc1IC0wLjIwMDg1NyAtMC4yMTU5NTMgLTAuMTc3MTc0IC0wLjA4OTQ5OCAwLjAzNDYzNiAwLjE3OTU2NiAwLjMzMDAxOCAwLjQ3MzQ4NyAwLjYwMTMzOCAwLjcwODg2NyAwLjc5NDcwNCAwLjg1OTkzMSAwLjkwNzE0NyAwLjkzOTY2NSAwLjk2MDg5MSAwLjk3Mzg5NCAwLjk4MTEzOSAwLjk4NDMyOCAwLjk4NDMyOCAwLjk4MTEzOSAwLjk3Mzg5NCAwLjk2MDg5MSAwLjkzOTY2NSAwLjkwNzE0NyAwLjg1OTkzMSAwLjc5NDcwNCAwLjcwODg2NyAwLjYwMTMzOCAwLjQ3MzQ4NyAwLjMzMDAxOCAwLjE3OTU2NiAwLjAzNDYzNiAtMC4wODk0OTggLTAuMTc3MTc0IC0wLjIxNTk1MyAtMC4yMDA4NTcgLTAuMTM3OTc1IC0wLjA0NTczMSAwLjA0Nzg1MiAwLjExMjU0MCAwLjEyNjU3MyAwLjA4NjgxNSAwLjAxMjk5MCBcbi0wLjAwMzA0NCAwLjA3Mjk2MiAwLjEyMjA3MyAwLjEyMDc2MyAwLjA2NzI0NiAtMC4wMjA3ODAgLTAuMTE1MDcyIC0wLjE4NzMxMiAtMC4yMTcwNDEgLTAuMTk1Mjk2IC0wLjEyNDIwNyAtMC4wMTM5ODcgMC4xMjEwMzAgMC4yNjYwMDUgMC40MDgxNjQgMC41MzgxNDUgMC42NTAzMDMgMC43NDIzMDYgMC44MTQzNjkgMC44NjgzODggMC45MDcxNDcgMC45MzM2ODMgMC45NTA4MjQgMC45NjA4OTEgMC45NjU1MDcgMC45NjU1MDcgMC45NjA4OTEgMC45NTA4MjQgMC45MzM2ODMgMC45MDcxNDcgMC44NjgzODggMC44MTQzNjkgMC43NDIzMDYgMC42NTAzMDMgMC41MzgxNDUgMC40MDgxNjQgMC4yNjYwMDUgMC4xMjEwMzAgLTAuMDEzOTg3IC0wLjEyNDIwNyAtMC4xOTUyOTYgLTAuMjE3MDQxIC0wLjE4NzMxMiAtMC4xMTUwNzIgLTAuMDIwNzgwIDAuMDY3MjQ2IDAuMTIwNzYzIDAuMTIyMDczIDAuMDcyOTYyIC0wLjAwMzA0NCBcbi0wLjAyMTUwOCAwLjA1NDg2NCAwLjExMzM2MiAwLjEyNjY5MyAwLjA4NzQzNCAwLjAwODE1NCAtMC4wODU5MDAgLTAuMTY2NzQ3IC0wLjIxMjA2NCAtMC4yMDk3NzEgLTAuMTU4NjU3IC0wLjA2NjEzNyAwLjA1NTI5OCAwLjE5MTYyNiAwLjMzMDAxOCAwLjQ2MDQ1MCAwLjU3NjI4OCAwLjY3NDExNyAwLjc1MzEzNCAwLjgxNDM2OSAwLjg1OTkzMSAwLjg5MjM2NiAwLjkxNDE2NSAwLjkyNzQzNyAwLjkzMzY4MyAwLjkzMzY4MyAwLjkyNzQzNyAwLjkxNDE2NSAwLjg5MjM2NiAwLjg1OTkzMSAwLjgxNDM2OSAwLjc1MzEzNCAwLjY3NDExNyAwLjU3NjI4OCAwLjQ2MDQ1MCAwLjMzMDAxOCAwLjE5MTYyNiAwLjA1NTI5OCAtMC4wNjYxMzcgLTAuMTU4NjU3IC0wLjIwOTc3MSAtMC4yMTIwNjQgLTAuMTY2NzQ3IC0wLjA4NTkwMCAwLjAwODE1NCAwLjA4NzQzNCAwLjEyNjY5MyAwLjExMzM2MiAwLjA1NDg2NCAtMC4wMjE1MDggXG4tMC4wNDEyOTcgMC4wMzI1MDMgMC4wOTkxNzcgMC4xMjgyMjEgMC4xMDYxOTUgMC4wMzk1MTUgLTAuMDUwNzY1IC0wLjEzNzk3NSAtMC4xOTg0MzcgLTAuMjE2OTg0IC0wLjE4ODcxNSAtMC4xMTc2OTYgLTAuMDEzOTg3IDAuMTA5NzA5IDAuMjQwODYzIDAuMzY4OTgzIDAuNDg2NDk3IDAuNTg4ODU1IDAuNjc0MTE3IDAuNzQyMzA2IDAuNzk0NzA0IDAuODMzMjMxIDAuODU5OTMxIDAuODc2NjE2IDAuODg0NjEwIDAuODg0NjEwIDAuODc2NjE2IDAuODU5OTMxIDAuODMzMjMxIDAuNzk0NzA0IDAuNzQyMzA2IDAuNjc0MTE3IDAuNTg4ODU1IDAuNDg2NDk3IDAuMzY4OTgzIDAuMjQwODYzIDAuMTA5NzA5IC0wLjAxMzk4NyAtMC4xMTc2OTYgLTAuMTg4NzE1IC0wLjIxNjk4NCAtMC4xOTg0MzcgLTAuMTM3OTc1IC0wLjA1MDc2NSAwLjAzOTUxNSAwLjEwNjE5NSAwLjEyODIyMSAwLjA5OTE3NyAwLjAzMjUwMyAtMC4wNDEyOTcgXG4tMC4wNjA2ODkgMC4wMDY1MzAgMC4wNzg2NjAgMC4xMjMxODIgMC4xMjA3NjMgMC4wNzA4NTUgLTAuMDEwOTc3IC0wLjEwMDY2MiAtMC4xNzQwNzUgLTAuMjEzMzQ1IC0wLjIwOTc3MSAtMC4xNjM2MjEgLTAuMDgxOTE4IDAuMDI0NTU4IDAuMTQ0MDcyIDAuMjY2MDA1IDAuMzgyMDI3IDAuNDg2NDk3IDAuNTc2Mjg4IDAuNjUwMzAzIDAuNzA4ODY3IDAuNzUzMTM0IDAuNzg0NTg0IDAuODA0NjM0IDAuODE0MzY5IDAuODE0MzY5IDAuODA0NjM0IDAuNzg0NTg0IDAuNzUzMTM0IDAuNzA4ODY3IDAuNjUwMzAzIDAuNTc2Mjg4IDAuNDg2NDk3IDAuMzgyMDI3IDAuMjY2MDA1IDAuMTQ0MDcyIDAuMDI0NTU4IC0wLjA4MTkxOCAtMC4xNjM2MjEgLTAuMjA5NzcxIC0wLjIxMzM0NSAtMC4xNzQwNzUgLTAuMTAwNjYyIC0wLjAxMDk3NyAwLjA3MDg1NSAwLjEyMDc2MyAwLjEyMzE4MiAwLjA3ODY2MCAwLjAwNjUzMCAtMC4wNjA2ODkgXG4tMC4wNzczMzUgLTAuMDIxNTA4IDAuMDUxNzMxIDAuMTA5NzIxIDAuMTI4MDUwIDAuMDk4ODE5IDAuMDMwODgwIC0wLjA1NTgwNCAtMC4xMzc5NzUgLTAuMTk1ODY4IC0wLjIxNzIxNyAtMC4xOTgyNTUgLTAuMTQyNDI3IC0wLjA1Nzk0MCAwLjA0NDg4NCAwLjE1NTc4NCAwLjI2NjAwNSAwLjM2ODk4MyAwLjQ2MDQ1MCAwLjUzODE0NSAwLjYwMTMzOCAwLjY1MDMwMyAwLjY4NTgzNiAwLjcwODg2NyAwLjcyMDE2NiAwLjcyMDE2NiAwLjcwODg2NyAwLjY4NTgzNiAwLjY1MDMwMyAwLjYwMTMzOCAwLjUzODE0NSAwLjQ2MDQ1MCAwLjM2ODk4MyAwLjI2NjAwNSAwLjE1NTc4NCAwLjA0NDg4NCAtMC4wNTc5NDAgLTAuMTQyNDI3IC0wLjE5ODI1NSAtMC4yMTcyMTcgLTAuMTk1ODY4IC0wLjEzNzk3NSAtMC4wNTU4MDQgMC4wMzA4ODAgMC4wOTg4MTkgMC4xMjgwNTAgMC4xMDk3MjEgMC4wNTE3MzEgLTAuMDIxNTA4IC0wLjA3NzMzNSBcbi0wLjA4ODQxNyAtMC4wNDkwMjEgMC4wMTk0ODggMC4wODY4MTUgMC4xMjUwODkgMC4xMTkzNTcgMC4wNzA4NTUgLTAuMDA2MTI5IC0wLjA5MDg1MiAtMC4xNjI5MjIgLTAuMjA3MTk0IC0wLjIxNTk1MyAtMC4xODg3MTUgLTAuMTMwNTAwIC0wLjA0OTU0MSAwLjA0NDg4NCAwLjE0NDA3MiAwLjI0MDg2MyAwLjMzMDAxOCAwLjQwODE2NCAwLjQ3MzQ4NyAwLjUyNTMwNSAwLjU2MzY0MyAwLjU4ODg1NSAwLjYwMTMzOCAwLjYwMTMzOCAwLjU4ODg1NSAwLjU2MzY0MyAwLjUyNTMwNSAwLjQ3MzQ4NyAwLjQwODE2NCAwLjMzMDAxOCAwLjI0MDg2MyAwLjE0NDA3MiAwLjA0NDg4NCAtMC4wNDk1NDEgLTAuMTMwNTAwIC0wLjE4ODcxNSAtMC4yMTU5NTMgLTAuMjA3MTk0IC0wLjE2MjkyMiAtMC4wOTA4NTIgLTAuMDA2MTI5IDAuMDcwODU1IDAuMTE5MzU3IDAuMTI1MDg5IDAuMDg2ODE1IDAuMDE5NDg4IC0wLjA0OTAyMSAtMC4wODg0MTcgXG4tMC4wOTEwNDMgLTAuMDcyNDUzIC0wLjAxNTQ3OSAwLjA1NDg2NCAwLjEwOTcyMSAwLjEyODI2NyAwLjEwMzg1MCAwLjA0MzcyMiAtMC4wMzU2OTQgLTAuMTE1MDcyIC0wLjE3NzU2OCAtMC4yMTIwNjQgLTAuMjE0MTA3IC0wLjE4NTA5MSAtMC4xMzA1MDAgLTAuMDU3OTQwIDAuMDI0NTU4IDAuMTA5NzA5IDAuMTkxNjI2IDAuMjY2MDA1IDAuMzMwMDE4IDAuMzgyMDI3IDAuNDIxMjQzIDAuNDQ3MzkzIDAuNDYwNDUwIDAuNDYwNDUwIDAuNDQ3MzkzIDAuNDIxMjQzIDAuMzgyMDI3IDAuMzMwMDE4IDAuMjY2MDA1IDAuMTkxNjI2IDAuMTA5NzA5IDAuMDI0NTU4IC0wLjA1Nzk0MCAtMC4xMzA1MDAgLTAuMTg1MDkxIC0wLjIxNDEwNyAtMC4yMTIwNjQgLTAuMTc3NTY4IC0wLjExNTA3MiAtMC4wMzU2OTQgMC4wNDM3MjIgMC4xMDM4NTAgMC4xMjgyNjcgMC4xMDk3MjEgMC4wNTQ4NjQgLTAuMDE1NDc5IC0wLjA3MjQ1MyAtMC4wOTEwNDMgXG4tMC4wODI5MDEgLTAuMDg3Njc5IC0wLjA0OTAyMSAwLjAxNjIzNiAwLjA4MTQzNCAwLjEyMjA3MyAwLjEyNDI2NiAwLjA4NzQzNCAwLjAyMTk3MiAtMC4wNTU4MDQgLTAuMTI5MDA4IC0wLjE4NDE5MCAtMC4yMTMzNDUgLTAuMjE0MTA3IC0wLjE4ODcxNSAtMC4xNDI0MjcgLTAuMDgxOTE4IC0wLjAxMzk4NyAwLjA1NTI5OCAwLjEyMTAzMCAwLjE3OTU2NiAwLjIyODQxNSAwLjI2NjAwNSAwLjI5MTQzNCAwLjMwNDI0MyAwLjMwNDI0MyAwLjI5MTQzNCAwLjI2NjAwNSAwLjIyODQxNSAwLjE3OTU2NiAwLjEyMTAzMCAwLjA1NTI5OCAtMC4wMTM5ODcgLTAuMDgxOTE4IC0wLjE0MjQyNyAtMC4xODg3MTUgLTAuMjE0MTA3IC0wLjIxMzM0NSAtMC4xODQxOTAgLTAuMTI5MDA4IC0wLjA1NTgwNCAwLjAyMTk3MiAwLjA4NzQzNCAwLjEyNDI2NiAwLjEyMjA3MyAwLjA4MTQzNCAwLjAxNjIzNiAtMC4wNDkwMjEgLTAuMDg3Njc5IC0wLjA4MjkwMSBcbi0wLjA2MzExMiAtMC4wOTA3ODkgLTAuMDc1Nzg1IC0wLjAyNDQ2NyAwLjA0MjE5MiAwLjA5OTE3NyAwLjEyNzE1MSAwLjExNzgzMCAwLjA3NDM3MCAwLjAwODE1NCAtMC4wNjU4NzkgLTAuMTMzNTI3IC0wLjE4NDE5MCAtMC4yMTIwNjQgLTAuMjE1OTUzIC0wLjE5ODI1NSAtMC4xNjM2MjEgLTAuMTE3Njk2IC0wLjA2NjEzNyAtMC4wMTM5ODcgMC4wMzQ2MzYgMC4wNzY2MDYgMC4xMDk3MDkgMC4xMzI0ODUgMC4xNDQwNzIgMC4xNDQwNzIgMC4xMzI0ODUgMC4xMDk3MDkgMC4wNzY2MDYgMC4wMzQ2MzYgLTAuMDEzOTg3IC0wLjA2NjEzNyAtMC4xMTc2OTYgLTAuMTYzNjIxIC0wLjE5ODI1NSAtMC4yMTU5NTMgLTAuMjEyMDY0IC0wLjE4NDE5MCAtMC4xMzM1MjcgLTAuMDY1ODc5IDAuMDA4MTU0IDAuMDc0MzcwIDAuMTE3ODMwIDAuMTI3MTUxIDAuMDk5MTc3IDAuMDQyMTkyIC0wLjAyNDQ2NyAtMC4wNzU3ODUgLTAuMDkwNzg5IC0wLjA2MzExMiBcbi0wLjAzMzA5NyAtMC4wNzkyNDIgLTAuMDkwMTMxIC0wLjA2MDY4OSAtMC4wMDMwNDQgMC4wNjEwNDEgMC4xMDk3MjEgMC4xMjgzNTEgMC4xMTI1NDAgMC4wNjcyNDYgMC4wMDM0NDAgLTAuMDY1ODc5IC0wLjEyOTAwOCAtMC4xNzc1NjggLTAuMjA3MTk0IC0wLjIxNzIxNyAtMC4yMDk3NzEgLTAuMTg4NzE1IC0wLjE1ODY1NyAtMC4xMjQyMDcgLTAuMDg5NDk4IC0wLjA1Nzk0MCAtMC4wMzIxNTAgLTAuMDEzOTg3IC0wLjAwNDYyMyAtMC4wMDQ2MjMgLTAuMDEzOTg3IC0wLjAzMjE1MCAtMC4wNTc5NDAgLTAuMDg5NDk4IC0wLjEyNDIwNyAtMC4xNTg2NTcgLTAuMTg4NzE1IC0wLjIwOTc3MSAtMC4yMTcyMTcgLTAuMjA3MTk0IC0wLjE3NzU2OCAtMC4xMjkwMDggLTAuMDY1ODc5IDAuMDAzNDQwIDAuMDY3MjQ2IDAuMTEyNTQwIDAuMTI4MzUxIDAuMTA5NzIxIDAuMDYxMDQxIC0wLjAwMzA0NCAtMC4wNjA2ODkgLTAuMDkwMTMxIC0wLjA3OTI0MiAtMC4wMzMwOTcgXG4wLjAwMjg0NiAtMC4wNTMxNjcgLTAuMDg3NjEwIC0wLjA4NDk2NiAtMC4wNDY1MDMgMC4wMTI5OTAgMC4wNzI5NjIgMC4xMTUwNDkgMC4xMjgyNjcgMC4xMTA1NDIgMC4wNjcyNDYgMC4wMDgxNTQgLTAuMDU1ODA0IC0wLjExNTA3MiAtMC4xNjI5MjIgLTAuMTk1ODY4IC0wLjIxMzM0NSAtMC4yMTY5ODQgLTAuMjA5NzcxIC0wLjE5NTI5NiAtMC4xNzcxNzQgLTAuMTU4NjU3IC0wLjE0MjQyNyAtMC4xMzA1MDAgLTAuMTI0MjA3IC0wLjEyNDIwNyAtMC4xMzA1MDAgLTAuMTQyNDI3IC0wLjE1ODY1NyAtMC4xNzcxNzQgLTAuMTk1Mjk2IC0wLjIwOTc3MSAtMC4yMTY5ODQgLTAuMjEzMzQ1IC0wLjE5NTg2OCAtMC4xNjI5MjIgLTAuMTE1MDcyIC0wLjA1NTgwNCAwLjAwODE1NCAwLjA2NzI0NiAwLjExMDU0MiAwLjEyODI2NyAwLjExNTA0OSAwLjA3Mjk2MiAwLjAxMjk5MCAtMC4wNDY1MDMgLTAuMDg0OTY2IC0wLjA4NzYxMCAtMC4wNTMxNjcgMC4wMDI4NDYgXG4wLjAzNzY5NSAtMC4wMTYzODkgLTAuMDY2NzczIC0wLjA5MDc4OSAtMC4wNzg4MDcgLTAuMDM1ODc4IDAuMDIyNzQ0IDAuMDc4NjYwIDAuMTE2NjQ1IDAuMTI4MjY3IDAuMTEyNTQwIDAuMDc0MzcwIDAuMDIxOTcyIC0wLjAzNTY5NCAtMC4wOTA4NTIgLTAuMTM3OTc1IC0wLjE3NDA3NSAtMC4xOTg0MzcgLTAuMjEyMDY0IC0wLjIxNzA0MSAtMC4yMTU5NTMgLTAuMjExNDI4IC0wLjIwNTgxNiAtMC4yMDA5OTQgLTAuMTk4MjU1IC0wLjE5ODI1NSAtMC4yMDA5OTQgLTAuMjA1ODE2IC0wLjIxMTQyOCAtMC4yMTU5NTMgLTAuMjE3MDQxIC0wLjIxMjA2NCAtMC4xOTg0MzcgLTAuMTc0MDc1IC0wLjEzNzk3NSAtMC4wOTA4NTIgLTAuMDM1Njk0IDAuMDIxOTcyIDAuMDc0MzcwIDAuMTEyNTQwIDAuMTI4MjY3IDAuMTE2NjQ1IDAuMDc4NjYwIDAuMDIyNzQ0IC0wLjAzNTg3OCAtMC4wNzg4MDcgLTAuMDkwNzg5IC0wLjA2Njc3MyAtMC4wMTYzODkgMC4wMzc2OTUgXG4wLjA2MjkwMiAwLjAyMzM4NiAtMC4wMzA3NDggLTAuMDc1MDA1IC0wLjA5MTMyMCAtMC4wNzQxNTcgLTAuMDMwMjYyIDAuMDI2MDAwIDAuMDc4NjYwIDAuMTE1MDQ5IDAuMTI4MzUxIDAuMTE3ODMwIDAuMDg3NDM0IDAuMDQzNzIyIC0wLjAwNjEyOSAtMC4wNTU4MDQgLTAuMTAwNjYyIC0wLjEzNzk3NSAtMC4xNjY3NDcgLTAuMTg3MzEyIC0wLjIwMDg1NyAtMC4yMDg5ODUgLTAuMjEzMzQ1IC0wLjIxNTM3NSAtMC4yMTYxMTcgLTAuMjE2MTE3IC0wLjIxNTM3NSAtMC4yMTMzNDUgLTAuMjA4OTg1IC0wLjIwMDg1NyAtMC4xODczMTIgLTAuMTY2NzQ3IC0wLjEzNzk3NSAtMC4xMDA2NjIgLTAuMDU1ODA0IC0wLjAwNjEyOSAwLjA0MzcyMiAwLjA4NzQzNCAwLjExNzgzMCAwLjEyODM1MSAwLjExNTA0OSAwLjA3ODY2MCAwLjAyNjAwMCAtMC4wMzAyNjIgLTAuMDc0MTU3IC0wLjA5MTMyMCAtMC4wNzUwMDUgLTAuMDMwNzQ4IDAuMDIzMzg2IDAuMDYyOTAyIFxuMC4wNzA3NjIgMC4wNTU3OTYgMC4wMTIxOTkgLTAuMDQwMDI4IC0wLjA3OTI0MiAtMC4wOTEwOTMgLTAuMDcyNDUzIC0wLjAzMDI2MiAwLjAyMjc0NCAwLjA3Mjk2MiAwLjEwOTcyMSAwLjEyNzE1MSAwLjEyNDI2NiAwLjEwMzg1MCAwLjA3MDg1NSAwLjAzMDg4MCAtMC4wMTA5NzcgLTAuMDUwNzY1IC0wLjA4NTkwMCAtMC4xMTUwNzIgLTAuMTM3OTc1IC0wLjE1NDk2OCAtMC4xNjY3NDcgLTAuMTc0MDc1IC0wLjE3NzU2OCAtMC4xNzc1NjggLTAuMTc0MDc1IC0wLjE2Njc0NyAtMC4xNTQ5NjggLTAuMTM3OTc1IC0wLjExNTA3MiAtMC4wODU5MDAgLTAuMDUwNzY1IC0wLjAxMDk3NyAwLjAzMDg4MCAwLjA3MDg1NSAwLjEwMzg1MCAwLjEyNDI2NiAwLjEyNzE1MSAwLjEwOTcyMSAwLjA3Mjk2MiAwLjAyMjc0NCAtMC4wMzAyNjIgLTAuMDcyNDUzIC0wLjA5MTA5MyAtMC4wNzkyNDIgLTAuMDQwMDI4IDAuMDEyMTk5IDAuMDU1Nzk2IDAuMDcwNzYyIFxuMC4wNTc0NzggMC4wNzA2NTkgMC4wNDk5MjMgMC4wMDUyMTAgLTAuMDQ0NTI5IC0wLjA4MDUyOCAtMC4wOTEwOTMgLTAuMDc0MTU3IC0wLjAzNTg3OCAwLjAxMjk5MCAwLjA2MTA0MSAwLjA5OTE3NyAwLjEyMjA3MyAwLjEyODI2NyAwLjExOTM1NyAwLjA5ODgxOSAwLjA3MDg1NSAwLjAzOTUxNSAwLjAwODE1NCAtMC4wMjA3ODAgLTAuMDQ1NzMxIC0wLjA2NTg3OSAtMC4wODA5MjIgLTAuMDkwODUyIC0wLjA5NTc3NCAtMC4wOTU3NzQgLTAuMDkwODUyIC0wLjA4MDkyMiAtMC4wNjU4NzkgLTAuMDQ1NzMxIC0wLjAyMDc4MCAwLjAwODE1NCAwLjAzOTUxNSAwLjA3MDg1NSAwLjA5ODgxOSAwLjExOTM1NyAwLjEyODI2NyAwLjEyMjA3MyAwLjA5OTE3NyAwLjA2MTA0MSAwLjAxMjk5MCAtMC4wMzU4NzggLTAuMDc0MTU3IC0wLjA5MTA5MyAtMC4wODA1MjggLTAuMDQ0NTI5IDAuMDA1MjEwIDAuMDQ5OTIzIDAuMDcwNjU5IDAuMDU3NDc4IFxuMC4wMjU4NjEgMC4wNjE5MjMgMC4wNjk4MjggMC4wNDY2NzEgMC4wMDI4NDYgLTAuMDQ0NTI5IC0wLjA3OTI0MiAtMC4wOTEzMjAgLTAuMDc4ODA3IC0wLjA0NjUwMyAtMC4wMDMwNDQgMC4wNDIxOTIgMC4wODE0MzQgMC4xMDk3MjEgMC4xMjUwODkgMC4xMjgwNTAgMC4xMjA3NjMgMC4xMDYxOTUgMC4wODc0MzQgMC4wNjcyNDYgMC4wNDc4NTIgMC4wMzA4ODAgMC4wMTc0MjMgMC4wMDgxNTQgMC4wMDM0NDAgMC4wMDM0NDAgMC4wMDgxNTQgMC4wMTc0MjMgMC4wMzA4ODAgMC4wNDc4NTIgMC4wNjcyNDYgMC4wODc0MzQgMC4xMDYxOTUgMC4xMjA3NjMgMC4xMjgwNTAgMC4xMjUwODkgMC4xMDk3MjEgMC4wODE0MzQgMC4wNDIxOTIgLTAuMDAzMDQ0IC0wLjA0NjUwMyAtMC4wNzg4MDcgLTAuMDkxMzIwIC0wLjA3OTI0MiAtMC4wNDQ1MjkgMC4wMDI4NDYgMC4wNDY2NzEgMC4wNjk4MjggMC4wNjE5MjMgMC4wMjU4NjEgXG4tMC4wMTM4NzYgMC4wMzEzMzMgMC4wNjM4NDEgMC4wNjk0MjIgMC4wNDY2NzEgMC4wMDUyMTAgLTAuMDQwMDI4IC0wLjA3NTAwNSAtMC4wOTA3ODkgLTAuMDg0OTY2IC0wLjA2MDY4OSAtMC4wMjQ0NjcgMC4wMTYyMzYgMC4wNTQ4NjQgMC4wODY4MTUgMC4xMDk3MjEgMC4xMjMxODIgMC4xMjgyMjEgMC4xMjY2OTMgMC4xMjA3NjMgMC4xMTI1NDAgMC4xMDM4NTAgMC4wOTYxMzYgMC4wOTA0NDIgMC4wODc0MzQgMC4wODc0MzQgMC4wOTA0NDIgMC4wOTYxMzYgMC4xMDM4NTAgMC4xMTI1NDAgMC4xMjA3NjMgMC4xMjY2OTMgMC4xMjgyMjEgMC4xMjMxODIgMC4xMDk3MjEgMC4wODY4MTUgMC4wNTQ4NjQgMC4wMTYyMzYgLTAuMDI0NDY3IC0wLjA2MDY4OSAtMC4wODQ5NjYgLTAuMDkwNzg5IC0wLjA3NTAwNSAtMC4wNDAwMjggMC4wMDUyMTAgMC4wNDY2NzEgMC4wNjk0MjIgMC4wNjM4NDEgMC4wMzEzMzMgLTAuMDEzODc2IFxuLTAuMDQ2NTU3IC0wLjAxMDIyMCAwLjAzMzExNyAwLjA2Mzg0MSAwLjA2OTgyOCAwLjA0OTkyMyAwLjAxMjE5OSAtMC4wMzA3NDggLTAuMDY2NzczIC0wLjA4NzYxMCAtMC4wOTAxMzEgLTAuMDc1Nzg1IC0wLjA0OTAyMSAtMC4wMTU0NzkgMC4wMTk0ODggMC4wNTE3MzEgMC4wNzg2NjAgMC4wOTkxNzcgMC4xMTMzNjIgMC4xMjIwNzMgMC4xMjY1NzMgMC4xMjgyMjEgMC4xMjgyNjcgMC4xMjc3MTUgMC4xMjcyNjMgMC4xMjcyNjMgMC4xMjc3MTUgMC4xMjgyNjcgMC4xMjgyMjEgMC4xMjY1NzMgMC4xMjIwNzMgMC4xMTMzNjIgMC4wOTkxNzcgMC4wNzg2NjAgMC4wNTE3MzEgMC4wMTk0ODggLTAuMDE1NDc5IC0wLjA0OTAyMSAtMC4wNzU3ODUgLTAuMDkwMTMxIC0wLjA4NzYxMCAtMC4wNjY3NzMgLTAuMDMwNzQ4IDAuMDEyMTk5IDAuMDQ5OTIzIDAuMDY5ODI4IDAuMDYzODQxIDAuMDMzMTE3IC0wLjAxMDIyMCAtMC4wNDY1NTcgXG4tMC4wNTc4NjkgLTAuMDQ1NDcwIC0wLjAxMDIyMCAwLjAzMTMzMyAwLjA2MTkyMyAwLjA3MDY1OSAwLjA1NTc5NiAwLjAyMzM4NiAtMC4wMTYzODkgLTAuMDUzMTY3IC0wLjA3OTI0MiAtMC4wOTA3ODkgLTAuMDg3Njc5IC0wLjA3MjQ1MyAtMC4wNDkwMjEgLTAuMDIxNTA4IDAuMDA2NTMwIDAuMDMyNTAzIDAuMDU0ODY0IDAuMDcyOTYyIDAuMDg2ODE1IDAuMDk2ODQwIDAuMTAzNjMxIDAuMTA3NzczIDAuMTA5NzIxIDAuMTA5NzIxIDAuMTA3NzczIDAuMTAzNjMxIDAuMDk2ODQwIDAuMDg2ODE1IDAuMDcyOTYyIDAuMDU0ODY0IDAuMDMyNTAzIDAuMDA2NTMwIC0wLjAyMTUwOCAtMC4wNDkwMjEgLTAuMDcyNDUzIC0wLjA4NzY3OSAtMC4wOTA3ODkgLTAuMDc5MjQyIC0wLjA1MzE2NyAtMC4wMTYzODkgMC4wMjMzODYgMC4wNTU3OTYgMC4wNzA2NTkgMC4wNjE5MjMgMC4wMzEzMzMgLTAuMDEwMjIwIC0wLjA0NTQ3MCAtMC4wNTc4NjkgXG4tMC4wNDE3MjIgLTAuMDU3ODY5IC0wLjA0NjU1NyAtMC4wMTM4NzYgMC4wMjU4NjEgMC4wNTc0NzggMC4wNzA3NjIgMC4wNjI5MDIgMC4wMzc2OTUgMC4wMDI4NDYgLTAuMDMzMDk3IC0wLjA2MzExMiAtMC4wODI5MDEgLTAuMDkxMDQzIC0wLjA4ODQxNyAtMC4wNzczMzUgLTAuMDYwNjg5IC0wLjA0MTI5NyAtMC4wMjE1MDggLTAuMDAzMDQ0IDAuMDEyOTkwIDAuMDI2MDAwIDAuMDM1NzQ1IDAuMDQyMTkyIDAuMDQ1MzkyIDAuMDQ1MzkyIDAuMDQyMTkyIDAuMDM1NzQ1IDAuMDI2MDAwIDAuMDEyOTkwIC0wLjAwMzA0NCAtMC4wMjE1MDggLTAuMDQxMjk3IC0wLjA2MDY4OSAtMC4wNzczMzUgLTAuMDg4NDE3IC0wLjA5MTA0MyAtMC4wODI5MDEgLTAuMDYzMTEyIC0wLjAzMzA5NyAwLjAwMjg0NiAwLjAzNzY5NSAwLjA2MjkwMiAwLjA3MDc2MiAwLjA1NzQ3OCAwLjAyNTg2MSAtMC4wMTM4NzYgLTAuMDQ2NTU3IC0wLjA1Nzg2OSAtMC4wNDE3MjIgXG4iLCAiTUlNRXR5cGUiIDogImFwcGxpY2F0aW9uL3gtdmdmYyJ9"
        }
      );

      // filter result such that only specified results are displayed
      let viewer = this.json.metadata.viewer || [];
      if (!viewer.includes("Image")) {
        this.returnedOutputJson.artifacts = this.returnedOutputJson.artifacts.filter(function (value) {
          if (value.MIMEtype !== "image/png") {
            return value;
          }
        });
      }
      if (!viewer.includes("ParaView")) {
        this.returnedOutputJson.artifacts = this.returnedOutputJson.artifacts.filter(function (value) {
          if (value.MIMEtype !== "application/vtu") {
            return value;
          }
        });
      }
      if (!viewer.includes("ViPLabGraphics")) {
        this.returnedOutputJson.artifacts = this.returnedOutputJson.artifacts.filter(function (value) {
          if ((value.MIMEtype !== "application/x-vgf") && (value.MIMEtype !== "application/x-vgf3") && (value.MIMEtype !== "application/x-vgfc")) {
            return value;
          }
        });
      }
      if (!viewer.includes("CSV")) {
        this.returnedOutputJson.artifacts = this.returnedOutputJson.artifacts.filter(function (value) {
          if (value.MIMEtype !== "text/csv") {
            return value;
          }
        });
      }
      console.log(this.returnedOutputJson)
      // process connected vtu/vtk files
      //console.log(this.returnedOutputJson.artifacts)
      let connectedVtks = {};
      var artifacts = this.returnedOutputJson.artifacts;
      //let created = false;

      //get basenames for collections of files
      let outputConfig = this.json.configuration.output;
      if (outputConfig !== undefined) {
        let basenames = [];
        for (var out = 0; out < outputConfig.length; out++) {
          let currentConfig = outputConfig[out];
          let currentBasename = currentConfig.basename;
          if (!basenames.includes(currentBasename)) {
            basenames.push(currentBasename);
          }

          if(!connectedVtks[currentBasename]) {
            connectedVtks[currentBasename] = {};
            connectedVtks[currentBasename].type = "s3file";
            connectedVtks[currentBasename].urlsOrContents = [];
            connectedVtks[currentBasename].datasets = currentConfig.datasets;
            connectedVtks[currentBasename].labels = currentConfig.labels;
          }
          
        }

        // group results according to the available basenames
        for(var a = 0; a < artifacts.length; a++) {
          if((artifacts[a].MIMEtype == "application/vtu" || artifacts[a].MIMEtype == "text/csv") && !artifacts[a].artifacts){
            let path = artifacts[a].path;
            let lastIndex = path.lastIndexOf('/');
            let filenamePart = path.substr(lastIndex + 1, path.length);
            
            for (var base = 0; base < basenames.length; base++) {
              let currentBasename = basenames[base];

              if (filenamePart.startsWith(currentBasename) && (filenamePart.charAt(currentBasename.length) === "-")) {
                connectedVtks[currentBasename].type = artifacts[a].type;
                connectedVtks[currentBasename].MIMEtype = artifacts[a].MIMEtype;
                if (artifacts[a].url) {
                  connectedVtks[currentBasename].urlsOrContents.push(artifacts[a].url);
                } else {
                  connectedVtks[currentBasename].urlsOrContents.push(artifacts[a].content);
                }
                artifacts[a].inCollection = true;
              }

            }

          }
        }
        // delete all vtk and csv artifacts that are part of a collection
        artifacts = this.returnedOutputJson.artifacts;
        var b = artifacts.length;
        while(b--){
          if(artifacts[b].inCollection) {
            artifacts.splice(b, 1);
          }
        }
        
        // add vtk collections
        for(var c = 0; c < basenames.length; c++){
          this.returnedOutputJson.artifacts.push(connectedVtks[basenames[c]]);
        }
      }

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
    /**  return base64 image src for img-tag*/
    imagesrc: function (base64Image) {
      return "data:image/png;base64," + base64Image;
    },
    /** Save file locally on click from the user */
    async save(filename, identifier, mimetype) {
      var content = "";
      this.returnedUnmodifiedArtifacts.artifacts.forEach((item) => {
        if (item.identifier == identifier && item.content) {
          content = this.decodeBase64(item.content);
        } else if (item.identifier == identifier) {
          // handle files that were downloaded from s3
          var itemContent = "";
          if (item.MIMEtype === "text/plain" || item.MIMEtype === "image/png" || item.MIMEtype === "text/csv" || item.MIMEtype === "application/vtu") {
            itemContent = item.url;
          }
          content = itemContent;
        }
      });
      
      var blob = "";
      if (mimetype === "image/png" && !(content.includes("blob:http")) && !(content.startsWith("http"))) {
        // handle images that were not downloaded
        const byteNumbers = new Array(content.length);
        for (let i = 0; i < content.length; i++) {
          byteNumbers[i] = content.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], { type: mimetype });
        //console.log(blob);
      } else if ((mimetype === "image/png" && content.includes("blob:http")) || ((mimetype === "text/plain" || mimetype === "image/png" || mimetype === "text/csv" || mimetype === "application/vtu") && content.startsWith("http"))) {
        // handle files that were downloaded from s3
        blob = await fetch(content).then(response => response.blob());
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
    /** Maximize the window, meaning that the two collumns are displayed underneath each other */
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
      //console.log(obj);
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
                //this.json.files[f].parts[oldp].content = obj.parts[p].content;
                this.$set(this.json.files[f].parts[oldp], "content", obj.parts[p].content);
                this.$forceUpdate();
                console.log("Upload - " + this.json.files[f].parts[oldp].content);
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
    /** Parse the json and add elements for gui/parameter rendering
     * Add value element for parameters of mode any
     * else add selected elements for parameters of mode fixed
     */
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
        if (part.content !== "") {
          var mustacheTemplate = this.decodeBase64(part.content);
          var view = {};
          for(var p in part.parameters) {
            var currentParam = part.parameters[p];
            view[currentParam.identifier] = currentParam.value || currentParam.selected;
          }
          console.log(view);
          var output = Mustache.render(mustacheTemplate, view);
          return output;
        } else {
          /** Get Content from separate file*/
          return "";
        }
      }
    }, 
    generateMustacheDivId(partId) {
      return "mustache" + partId;
    },
    /** get filename from part for displaying it as the tab-name */
    getFilename: function(path) {
      let filename = path;
      if (path.includes('/')) {
        filename = path.slice(path.lastIndexOf('/') + 1, path.length); 
      }
      return filename;
    },
    updateContent: function (fileIndex, partIndex, event) {
      this.json.files[fileIndex].parts[partIndex].content = event
    },
    calculateFirstLineNumber: function (allParts, partIndex) {
      let firstLine = 1;
      if (partIndex > 0) {
        for (let previousPartIndex = 0; previousPartIndex < partIndex; previousPartIndex++) {
          let previousPart = allParts[previousPartIndex];
          let decodedPreviousContent = this.decodeBase64(previousPart.content);
          let lines = decodedPreviousContent.split(/\r\n|\r|\n/).length;
          firstLine += lines;
        }
      }
      return firstLine;
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
  },
};
</script>

<style lang="scss">
body {
  /* Needed for the position sticky to work */
  overflow: unset !important;
}

#injected {

  .header {
    overflow: hidden;
    position: relative;
  }

  /* Style the header links */
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

  .sticky-button {
    position: -webkit-sticky;
    position: sticky;
    bottom: 0px;
    left: 74px;
    text-align: right;
    background: rgba(0,0,0,0.1);//rgba(255,255,255,0.7);
    z-index: 1000;
  }

  .btn-row {
    margin: 5px 0 5px 0;
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
    border-radius: calc(0.25rem - 1px);
  }

  .side-to-side-div {
    /* make columns equal size when using minimize/maximize */
    flex: 1 1 0px;
    min-width: 0;
  }

  .sticky-div {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
  }

  img {
    max-height: 100%;
    max-width: 100%;
  }

  .form-item {
    border: 1px solid #ddd;
    border-radius: calc(0.25rem - 1px);
    padding: 10px;
    /*margin-bottom: 10px;*/
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
    /* Grundfläche */
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

  .nav-link.active {
    background-color: white;
  }

  .btn {
    border-radius: calc(0.25rem - 1px) !important;
    padding-left: 20px !important;
    padding-right: 20px !important;
  }

  
}

.tooltip {
  display: block !important;
  z-index: 10000;
}

.tooltip .tooltip-inner {
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: calc(0.25rem - 1px);
  padding: 5px 10px 4px;
}

.tooltip .tooltip-arrow {
  width: 0;
  height: 0;
  border-style: solid;
  position: absolute;
  margin: 5px;
  border-color: rgba(0, 0, 0, 0.5);
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

/* Responsive layout - makes a one column-layout instead of two-column layout */
@media (max-width: 1170px) {
  #injected {
    .flex-container {
      flex-direction: column;
    }
    #maximize-button {
      /* hide Maximizing-button if the screen is too small to shwo two columns */
      display:none;
    }
  }
}
</style>
