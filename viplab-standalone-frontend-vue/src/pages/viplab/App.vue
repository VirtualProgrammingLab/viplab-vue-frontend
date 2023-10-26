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
        class="row"
        :style="[maximized ? { 'flex-direction': 'column !important' } : null]"
      >
      <div class="col-6">

        <VForm v-slot="{ invalid }">
          <form @submit.prevent="sendData">
            <div>

              <h2 v-if="parsedFilesJson">Input Files</h2>
                <!--
                Aktuell kann man die cards auch sehen, wenn sie leer sind - Wie kann man das ändern?
                -->
                <q-card v-if="numberOfInputFiles > 0 || parsedParametersJson">
                  <q-tabs
                    v-model="selectedInputTab"
                    no-caps
                    align="left"
                    class="text-grey"
                    active-color="primary"
                    indicator-color="primary"
                    narrow-indicator
                  >
                    <q-tab :name="file.identifier"
                           v-for="file in parsedFilesJson"
                           :key="file.identifier">{{file.path}}</q-tab>

                  </q-tabs>
                  <q-tab-panels v-model="selectedInputTab" class="files" content-class="m-2" fill>
                    <q-tab-panel :name="file.identifier"
                      ref="file"
                      class="file"
                      v-for="(file, fileIndex) in parsedFilesJson"
                      :key="file.identifier"
                      @click="tabClicked"
                    >
                    <template #title>
                     {{ getFilename(file.path) }}
                        <q-tooltip anchor="top middle" v-if="file.metadata && file.metadata.description">{{ file.metadata.description }}</q-tooltip>
                        <BIconInfoCircle class="pl-1">
                        </BIconInfoCircle>
                    </template>
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
                          <div class="desc-file-part"
                               v-if="
                               (part.access !== 'invisible') &&
                               part.metadata &&
                               part.metadata.description">
                            {{part.metadata.description}}
                          </div>
                          <div v-if="part.access === 'visible'">
                            <ace-editor-component
                              :isParameter="false"
                              :isHandlebar="false"
                              :readonly="true"
                              :item="part"
                              :lang="file.metadata.syntaxHighlighting"
                              :startLineNumber="calculateFirstLineNumber(file.parts, partIndex)"
                              :key="part.identifier + calculateFirstLineNumber(file.parts, partIndex)"
                            ></ace-editor-component>
                          </div>
                          <div v-else-if="part.access === 'modifiable'">
                            <ace-editor-component
                              :isParameter="false"
                              :isHandlebar="false"
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
                          v-if="part.parameters && part.access === 'template'"
                        >
                        <div class="desc-file-part mb-2"
                             v-if="part.metadata && part.metadata.description">
                          {{part.metadata.description}}
                        </div>
                          <parameters
                            :parameters="part.parameters">
                          </parameters>

                        </div>
                      </div>
                      <q-btn v-if="isPartParameters > 0" class="btn mb-3 float-right"
                                @click="switchParameterView()">
                        <BIconFileEarmarkCode v-if="asForm" aria-hidden="true">
                          <q-tooltip anchor="top middle">View File</q-tooltip>
                        </BIconFileEarmarkCode>
                        <BIconFileEarmarkDiff v-else aria-hidden="true">
                          <q-tooltip anchor="top middle">Hide File</q-tooltip>
                        </BIconFileEarmarkDiff>
                      </q-btn>
                    </q-tab-panel>
                    <q-tab-panel v-if="parsedParametersJson" title="Parameters">
                      <!-- render parameters section of the json -->
                        <div class="form-group">
                          <h2 v-if="parsedParametersJson">Commandline Parameters</h2>
                          <parameters
                            :parameters="parsedParametersJson"
                          ></parameters>
                        </div>
                    </q-tab-panel>
                  </q-tab-panels>
                </q-card>
            </div>
          </form>
          <!-- sticky buttons -->
          <div class="sticky-button row justify-between">
            <q-btn-group>
              <q-btn class="btn-row">
                <q-tooltip anchor="top middle">Download backup of changes</q-tooltip>
                <BIconDownload
                  aria-hidden="true"
                  @click="download"
                ></BIconDownload>
              </q-btn>
              <input
                type="file"
                ref="upload"
                style="display: none"
                @change="upload"
                accept="application/JSON"
              />
              <q-btn
                class="btn btn-secondary file btn-row"
                @click="$refs.upload.click()"
              >
                <q-tooltip anchor="top middle">Upload of previously downloaded backup</q-tooltip>
                <BIconUpload aria-hidden="true"></BIconUpload>
              </q-btn>
            </q-btn-group>
            <q-btn-group>
              <q-btn class="btn-row"
                      id="maximize  -button"
                      @click="maximize"
                      v-if="!asForm || outputFiles !== ''">
                <q-tooltip anchor="top middle" v-if="maximized">Minimize</q-tooltip>
                <q-tooltip anchor="top middle" v-else>Maximize</q-tooltip>
                <BIconFullscreen v-if="!maximized" aria-hidden="true"></BIconFullscreen>
                <BIconFullscreenExit v-else  aria-hidden="true"></BIconFullscreenExit>
              </q-btn>
              <q-btn v-if="$config.IS_STUDENT" class="btn-row"
                        style="width:62.5px"
                        variant="success"
                        btn-variant="white">
                <q-tooltip anchor="top middle">Save</q-tooltip>
                <font-awesome-icon icon="save" />
              </q-btn>
              <q-btn class="btn btn-row"
                        id="submit"
                        variant="primary"
                        :disabled="invalid"
                        @click="sendData">
                <q-tooltip anchor="top middle">Run</q-tooltip>
                <BIconPlay v-if="!waitingResponse" aria-hidden="true"></BIconPlay>
                <div v-else>
                  <spring-spinner
                    slot="waiting"
                    :animation-duration="3000"
                    :size="25"
                    color="#fff"
                  />
                </div>
              </q-btn>
            </q-btn-group>
          </div>
        </VForm>
      </div>

      <div
        class="side-to-side-div flex-right m-2 pt-5 pb-5"
        v-if="
          !asForm ||
          (outputFiles !== '' || errorFiles !== ''
            || (returnedOutputJson !== '' && returnedOutputJson.artifacts.length > 0)
          )"
        >
        <div class="sticky-div form-group mb-5 ml-5 mr-5">
          <h2>Output Files</h2>

          <!-- Render Handlebar Templates with the filled in Parameters -->
          <div v-if="!asForm">
            <q-card no-body v-if="numberOfInputFiles > 0">
              <q-tabs card class="files" content-class="m-2" fill>
                <q-tab
                  :title="getFilename(file.path)"
                  ref="file"
                  class="file"
                  v-for="file in parsedFilesJson"
                  :key="file.identifier"
                  @click="tabClicked"
                >
                  <div class="desc-file-part mb-2">
                    Adjust values using the form fields in the Input Files panel
                  </div>
                  <div
                    class="part mb-3"
                    v-for="part in file.parts"
                    :key="part.identifier"
                  >
                    <div v-if="part.parameters && part.access === 'template'">
                      <ace-editor-component
                        :isParameter="false"
                        :isHandlebar="true"
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
                </q-tab>
              </q-tabs>
            </q-card>
          </div>

          <div class="mt-2">
            <div v-if="!waitingResponse">
              <q-card
                no-body
                v-if="
                outputFiles !== '' ||
                errorFiles !== '' ||
                (returnedOutputJson !== '' && returnedOutputJson.artifacts.length > 0)"
                fill
              >
                <q-tabs v-model='selectedOutputTab' no-caps align="left">
                  <q-tab name="stdout" v-if="outputFiles !== ''">Stdout</q-tab>
                  <q-tab name="stderr" v-if="errorFiles !== ''">Stderr</q-tab>
                  <q-tab name="visualization" v-if="returnedOutputJson.artifacts.length > 0">Visualizations</q-tab>
                  <q-tab name="download" v-if="returnedUnmodifiedArtifacts.artifacts.length > 0">Downloads</q-tab>
                </q-tabs>
                <q-tab-panels v-model='selectedOutputTab' class="files" content-class="m-2">

                  <q-tab-panel
                    name="stdout"
                    class="artifact"
                    v-if="outputFiles !== ''"
                  >
                    <div id="stdout">
                      <ansi-output :divId="'stdout-div'" :content="outputFiles"></ansi-output>
                    </div>
                  </q-tab-panel>

                  <q-tab-panel
                    name="stderr"
                    class="artifact"
                    v-if="errorFiles !== ''"
                  >
                    <div id="stderr">
                      <ansi-output :divId="'stderr-div'" :content="errorFiles"></ansi-output>
                    </div>
                  </q-tab-panel>
                  <!-- TODO: Only show tabs if necessary-->
                  <q-tab-panel
                    name="visualization"
                    class="artifact"
                    v-if="returnedOutputJson.artifacts.length > 0"
                  >
                    <div id="fileList" class="mt-2">
                      <div class="fileViewer">
                        <q-card
                          no-body
                          v-if="returnedOutputJson.artifacts.length > 0"
                          fill
                        >
                          <q-tabs  no-caps v-model="selectedVisualizationTab">
                            <q-tab
                              :name="artifact.identifier"
                              v-for="(
                                artifact
                              ) in filteredArtifacts(returnedOutputJson.artifacts)"
                              :key="artifact.identifier"
                            >{{ artifact.basename || artifact.path }}
                              </q-tab>
                          </q-tabs>
                          <q-tab-panels  v-model="selectedVisualizationTab" class="files" content-class="m-2">
                            <!-- TODO: Filename verwenden -->
                            <q-tab-panel
                              :name="artifact.identifier"
                              v-for="(
                                artifact
                              ) in filteredArtifacts(returnedOutputJson.artifacts)"
                              :key="artifact.identifier"
                            >
                              <div v-if="artifact.type !== 's3file'">
                                <div
                                  v-if="
                                    artifact.MIMEtype === 'text/plain' ||
                                    artifact.MIMEtype === 'application/json'"
                                  ref="outPartcontent"
                                  class="outPartcontent"
                                >
                                  <ace-editor-component
                                    :isParameter="false"
                                    :isHandlebar="false"
                                    :readonly="true"
                                    :lang="(artifact.MIMEtype === 'application/json') ?
                                      'json' : 'text'"
                                    :item='{
                                      "identifier" : "Editor" + artifact.identifier,
                                      "content" : artifact.content,
                                      "path" : artifact.path
                                    }'
                                  ></ace-editor-component>
                                </div>
                                <div
                                  v-if="artifact.MIMEtype === 'text/uri-list'"
                                  ref="outPartcontent"
                                  class="outPartcontent"
                                >
                                  Links:
                                  <ul>
                                    <li v-for="(link, link_index) in getLinks(artifact.content)"
                                        :key="'uri' + artifact.identifier + link_index">
                                      <div class="d-flex justify-content-between">
                                        <a target="_blank" rel="noopener noreferrer"
                                           :href="link">
                                          {{ link }}
                                        </a>
                                        <q-btn class="float-right"
                                                  variant="outline-primary"
                                                  @click="downloadFromLink(link)">
                                          <BIconDownload aria-hidden="true"></BIconDownload>
                                        </q-btn>
                                      </div>
                                    </li>
                                  </ul>
                                </div>

                                <div v-if="artifact.MIMEtype === 'application/vnd.kitware'">
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
                                  v-if="
                                    artifact.MIMEtype === 'image/png' ||
                                    artifact.MIMEtype === 'image/jpeg'"
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
                                    <div v-for="plot in artifact.plots"
                                         :key="(typeof plot.key == 'string') ?
                                         plot.key : plot.key[0]"
                                    >
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
                                  <grid-plot
                                    :plotData="base64url.decode(artifact.content)">
                                  </grid-plot>
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
                                <div v-if="artifact.MIMEtype === 'application/vnd.kitware'">
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
                                  v-else-if="
                                    artifact.MIMEtype !== 'image/png' &&
                                    artifact.MIMEtype !== 'image/jpeg' &&
                                    ( artifact.MIMEtype === 'text/plain' ||
                                      artifact.MIMEtype === 'application/json')"
                                  ref="outPartcontent"
                                  class="outPartcontent"
                                >
                                  <div v-if="promiseError.get(artifact.url)">
                                    Error: {{ promiseError.get(artifact.url).message }}
                                  </div>
                                  <div v-else-if="isLoading.get(artifact.url)">
                                    Loading...
                                  </div>
                                  <div v-else-if="!isLoading.get(artifact.url)">
                                      <ace-editor-component
                                        :isParameter="false"
                                        :isHandlebar="false"
                                        :readonly="true"
                                        :lang="(artifact.MIMEtype === 'application/json') ?
                                          'json' : 'text'"
                                        :item='{
                                          "identifier" : "Editor" + artifact.identifier,
                                          "content" : s3Contents.get(artifact.url),
                                          "path" : artifact.path
                                        }'
                                        :ref="artifact.path"
                                      ></ace-editor-component>
                                  </div>

                                </div>
                                <div v-else-if="artifact.MIMEtype === 'text/csv'">
                                  <div v-if="artifact.plots">
                                    <div v-for="plot in artifact.plots"
                                         :key="(typeof plot.key == 'string') ?
                                           plot.key : plot.key[0]">
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
                                <div v-else-if="
                                  artifact.MIMEtype === 'image/png' ||
                                  artifact.MIMEtype === 'image/jpeg'">
                                  <img
                                    :src="artifact.url"
                                    :ref="artifact.path"/>
                                </div>
                                <div v-else>

                                  <div v-if="promiseError.get(artifact.url)">
                                    Error: {{ promiseError.get(artifact.url).message }}
                                  </div>
                                  <div v-else-if="isLoading.get(artifact.url)">
                                    Loading...
                                  </div>
                                  <div v-else-if="!isLoading.get(artifact.url)">
                                    <div>
                                        <div
                                          v-if="artifact.MIMEtype === 'application/x-vgfc'"
                                          ref="outPartcontent"
                                          class="outPartcontent"
                                        >
                                          <grid-plot :plotData="s3Contents.get(artifact.url)"
                                          ></grid-plot>
                                        </div>
                                        <!-- show viplab 2d plot -->
                                        <div
                                          v-if="artifact.MIMEtype === 'application/x-vgf'"
                                          ref="outPartcontent"
                                          class="outPartcontent"
                                        >
                                          <plot-2d :plotData="s3Contents.get(artifact.url)">
                                          </plot-2d>
                                        </div>
                                      </div>
                                  </div>

                                </div>
                              </div>
                            </q-tab-panel>
                          </q-tab-panels>
                        </q-card>
                      </div>
                    </div>
                  </q-tab-panel>
                  <q-tab-panel
                    name="download"
                    ref="artifact"
                    class="artifact"
                    v-if="returnedUnmodifiedArtifacts.artifacts.length > 0"
                  >
                    <div id="downloadFiles">
                      <h3>Files to Download</h3>
                      <ul>
                        <li
                          v-for="(artifact) in
                            filteredDownloadArtifacts(returnedUnmodifiedArtifacts.artifacts)"
                          :key="artifact.identifier+'Download'"
                        >
                          <a v-if="(artifact.type !== 's3file')"
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
                          <a v-else
                             :href="artifact.url"
                          >{{ artifact.path }}</a>

                        </li>
                      </ul>
                    </div>
                  </q-tab-panel>
                </q-tab-panels>
              </q-card>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
