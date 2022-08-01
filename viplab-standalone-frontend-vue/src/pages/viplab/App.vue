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

      <v-wait for="wait for ws response">
        <BlockUI :message="statusMessage.message" slot="waiting">
          <spring-spinner
            class="wait-spinner"
            :animation-duration="3000"
            :size="25"
            color="#000"
            />
        </BlockUI>
      </v-wait>

      <div class="side-to-side-div flex-left m-2 pt-5 pb-5">

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
                    <b-icon v-if="!waitingResponse" icon="play" aria-hidden="true"></b-icon>
                    <v-wait for="wait for ws response">
                      <spring-spinner
                        slot="waiting"
                        :animation-duration="3000"
                        :size="25"
                        color="#fff"
                      />
                    </v-wait>
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
                            "identifier" : generateHandlebarsDivId(part.identifier),
                            "content" : showHandlebarsTemplate(part)
                          }'
                        :lang="'matlab'"
                        :key="showHandlebarsTemplate(part)"
                      ></ace-editor-component>
                    </div>
                  </div>
                </b-tab>
              </b-tabs>
            </b-card>
          </div>

          <div class="my-2">
            <v-wait for="wait for ws response">

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
                      <ansi-output :divId="'stdout-div'" :content="outputFiles"></ansi-output>
                    </div>
                  </b-tab>

                  <b-tab
                    title="Stderr"
                    ref="artifact"
                    class="artifact"
                  >
                    <div id="stderr" v-if="outputFiles !== ''">
                      <h3>Stderr</h3>
                      <ansi-output :divId="'stderr-div'" :content="errorFiles"></ansi-output>
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
                              ) in filteredArtifacts(returnedOutputJson.artifacts)"
                              :key="artifact.identifier"
                            >
                              <div v-if="artifact.type !== 's3file'">
                                <div
                                  v-if="artifact.MIMEtype == 'text/plain' || artifact.MIMEtype == 'application/json'"
                                  ref="outPartcontent"
                                  class="outPartcontent"
                                >
                                  <ace-editor-component 
                                    :isParameter="false" 
                                    :isMustache="false"
                                    :readonly="true"
                                    :lang="(artifact.MIMEtype == 'application/json') ? 'json' : 'text'"
                                    :item='{
                                      "identifier" : "Editor" + artifact.identifier,
                                      "content" : artifact.content,
                                      "path" : artifact.path
                                    }'
                                  ></ace-editor-component>
                                </div>
                                <div
                                  v-if="artifact.MIMEtype == 'text/uri-list'"
                                  ref="outPartcontent"
                                  class="outPartcontent"
                                >
                                  Links: 
                                  <ul>
                                      <li v-for="(link, link_index) in getLinks(artifact.content)" :key="'uri' + artifact.identifier + link_index">
                                        <div class="d-flex justify-content-between">
                                          <a target="_blank" rel="noopener noreferrer" :href="link">{{ link }}</a>
                                          <b-button class="float-right" variant="outline-primary" @click="downloadFromLink(link)">
                                            <b-icon icon="download" aria-hidden="true"></b-icon>
                                          </b-button>
                                        </div>
                                      </li>
                                  </ul>
                                </div>

                                <div v-if="artifact.MIMEtype == 'application/vnd.kitware'">
                                    <vtk-component
                                        v-if="artifact.urlsOrContents"
                                        :propFiles=artifact.urlsOrContents
                                    ></vtk-component>
                                    <vtk-component
                                        v-else-if="!artifact.urlsOrContents"
                                        :propFiles=[artifact.content]
                                    ></vtk-component>
                                </div>

                                <div
                                  v-if="artifact.MIMEtype === 'image/png' || artifact.MIMEtype === 'image/jpeg'"
                                  ref="outPartcontent"
                                  class="outPartcontent"
                                >
                                  <img :src="imagesrc(artifact.content, artifact.MIMEtype)" />
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
                                  <grid-plot :plotData="base64url.decode(artifact.content)"></grid-plot>
                                </div>
                                <!-- show viplab 2d plot -->
                                <div
                                  v-if="artifact.MIMEtype === 'application/x-vgf'"
                                  ref="outPartcontent"
                                  class="outPartcontent"
                                >
                                  <plot-2d :plotData="base64url.decode(artifact.content)"></plot-2d>
                                </div>

                              </div>
                              <!-- Render s3 files that have no content-element-->
                              <div v-else>
                                <div v-if="artifact.MIMEtype == 'application/vnd.kitware'">
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
                                  v-else-if="artifact.MIMEtype !== 'image/png' && artifact.MIMEtype !== 'image/jpeg' && ( artifact.MIMEtype == 'text/plain' || artifact.MIMEtype == 'application/json')"
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
                                        :lang="(artifact.MIMEtype == 'application/json') ? 'json' : 'text'"
                                        :item='{
                                          "identifier" : "Editor" + artifact.identifier,
                                          "content" : base64url(data),
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
                                <div v-else-if="artifact.MIMEtype == 'image/png' || artifact.MIMEtype == 'image/jpeg'">
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

