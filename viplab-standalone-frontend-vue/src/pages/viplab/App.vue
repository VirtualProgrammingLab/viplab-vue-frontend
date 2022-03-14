<template>
    <!-- content -->
    <div
      id="app"
    >
      
    <!-- header -->
    <div class="header m-2 p-5" v-if="showHeader">
      <div class="header-content">
        <h1 v-if="json.metadata.displayName">
          {{ json.metadata.displayName }}
        </h1>
        <h4 v-if="json.metadata.description">
          {{ json.metadata.description }}
        </h4>
      </div>
    </div>

      <div
        class="flex-container"
        :style="[maximized ? { 'flex-direction': 'column !important' } : null]"
      >
      <div class="side-to-side-div flex-left m-2 pt-5 pb-5">

        <csv-plot :areUrlsProp="true" :csvsProp="['http://localhost:8080/plotly-test.csv']" :datasetProp="{}" :labelProp="{}"></csv-plot>

        <validation-observer v-slot="{ invalid }">
        <form @submit.prevent="sendData">
          <div class="form-group ml-5 mr-5 ">

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
                      class="part"
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
                        <h3 class="mt-3" v-if="(part.access == 'visible' || part.access == 'modifiable') && part.metadata.description">{{part.metadata.description}}</h3>
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
                  <b-button v-if="$config.IS_STUDENT" class="btn mr-2 btn-row" style="width:62.5px" variant="success" btn-variant="white" v-tooltip.top-center="'Save'">
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
        class="side-to-side-div flex-right m-2 pt-5 pb-5"
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

              <b-card
                no-body
                v-if="outputFiles !== '' || (returnedOutputJson !== '' && returnedOutputJson.artifacts.length > 0)"
                fill
              >
                <b-tabs card class="files" content-class="m-2" lazy>
                  
                  <b-tab
                    title="Stdout"
                    ref="artifact"
                    class="artifact"
                  >
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
                  </b-tab>

                  <b-tab
                    title="Stderr"
                    ref="artifact"
                    class="artifact"
                  >
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
                  </b-tab>

                  <b-tab
                    title="Files"
                    ref="artifact"
                    class="artifact"
                  >
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
                                  <div v-if="artifact.plots">
                                    <div v-for="plot in artifact.plots" :key="plot.key">
                                      <csv-plot 
                                        :csvsProp=artifact.urlsOrContents
                                        :areUrlsProp="false"
                                        :datasetProp=plot
                                        :labelProp="artifact.xlabel">
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
                                  <div v-if="artifact.plots">
                                    <div v-for="plot in artifact.plots" :key="plot.key">
                                      <csv-plot 
                                        :csvsProp=artifact.urlsOrContents
                                        :areUrlsProp="true"
                                        :datasetProp=plot
                                        :labelProp="artifact.xlabel">
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
                    </div>
                  </b-tab>
                  <b-tab
                    title="Downloads"
                    ref="artifact"
                    class="artifact"
                  >
                    <div id="downloadFiles">
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
                  </b-tab>
                </b-tabs>
              </b-card>
            </v-wait>
          </div>
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
    showHeader: function() {
      if (typeof this.json.metadata !== 'undefined') {
        if (typeof this.json.metadata.displayName !== 'undefined' || typeof this.json.metadata.description !== 'undefined') {
          return true;
        }
      }
      return false;
    }
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
      //console.log("connect to ws");
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
      //console.log("send data");

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
          //console.log(task);
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
      /*
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
          "identifier" : "ab3c1cf9-c02d-4694-902c-93c298d68d02",
          "MIMEtype": "application/x-vgfc",
          "path": "/test/dumux-out.vgfc",
          "url": "http://localhost:4040/dumux-out.vgfc"
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
      this.returnedUnmodifiedArtifacts.artifacts.push(
        {
          "type" : "s3file",
          "identifier" : "aa3c1cf9-c02d-4694-902c-93c298d68d02",
          "MIMEtype": "application/x-vgfc",
          "path": "/test/vipplot.vgfc",
          "url": "http://localhost:4040/vipplot.vgfc"
        }
      );
      this.returnedUnmodifiedArtifacts.artifacts.push(
        {
          "type" : "s3file",
          "identifier" : "bb3c1cf9-c02d-4694-902c-93c298d68d02",
          "MIMEtype": "application/x-vgf",
          "path": "/test/vipplot.vgf",
          "url": "http://localhost:4040/vipplot.vgf"
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
      );*/

      // filter result such that only specified results are displayed
      let viewer = [];
      if (typeof this.json.metadata !== 'undefined') {
        if (typeof this.json.metadata.viewer !== 'undefined')
          viewer  = this.json.metadata.viewer;
      }
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

      console.log(this.returnedOutputJson.artifacts);
      
      // process connected vtu/vtk & csv files
      let connectedVtks = {};
      var artifacts = this.returnedOutputJson.artifacts;
      //let created = false;

      //get basenames for collections of files
      let outputConfig = this.json.metadata.output.csv.concat(this.json.metadata.output.vtk);
      console.log("----------")
      console.log("outputConfig:");
      console.log(outputConfig);
      console.log("----------")
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
            connectedVtks[currentBasename].plots = currentConfig.plots;
            connectedVtks[currentBasename].xlabel = currentConfig.xlabel;
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
                console.log(currentBasename + " - " + filenamePart);
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

        // If config contains output, that wasn't sent: remove from connectedVtks so ot isn't shown in gui
        console.log(connectedVtks);
        let tmpConnectedFiles = {};
        for (let fileGroupKey in connectedVtks) {
          let value = connectedVtks[fileGroupKey]
          if (value.urlsOrContents.length > 0) {
            tmpConnectedFiles[fileGroupKey] = connectedVtks[fileGroupKey];
          }
        }
        connectedVtks = tmpConnectedFiles;

        // delete all vtk and csv artifacts that are part of a collection
        artifacts = this.returnedOutputJson.artifacts;
        var b = artifacts.length;
        while(b--){
          if(artifacts[b].inCollection) {
            artifacts.splice(b, 1);
          }
        }
        
        // add vtk/csv collections
        let connectedFilesKeys = Object.keys(connectedVtks);
        for(var c = 0; c <connectedFilesKeys.length; c++){
          this.returnedOutputJson.artifacts.push(connectedVtks[connectedFilesKeys[c]]);
        }
      }
      console.log("----------");
      console.log("returnedOutputJson");
      console.log(this.returnedOutputJson)
      console.log("----------");

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
                //console.log("Upload - " + this.json.files[f].parts[oldp].content);
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
    showMustacheTemplate(part) {
      // Disable Mustache HTML-escaping behaviour:
      Mustache.escape = function(text) {return text;};
      // If the template should be displayed
      if(!this.asForm){
        if (part.content !== "") {
          var mustacheTemplate = this.decodeBase64(part.content);
          var view = {};
          // Get values that will be substituted into the template
          for(var p in part.parameters) {
            let currentParam = part.parameters[p];
            let currentValue = currentParam.value || currentParam.selected;
            view[currentParam.identifier] = currentValue;
          }
          // Substitute values in mustache template
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
    /*for (var file in this.json.files) {
      for (var part in this.json.files[file].parts) {
        for (var param in this.json.files[file].parts[part].parameters) {
          var currentParam = this.json.files[file].parts[part].parameters[param];
          //console.log(currentParam);
          //console.log("test" + JSON.parse(currentParam).mode);
        }
      }
    }*/
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
    border-radius: calc(0.25rem - 1px);
    background:#fff;
    overflow-y: auto;
    height: 250px;
    display: -webkit-flex;
    display: flex;
    justify-content: center;
    align-content: center;
  }

  .header-content {
    text-align: center;
    width: 50%;
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
    min-height: 3.5em;
  }

  .toggle input {
    display: none;
  }

  .toggle .slider {
    /* Grundfläche */
    position: absolute;
    cursor: pointer;
    
    bottom: 0;
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
</style>+