</template>

<script>
// import Ace
import { SpringSpinner } from 'epic-spinners';
import { Form } from 'vee-validate';
import base64url from 'base64url';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  BIconDownload,
  BIconFileEarmarkCode,
  BIconFileEarmarkDiff,
  BIconFullscreen,
  BIconFullscreenExit,
  BIconInfoCircle,
  BIconPlay,
  BIconUpload,
} from 'bootstrap-icons-vue';
import { Loading } from 'quasar';
import AceEditorComponent from '../../components/EditorComponent-Ace.vue';

// own components
import Parameters from '../../components/Parameters.vue';
import GridPlot from '../../components/viplab-plots/gridplot/GridPlot.vue';
import VtkComponent from '../../components/vtk-plots/VtkComponent.vue';
import Plot2d from '../../components/viplab-plots/plot2d/plot2d.vue';
import CsvPlot from '../../components/csv-plots/CsvPlot.vue';

import AnsiOutput from '../../components/AnsiOutput.vue';

const Handlebars = require('handlebars');

// const Base64 = require('js-base64');

export default {
  name: 'ViPLab',
  components: {
    FontAwesomeIcon,
    SpringSpinner,
    Parameters,
    GridPlot,
    VtkComponent,
    Plot2d,
    CsvPlot,
    VForm: Form,
    AceEditorComponent,
    AnsiOutput,
    BIconInfoCircle,
    BIconFileEarmarkDiff,
    BIconFileEarmarkCode,
    BIconPlay,
    BIconDownload,
    BIconUpload,
    BIconFullscreen,
    BIconFullscreenExit,
  },
  data() {
    return {
      templates: require.context('../../input/', false, /^.*\.json$/).keys(), // get json file names from ./input folder
      numberOfInputFiles: [],
      computationId: '',
      returnedOutputJson: '',
      returnedUnmodifiedArtifacts: '',
      outputFiles: '',
      errorFiles: '',
      maximized: false,
      file: null,
      asForm: true,
      isPartParameters: 0,
      waitingResponse: false,
      statusMessage: { timestamp: '2022-04-21T06:30+01:00', message: 'Waiting...' },
      s3Contents: new Map(),
      isLoading: new Map(),
      promiseError: new Map(),
      selectedInputTab: '',
      selectedOutputTab: 'stdout',
      selectedVisualizationTab: '',
    };
  },
  watch: {
    json: {
      handler(val) {
        console.log(val);
        this.json = val;
        // update Vuex Store
        this.$store.commit('updateJsonTemplate', val);
        this.$forceUpdate();
      },
      deep: true,
    },
  },
  computed: {
    json: {
      get() {
        return this.$store.state.jsonTemplate;
      },
      set(newValue) {
        this.$store.commit('updateJsonTemplate', newValue);
      },
    },
    token: {
      get() {
        return this.$store.state.token;
      },
      set(newValue) {
        this.$store.commit('updateToken', newValue);
      },
    },
    dataTemplate: {
      get() {
        return this.$store.state.dataTemplate;
      },
      set(newValue) {
        this.$store.commit('updateDataTemplate', newValue);
      },
    },
    ws: {
      get() {
        return this.$store.state.ws;
      },
      set(newValue) {
        this.$store.commit('updateWebSocket', newValue);
      },
    },
    modifiedByTeacher: {
      get() {
        return this.$store.state.modifiedByTeacher;
      },
      set(newValue) {
        this.$store.commit('updateModifiedByTeacher', newValue);
      },
    },
    /* return parameters section of json file */
    parsedParametersJson() {
      const parsed = this.json.parameters;
      return parsed;
    },
    /* return files section of json file */
    parsedFilesJson() {
      const parsed = this.json.files;
      return parsed;
    },
    showHeader() {
      if (typeof this.json.metadata !== 'undefined') {
        if (typeof this.json.metadata.displayName !== 'undefined' || typeof this.json.metadata.description !== 'undefined') {
          return true;
        }
      }
      return false;
    },
  },
  methods: {
    // Make the function wait until the connection is made...
    waitForSocketConnection(context, socket, callback) {
      setTimeout(() => {
        if (socket.readyState === 1) {
          if (callback != null) {
            callback();
          }
        } else {
          context.waitForSocketConnection(context, socket, callback);
        }
      }, 5); // wait 5 milisecond for the connection...
    },
    sendWaiting(msg) {
      this.waitForSocketConnection(this, this.ws, () => {
        this.ws.send(msg);
      });
    },
    /* set the number of input files */
    setNumberOfInputFiles() {
      Object.values(this.json.files).forEach((file) => {
        this.numberOfInputFiles = file.parts.length;
      });
    },
    /** load json from file with temp being the file name, set this.json to the content of the file and fill form_v_model */
    loadJsonFromFile() {
      const appDiv = document.body;
      const data = appDiv.getAttribute('data-template');
      const token = appDiv.getAttribute('data-token');

      if (data && data !== '{{ data }}' && data !== '' && Object.keys(this.$store.state.jsonTemplate).length === 0) {
        this.json = JSON.parse(base64url.decode(data));
        this.$store.commit('updateDataTemplate', data);
      } else if (Object.keys(this.$store.state.jsonTemplate).length > 0) {
        if ((data && (data === '{{ data }}' || data === '')) || this.modifiedByTeacher) {
          this.json = this.$store.state.jsonTemplate;
          this.dataTemplate = this.$store.state.dataTemplate;
        } else {
          this.json = JSON.parse(base64url.decode(data));
          this.$store.commit('updateDataTemplate', data);
        }
      } else {
        this.json = {};
        this.dataTemplate = '';
      }

      if (token && token !== '{{ token }}' && token !== '' && this.$store.state.token.length === 0) {
        this.$store.commit('updateToken', appDiv.getAttribute('data-token'));
      } else if (this.$store.state.token.length > 0) {
        if ((token && (token === '{{ token }}' || token === '')) || this.modifiedByTeacher) {
          this.token = this.$store.state.token;
        } else {
          this.$store.commit('updateToken', appDiv.getAttribute('data-token'));
        }
      } else {
        this.token = '';
      }

      this.$store.commit('updateModifiedByTeacher', false);

      if (this.$store.state.dataTemplate.length === 0 && data !== '{{ data }}') {
        this.dataTemplate = data;
      } else if (this.$store.state.dataTemplate.length === 0 && Object.keys(this.$store.state.jsonTemplate).length > 0) {
        this.dataTemplate = base64url(JSON.stringify(this.$store.state.jsonTemplate));
      }

      // if there are parameters in parts, set var accordingly for rendering of button
      Object.values(this.json.files).forEach((file) => Object.values(file.parts).forEach((part) => {
        if (part.access === 'template' && part.parameters) {
          this.isPartParameters += 1;
        }
      }));

      this.setNumberOfInputFiles();
    },
    /** should be the first thing that is executed when DOM is loaded: setup connection to webserver */
    executeAfterDomLoaded() {
      this.$store.commit('updateWebSocket', new WebSocket(this.$config.WEBSOCKET_API));

      const message = JSON.stringify({ type: 'authenticate', content: { jwt: this.token } });
      this.sendWaiting(message);

      const prepareMessage = JSON.stringify({ type: 'prepare-computation', content: { template: this.dataTemplate, task: this.generateComputationTask() } });
      this.sendWaiting(prepareMessage);

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'computation':
            this.displayComputation(data.content);
            break;
          case 'prepared-computation':
            console.log(event.data);
            break;
          case 'result':
            this.displayResult(data.content);
            console.log(data.content);
            break;
          case 'system-status':
            // Check if date is newer than the one from the previous message
            // Set message-variable so that info-message can be displayed in the progress bar
            // If status is warning or error, stop progress bar, show error message to user and re-enable run-button
            if (new Date(this.statusMessage.timestamp) < new Date(data.content.timestamp)) {
              this.statusMessage = data.content;
              if (this.statusMessage.status !== 'info') {
                // stop waiting/ progress bar
                Loading.hide();
                this.waitingResponse = false;
                // show error in popup
                this.$alert(this.statusMessage.message, '', this.statusMessage.status);
              }
            }
            break;
          default:
            console.error(data);
        }

        if (this.outputFiles !== '' || this.errorFiles !== '' || this.returnedOutputJson !== '') {
          // stop waiting
          Loading.hide();
          this.waitingResponse = false;
        }
      };
      // document.getElementById("submit").onclick = this.sendData;
    },
    /** create uuid for the template to be sent as request */
    uuid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return (
        `${s4()
        + s4()
        }-${
          s4()
        }-${
          s4()
        }-${
          s4()
        }-${
          s4()
        }${s4()
        }${s4()}`
      );
    },
    /** send data to webserver for requesting the solution */
    sendData() {
      // reset result variables
      this.outputFiles = '';
      this.errorFiles = '';
      this.returnedOutputJson = '';
      this.returnedUnmodifiedArtifacts = '';
      this.selectedVisualizationTab = '';

      console.log(`sendData ${this.outputFiles}`);

      document.getElementById('submit').disabled = true;
      const task = {
        type: 'create-computation',
        content: {
          template: this.dataTemplate,
          task: this.generateComputationTask(),
        },
      };

      this.ws.send(JSON.stringify(task));

      // start waiting
      Loading.show();
      this.waitingResponse = true;

      return false;
    },
    stopComputation() {
      // send cancel-message to websocket
      const cancel = {
        type: 'cancel-computation',
        content: {
          computation: this.computationId,
        },
      };
      this.ws.send(JSON.stringify(cancel));
      // stop waiting
      Loading.hide();
      this.waitingResponse = false;
    },
    generateComputationTask() {
      const task = {
        template: this.json.identifier,
        identifier: this.uuid(),
        files: [],
      };

      if (this.$refs.file != null) {
        Object.keys(this.json.files).forEach((fileIndex) => {
          const file = { identifier: this.json.files[fileIndex].identifier, parts: [] };
          Object.keys(this.json.files[fileIndex].parts).forEach((part) => {
            // for access modifiable or access template, where the content is available
            if (this.json.files[fileIndex].parts[part].access === 'modifiable') {
              file.parts.push({
                identifier: this.json.files[fileIndex].parts[part].identifier,
                content: this.json.files[fileIndex].parts[part].content,
              });
            // Generate json for access template parameters, if there is no content given
            } else if (this.json.files[fileIndex].parts[part].access === 'template') {
              const generatedContent = JSON.parse('{}');
              Object.keys(this.json.files[fileIndex].parts[part].parameters).forEach((paramIndex) => {
                const currentParam = this.json.files[fileIndex].parts[part].parameters[paramIndex];
                let value = currentParam.value || currentParam.selected;

                /* If parameter is editor or text-input, add prefix to signal to websocket-api, that value is base64url-encoded */
                if (currentParam.metadata.guiType === 'editor' || (currentParam.metadata.guiType === 'input_field' && currentParam.metadata.type === 'text')) {
                  value = `base64:${value}`;
                }
                /* If Parameter is single-value slider or input_field of type number, use string/number as result, instead of array */
                if ((currentParam.metadata.guiType === 'slider' && value.length === 1) || (currentParam.metadata.guiType === 'input_field' && currentParam.metadata.type === 'number' && Array.isArray(value))) {
                  [value] = value;
                }

                generatedContent[currentParam.identifier] = value;
              });
              const contentBase64 = base64url(JSON.stringify(generatedContent));

              file.parts.push({
                identifier: this.json.files[fileIndex].parts[part].identifier,
                content: contentBase64,
              });
            }
          });
          task.files.push(file);
        });

        // Add arguments to task - only fixed-value parameters!
        if (Object.prototype.hasOwnProperty.call(this.json, 'parameters')) {
          const args = {};
          Object.values(this.json.parameters).forEach((parameter) => {
            args[parameter.identifier] = parameter.value || parameter.selected;
          });
          task.arguments = args;
        }
      }

      return task;
    },
    /** log the computation */
    displayComputation(computation) {
      console.log('----------');
      console.log('computation:');
      console.log(computation);
      console.log('----------');
      this.computationId = computation.id;
    },
    /** process the result before displaying it in the DOM */
    displayResult(result) {
      if (result.result.status === 'final') {
        document.getElementById('submit').disabled = false;
      }

      // if the first result came back, set the whole object, else, only add the new artifacts to the existing object
      // use JSON.parse(JSON.stringify(...)) to make sure a copy of the data is made, such that not only a reference is used
      if (this.returnedOutputJson === '') {
        this.returnedOutputJson = {
          identifier: result.result.identifier,
          version: result.result.version,
          computation: result.result.computation,
          status: 'final',
          timestamp: '',
          output: {
            stdout: '',
            stderr: '',
          },
          artifacts: [],
        };
        this.returnedUnmodifiedArtifacts = JSON.parse(JSON.stringify(this.returnedOutputJson));
      }
      this.returnedUnmodifiedArtifacts.artifacts = this.returnedUnmodifiedArtifacts.artifacts.concat(JSON.parse(JSON.stringify(result.result.artifacts)));

      this.returnedUnmodifiedArtifacts.artifacts.sort((a, b) => a.path.localeCompare(b.path));

      // filter result such that only specified results are displayed
      const viewer = this.json?.metadata?.output?.viewer ?? [];
      let returnedArtifacts = JSON.parse(JSON.stringify(result.result.artifacts));
      if (!viewer.includes('Image')) {
        returnedArtifacts = returnedArtifacts.filter(
          (value) => value.MIMEtype !== 'image/png' || value.MIMEtype !== 'image/jpeg',
        );
      }
      if (!viewer.includes('ParaView')) {
        returnedArtifacts = returnedArtifacts.filter(
          (value) => value.MIMEtype !== 'application/vnd.kitware',
        );
      }
      if (!viewer.includes('ViPLabGraphics')) {
        returnedArtifacts = returnedArtifacts.filter(
          (value) => (value.MIMEtype !== 'application/x-vgf')
            && (value.MIMEtype !== 'application/x-vgf3')
            && (value.MIMEtype !== 'application/x-vgfc'),
        );
      }
      if (!viewer.includes('CSV')) {
        returnedArtifacts = returnedArtifacts.filter(
          (value) => value.MIMEtype !== 'text/csv',
        );
      }

      /* eslint no-param-reassign: ["error", { "props": false }] */
      // process vtk-files with base64-content
      returnedArtifacts.forEach((item) => {
        if (item.MIMEtype === 'application/vnd.kitware') {
          if (item.content) {
            // generate Object-URLs of the base64url encoded content
            const byteCharacters = base64url.decode(item.content);
            const byteArrays = [];
            const sliceSize = 512;

            for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
              const slice = byteCharacters.slice(offset, offset + sliceSize);

              const byteNumbers = new Array(slice.length);
              for (let i = 0; i < slice.length; i += 1) {
                byteNumbers[i] = slice.charCodeAt(i);
              }

              const byteArray = new Uint8Array(byteNumbers);
              byteArrays.push(byteArray);
            }

            const blob = new Blob(byteArrays, { type: 'application/vnd.kitware' });
            // generate file from blob to retain the file name with the correct extension (for usage in vtk-component)
            const file = new File([blob], 'earth.vtp');
            const blobUrl = URL.createObjectURL(file);
            item.content = blobUrl;
          }
        }
      });

      // process connected vtu/vtk & csv files
      const connectedVtks = {};
      const { artifacts } = this.returnedOutputJson;
      // isNew flag to ensure that connected files are only added once
      artifacts.forEach((artifact) => {
        if (artifact.basename) {
          connectedVtks[artifact.basename] = artifact;
          connectedVtks[artifact.basename].isNew = false;
        }
      });

      // get basenames for collections of files
      let outputConfig = [];
      if (typeof this.json.metadata !== 'undefined') {
        if (this.json.metadata.output !== undefined) {
          if (this.json.metadata.output.csv !== undefined) {
            outputConfig = outputConfig.concat(this.json.metadata.output.csv);
          }
          if (this.json.metadata.output.vtk !== undefined) {
            outputConfig = outputConfig.concat(this.json.metadata.output.vtk);
          }
        }
      }

      if (outputConfig.length > 0) {
        const basenames = [];
        for (let out = 0; out < outputConfig.length; out += 1) {
          const currentConfig = outputConfig[out];
          const currentBasename = currentConfig.basename;
          if (!basenames.includes(currentBasename)) {
            basenames.push(currentBasename);
          }

          if (!connectedVtks[currentBasename]) {
            connectedVtks[currentBasename] = {};
            connectedVtks[currentBasename].type = 's3file';
            connectedVtks[currentBasename].basename = currentBasename;
            connectedVtks[currentBasename].identifier = this.uuid();
            connectedVtks[currentBasename].urlsOrContents = [];
            connectedVtks[currentBasename].plots = currentConfig.plots;
            connectedVtks[currentBasename].xlabel = currentConfig.xlabel;
            connectedVtks[currentBasename].isConnected = true;
            connectedVtks[currentBasename].isNew = true;
          }
        }

        // group results according to the available basenames
        for (let a = 0; a < returnedArtifacts.length; a += 1) {
          if (returnedArtifacts[a].MIMEtype === 'application/vnd.kitware'
              || returnedArtifacts[a].MIMEtype === 'text/csv') {
            const { path } = returnedArtifacts[a];
            const lastIndex = path.lastIndexOf('/');
            const filenamePart = path.substr(lastIndex + 1, path.length);

            for (let base = 0; base < basenames.length; base += 1) {
              const currentBasename = basenames[base];
              // filename has to start with basename
              if (filenamePart.startsWith(currentBasename)) {
                connectedVtks[currentBasename].type = returnedArtifacts[a].type;
                // connectedVtks[currentBasename].identifier = returnedArtifacts[a].identifier;
                connectedVtks[currentBasename].MIMEtype = returnedArtifacts[a].MIMEtype;
                connectedVtks[currentBasename].basename = currentBasename;
                if (returnedArtifacts[a].url) {
                  connectedVtks[currentBasename].urlsOrContents.push(returnedArtifacts[a].url);
                } else {
                  connectedVtks[currentBasename].urlsOrContents.push(returnedArtifacts[a].content);
                }
                returnedArtifacts[a].inCollection = true;
              }
            }
          }
        }

        // delete all vtk and csv artifacts that are part of a collection
        let b = returnedArtifacts.length - 1;
        while (b >= 0) {
          if (returnedArtifacts[b].inCollection) {
            returnedArtifacts.splice(b, 1);
          }
          b -= 1;
        }

        // add vtk/csv collections
        const connectedFilesKeys = Object.keys(connectedVtks);
        for (let c = 0; c < connectedFilesKeys.length; c += 1) {
          if (connectedVtks[connectedFilesKeys[c]].isNew && connectedVtks[connectedFilesKeys[c]].urlsOrContents.length > 0) {
            this.returnedOutputJson.artifacts.push(connectedVtks[connectedFilesKeys[c]]);
          }
          if (connectedVtks[connectedFilesKeys[c]].urlsOrContents.length > 1) {
            connectedVtks[connectedFilesKeys[c]].urlsOrContents.sort((a, b) => a.localeCompare(b));
          }
        }
      }

      // filter returnedOutputJson to only include displayable results
      const displayableMIMEtypes = ['text/plain', 'text/csv', 'text/uri-list', 'image/png', 'image/jpeg', 'application/x-vgf', 'application/x-vgf3', 'application/x-vgfc', 'application/vnd.kitware', 'application/json'];
      returnedArtifacts = returnedArtifacts.filter(
        (value) => displayableMIMEtypes.includes(value.MIMEtype),
      );

      Object.values(returnedArtifacts).forEach((currentArtifact) => {
        if (currentArtifact.type === 's3file') {
          if (currentArtifact.MIMEtype === 'text/plain' || currentArtifact.MIMEtype === 'application/json') {
            this.getContentFromS3(currentArtifact.url);
          } else if (currentArtifact.MIMEtype === 'application/x-vgf' || currentArtifact.MIMEtype === 'application/x-vgf3' || currentArtifact.MIMEtype === 'application/x-vgfc') {
            this.getContentFromS3(currentArtifact.url, true);
          }
        }
      });
      returnedArtifacts.forEach((artifact) => this.returnedOutputJson.artifacts.push(artifact));
      this.returnedOutputJson.artifacts.sort((a, b) => {
        const a_path = a.path ?? a.basename;
        const b_path = b.path ?? b.basename;
        return a_path.localeCompare(b_path);
      });
      if (this.selectedVisualizationTab === '' && this.filteredArtifacts(this.returnedOutputJson.artifacts).length > 0) {
        this.selectedVisualizationTab = this.filteredArtifacts(this.returnedOutputJson.artifacts)[0].identifier;
      }
      // TODO: Vars nicht überschreiben, sondern ergänzen für intermediate
      this.outputFiles = this.outputFiles.concat(base64url.decode(result.result.output.stdout));
      this.errorFiles = this.errorFiles.concat(base64url.decode(result.result.output.stderr));
      this.$forceUpdate();
    },
    /** get content from s3 */
    async getContentFromS3(url, isViPLabGraphics = false) {
      this.isLoading.set(url, true);
      this.promiseError.set(url, null);

      fetch(url, { method: 'GET' })
        .then((response) => {
          if (response.ok) {
            return response.text();
          }
          throw new Error('Something went wrong');
        })
        .then((responseText) => {
          if (!isViPLabGraphics) {
            this.s3Contents.set(url, base64url(responseText));
          } else {
            this.s3Contents.set(url, responseText);
          }
        })
        .catch((error) => {
          this.promiseError.set(url, error);
        })
        .finally(() => {
          this.isLoading.set(url, false);
          this.$forceUpdate();
        });
    },
    /**  return base64 image src for img-tag */
    imagesrc(base64Image, mimetype) {
      const base64 = base64Image.replaceAll('-', '+').replaceAll('_', '/');
      if (base64.length % 4 !== 0) {
        base64.concat('='.repeat(4 - (base64.length % 4)));
      }
      if (mimetype === 'image/jpeg') {
        return `data:image/jpeg;base64,${base64}`;
      }
      return `data:image/png;base64,${base64}`;
    },
    /** Save file locally on click from the user */
    async save(filename, identifier, mimetype) {
      let content = '';
      this.returnedUnmodifiedArtifacts.artifacts.forEach((item) => {
        if (item.identifier === identifier && item.content) {
          if (item.MIMEtype !== 'image/png' && item.MIMEtype !== 'image/jpeg') {
            content = base64url.decode(item.content);
          } else {
            content = item.content;
          }
        } else if (item.identifier === identifier) {
          // handle files that were downloaded from s3
          let itemContent = '';
          itemContent = item.url;
          content = itemContent;
        }
      });

      let downloadNecessary = true;
      let blob = '';
      if ((mimetype === 'image/png' || mimetype === 'image/jpeg') && !(content.includes('blob:http')) && !(content.startsWith('http'))) {
        downloadNecessary = false;
        const base64 = this.imagesrc(content, mimetype);
        fetch(base64)
          .then((res) => res.blob())
          .then((contentBlob) => {
            const elem = window.document.createElement('a');
            elem.href = window.URL.createObjectURL(contentBlob);
            elem.download = filename;
            document.body.appendChild(elem);
            elem.click();
            document.body.removeChild(elem);
          });
      } else if (((mimetype === 'image/png' || mimetype === 'image/jpeg') && content.includes('blob:http')) || content.startsWith('http')) {
        // handle files that were downloaded from s3
        blob = await fetch(content).then((response) => response.blob());
      } else {
        blob = new Blob([content], { mimetype });
      }

      if (downloadNecessary) {
        if (window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveBlob(blob, filename);
        } else {
          const elem = window.document.createElement('a');
          elem.href = window.URL.createObjectURL(blob);
          elem.download = filename;
          document.body.appendChild(elem);
          elem.click();
          document.body.removeChild(elem);
        }
      }
      return false;
    },
    /** Maximize the window, meaning that the two columns are displayed underneath each other */
    maximize() {
      this.maximized = !this.maximized;
    },
    /* download Computation Task JSON Message */
    download() {
      // first, generate the computation task json message
      const taskJson = {};
      taskJson.template = this.json.identifier;
      const args = [];
      Object.values(this.json.parameters).forEach((param) => {
        const arg = {};
        if (param.selected) {
          arg.identifier = param.identifier;
          arg.value = param.selected;
        } else if (param.value) {
          arg.identifier = param.identifier;
          arg.value = param.value;
        } else {
          arg.identifier = param.identifier;
          arg.value = '';
        }
        args.push(arg);
      });
      taskJson.arguments = args;
      const parts = [];
      Object.values(this.json.files).forEach((file) => {
        Object.values(file.parts).forEach((part) => {
          if (part.access !== 'visible') {
            parts.push(part);
          }
        });
      });
      taskJson.parts = parts;

      // now download json
      const dataStr = `data:text/json;charset=utf-8,${
        encodeURIComponent(JSON.stringify(taskJson))}`;
      const exportName = this.json.identifier;
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute('href', dataStr);
      downloadAnchorNode.setAttribute('download', `${exportName}.json`);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    },
    /* upload Computation Task JSON Message */
    upload(event) {
      const reader = new FileReader();
      reader.onload = this.onReaderLoad;
      reader.readAsText(event.target.files[0]);
    },
    /* get json from uploaded file und update DOM */
    onReaderLoad(event) {
      const obj = JSON.parse(event.target.result);
      // apply changes to current json
      const templateId = obj.template;
      if (templateId === this.json.identifier) {
        // parse parameters/arguments
        Object.keys(obj.arguments).forEach((a) => {
          const currentArg = obj.arguments[a];
          const argId = currentArg.identifier;
          const argValue = currentArg.value;
          const currentParam = this.json.parameters[a];
          if (argId === currentParam.identifier) {
            if (currentParam.selected) {
              currentParam.selected = argValue;
            } else {
              currentParam.value = argValue;
            }
          }
        });

        // parse parts
        Object.values(obj.parts).forEach((currentPart) => {
          const partId = currentPart.identifier;
          Object.values(this.json.files).forEach((file) => {
            Object.values(file.parts).forEach((part) => {
              if (part.identifier === partId) {
                // set content of parts
                // this.json.files[f].parts[oldp].content = obj.parts[p].content;
                part.content = currentPart.content;
                this.$forceUpdate();
                // set parameters of parts
                Object.values(part.parameters).forEach((parameterFromJson) => {
                  Object.values(currentPart.parameters).forEach((parameterFromObj) => {
                    if (parameterFromObj.identifier === parameterFromJson.identifier) {
                      if (parameterFromJson.selected) {
                        parameterFromJson.selected = parameterFromObj.selected;
                      } else {
                        parameterFromJson.value = parameterFromObj.value;
                      }
                    }
                  });
                });
              }
            });
          });
        });
      }
    },
    /** For the sticky play button: emit a scroll event when files tab is changed, so that the sticky-button is reloaded in the right place */
    tabClicked() {
      window.scrollTo(window.scrollX, window.scrollY - 1);
      window.scrollTo(window.scrollX, window.scrollY + 1);
    },
    /** Parse the json and add elements for gui/parameter rendering
     * Add value element for parameters of mode any
     * else add selected elements for parameters of mode fixed
     */
    parseParametersForGuiGeneration(currentParameter) {
      const { mode } = currentParameter;
      // add value-item to parameters with mode == any
      if (mode === 'any') {
        // create reactive object value in curr with curr.default as content
        currentParameter.value = currentParameter.default;
      } else {
        // add selected-item to parameters with mode == fixed
        const arr = [];
        const { options } = currentParameter;
        Object.values(options).forEach((option) => {
          if (option.selected) {
            arr.push(option.value);
          }
        });
        if (currentParameter.metadata.guiType === 'radio' || (currentParameter.metadata.guiType === 'dropdown' && !currentParameter.multiple) || (currentParameter.metadata.guiType === 'input_field')) {
          [currentParameter.selected] = arr;
        } else {
          currentParameter.selected = arr;
        }
      }
    },
    // switch between the form (to modify the parameters) and the handlebar template with the filled out parameters
    switchParameterView() {
      this.asForm = !this.asForm;
    },
    // fill in content of handlebar template with selected parameter values return it
    showHandlebarsTemplate(part, forSend = false) {
      // To disable Mustache HTML-escaping behaviour, use three curly brackets, instead of two!
      // If the template should be displayed
      // TODO: is this still needed in handlebars?
      if (!this.asForm || forSend) {
        if (part.content !== '') {
          const handlebarsTemplate = base64url.decode(part.content);
          const view = {};
          // Get values that will be substituted into the template
          Object.values(part.parameters).forEach((currentParam) => {
            const currentValue = currentParam.value || currentParam.selected;
            view[currentParam.identifier] = currentValue;
          });
          // Substitute values in handlebars template
          const template = Handlebars.compile(handlebarsTemplate);
          return template(view);
        }
      }
      /** Get Content from separate file */
      return '';
    },
    generateHandlebarsDivId(partId) {
      return `handlebars${partId}`;
    },
    /** get filename from part for displaying it as the tab-name */
    getFilename(path) {
      let filename = path;
      if (path.includes('/')) {
        filename = path.slice(path.lastIndexOf('/') + 1, path.length);
      }
      return filename;
    },
    updateContent(fileIndex, partIndex, event) {
      this.json.files[fileIndex].parts[partIndex].content = event;
    },
    calculateFirstLineNumber(allParts, partIndex) {
      let firstLine = 1;
      if (partIndex > 0) {
        for (let previousPartIndex = 0; previousPartIndex < partIndex; previousPartIndex += 1) {
          const previousPart = allParts[previousPartIndex];
          const decodedPreviousContent = base64url.decode(previousPart.content);
          const lines = decodedPreviousContent.split(/\r\n|\r|\n/).length;
          firstLine += lines;
        }
      }
      return firstLine;
    },
    getLinks(base64UriContent) {
      const decodedString = base64url.decode(base64UriContent);
      const uriArray = decodedString.split('\n');
      return uriArray;
    },
    downloadFromLink(dataurl) {
      const filename = dataurl.slice(dataurl.lastIndexOf('/') + 1, dataurl.length);

      fetch(dataurl)
        .then((response) => response.arrayBuffer())
        .then((response) => {
          const blob = new Blob([response], { type: 'application/octet-stream' });
          const link = document.createElement('a');
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          link.click();
          link.remove();
          // in case the Blob uses a lot of memory
          setTimeout(() => URL.revokeObjectURL(link.href), 7000);
        })
        .catch(console.error);
    },
    filteredArtifacts(artifactsArray) {
      const availableMIMEtypes = ['text/plain', 'text/uri-list', 'application/json', 'image/png', 'image/jpeg', 'application/x-vgf', 'application/x-vgf3', 'application/x-vgfc', 'text/csv', 'application/vnd.kitware'];
      let filenamefilter = [];
      // TODO replace with es2020 syntax
      if (typeof this.json.metadata !== 'undefined') {
        if (typeof this.json.metadata.output !== 'undefined') {
          if (typeof this.json.metadata.output.ignore !== 'undefined') {
            if (typeof this.json.metadata.output.ignore.visualization !== 'undefined') {
              filenamefilter = this.json.metadata.output.ignore.visualization.map((filename) => {
                const w = filename.replace(/[.+^${}()|[\]\\]/g, '\\$&'); // regexp escape
                return new RegExp(`^${w.replace(/\*/g, '.*').replace(/\?/g, '.')}$`);
              });
            }
          }
        }
      }
      const filtered = artifactsArray
        .filter((artifact) => (availableMIMEtypes.indexOf(artifact.MIMEtype) > -1))
        .filter((artifact) => filenamefilter.every((filterregex) => !filterregex.test(artifact.path)));
      return filtered;
    },

    filteredDownloadArtifacts(artifactsArray) {
      let filenamefilter = [];
      // TODO replace with es2020 syntax
      if (typeof this.json.metadata !== 'undefined') {
        if (typeof this.json.metadata.output !== 'undefined') {
          if (typeof this.json.metadata.output.ignore !== 'undefined') {
            if (typeof this.json.metadata.output.ignore.download !== 'undefined') {
              filenamefilter = this.json.metadata.output.ignore.download.map((filename) => {
                const w = filename.replace(/[.+^${}()|[\]\\]/g, '\\$&'); // regexp escape
                return new RegExp(`^${w.replace(/\*/g, '.*').replace(/\?/g, '.')}$`);
              });
            }
          }
        }
      }
      const filtered = artifactsArray
        .filter((artifact) => filenamefilter.every((filterregex) => !filterregex.test(artifact.path)));
      return filtered;
    },
  },
  created() {
    this.loadJsonFromFile();
    // parse the parameters and add items for generating the gui and modifing the content
    // first: modify parameters section
    const keys = Object.keys(this.json);
    if (keys.find((key) => key === 'parameter')) {
      this.json.parameters.forEach(
        (curr) => this.parseParametersForGuiGeneration(curr),
      );
    }
    // then: modify the parameters inside the parts
    if (keys.find((key) => key === 'files')) {
      Object.values(this.json.files).forEach((file) => {
        Object.values(file.parts).forEach((part) => {
          Object.values(part.parameters).forEach((parameter) => {
            this.parseParametersForGuiGeneration(parameter);
          });
        });
      });
    }
  },
  mounted() {
    this.executeAfterDomLoaded();
    this.selectedInputTab = this.json.files[0].identifier;
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
    width: 75%;
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
  }

  .flex-container {
    display: flex;
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
  }

  .item-name {
    font-weight: bold;
    font-size: 14pt;
  }

  .desc-file-part {
    font-style: italic;
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
</style>