import { SpringSpinner } from 'epic-spinners'

import GridPlot from "../../components/viplab-plots/gridplot/GridPlot.vue";

//import $ from 'jquery';

import VtkComponent from "../../components/vtk-plots/VtkComponent.vue";
import Plot2d from '../../components/viplab-plots/plot2d/plot2d.vue';
import CsvPlot from '../../components/csv-plots/CsvPlot.vue';

import AnsiOutput from "../../components/AnsiOutput.vue";

import {Promised} from "vue-promised";

const Handlebars = require('handlebars');

import {ValidationObserver} from "vee-validate";

import base64url from "base64url";

//const Base64 = require('js-base64');

export default {
  name: "app",
  components: {
    SpringSpinner,
    Parameters,
    GridPlot,
    VtkComponent,
    Plot2d,
    CsvPlot,
    Promised,
    ValidationObserver,
    AceEditorComponent,
    AnsiOutput
  },
  data() {
    return {
      //json: "{}", 
      //token: "",
      templates: require.context("../../input/", false, /^.*\.json$/).keys(), //get json file names from ./input folder
      numberOfInputFiles: [],
      //ws: "",
      returnedOutputJson: "",
      returnedUnmodifiedArtifacts: "",
      outputFiles: "",
      errorFiles: "",
      maximized: false,
      file: null,
      asForm: true,
      isPartParameters: 0,
      waitingResponse: false, 
      statusMessage: { "timestamp" : "2022-04-21T06:30+01:00", "message" : "Waiting..."}
    };
  },
  watch: {
    json: {
      handler: function (val) {
        this.json = val;
        // update Vuex Store
        console.log("json was updated")
        this.$store.commit("updateJsonTemplate", val);
        //console.log(this.json.files[0].parts[0].parameters[0].selected);
        this.$forceUpdate();
      },
      deep: true
    },
    '$route': {
      handler: function() {
        //console.log("ROUTE - viplab - " + this.token)
        // this.ws = new WebSocket(this.$config.WEBSOCKET_API);
        // let message = JSON.stringify({ type: "authenticate", content: { jwt: this.token } });
        // this.sendWaiting(message)

        // this.ws.onopen = () => {
        //   console.log("Connection is open!")
        //   this.ws.send(
        //     JSON.stringify({ type: "authenticate", content: { jwt: this.token } })
        //   );
        // };
        // if (this.ws.readyState  === 1) {
        //   console.log("It is safe to send messages now")
        // } else {
        //   console.log("ws not open...")
        // }

        //this.executeAfterDomLoaded();
        // let base64Template = Base64.encode(Buffer.from(JSON.stringify(this.json)).toString(), "utf-8");
        // this.ws = new WebSocket(this.$config.WEBSOCKET_API);
        //this.ws.onopen = () => {
          // this.ws.send(
          //   JSON.stringify({ type: "authenticate", content: { jwt: this.token } })
          // );
          // this.ws.send(
            // JSON.stringify({ type: "prepare-computation", content: { template: base64Template, task: this.generateComputationTask() } })
          // );
          // currently always enabled as soon as every part of form validates!!!
          //document.getElementById("submit").disabled = false;
        // };
      },
      deep: true,
      immediate: true
    }
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
      }
    },
    dataTemplate: {
      get () {
        this.$forceUpdate()
        return this.$store.state.dataTemplate;
      },
      set (newValue) {
        this.$store.commit("updateDataTemplate", newValue)
      }
    },
    ws: {
      get () {
        this.$forceUpdate()
        return this.$store.state.ws;
      },
      set (newValue) {
        this.$store.commit("updateWebSocket", newValue)
      }
    },
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
        if(artifacts[i].MIMEtype != 'application/vnd.kitware' && artifacts[i].MIMEtype != 'text/csv') {
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
    // Make the function wait until the connection is made...
    waitForSocketConnection: function(context, socket, callback) {
      setTimeout(
        function () {
          if (socket.readyState === 1) {
            console.log('Connection is made')
            if (callback != null) {
              callback()
            }
          } else {
            console.log('wait for connection...')
            context.waitForSocketConnection(context, socket, callback)
          }
        }, 5) // wait 5 milisecond for the connection...
    },
    sendWaiting: function(msg) {
      this.waitForSocketConnection(this, this.ws, () => {
        //console.log('Sending ' + msg)
        this.ws.send(msg)
        //console.log('Sent ' + msg)
      })
    },
    /* set the number of input files */
    setNumberOfInputFiles: function () {
      var files = this.json.files;
      for (var file in files) {
        var parts = files[file].parts;
        //console.log(parts.length);
        this.numberOfInputFiles = parts.length;
      }
    },
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
        this.$store.commit("updateDataTemplate", data);
      } else if (Object.keys(this.$store.state.jsonTemplate).length > 0) {
        console.log("2")
        this.json = this.$store.state.jsonTemplate;
        this.token = this.$store.state.token;
        this.dataTemplate = this.$store.state.dataTemplate;
      } else {
        console.log(3)
        this.json = {};
        this.token = "";
        this.dataTemplate = "";
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

      //console.log(this.json);

      this.setNumberOfInputFiles();
    },
    /** should be the first thing that is executed when DOM is loaded: setup connection to webserver */
    executeAfterDomLoaded: function () {
      console.log("AUTHENTICATE - /viplab")
      //let base64Template = Base64.encode(Buffer.from(JSON.stringify(this.json)).toString(), "utf-8");

      //this.ws = new WebSocket("ws://192.168.195.128:8083/computations");
      //this.ws = new WebSocket(this.$config.WEBSOCKET_API);
      this.$store.commit("updateWebSocket", new WebSocket(this.$config.WEBSOCKET_API))
      //console.log("connect to ws");
      
      // this.ws.onopen = () => {
      //   this.ws.send(
      //     JSON.stringify({ type: "authenticate", content: { jwt: this.token } })
      //   );
      //   this.ws.send(
      //     JSON.stringify({ type: "prepare-computation", content: { template: base64Template, task: this.generateComputationTask() } })
      //   );
      //   // currently always enabled as soon as every part of form validates!!!
      //   document.getElementById("submit").disabled = false;
      // };
      let message = JSON.stringify({ type: "authenticate", content: { jwt: this.token } });
      this.sendWaiting(message)

      let prepareMessage = JSON.stringify({ type: "prepare-computation", content: { template: this.dataTemplate, task: this.generateComputationTask() } });
      this.sendWaiting(prepareMessage)

      this.ws.onmessage = (event) => {
        var data = JSON.parse(event.data);
        switch (data.type) {
          case "computation":
            this.displayComputation(data.content);
            break;
          case "prepared-computation":
            console.log(event.data)
            break;
          case "result":
            this.displayResult(data.content);
            console.log(data.content)
            break;
          case "system-status":
            // Check if date is newer than the one from the previous message
            // Set message-variable so that info-message can be displayed in the progress bar
            // If status is warning or error, stop progress bar, show error message to user and re-enable run-button
            if (new Date(this.statusMessage.timestamp) < new Date(data.content.timestamp)) {
              this.statusMessage = data.content;
              if (this.statusMessage.status !== "info") {
                // stop waiting/ progress bar
                this.$wait.end("wait for ws response");
                this.waitingResponse = false;
                // show error in popup
                this.$alert(this.statusMessage.message, "", this.statusMessage.status);
              }
            }
            break;
          default:
            console.error(data);
        }

        if (this.outputFiles !== "") {
          // stop waiting
          this.$wait.end("wait for ws response");
          this.waitingResponse = false;
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
      this.waitingResponse = true;

      document.getElementById("submit").disabled = true;
      var task = {
        type: "create-computation",
        content: {
          template: this.dataTemplate,
          task: this.generateComputationTask()
        },
      };

      this.ws.send(JSON.stringify(task));

      return false;
    },
    generateComputationTask: function() {
      let task = {
            template: this.json.identifier,
            identifier: this.uuid(),
            files: [],
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
              for (let paramIndex in this.json.files[fileIndex].parts[part].parameters) {
                let currentParam = this.json.files[fileIndex].parts[part].parameters[paramIndex];
                let value = currentParam.value || currentParam.selected;
                
                /* If parameter is editor or text-input, add prefix to signal to websocket-api, that value is base64url-encoded*/
                if (currentParam.metadata.guiType === "editor" || (currentParam.metadata.guiType === "input_field" && currentParam.metadata.type === "text")) {
                  value = "base64:" + value
                }
                /* If Parameter is single-value slider or input_field of type number, use string/number as result, instead of array */
                if ((currentParam.metadata.guiType === "slider" && value.length == 1) || (currentParam.metadata.guiType === "input_field" && currentParam.metadata.type === "number" && Array.isArray(value))) {
                  value = value[0];
                }
                
                /*
                console.log("----------");
                console.log("Param value before sending");
                console.log(currentParam.metadata.guiType + " - " + value);
                console.log(value);
                console.log("----------");
                */
                generatedContent[currentParam.identifier] = value;
                //console.log(generatedContent)
              }
              let contentBase64 = base64url(JSON.stringify(generatedContent));
              /*
              console.log("----------");
              console.log("contentBase64:");
              console.log(contentBase64);
              console.log("----------");
              */
              file.parts.push({
                identifier: this.json.files[fileIndex].parts[part].identifier,
                content: contentBase64,
              });
            }
          }
          task.files.push(file);
        }

        // Add arguments to task - only fixed-value parameters!
        if (Object.prototype.hasOwnProperty.call(this.json, "parameters")) {
          let args = JSON.parse("{}");
          let parametersJson = this.json.parameters;
          for (let paramIndex in parametersJson) {
            let currentParam = parametersJson[paramIndex];
            let value = currentParam.value || currentParam.selected;
            
            args[currentParam.identifier] = value;
          }
          task["arguments"] = args;
        }
        console.log("---------- Task: ----------");
        console.log(task);
        console.log("----------");
      }

      return task;
    },
    /** log the computation */
    displayComputation: function (computation) {
      console.log("----------")
      console.log("computation:");
      console.log(computation);
      console.log("----------")
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
      );

      this.returnedOutputJson.artifacts.push(
        {
          "type" : "file",
          "identifier" : "cc3c1cf9-c02d-4694-902c-93c298d68d02",
          "MIMEtype": "text/uri-list",
          "path": "/test/uri-list.txt",
          "content": "aHR0cDovL2xvY2FsaG9zdDo4MDgxL3Rlc3QucGRmDQpodHRwOi8vbG9jYWxob3N0OjgwODEvdGVzdC50eHQNCmh0dHA6Ly9sb2NhbGhvc3Q6ODA4MS92b3lhZ2VyLnBuZw"
        }
      );
      this.returnedUnmodifiedArtifacts.artifacts.push(
        {
          "type" : "file",
          "identifier" : "aa3c1cf9-c02d-4694-902c-93c298d68d02",
          "MIMEtype": "application/uri-list",
          "path": "/test/uri-list.txt",
          "content": "aHR0cDovL2xvY2FsaG9zdDo4MDgxL3Rlc3QucGRmDQpodHRwOi8vbG9jYWxob3N0OjgwODEvdGVzdC50eHQNCmh0dHA6Ly9sb2NhbGhvc3Q6ODA4MS92b3lhZ2VyLnBuZw"
        }
      );*/

      // filter result such that only specified results are displayed
      let viewer = [];
      if (typeof this.json.metadata !== 'undefined') {
        if (typeof this.json.metadata.output !== 'undefined') {
          if (typeof this.json.metadata.output.viewer !== 'undefined') {
            viewer  = this.json.metadata.output.viewer;
          }
        }
      }
      if (!viewer.includes("Image")) {
        this.returnedOutputJson.artifacts = this.returnedOutputJson.artifacts.filter(function (value) {
          if (value.MIMEtype !== "image/png" || value.MIMEtype !== "image/jpeg") {
            return value;
          }
        });
      }
      if (!viewer.includes("ParaView")) {
        this.returnedOutputJson.artifacts = this.returnedOutputJson.artifacts.filter(function (value) {
          if (value.MIMEtype !== "application/vnd.kitware") {
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

      //console.log(this.returnedOutputJson.artifacts);
      
      // process vtk-files with base64-content
      this.returnedOutputJson.artifacts.forEach(function(item) {
        if (item.MIMEtype == "application/vnd.kitware") {
          
          if (item.content) {
            // generate Object-URLs of the base64url encoded content
            const byteCharacters = base64url.decode(item.content);
            const byteArrays = [];
            let sliceSize = 512;

            for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
              const slice = byteCharacters.slice(offset, offset + sliceSize);

              const byteNumbers = new Array(slice.length);
              for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
              }

              const byteArray = new Uint8Array(byteNumbers);
              byteArrays.push(byteArray);
            }

            const blob = new Blob(byteArrays, {type: "application/vnd.kitware"});
            // generate file from blob to retain the file name with the correct extension (for usage in vtk-component)
            const file = new File([blob], "earth.vtp")
            const blobUrl = URL.createObjectURL(file);
            item.content = blobUrl;
          }
        }
      });

      // process connected vtu/vtk & csv files
      let connectedVtks = {};
      var artifacts = this.returnedOutputJson.artifacts;
      //let created = false;

      //get basenames for collections of files
      let outputConfig = [];
      if (this.json.metadata.output !== undefined) {
        if (this.json.metadata.output.csv !== undefined) {
          outputConfig.concat(this.json.metadata.output.csv);
        }
        if (this.json.metadata.output.vtk !== undefined) {
          outputConfig.concat(this.json.metadata.output.vtk);
        }
      }
      /*
      console.log("----------")
      console.log("outputConfig:");
      console.log(outputConfig);
      console.log("----------")
      */
      if (outputConfig.length > 0) {
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
          if((artifacts[a].MIMEtype == "application/vnd.kitware" || artifacts[a].MIMEtype == "text/csv") && !artifacts[a].artifacts){
            let path = artifacts[a].path;
            let lastIndex = path.lastIndexOf('/');
            let filenamePart = path.substr(lastIndex + 1, path.length);
            
            for (var base = 0; base < basenames.length; base++) {
              let currentBasename = basenames[base];
              // filename has to start with basename
              if (filenamePart.startsWith(currentBasename)) {
                //console.log(currentBasename + " - " + filenamePart);
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
        //console.log(connectedVtks);
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
      /*
      console.log("----------");
      console.log("returnedOutputJson");
      console.log(this.returnedOutputJson)
      console.log("----------");
      */
      
      //TODO: Vars nicht überschreiben, sondern ergänzen für intermediate
      this.outputFiles = base64url.decode(result.result.output.stdout);
      this.errorFiles = base64url.decode(result.result.output.stderr);
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
    imagesrc: function (base64Image, mimetype) {
      var base64 = base64Image.replaceAll("-", "+").replaceAll("_", "/")
      if (base64.length % 4 != 0) {
          base64.concat("=".repeat(4 - (base64.length % 4)))
      }
      if (mimetype === "image/jpeg") {
        return "data:image/jpeg;base64," + base64;
      }
      return "data:image/png;base64," + base64;
    },
    /** Save file locally on click from the user */
    async save(filename, identifier, mimetype) {
      var content = "";
      this.returnedUnmodifiedArtifacts.artifacts.forEach((item) => {
        if (item.identifier == identifier && item.content) {
          if (item.MIMEtype !== "image/png" && item.MIMEtype !== "image/jpeg") {
            content = base64url.decode(item.content);
          } else {
            content = item.content;
          }
        } else if (item.identifier == identifier) {
          // handle files that were downloaded from s3
          var itemContent = "";
          if (item.MIMEtype === "text/plain" || item.MIMEtype === "image/png"  || item.MIMEtype === "image/jpeg" || item.MIMEtype === "text/csv" || item.MIMEtype === "application/vnd.kitware") {
            itemContent = item.url;
          }
          content = itemContent;
        }
      });
      
      let downloadNecessary = true;
      var blob = "";
      if ((mimetype === "image/png" || mimetype === "image/jpeg") && !(content.includes("blob:http")) && !(content.startsWith("http"))) {
        downloadNecessary = false;
        let base64 = this.imagesrc(content, mimetype)
        fetch(base64)
          .then(res => res.blob())
          .then(blob => {
            let elem = window.document.createElement("a");
            elem.href = window.URL.createObjectURL(blob);
            elem.download = filename;
            document.body.appendChild(elem);
            elem.click();
            document.body.removeChild(elem);
          });
      } else if (((mimetype === "image/png" ||  mimetype === "image/jpeg") && content.includes("blob:http")) || ((mimetype === "text/plain" || mimetype === "image/png" || mimetype === "image/jpeg" || mimetype === "text/csv" || mimetype === "application/vnd.kitware") && content.startsWith("http"))) {
        // handle files that were downloaded from s3
        blob = await fetch(content).then(response => response.blob());
      } else {
        blob = new Blob([content], { mimetype: mimetype });
      }

      if (downloadNecessary) {
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
    showHandlebarsTemplate(part, forSend = false) {
      // To disable Mustache HTML-escaping behaviour, use three curly brackets, instead of two!
      // If the template should be displayed
      if(!this.asForm || forSend){
        if (part.content !== "") {
          var handlebarsTemplate = base64url.decode(part.content);
          var view = {};
          // Get values that will be substituted into the template
          for(var p in part.parameters) {
            let currentParam = part.parameters[p];
            let currentValue = currentParam.value || currentParam.selected;
            view[currentParam.identifier] = currentValue;
          }
          console.log(view)
          // Substitute values in handlebars template
          const template = Handlebars.compile(handlebarsTemplate);
          var output = template(view);
          return output;
        } else {
          /** Get Content from separate file*/
          return "";
        }
      }
    }, 
    generateHandlebarsDivId(partId) {
      return "handlebars" + partId;
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
          let decodedPreviousContent = base64url.decode(previousPart.content);
          let lines = decodedPreviousContent.split(/\r\n|\r|\n/).length;
          firstLine += lines;
        }
      }
      return firstLine;
    },
    getLinks: function(base64UriContent) {
      let decodedString = base64url.decode(base64UriContent);
      let uriArray = decodedString.split("\n");
      return uriArray;
    },
    downloadFromLink: function(dataurl) {
      let filename = dataurl.slice(dataurl.lastIndexOf("/") + 1, dataurl.length);
      //console.log(filename);
      fetch(dataurl)
        .then(response => response.arrayBuffer())
        .then(response => {
          const blob = new Blob([response], {type: 'application/octet-stream'})
          const link = document.createElement("a");
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          link.click();
          link.remove();
          // in case the Blob uses a lot of memory
          setTimeout(() => URL.revokeObjectURL(link.href), 7000);
      })
      .catch(console.error);
    },
    filteredArtifacts: function(artifactsArray) {
      let availableMIMEtypes = ["text/plain", "text/uri-list", "application/json", "image/png", "image/jpeg", "application/x-vgf", "application/x-vgf3", "application/x-vgfc", "text/csv", "application/vnd.kitware"]
      let filtered = artifactsArray.filter(artifact => (availableMIMEtypes.indexOf(artifact.MIMEtype) > -1));
      return filtered;
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
    width: 61px;
    height: 38px;
  }

  .disabled {
    pointer-events: none;
  }

  .wait-spinner {
    margin: auto;
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

/*Style button in popup */
  .swal2-styled {
    padding: 0;
    border-radius: calc(0.25rem - 1px) !important;
    padding-left: 20px !important;
    padding-right: 20px !important;
    width: 61px;
    height: 38px;
    font-size: inherit !important;
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