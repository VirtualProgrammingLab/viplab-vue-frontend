<template>
  <!-- content -->
    <q-layout id="teacher" view="hHh lpR lFr">

    <q-header class="column justify-center teacher-header">
            <h3 class="center">
              This site will help you create a Computation Template
              <a class="ct-docu-link" href="https://virtualprogramminglab.github.io/documentation/viplab-3.0/computation_template/" title="Go to Documentation for more Info" target="_blank"><BIconBook>Go to Documentation for more Info</BIconBook></a>
            </h3>

            <q-btn disable class="center header-button" id="start-guide" variant="outline-primary" @click="startGuide">Start Guide</q-btn>

            <input
                    type="file"
                    ref="upload"
                    style="display: none"
                    @change="uploadCT"
                    accept="application/JSON"
                  />
                  <q-btn
                    class="center header-button"
                    id="upload-existing"
                    variant="outline-primary"

                    @click="$refs.upload.click()"
                  >
                    <q-tooltip anchor="top middle">Upload of previously created template</q-tooltip>
                    Modify existing Template
                    <BIconUpload icon="upload" aria-hidden="true"></BIconUpload>
                  </q-btn>
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleComponents" >Toggle Components</q-btn>

        <q-toolbar-title>

        </q-toolbar-title>

        <q-btn dense flat round icon="menu" @click="toggleConfiguration" >Toggle Configuration </q-btn>
      </q-toolbar>
        </q-header>
      <q-drawer show-if-above class="select-list" v-model="showComponents"  side="left" bordered>
          Components
            <!-- Drag-and-Drop Components -->
              <div class="mb-2">Template elements:</div>
              <transition-group name="list" tag="div">
                <drag :key="'file'"
                      class="drag"
                      :type="'file'">
                  file
                  <div class="pl-2">
                    <q-tooltip anchor="top middle">Drop this to the middle-section, if you want to show the user a file or let the user modify it.</q-tooltip>
                    <BIconInfoCircle ></BIconInfoCircle>
                  </div>
                </drag>
                <drag v-if="!hasTemplateParameters"
                      :key="'commandline arguments'"
                      class="drag"
                      :type="'commandline arguments'">
                  commandline arguments
                  <div class="pl-2">
                    <q-tooltip anchor="top middle">
                      Drop this to the middle-section, if you want to let the user set values of commandline arguments.
                    </q-tooltip>
                    <BIconInfoCircle ></BIconInfoCircle>
                  </div>
                </drag>
              </transition-group>
              <div v-if="hasTemplateFiles">
                <div class="mb-2">File elements:</div>
                <transition-group name="list" tag="div">
                  <drag v-for="n in componentsFile"
                        :key="n"
                        class="drag"
                        :type="n">
                    {{n}}
                    <div class="tooltip-icon pl-2">
                      <BIconInfoCircle v-if="n === 'part'">
                        <q-tooltip anchor="top middle">
                          Drop this to the middle-section, if you want to add content to a file. You can also split the content of a file in several parts and decide individually for each file, whether the user will be able to see or even modify it.
                        </q-tooltip>
                      </BIconInfoCircle>
                    </div>
                  </drag>
                </transition-group>
              </div>
              <div v-if="hasTemplateFilePartsWithTemplate">
                <div class="mb-2">Part elements:</div>
                <transition-group name="list" tag="div">
                  <drag v-for="n in availableGuiTypes"
                        :key="n"
                        class="drag"
                        :type="n">
                    {{n}}
                    <div class="tooltip-icon pl-2">
                      <q-tooltip anchor="top middle" v-if="n === 'file'">Drop this to the middle-section, if you want to show the user a file or let the user modify it.</q-tooltip>
                      <q-tooltip anchor="top middle" v-if="n === 'part'">Drop this to the middle-section, if you want to add content to a file. You can also split the content of a file in several parts and decide individually for each file, whether the user will be able to see or even modify it.</q-tooltip>
                      <q-tooltip anchor="top middle" v-if="n === 'checkbox'">Drop this to the middle-section, if you want the user to be able to modify a parameter using a checkox.</q-tooltip>
                      <q-tooltip anchor="top middle" v-if="n === 'radio'">Drop this to the middle-section, if you want the user to be able to modify a parameter using a radio-button.</q-tooltip>
                      <q-tooltip anchor="top middle" v-if="n === 'dropdown'">Drop this to the middle-section, if you want the user to be able to modify a parameter using a dropdown.</q-tooltip>
                      <q-tooltip anchor="top middle" v-if="n === 'toggle'">Drop this to the middle-section, if you want the user to be able to modify a parameter using a toggle-button.</q-tooltip>
                      <q-tooltip anchor="top middle" v-if="n === 'input_field'">Drop this to the middle-section, if you want the user to be able to modify a parameter using an input_field.</q-tooltip>
                      <q-tooltip anchor="top middle" v-if="n === 'editor'">Drop this to the middle-section, if you want the user to be able to modify a parameter using an editor.</q-tooltip>
                      <q-tooltip anchor="top middle" v-if="n === 'slider'">Drop this to the middle-section, if you want the user to be able to modify a parameter using a slider.</q-tooltip>
                      <BIconInfoCircle></BIconInfoCircle>
                    </div>
                  </drag>
                </transition-group>
              </div>
              <div v-if="hasTemplateParameters">
                <div class="mb-2">Commandline Argument elements:</div>
                <transition-group name="list" tag="div">
                  <drag v-for="n in componentsCommand"
                        :key="n"
                        class="drag"
                        :type="n">
                    {{n}}
                    <div class="tooltip-icon pl-2">
                      <q-tooltip anchor="top middle" v-if="n === 'checkbox'">Drop this to the middle-section, if you want the user to be able to modify a commandline argument using a checkox.</q-tooltip>
                      <q-tooltip anchor="top middle" v-if="n === 'radio'">Drop this to the middle-section, if you want the user to be able to modify a commandline argument using a radio-button.</q-tooltip>
                      <q-tooltip anchor="top middle" v-if="n === 'dropdown'">Drop this to the middle-section, if you want the user to be able to modify a commandline argument using a dropdown.</q-tooltip>
                      <q-tooltip anchor="top middle" v-if="n === 'toggle'">Drop this to the middle-section, if you want the user to be able to modify a commandline argument using a toggle-button.</q-tooltip>
                      <BIconInfoCircle></BIconInfoCircle>
                    </div>
                  </drag>
                </transition-group>
              </div>
      </q-drawer>
      <q-drawer show-if-above class="select-list" v-model="showConfiguration" side="right" bordered>
        Configuration
                <div class="preferences-list">
                <!-- Template Data -->
                <div v-if="showTemplateConfig">

                  <!-- Environment -->
                  <div id="run-configuration">

                    <label class="mr-2" for="computationTemplate.environment">Environment: </label>
                    <div class="d-flex form-group">
                      <div class="dropdown flex-grow-1">
                        <select
                          class="form-control"
                          v-model="computationTemplate.environment"
                          @change="addConfig()"
                        >
                          <option disabled>C</option>
                          <option disabled>C++</option>
                          <option disabled>Java</option>
                          <option disabled>Matlab</option>
                          <option disabled>Octave</option>
                          <option>Container</option>
                          <option disabled>DuMuX</option>
                        </select>
                      </div>
                      <!-- tooltip -->
                      <div class="tooltip-icon pl-2">
                        <BIconInfoCircle></BIconInfoCircle>
                        <q-tooltip anchor="top middle">Specifies the environment used for the Computation. It defines language, runtime, libraries and tools.'"</q-tooltip>
                      </div>
                    </div>

                    <!-- Configuration -->
                    <div v-if="typeof computationTemplate.configuration !== 'undefined' && computationTemplate.environment !== ''" class="border mb-2 p-2">

                      <!-- resources.image -->
                      <div v-if="computationTemplate.environment === 'Container'" id="image">
                        <label class="mr-2">Docker-Image*:</label>
                        <div class="d-flex form-group">
                          <div class="flex-grow-1">
                            <input type="text" class="form-control" :value="getConfigvModel('resources.image', null)" @input="setConfigvModel('resources.image', $event, null)">
                          </div>
                          <!-- tooltip -->
                          <div>
                            <BIconInfoCircle />
                            <q-tooltip anchor="top middle">Location of the image to be executed. Can have one of the following prefixes: name://, file://, id://</q-tooltip>
                          </div>
                        </div>
                      </div>

                      <!-- running.timelimitInSeconds -->
                      <div v-if="computationTemplate.environment === 'Container'">
                        <label class="mr-2">Time Limit for Running the Container (in Seconds):</label>
                        <div class="d-flex form-group">
                          <div class="flex-grow-1">
                            <input type="number" class="form-control" :value="getConfigvModel('running.timelimitInSeconds', null)" @input="setConfigvModel('running.timelimitInSeconds', $event, null, true)">
                          </div>
                          <!-- tooltip -->
                          <div class="tooltip-icon pl-2">
                            <BIconInfoCircle></BIconInfoCircle>
                            <q-tooltip anchor="top middle">CPU time limit.</q-tooltip>
                          </div>
                        </div>
                      </div>

                      <!-- running.commandLineArguments -->
                      <div v-if="computationTemplate.environment === 'Container'">
                        <label class="mr-2">Commandline Arguments:</label>
                        <div class="d-flex form-group">
                          <div class="flex-grow-1">
                            <input type="text" class="form-control" :value="getConfigvModel('running.commandLineArguments', null)" @input="setConfigvModel('running.commandLineArguments', $event, null)">
                          </div>
                          <!-- tooltip -->
                          <div class="tooltip-icon pl-2">
                            <BIconInfoCircle></BIconInfoCircle>
                            <q-tooltip anchor="top middle">For C, C++, Java: arguments given to main() function; For DuMuX, Container: Additional command line arguments.</q-tooltip>
                          </div>
                        </div>
                      </div>

                      <!-- running.entrypoint -->
                      <div v-if="computationTemplate.environment === 'Container'">
                        <label class="mr-2">Docker Entrypoint:</label>
                        <div class="d-flex form-group">
                          <div class="flex-grow-1">
                            <input type="text" class="form-control" :value="getConfigvModel('running.entrypoint', null)" @input="setConfigvModel('running.entrypoint', $event, null)">
                          </div>
                          <!-- tooltip -->
                          <div class="tooltip-icon pl-2">
                            <BIconInfoCircle></BIconInfoCircle>
                            <q-tooltip anchor="top middle">Executable to run inside the Container. For Container: Can contain handlebar template syntax for injecting PARAM_IDs.</q-tooltip>
                          </div>
                        </div>
                      </div>

                      <!-- running.intermediateFilesPattern -->
                      <div v-if="computationTemplate.environment === 'Container'">
                        <label class="mr-2">RegEx-Pattern for Intermediate Result Files:</label>
                        <div class="d-flex form-group">
                          <div class="flex-grow-1">
                            <div class="ml-4 mr-4">
                              <!-- set how many values the config should have -->
                              <label for="'running.intermediateFilesPattern-sb-options'">How many Patterns should there be?</label>
                              <!-- <b-form-spinbutton :id="'running.intermediateFilesPattern-sb-options'" placeholder="0" min="0" :value="getNumberofConfigFields('running.intermediateFilesPattern')" class="mb-2" @change="setNumberOfConfigFields('running.intermediateFilesPattern', $event)"></b-form-spinbutton>-->
                              <!-- input config-values -->
                              <div class="border mb-2 p-2" v-for="(field, index) in getNumberofConfigFields('running.intermediateFilesPattern')" :key="'running.intermediateFilesPattern-' + index">
                                <!-- value -->
                                <label>Set value(s):</label>
                                <input type="text" class="form-control" :value="getConfigvModel('running.intermediateFilesPattern', index)" @input="setConfigvModel('running.intermediateFilesPattern', $event, index)">
                              </div>
                            </div>
                          </div>
                          <!-- tooltip -->
                          <div class="tooltip-icon pl-2">
                            <BIconInfoCircle></BIconInfoCircle>
                            <q-tooltip anchor="top middle">If there are result-files, that are generated step by step, the Backend needs to be notified whether a file was written. This is done by using a RegEx-Expression. The Backend searches for those patterns in Stdout, to find files which are ready to be transferred to the Frontend, so that the results can be displayed.</q-tooltip>
                          </div>
                        </div>
                      </div>

                      <!-- running.userId -->
                      <div v-if="computationTemplate.environment === 'Container'">
                        <label class="mr-2">User-Id:</label>
                        <div class="d-flex form-group">
                          <div class="flex-grow-1">
                            <input type="text" class="form-control" :value="getConfigvModel('running.userId', null)" @input="setConfigvModel('running.userId', $event, null, true)">
                          </div>
                          <!-- tooltip -->
                          <div class="tooltip-icon pl-2">
                            <BIconInfoCircle></BIconInfoCircle>
                            <q-tooltip anchor="top middle">User id of the user that writes files inside the Container.</q-tooltip>
                          </div>
                        </div>
                      </div>

                      <!-- resources.volume -->
                      <div v-if="computationTemplate.environment === 'Container'">
                        <label class="mr-2">Volume:</label>
                        <div class="d-flex form-group">
                          <div class="flex-grow-1">
                            <input type="text" class="form-control" :value="getConfigvModel('resources.volume', null)" @input="setConfigvModel('resources.volume', $event, null)">
                          </div>
                          <!-- tooltip -->
                          <div class="tooltip-icon pl-2">
                            <BIconInfoCircle></BIconInfoCircle>
                            <q-tooltip anchor="top middle">Path in the Container where data is placed.'"</q-tooltip>
                          </div>
                        </div>
                      </div>

                      <!-- resources.memory -->
                      <div v-if="computationTemplate.environment === 'Container'">
                        <label class="mr-2">Memory:</label>
                        <div class="d-flex form-group">
                          <div class="flex-grow-1">
                            <input type="text" class="form-control" :value="getConfigvModel('resources.memory', null)" @input="setConfigvModel('resources.memory', $event, null)">
                          </div>
                          <!-- tooltip -->
                          <div class="tooltip-icon pl-2">
                            <BIconInfoCircle></BIconInfoCircle>
                            <q-tooltip anchor="top middle">Memory limit for the Container.'"</q-tooltip>
                          </div>
                        </div>
                      </div>

                      <!-- resources.numCPUs -->
                      <div v-if="computationTemplate.environment === 'Container'">
                        <label class="mr-2">Number of CPUs:</label>
                        <div class="d-flex form-group">
                          <div class="flex-grow-1">
                            <input type="text" class="form-control" :value="getConfigvModel('resources.numCPUs', null)" @input="setConfigvModel('resources.numCPUs', $event, null, true)">
                          </div>
                          <!-- tooltip -->
                          <div class="tooltip-icon pl-2">
                            <BIconInfoCircle></BIconInfoCircle>
                            <q-tooltip anchor="top middle">Number of CPUs for the Container.'"</q-tooltip>
                          </div>
                        </div>
                      </div>

                      <!-- resources.diskSpace -->
                      <div v-if="computationTemplate.environment === 'Container'">
                        <label class="mr-2">Limit of Disk Space:</label>
                        <div class="d-flex form-group">
                          <div class="flex-grow-1">
                            <input type="text" class="form-control" :value="getConfigvModel('resources.diskSpace', null)" @input="setConfigvModel('resources.diskSpace', $event, null, true)">
                          </div>
                          <!-- tooltip -->
                          <div class="tooltip-icon pl-2">
                            <BIconInfoCircle></BIconInfoCircle>
                            <q-tooltip anchor="top middle">Disk space limit for the Container.'"</q-tooltip>
                          </div>
                        </div>
                      </div>

                      <!-- TODO Config Props need to be added if ViPLab supports other environments than Container -->
                    </div>
                  </div>

                  <!-- Metadata -->
                  <div> <!-- v-if="computationTemplate.metadata"> -->
                    <label class="mr-2" for="computationTemplate.metadata">Metadata of Template: </label>
                    <div class="ml-4 mr-4">
                      <!-- display name -->
                      <div>
                        <label class="mr-2">Name of Template:</label>
                        <div class="d-flex form-group">
                          <div class="flex-grow-1">
                            <input type="text" class="form-control" :value="getvModelTemplateMetadata('displayName')" @input="setvModelTemplateMetadata('displayName', $event)">
                          </div>
                          <!-- tooltip -->
                          <div class="tooltip-icon pl-2">
                            <BIconInfoCircle></BIconInfoCircle>
                            <q-tooltip anchor="top middle">Name of Computation Template shown in Frontend.</q-tooltip>
                          </div>
                        </div>
                      </div>
                      <!-- description -->
                      <div>
                        <label class="mr-2">Description:</label>
                        <div class="d-flex form-group">
                          <div class="flex-grow-1">
                            <input type="text" class="form-control" :value="getvModelTemplateMetadata('description')" @input="setvModelTemplateMetadata('description', $event)">
                          </div>
                          <!-- tooltip -->
                          <div class="tooltip-icon pl-2">
                            <q-tooltip anchor="top middle">Short description of Computation Template shown in Frontend.</q-tooltip>
                            <BIconInfoCircle></BIconInfoCircle>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- output -->
                    <div id="define-output">
                      <label class="mr-2">Configuration of Output: </label>
                      <div class="ml-4 mr-4">
                        <!-- viewer -->
                        <div>
                          <label class="mr-2" for="computationTemplate.metadata.output.viewer">File Types to be shown in Result: </label>
                          <div class="d-flex form-group">
                            <div class="flex-grow-1">
                              <div class="dropdown">
                                <select
                                  class="form-control"
                                  v-model="vModelOutputViewer"
                                  multiple
                                >
                                  <option>Image</option>
                                  <option>ParaView</option>
                                  <option>CSV</option>
                                  <option>ViPLabGraphics</option>
                                  <option value="">No Special Outputfile Format</option>
                                </select>
                              </div>
                            </div>
                            <!-- tooltip -->
                            <div class="tooltip-icon pl-2">
                              <BIconInfoCircle></BIconInfoCircle>
                              <q-tooltip anchor="top middle">When given, specific file extension, like .vtu are interpreted by the frontend for displaying results. Otherwise files are only downloadable.</q-tooltip>
                            </div>
                          </div>
                        </div>
                        <!-- ignore files -->
                        <div>
                          <label class="mr-2" for="computationTemplate.metadata.output.ignore.visualization">Ignore files in visualization</label>
                          <div class="d-flex form-group">
                            <div class="flex-grow-1">
                              <ul id="visualizationIgnore" v-if="ignoreVisualizationDefined">
                                <li v-for="item in computationTemplate.metadata.output.ignore.visualization" :key="item">
                                  {{ item }} <BIconPlus @click="removeIgnoreVisualization(item)"></BIconPlus>
                                </li>
                              </ul>
                              <input type="text" class="form-control" v-model="outputIgnoreVisualization">
                              <q-btn class="btn mb-3" @click="addIgnoreVisualization()">
                                <q-tooltip anchor="top middle">Add Ignore to Visualization</q-tooltip>
                                <BIconPlus aria-hidden="true"></BIconPlus>
                              </q-btn>
                            </div>
                          </div>
                          <label class="mr-2" for="computationTemplate.metadata.output.ignore.download">Ignore files in download</label>
                          <div class="d-flex form-group">
                            <div class="flex-grow-1">
                              <ul id="visualizationIgnore" v-if="ignoreDownloadDefined">
                                <li v-for="item in computationTemplate.metadata.output.ignore.download" :key="item">
                                  {{ item }} <BIconX @click="removeIgnoreDownload(item)"></BIconX>
                                </li>
                              </ul>
                              <input type="text" class="form-control" v-model="outputIgnoreDownload">
                              <q-btn class="btn mb-3" @click="addIgnoreDownload()">
                                <q-tooltip anchor="top middle">Add Ignore to Download</q-tooltip>
                                <BIconPlus aria-hidden="true"></BIconPlus>
                              </q-btn>
                            </div>
                          </div>
                        </div>
                        <!-- csv -->
                        <div>
                          <div class="d-flex">
                            <div class="flex-grow-1">
                              <label class="mr-2" for="computationTemplate.metadata.output.csv">How should CSVs be displayed? </label>
                            </div>
                            <!-- tooltip -->
                            <div class="tooltip-icon pl-2">
                              <BIconInfoCircle></BIconInfoCircle>
                              <q-tooltip anchor="top middle">Use this object to define connected csv-files, if there are intermediate results.</q-tooltip>
                            </div>
                          </div>
                          <q-btn class="btn mb-3" @click="addCsvConfig()">
                            <q-tooltip anchor="top middle">Add Config for Group of CSV-Files</q-tooltip>
                            <BIconPlus aria-hidden="true"></BIconPlus>
                          </q-btn>
                          <div class="ml-4 mr-4 mb-2" v-if="(typeof computationTemplate.metadata != 'undefined') && (typeof computationTemplate.metadata.output != 'undefined') && (typeof computationTemplate.metadata.output.csv != 'undefined')">
                            <div class="border p-2 mb-2" v-for="(csvConfig, index) in computationTemplate.metadata.output.csv" :key="'csvConfig-'+index">
                              <!-- basename -->
                              <div>
                                <div class="d-flex">
                                  <div class="flex-grow-1">
                                    <label class="mr-2" :for="csvConfig.basename">Basename to identify connected CSVs: </label>
                                  </div>
                                  <!-- Delete CSV-Config -->
                                  <div class="tooltip-icon pl-2" @click="removeConfig($event, true, index)">
                                    <BIconXCircle></BIconXCircle>
                                    <q-tooltip anchor="top middle">Delete CSV-Config</q-tooltip>
                                  </div>
                                </div>
                                <div class="d-flex form-group">
                                  <div class="flex-grow-1">
                                    <input type="text" class="form-control" id="csvConfig.basename" v-model="csvConfig.basename">
                                  </div>
                                  <!-- tooltip -->
                                  <div class="tooltip-icon pl-2">
                                    <BIconInfoCircle>/</BIconInfoCircle>
                                    <q-tooltip anchor="top middle">Basename defines connected files: Path of file begins with basename.</q-tooltip>
                                  </div>
                                </div>
                              </div>
                              <!-- xlabel -->
                              <div>
                                <label class="mr-2" for="csvConfig.xlabel">Information about X-Axis: </label>
                                <div class="ml-4 mr-4">
                                  <!-- key -->
                                  <label class="mr-2" for="csvConfig.xlabel.key">Key of X-Axis in CSV: </label>
                                  <div class="d-flex form-group">
                                    <div class="flex-grow-1">
                                      <input type="text" class="form-control" id="csvConfig.xlabel.key" v-model="csvConfig.xlabel.key">
                                    </div>
                                    <!-- tooltip -->
                                    <div class="tooltip-icon pl-2">
                                      <BIconInfoCircle></BIconInfoCircle>
                                      <q-tooltip anchor="top middle">Key for x-axis given in csv header.</q-tooltip>
                                    </div>
                                  </div>
                                  <!-- label -->
                                  <label class="mr-2" for="csvConfig.xlabel.label">Label for X-Axis: </label>
                                  <div class="d-flex form-group">
                                    <div class="flex-grow-1">
                                      <input type="text" class="form-control" id="csvConfig.xlabel.label" v-model="csvConfig.xlabel.label">
                                    </div>
                                    <!-- tooltip -->
                                    <div class="tooltip-icon pl-2">
                                      <BIconInfoCircle></BIconInfoCircle>
                                      <q-tooltip anchor="top middle">
                                        X-axis label for diagram.'"</q-tooltip>
                                    </div>
                                  </div>
                                  <!-- factor -->
                                  <label class="mr-2" for="csvConfig.xlabel.factor">Factor to multiply Values: </label>
                                  <div class="d-flex form-group">
                                    <div class="flex-grow-1">
                                      <input type="number" class="form-control" id="csvConfig.xlabel.factor" v-model.number="csvConfig.xlabel.factor">
                                    </div>
                                    <!-- tooltip -->
                                    <div class="tooltip-icon pl-2">
                                      <BIconInfoCircle></BIconInfoCircle>
                                      <q-tooltip anchor="top middle">Multiply x-values with this factor.</q-tooltip>
                                    </div>
                                  </div>
                                  <!-- format -->
                                  <label class="mr-2" for="csvConfig.xlabel.format">Format of the Values: </label>
                                  <div class="d-flex form-group">
                                    <div class="flex-grow-1">
                                      <input type="text" class="form-control" id="csvConfig.xlabel.format" v-model="csvConfig.xlabel.format">
                                    </div>
                                    <!-- tooltip -->
                                    <div class="tooltip-icon pl-2">
                                      <BIconInfoCircle></BIconInfoCircle>
                                      <q-tooltip anchor="top middle">Format the x-axis values according to format string. For information on the avaliable formating take a look at the info given by Plotly (https://github.com/d3/d3-format/blob/main/README.md#locale_format); Example: To format a number to have two decimals, use 0.2f</q-tooltip>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <!-- plots -->
                              <label class="mr-2" for="csvConfig.plots">Information about the Y-Axis: </label>
                              <div class="d-flex ml-4 mr-4">
                                <div class="flex-grow-1">
                                  <label class="mr-2" for="csvConfig.plots">Define multiple Plots generated from one CSV: </label>
                                </div>
                                <!-- tooltip -->
                                <div class="tooltip-icon pl-2">
                                  <BIconInfoCircle></BIconInfoCircle>
                                  <q-tooltip anchor="top middle">Define datasets: Provide y-axis labels for y-key given in csv. For each dataset one diagram is rendered in the result.'"</q-tooltip>
                                </div>
                              </div>

                              <div class="ml-4 mr-4">
                                <q-btn class="btn mb-3" @click="addCsvPlot(index)">
                                  <BIconPlus aria-hidden="true"></BIconPlus>
                                  <q-tooltip anchor="top middle">Add Y-Axis to generate Plot from CSV-Files</q-tooltip>
                                </q-btn>
                                <div class="border mb-2 p-2" v-for="(csvPlot, plotIndex) in csvConfig.plots" :key="csvConfig.identifier + '-plot-' + plotIndex">
                                  <!-- key -->
                                  <div class="d-flex form-group">
                                    <div class="flex-grow-1">
                                      <label class="mr-2" for="csvPlot.key">Key(s) of Y-Axis in CSV: </label>
                                    </div>
                                    <!-- Delete CSV-Config -->
                                    <div class="tooltip-icon pl-2" @click="removePlot($event, csvConfig, csvPlot)">
                                      <BIconXCircle></BIconXCircle><q-tooltip anchor="top middle">Delete CSV-Config</q-tooltip>
                                    </div>
                                  </div>
                                  <div class="d-flex form-group">
                                    <div class="flex-grow-1">
                                      <input type="text" class="form-control" id="csvPlot.key" v-model="csvPlot.key">
                                    </div>
                                    <!-- tooltip -->
                                    <div class="tooltip-icon pl-2">
                                      <BIconInfoCircle></BIconInfoCircle>
                                      <q-tooltip anchor="top middle">Key(s) for y-axis given in csv header.</q-tooltip>
                                    </div>
                                  </div>
                                  <!-- label -->
                                  <label class="mr-2" for="csvPlot.label">Label for Y-Axis: </label>
                                  <div class="d-flex form-group">
                                    <div class="flex-grow-1">
                                      <input type="text" class="form-control" id="csvPlot.label" v-model="csvPlot.label">
                                    </div>
                                    <!-- tooltip -->
                                    <div class="tooltip-icon pl-2">
                                      <BIconInfoCircle></BIconInfoCircle>
                                      <q-tooltip anchor="top middle">Y-axis label for diagram.</q-tooltip>
                                    </div>
                                  </div>
                                  <!-- factor -->
                                  <label class="mr-2" for="csvPlot.factor">Factor to multiply Values: </label>
                                  <div class="d-flex form-group">
                                    <div class="flex-grow-1">
                                      <input type="number" class="form-control" id="csvPlot.factor" v-model.number="csvPlot.factor">
                                    </div>
                                    <!-- tooltip -->
                                    <div class="tooltip-icon pl-2">
                                      <q-tooltip anchor="top middle">Multiply y-values with this factor.</q-tooltip>
                                      <BIconInfoCircle> </BIconInfoCircle>
                                    </div>
                                  </div>
                                  <!-- format -->
                                  <label class="mr-2" for="csvPlot.format">Format of the Values: </label>
                                  <div class="d-flex form-group">
                                    <div class="flex-grow-1">
                                      <input type="text" class="form-control" id="csvPlot.format" v-model="csvPlot.format">
                                    </div>
                                    <!-- tooltip -->
                                    <div class="tooltip-icon pl-2">
                                      <BIconInfoCircle></BIconInfoCircle>
                                      <q-tooltip anchor="top middle">Format the y-axis values according to format string. For information on the avaliable formating take a look at the info given by Plotly (https://github.com/d3/d3-format/blob/main/README.md#locale_format); Example: To format a number to have two decimals, use 0.2f</q-tooltip>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Files Data -->
                <div v-else-if="showFile">
                  <!-- path -->
                  <div>
                    <label class="mr-2" for="selectedFile.path">Path to File: </label>
                    <div class="d-flex form-group">
                      <div class="flex-grow-1">
                        <input type="text" class="form-control" id="selectedFile.path" v-model="vModelFilePath">
                      </div>
                      <!-- tooltip -->
                      <div class="tooltip-icon pl-2">
                        <BIconInfoCircle></BIconInfoCircle>
                        <q-tooltip anchor="top middle">Relative path to file. It is not allowed to start with /. The path is relative to the path you entered in the configurtion under resources.volume.</q-tooltip>
                      </div>
                    </div>
                  </div>
                  <!-- metadata syntaxHighlighting -->
                  <div>
                    <label class="mr-2">Syntax Highlighting for File-Content:</label>
                    <div class="d-flex form-group">
                      <div class="flex-grow-1">
                        <input type="text" class="form-control" id="selectedFile.syntaxHighlighting"
                               v-model="vModelFileMetadataSyntaxHighlighting">
                      </div>
                      <!-- tooltip -->
                      <div class="tooltip-icon pl-2">
                        <BIconInfoCircle></BIconInfoCircle>
                        <q-tooltip anchor="top middle">Mode of the ace editor. List can be found on github (https://github.com/ajaxorg/ace/tree/master/src/mode). Examples: ini, c_cpp, matlab, java.</q-tooltip>
                      </div>
                    </div>
                  </div>
                  <div>  <!-- description -->
                    <label class="mr-2">Description:</label>
                    <div class="d-flex form-group">
                      <div class="flex-grow-1">
                        <input type="text" class="form-control" id="selectedFile.description"
                               v-model="vModelFileMetadataDescription">
                      </div>
                      <!-- tooltip -->
                      <div class="tooltip-icon pl-2">
                        <BIconInfoCircle></BIconInfoCircle>
                        <q-tooltip anchor="top middle">Additional information about the file, e.g. what it is used for. It is shown in the Frontend as tooltip behind the filename.</q-tooltip>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Part Data -->
                <div v-else-if="showPart">
                  <!-- access -->
                  <div>
                    <label class="mr-2" for="selectedPart.access">Define Access Level: </label>
                    <div class="d-flex form-group">
                      <div class="flex-grow-1">
                        <div class="dropdown">
                          <select
                            class="form-control"
                            v-model="vModelPartAccess"
                            @change="addOrRemoveParameters(selectedPart)"
                          >
                            <option disabled value="">Choose one of the options below</option>
                            <option>invisible</option>
                            <option>visible</option>
                            <option>modifiable</option>
                            <option>template</option>
                          </select>
                        </div>
                      </div>
                      <!-- tooltip -->
                      <div class="tooltip-icon pl-2">
                        <BIconInfoCircle></BIconInfoCircle>
                        <q-tooltip anchor="top middle">Defines the access level of this part for the user.</q-tooltip>
                      </div>
                    </div>
                  </div>
                  <!-- metadata -->
                  <div>
                    <label class="mr-2">Additional Description of Part:</label>
                    <div class="d-flex form-group">
                      <div class="flex-grow-1">
                        <input type="text" class="form-control" id="selectedPart.metadata.description" v-model="vModelPartMetadataName">
                      </div>
                      <!-- tooltip -->
                      <div class="tooltip-icon pl-2">
                        <BIconInfoCircle></BIconInfoCircle>
                        <q-tooltip anchor="top middle">Additional description of this part to be shown in the Frontend.'"</q-tooltip>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Show Parameter Preferences -->
                <div v-else-if="showParameter">

                  <!-- identifier -->
                  <div>
                    <label class="mr-2" for="selectedParameter.identifier">Identifier for Handlebars.js-Template: </label>
                    <div class="d-flex form-group">
                      <div class="flex-grow-1">
                        <input type="text" class="form-control" id="selectedParameter.identifier" v-model="vModelParameterIdentifier">
                      </div>
                      <!-- tooltip -->
                      <div class="tooltip-icon pl-2">
                        <BIconInfoCircle></BIconInfoCircle>
                        <q-tooltip anchor="top middle">Unique id for this parameter. This id must be valid Handlebars.js template variable. Example: __BINARY__.</q-tooltip>
                      </div>
                    </div>
                  </div>
                  <!-- name -->
                  <div>
                    <label class="mr-2" for="selectedParameter.metadata.name">Name: </label>
                    <div class="d-flex form-group">
                      <div class="flex-grow-1">
                        <input type="text" class="form-control" id="selectedParameter.metadata.name" v-model="vModelParameterMetadataName">
                      </div>
                      <!-- tooltip -->
                      <div class="tooltip-icon pl-2">
                        <BIconInfoCircle></BIconInfoCircle>
                        <q-tooltip anchor="top middle">Label for the parameter to be shown in Frontend.'"</q-tooltip>
                      </div>
                    </div>
                  </div>
                  <!-- description -->
                  <div>
                    <label class="mr-2" for="selectedParameter.metadata.description">Description: </label>
                    <div class="d-flex form-group">
                      <div class="flex-grow-1">
                        <input type="text" class="form-control" id="selectedParameter.metadata.description" v-model="vModelParameterMetadataDescription">
                      </div>
                      <!-- tooltip -->
                      <div class="tooltip-icon pl-2">
                        <BIconInfoCircle></BIconInfoCircle>
                        <q-tooltip anchor="top middle">Will be shown in the Frontend as tooltip (just like this one you are hovering over).</q-tooltip>
                      </div>
                    </div>
                  </div>

                  <!-- input_field -->
                  <div v-if="selectedParameter.metadata.guiType === 'input_field'">
                    <!-- type -->
                    <div>
                      <label class="mr-2" for="selectedParameter.metadata.type">Field Type: </label>
                      <div class="dropdown form-group">
                        <select
                          class="form-control"
                          v-model="selectedParameter.metadata.type"
                          @change="adjustInputType(selectedParameter)"
                        >
                          <option>number</option>
                          <option>text</option>
                        </select>
                      </div>
                    </div>
                    <div v-if="selectedParameter.metadata.type">
                      <!-- default value -->
                      <div>
                        <label class="mr-2" for="selectedParameter.default">Default Value: </label>
                        <input v-if="selectedParameter.metadata.type === 'text'" type="text" class="form-control form-group" id="selectedParameter.default" v-model="vModelInputFieldText">
                        <input v-else class="form-control form-group" id="selectedParameter.default" v-model="vModelInputFieldNumber">
                      </div>
                      <!-- type: number - min, max, step -->
                      <div v-if="selectedParameter.metadata.type === 'number'">
                        <div>
                          <label class="mr-2" for="selectedParameter.min">Minium Value: </label>
                          <input type="number" class="form-control form-group" id="selectedParameter.min" v-model.number="selectedParameter.min">
                        </div>
                        <div>
                          <label class="mr-2" for="selectedParameter.max">Maximum Value: </label>
                          <input type="number" class="form-control form-group" id="selectedParameter.max" v-model.number="selectedParameter.max">
                        </div>
                        <div>
                          <label class="mr-2" for="selectedParameter.step">Step Size: </label>
                          <input type="number" class="form-control form-group" id="selectedParameter.step" v-model.number="selectedParameter.step">
                        </div>
                      </div>
                      <!-- type: text - maxlength -->
                      <div v-if="selectedParameter.metadata.type === 'text'">
                        <div>
                          <label class="mr-2" for="selectedParameter.maxlength">Maximum Text Length: </label>
                          <input class="form-control form-group" id="selectedParameter.maxlength" v-model="vModelParameterMaxlength">
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- slider -->
                  <div v-if="selectedParameter.metadata.guiType === 'slider'">
                    <!-- vertical -->
                    <label class="mr-2" for="selectedParameter.metadata.vertical">How should the Slider be displayed? </label>
                    <div class="radiobutton form-check custom-control custom-radio form-group">
                      <div>
                        <input class="form-check-input custom-control-input" id="vertical" type="radio" name="slider-vertical" value=true v-model="selectedParameter.metadata.vertical" />
                        <label class="form-check-label custom-control-label" for="vertical">vertical</label><br>
                      </div>
                      <div>
                        <input class="form-check-input custom-control-input" id="horizontal" type="radio" name="slider-vertical" value=false v-model="selectedParameter.metadata.vertical" checked />
                        <label class="form-check-label custom-control-label" for="horizontal">horizontal</label><br>
                      </div>
                    </div>

                    <!-- default -->
                    <div class="">
                      <label class="mr-2" for="selectedParameter.default">value(s): </label>
                      <div class="ml-4 mr-4 form-group">
                        <!-- set how many values the slider should have -->
                        <label for="selectedParameter.identifier + 'sb-default'">How many values should the slider have?</label>
                        <!-- <b-form-spinbutton :id="selectedParameter.identifier + 'sb-default'" placeholder="1" :value="getNumberOfFields(selectedParameter.identifier)" class="form-group" @change="setNumberOfFields(selectedParameter.identifier, $event)"></b-form-spinbutton> -->
                        <!-- input slider default-values -->
                        <div class="border mb-2 p-2" v-for="(field, index) in getNumberOfFields(selectedParameter.identifier)" :key="selectedParameter.identifier + '-' + index">
                          <label>Set default values for slider-value:</label>
                          <input type="number" class="form-control" id="selectedParameter.default" :value="getSlidervModel(index)" @input="setSlidervModel($event, index)">
                        </div>
                      </div>
                    </div>
                    <!-- min -->
                    <div>
                      <label class="mr-2" for="selectedParameter.min">Minimum Value: </label>
                      <input type="number" class="form-control form-group" id="selectedParameter.min" v-model.number="selectedParameter.min">
                    </div>
                    <!-- max -->
                    <div>
                      <label class="mr-2" for="selectedParameter.max">Maximum Value: </label>
                      <input type="number" class="form-control form-group" id="selectedParameter.max" v-model.number="selectedParameter.max">
                    </div>
                    <!-- step -->
                    <div>
                      <label class="mr-2" for="selectedParameter.step">Step Size: </label>
                      <input type="number" class="form-control form-group" id="selectedParameter.step" v-model.number="selectedParameter.step">
                    </div>
                  </div>

                  <!-- editor -->
                  <div class="form-group" v-if="selectedParameter.metadata.guiType === 'editor'">
                    <TemplateComponentEditor
                      :editor-identifier="selectedParameter.identifiert"
                      :editor-content="selectedParameter.default[0]"
                      @updated="setEditorValue"/>
                  </div>

                  <!-- checkbox, dropdown, toggle, radio -->
                  <div v-if="selectedParameter.metadata.guiType === 'checkbox' || selectedParameter.metadata.guiType === 'dropdown' || selectedParameter.metadata.guiType === 'toggle'|| selectedParameter.metadata.guiType === 'radio'">
                    <!-- options -->
                    <div>
                      <label class="mr-2" for="selectedParameter.options">Value(s): </label>
                      <div class="ml-4 mr-4">
                        <!-- set how many values the checkbox should have -->
                        <label for="selectedParameter.identifier + 'sb-options'">How many values should the parameter have?</label>
                        <!-- <b-form-spinbutton :id="selectedParameter.identifier + 'sb-options'" placeholder="1" :value="getNumberOfFields(selectedParameter.identifier)" class="form-group" @change="setNumberOfFields(selectedParameter.identifier, $event)"></b-form-spinbutton> -->

                        <!-- input option-values -->
                        <div class="border form-group p-2" v-for="(field, index) in getNumberOfFields(selectedParameter.identifier)" :key="selectedParameter.identifier + '-' + index">
                          <!-- value -->
                          <label>Set value:</label>
                          <input type="text" class="form-control form-group" id="field.value" :value="getFixedParamvModel(index)" @input="setFixedParamvModel($event, index, 'value')">
                          <!-- text -->
                          <label>Set label for value (else value is used):</label>
                          <input type="text" class="form-control form-group" id="field.text" :value="getFixedParamvModel(index, 'text')" @input="setFixedParamvModel($event, index, 'text')">
                          <!-- selected - radio -->
                          <label class="mr-2">Is selected? </label>
                          <div v-if="selectedParameter.metadata.guiType === 'radio'" class="radiobutton form-check custom-control custom-radio form-group">
                            <div>
                              <input class="form-check-input custom-control-input" :id="selectedParameter.identifier+'-'+index+ '-'+'selected'" type="radio" :name="selectedParameter.identifier+'-'+index+'-'+'checkbox-selected'" :value=true @input="setFixedParamvModel($event, index, 'selected')" :checked="!!getRadioSelected(index)" />
                              <label class="form-check-label custom-control-label" :for="selectedParameter.identifier+'-'+index+ '-'+'selected'">selected</label><br>
                            </div>
                            <div>
                              <input class="form-check-input custom-control-input" :id="selectedParameter.identifier+'-'+index+ '-'+'unselected'" type="radio" :name="selectedParameter.identifier+'-'+index+'-'+'checkbox-selected'" :value=false @input="setFixedParamvModel($event, index, 'selected')" :checked="!getRadioSelected(index)" />
                              <label class="form-check-label custom-control-label" :for="selectedParameter.identifier+'-'+index+ '-'+'unselected'">not selected</label><br>
                            </div>
                          </div>
                          <!-- selected checkbox, dropdown, toggle -->
                          <div v-else class="radiobutton form-check custom-control custom-radio form-group">
                            <div>
                              <input class="form-check-input custom-control-input" :id="selectedParameter.identifier+'-'+index+ '-'+'selected'" type="radio" :name="selectedParameter.identifier+'-'+index+'-'+'checkbox-selected'" :value=true @input="setFixedParamvModel($event, index, 'selected')" :checked="!!getFixedParamvModel(index, 'selected')"/>
                              <label class="form-check-label custom-control-label" :for="selectedParameter.identifier+'-'+index+ '-'+'selected'">selected</label><br>
                            </div>
                            <div>
                              <input class="form-check-input custom-control-input" :id="selectedParameter.identifier+'-'+index+ '-'+'unselected'" type="radio" :name="selectedParameter.identifier+'-'+index+'-'+'checkbox-selected'" :value=false @input="setFixedParamvModel($event, index, 'selected')" :checked="!getFixedParamvModel(index,'selected')" />
                              <label class="form-check-label custom-control-label" :for="selectedParameter.identifier+'-'+index+ '-'+'unselected'">not selected</label><br>
                            </div>
                          </div>
                          <!-- disabled -->
                          <label class="mr-2">Is disabled? </label>
                          <div class="radiobutton form-check custom-control custom-radio">
                            <div>
                              <input class="form-check-input custom-control-input" :id="selectedParameter.identifier+'-'+index+'-'+'disabled'" type="radio" :name="selectedParameter.identifier+'-'+index+'-'+'checkbox-disabled'" :value=true @input="setFixedParamvModel($event, index, 'disabled')" :checked="!!getFixedParamvModel(index,'disabled')"/>
                              <label class="form-check-label custom-control-label" :for="selectedParameter.identifier+'-'+index+'-'+'disabled'">disabled</label><br>
                            </div>
                            <div>
                              <input class="form-check-input custom-control-input" :id="selectedParameter.identifier+'-'+index+'-'+'enabled'" type="radio" :name="selectedParameter.identifier+'-'+index+'-'+'checkbox-disabled'" :value=false @input="setFixedParamvModel($event, index, 'disabled')" :checked="!getFixedParamvModel(index,'disabled')" />
                              <label class="form-check-label custom-control-label" :for="selectedParameter.identifier+'-'+index+'-'+'enabled'">enabled</label><br>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Validation -->
                  <div>
                    <label class="mr-2" for="selectedParameter.validation">Validation: </label>

                    <!-- mode: any -->
                    <div v-if="selectedParameter.mode === 'any'">

                      <div class="d-flex form-group">
                        <div class="flex-grow-1">
                          <div class="dropdown">
                            <select
                              class="form-control"
                              v-model="selectedParameter.validation"
                              @change="adjustPatternExistence(selectedParameter)"
                            >
                              <option value="pattern">Set a RegEx-Pattern the text-value has to fulfill</option>
                              <option value="range">Set Range for the value</option>
                              <option value="none" selected="selected">Any value is allowed</option>
                            </select>
                          </div>
                        </div>
                        <!-- tooltip -->
                        <div class="tooltip-icon pl-2">
                          <BIconInfoCircle></BIconInfoCircle>
                          <q-tooltip anchor="top middle">Set if and how the parameter should be validated.'"</q-tooltip>
                        </div>
                      </div>

                      <!-- pattern -->
                      <div class="ml-4 mr-4" v-if="selectedParameter.validation === 'pattern'">
                        <label class="mr-2" for="selectedParameter.pattern">RegEx-Pattern for Validation: </label>
                        <input type="text" class="form-control" id="selectedParameter.pattern" v-model="selectedParameter.pattern">
                      </div>

                    </div>

                    <!-- mode: fixed -->
                    <div v-else>
                      <div class="d-flex form-group">
                        <div class="flex-grow-1">
                          <div class="dropdown">
                            <select
                              class="form-control"
                              v-model="selectedParameter.validation"
                            >
                              <option value="oneof">Only one option selectable</option>
                              <option value="minone">Set at min one value</option>
                              <option value="anyof" selected="selected">Any value is allowed</option>
                            </select>
                          </div>
                        </div>
                        <!-- tooltip -->
                        <div class="tooltip-icon pl-2">
                          <BIconInfoCircle></BIconInfoCircle>
                          <q-tooltip anchor="top middle">Set if and how the parameter should be validated.'"</q-tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
      </q-drawer>

    <q-page-container class="main-div pl-4 pr-4">

      <div class="teacher-section-wrap">
      <div class="group">


        <!-- Graphical View of Template -->
        <div class="dnd-window" id="drag-components-here" :key="signifyChange">
            <q-tabs v-model="selectedContentTab">
              <q-tab name="structure">Drop Here</q-tab>
              <q-tab name="preview">JSON Preview</q-tab>
            </q-tabs>
            <q-tab-panels v-model="selectedContentTab" card class="files" content-class="m-2" fill>
              <!-- Drag-and-Drop Components -->
              <q-tab-panel name="structure">
                <drop class="top-copy"
                      @drop="onFileDrop($event)"
                      :accepts-type="['file','commandline arguments']"
                      >
                  <div class="template p-2" @click="openWindow($event, 'template', computationTemplate)">

                    <div v-for="(file, index) in computationTemplate.files" :key="file.identifier + '-' + index">
                      <drop class="copy"
                            @drop="onPartDrop($event,file)"
                            :accepts-type="'part'">
                        <div class="file p-2" @click="openWindow($event, 'file', file)">

                          <div class="row">
                            <div v-if="file.path" class="col">
                              File: {{file.path}}
                            </div>
                            <div v-else class="bg-warning col">
                              File: Path must be set
                            </div>
                            <div class="col">
                              <div class="text-right" @click="removeFile($event, file)">
                                <BIconXCircle></BIconXCircle>
                                <q-tooltip anchor="top middle">Delete File</q-tooltip>
                              </div>
                            </div>
                          </div>

                          <drop-list class="part-droplist"
                                     v-if="file.parts"
                                     :items="file.parts"
                                     @insert="onInsert($event, false, file)"
                                     @reorder="$event.apply(file.parts)"
                                     :accepts-type="[]"
                                     :column="true">
                            <template v-slot:item="{item}">
                              <drag class="item part-drag" :key="item.identifier" type="part">
                                <drop class="part-border"
                                      @drop="onParameterDrop($event, item)"
                                      :accepts-type="(param) => ((availableGuiTypes.includes(param))) && item.parameters">
                                  <div class="part p-2" @click="openWindow($event, 'part', item)">

                                    <div class="row">
                                      <div class="col">
                                        Part
                                      </div>
                                      <div class="col">
                                        <div class="text-right" @click="removePart($event, item)">
                                          <BIconXCircle></BIconXCircle>
                                          <q-tooltip anchor="top middle">Delete Part</q-tooltip>
                                        </div>
                                      </div>
                                    </div>
                                    <q-expansion-item v-if="item.parameters" expand-separator label="Parameters" :id="item.identifier+'param'" visible accordion="my-accordion-1" role="tabpanel">
                                      <drop-list v-if="item.parameters"
                                                 class="param-droplist"
                                                 :items="item.parameters"
                                                 @insert="onInsert($event, true ,item)"
                                                 @reorder="$event.apply(item.parameters)"
                                                 :accepts-type="() => false"
                                                 :column="true">
                                        <template v-slot:item="{item}">
                                          <drag class="item param" :key="item.identifier">
                                            <!--
                                            todo fix layout -->
                                            <div class="param-container p-2" @click="openWindow($event, 'parameter', item)">

                                              <div class="row">
                                                <div class="col-8">
                                                  {{item.metadata.guiType}}
                                                </div>
                                                <div class="col-4">
                                                  <div class="text-right" @click="removeParameter($event, item)">
                                                    <BIconXCircle></BIconXCircle>
                                                    <q-tooltip anchor="top middle">Delete Parameter</q-tooltip>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </drag>
                                        </template>
                                        <template v-slot:feedback="{data}">
                                          <div class="item feedback" :key="data">{{data}}</div>
                                        </template>
                                      </drop-list>
                                    </q-expansion-item>
                                    <q-expansion-item :id="item.identifier +'content'" label="Content" visible accordion="my-accordion-2" role="tabpanel">
                                      <div class="part-content-field">
                                        <div class="d-flex">
                                          <div class="flex-grow-1">
                                            <label class="mr-2" for="item.content">content: </label>
                                          </div>
                                          <!-- tooltip -->
                                          <div class="tooltip-icon pl-2">
                                            <BIconInfoCircle></BIconInfoCircle>
                                            <q-tooltip anchor="top middle">Content, that will be base64url-encoded automatically. Can contain Handlebars.js expressions with PARAM_IDs (identifiers) if the access type of this part is template.</q-tooltip>
                                          </div>
                                        </div>
                                        <ace-editor-component
                                          :isParameter="false"
                                          :isHandlebar="false"
                                          :readonly="false"
                                          :item='{
                                            "identifier" : "Editor" + item.identifier,
                                            "content" : item.content
                                          }'
                                          v-on:update:item="updateContent(item, $event)"
                                        ></ace-editor-component>
                                      </div>
                                    </q-expansion-item>
                                  </div>
                                </drop>
                              </drag>
                            </template>
                            <template v-slot:feedback="{data}">
                              <div class="item feedback" :key="data">{{data}}</div>
                            </template>
                          </drop-list>
                          <!--</div>-->
                        </div>
                      </drop>
                    </div>

                    <!-- Commandline Parameters -->
                    <drop v-if="computationTemplate.parameters" class="copy"
                          @drop="onParameterDrop($event)"
                          :accepts-type="(param) => ((availableGuiTypes.includes(param))) && computationTemplate.parameters">
                      <div class="file p-2" @click="openWindow($event, 'commands', computationTemplate.parameters)">

                        <div class="row">
                          <div class="col-10">
                            Commandline Arguments
                          </div>
                          <div class="col-2">
                            <div class="text-right" @click="removeCommandlineArgs($event)">
                              <BIconXCircle></BIconXCircle>
                              <q-tooltip anchor="top middle">Delete Commandline Arguments'"</q-tooltip>
                            </div>
                          </div>
                        </div>

                        <drop-list class="param-droplist"
                                   v-if="computationTemplate.parameters"
                                   :items="computationTemplate.parameters"
                                   @insert="onInsert($event, true, item)"
                                   @reorder="$event.apply(computationTemplate.parameters)"
                                   :accepts-type="() => false"
                                   :column="true"
                                   :key="uuid()">
                          <template v-slot:item="{item}">
                            <drag class="item param" :key="item.identifier">
                              <div class="param-container p-2" @click="openWindow($event, 'parameter', item)">
                                <div class="row">
                                  <div class="col-8">
                                    {{item.metadata.guiType}}
                                  </div>
                                  <div class="col-4">
                                    <div class="text-right" @click="removeParameter($event, item, false)">
                                      <BIconXCircle></BIconXCircle>
                                      <q-tooltip anchor="top middle">Delete Argument'"</q-tooltip>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </drag>
                          </template>
                          <template v-slot:feedback="{data}">
                            <div class="item feedback" :key="data">{{data}}</div>
                          </template>
                        </drop-list>

                      </div>
                    </drop>
                  </div>
                </drop>
              </q-tab-panel>
              <q-tab-panel name="preview">
                <pre>{{ computationTemplate }}</pre>
              </q-tab-panel>
            </q-tab-panels>
        </div>

        <!-- TODO: Rename labels to make everything understandable -->
        <!-- Components and Preferences -->
        </div>
        <div class="validation-div pl-2 pr-2 pb-2">
          <q-btn @click="validateJson">Validate</q-btn>
          <div class="validation-result-div">

            <q-card v-if="validationRunning" class="p-2">
              <q-skeleton animation="wave" width="85%"></q-skeleton>
              <q-skeleton animation="wave" width="55%"></q-skeleton>
              <q-skeleton animation="wave" width="70%"></q-skeleton>
            </q-card>
            <q-card :class="classValidity" class="p-2" v-if="!validationRunning && (validationArgsResult != null || validationPartParameterResult != null || validationResult != null)">
              <pre>{{validationResult}}</pre>
              <pre v-if="validationPartParameterResult != null">{{validationPartParameterResult}}</pre>
              <pre v-if="validationArgsResult != null">{{validationArgsResult}}</pre>
            </q-card>

          </div>
        </div>
        <div class="p-2" v-if="isLoggedIn">
          <q-btn
            variant="success"
            @click="runTemplate"
            :disabled="!validateJson">
            Execute Template
            <BIconPlay aria-hidden="true"></BIconPlay>
          </q-btn>
          <div id="iframe-div"></div>
        </div>
        <div class="pl-2 pr-2 pb-2">
          <q-btn
            @click="downloadCT">
            <q-tooltip anchor="top middle">Download Computation Template</q-tooltip>
            Download Computation Template
            <BIconDownload aria-hidden="true"></BIconDownload>
          </q-btn>
        </div>
      </div>
    </q-page-container>
    <!-- <v-tour name="myTour" :steps="steps" :options="{ highlight: true }"></v-tour>-->
  </q-layout>
</template>

<script>
import {Drag, Drop, DropList} from 'vue-easy-dnd';

// import Ace
import base64url from 'base64url';
import Ajv from 'ajv';
import AceEditorComponent from '../../components/EditorComponent-Ace.vue';

//import {biInfoCircle, biInfoCircleFill} from '@quasar/extras/bootstrap-icons';

import {
  BIconBook,
  BIconCaretDownFill,
  BIconCaretUp,
  BIconDownload,
  BIconInfoCircle,
  BIconPlay,
  BIconPlus,
  BIconUpload,
  BIconX,
  BIconXCircle,
} from 'bootstrap-icons-vue';

// for validation
import ctSchema from './json-schema/computation-template-container.json';
import parameterSchema from './json-schema/parameters.json';
import commandlineArgumentsSchema from './json-schema/commandline-arguments.json';
import TemplateComponentEditor from "@/pages/teacher/TemplateComponentEditor.vue";

export default {
  name: 'Teacher',
  components: {
    TemplateComponentEditor,
    Drag,
    Drop,
    DropList,
    AceEditorComponent,
    BIconBook,
    BIconInfoCircle,
    BIconDownload,
    BIconUpload,
    BIconXCircle,
    BIconCaretUp,
    BIconCaretDownFill,
    BIconX,
    BIconPlus,
    BIconPlay,
  },
  data() {
    return {
      componentsFiles: ['file', 'commandline arguments'],
      componentsFile: ['part'],
      componentsPart: ['part'],
      componentsCommand: ['checkbox', 'radio', 'dropdown', 'toggle'],
      availableGuiTypes: ['input_field', 'editor', 'slider', 'checkbox', 'radio', 'dropdown', 'toggle'],
      preferences: true,
      selectedParameter: {},
      selectedPart: {},
      selectedFile: {},
      showTemplateConfig: false,
      showFile: false,
      showPart: false,
      showParameter: false,
      showCommands: false,
      showComponents: true,
      showConfiguration: true,
      selectedComponentTab: "components",
      selectedContentTab: "structure",
      selectedConfigurationTab: "configuration",
      valueNumbers: new Map(),
      schema: ctSchema,
      paramSchema: parameterSchema,
      commandlineArgsSchema: commandlineArgumentsSchema,
      validationResult: null,
      validationPartParameterResult: null,
      validationArgsResult: null,
      steps: [
        {
          target: '#start-guide',
          content: 'Tour the <strong>ViPLab Computation Template Generator</strong>!',
        },
        {
          target: '#run-configuration',
          content: 'Choose the Environment! How is your Application run? After that, configure other parameters for the execution.',
          offset: -200,
        },
        {
          target: '#component-selection',
          content: 'Add components, like files, parts of files and gui-elements to your template by dragging and dropping them to the middle-section.',
        },
        {
          target: '#component-selection',
          content: 'For example: Drag-and-drop a file to add an input-file, or display code-snippets to the user.',
        },
        {
          target: '#component-selection',
          content: 'Additionally, if you want the user to modify the commandline arguments for execution, you can drag-and-drop the commandline argument-element. Then add GUI-elements to specify possible values the user can select from.',
        },
        {
          target: '#drag-components-here',
          content: 'By clicking on the different components in the middle-section, you can modify the configuration of each component on the right/bottom.',
          offset: -200,
          params: {
            placement: 'top',
          },
        },
        {
          target: '#define-output',
          content: 'Last, define, what the output should look like.',
          offset: -200,
          params: {
            placement: 'top',
          },
        },
      ],
      validationRunning: false,
      classValidity: '',
      signifyChange: true,
      outputIgnoreVisualization: '',
      outputIgnoreDownload: '',
    };
  },
  computed: {
    json: {
      get() {
        //this.$forceUpdate();
        return this.$store.state.jsonTemplate;
      },
      set(newValue) {
        this.$store.commit('updateJsonTemplate', newValue);
        this.$forceUpdate();
      },
    },
    token: {
      get() {
        //this.$forceUpdate();
        return this.$store.state.token;
      },
      set(newValue) {
        this.$store.commit('updateToken', newValue);
      },
    },
    ws: {
      get() {
        //this.$forceUpdate();
        return this.$store.state.ws;
      },
      set(newValue) {
        this.$store.commit('updateWebSocket', newValue);
      },
    },
    computationTemplate: {
      get() {
        return this.$store.state.generatedComputationTemplate;
      },
      set(newValue) {
        this.$store.commit('updateGeneratedComputationTemplate', newValue);
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
    hasTemplateParameters() {
      return this.computationTemplate.hasOwnProperty('parameters');
    },
    hasTemplateFiles() {
      return this.computationTemplate.hasOwnProperty('files') &&
        this.computationTemplate.files.length > 0;
    },
    hasTemplateFilePartsWithTemplate() {
      return this.computationTemplate.hasOwnProperty('files') &&
        this.computationTemplate.files.filter((file) =>
        file.parts.filter((part) => part && part.access === 'template').length > 0).length > 0;
    },
    vModelInputFieldText: {
      get() {
        if (this.selectedParameter.default.length > 0) {
          return base64url.decode(this.selectedParameter.default[0]);
        }
        return '';
      },
      set(val) {
        if (typeof this.selectedParameter !== 'undefined') {
          this.selectedParameter.default[ 0] = base64url(val);
          this.$forceUpdate();
        }
      },
    },
    vModelInputFieldNumber: {
      get() {
        if (this.selectedParameter.default.length > 0) {
          return this.selectedParameter.default[0];
        }
        return '';
      },
      set(val) {
        let newValue = parseFloat(val);

        if (Number.isNaN(newValue)) {
          // set to old value, if input was not null
          if (typeof this.selectedParameter !== 'undefined' && val !== '') {
            [newValue] = this.selectedParameter.default;
          // set to old value if new char was string not number
          } else if (typeof this.selectedParameter !== 'undefined' && val.length > 0) {
            [newValue] = this.selectedParameter.default;
          // else set value to null
          } else {
            newValue = null;
          }
        }

        if (typeof this.selectedParameter !== 'undefined') {
          this.selectedParameter.default[0] =  newValue;
        }

        if (newValue == null) {
          delete this.selectedParameter.default[0];
        }
        this.$forceUpdate();
      },
    },
    vModelOutputViewer: {
      get() {
        if (typeof this.computationTemplate.metadata !== 'undefined') {
          if (typeof this.computationTemplate.metadata.output !== 'undefined') {
            if (typeof this.computationTemplate.metadata.output.viewer !== 'undefined') {
              return this.computationTemplate.metadata.output.viewer;
            }
          }
        }
        return [];
      },
      set(val) {
        // create objects (metadata, output, viewer) if not set yet
        if (typeof this.computationTemplate.metadata === 'undefined') {
          this.computationTemplate['metadata'] = { };
        }
        if (typeof this.computationTemplate.metadata.output === 'undefined') {
          this.computationTemplate.metadata['output'] =  { };
        }
        if (typeof this.computationTemplate.metadata.output.viewer === 'undefined') {
          this.computationTemplate.metadata.output['viewer'] =  [];
        }

        // set viewer if the user wants to have special output formats
        if (val.length > 1 || (val.length === 1 && val[0] !== '')) {
          if (typeof this.computationTemplate.metadata.output.viewer !== 'undefined') {
            this.computationTemplate.metadata.output['viewer'] = val;
          }
        // delete viewer-object if user doesn't want special formats
        } else {
          delete this.computationTemplate.metadata.output['viewer'];
        }

        // delete metadata.output if empty
        if (typeof this.computationTemplate.metadata.output.viewer === 'undefined' && typeof this.computationTemplate.metadata.output.csv === 'undefined' && typeof this.computationTemplate.metadata.output.vtk === 'undefined') {
          delete this.computationTemplate.metadata['output'];
        }

        this.$forceUpdate();
      },
    },
    vModelFilePath: {
      get() {
        if (typeof this.selectedFile.path !== 'undefined') {
          return this.selectedFile.path;
        }
        return '';
      },
      set(val) {
        this.selectedFile['path'] =  val;
        if (val === '') {
          delete this.selectedFile['path'];
        }
        this.$forceUpdate();
      },
    },
    vModelFileMetadataSyntaxHighlighting: {
      get() {
        if (typeof this.selectedFile.metadata !== 'undefined') {
          if (typeof this.selectedFile.metadata.syntaxHighlighting !== 'undefined') {
            return this.selectedFile.metadata.syntaxHighlighting;
          }
        }
        return '';
      },
      set(val) {
        // if file-metadata object does not exist, create it
        if (typeof this.selectedFile.metadata === 'undefined') {
          this.selectedFile['metadata'] = { };
        }
        this.selectedFile.metadata['syntaxHighlighting'] = val;

        // if val is empty, remove object from ct
        if (val === '') {
          delete this.selectedFile.metadata['syntaxHighlighting'];
          if (Object.keys(this.selectedFile.metadata).length === 0) {
            delete this.selectedFile['metadata'];
          }
        }

        this.$forceUpdate();
      },
    },
    vModelFileMetadataDescription: {
      get() {
        if (typeof this.selectedFile.metadata !== 'undefined') {
          if (typeof this.selectedFile.metadata.description !== 'undefined') {
            return this.selectedFile.metadata.description;
          }
        }
        return '';
      },
      set(val) {
        // if file-metadata object does not exist, create it
        if (typeof this.selectedFile.metadata === 'undefined') {
          this.selectedFile['metadata'] = { };
        }
        this.selectedFile.metadata['description'] = val;

        // if val is empty, remove object from ct
        if (val === '') {
          delete this.selectedFile.metadata[ 'description'];
          if (Object.keys(this.selectedFile.metadata).length === 0) {
            delete this.selectedFile['metadata'];
          }
        }

        this.$forceUpdate();
      },
    },
    vModelPartAccess: {
      get() {
        if (typeof this.selectedPart.access !== 'undefined') {
          return this.selectedPart.access;
        }
        return '';
      },
      set(val) {
        if (typeof this.selectedPart.access !== 'undefined') {
          this.selectedPart['access'] = val;
        }

        this.$forceUpdate();
        return this.selectedPart.access;
      },
    },
    vModelPartMetadataName: {
      get() {
        if (typeof this.selectedPart.metadata !== 'undefined') {
          if (typeof this.selectedPart.metadata.description !== 'undefined') {
            return this.selectedPart.metadata.description;
          }
        }
        return '';
      },
      set(val) {
        if (typeof this.selectedPart.metadata !== 'undefined') {
          this.selectedPart.metadata['description'] ='';
        } else {
          this.selectedPart['metadata'] = { description: '' };
        }

        if (typeof this.selectedPart.metadata.description !== 'undefined') {
          this.selectedPart.metadata['description'] = val;
        }

        // if val is empty, remove object from ct
        if (val === '') {
          delete this.selectedPart.metadata['description'];
          if (Object.keys(this.selectedPart.metadata).length === 0) {
            delete this.selectedPart['metadata'];
          }
        }

        this.$forceUpdate();
      },
    },
    vModelParameterIdentifier: {
      get() {
        if (typeof this.selectedParameter.identifier !== 'undefined') {
          return this.selectedParameter.identifier;
        }
        return '';
      },
      set(val) {
        this.selectedParameter['identifier'] = val;
        // if val is empty, remove object from ct
        if (val === '') {
          delete this.selectedParameter['identifier'];
        }

        this.$forceUpdate();
      },
    },
    vModelParameterMetadataName: {
      get() {
        if (typeof this.selectedParameter.metadata !== 'undefined') {
          if (typeof this.selectedParameter.metadata.name !== 'undefined') {
            return this.selectedParameter.metadata.name;
          }
        }
        return '';
      },
      set(val) {
        if (typeof this.selectedParameter.metadata === 'undefined') {
          this.selectedParameter['metadata'] = { name: val };
        } else {
          this.selectedParameter.metadata['name'] = val;
        }

        // if val is empty, remove object from ct
        if (val === '') {
          delete this.selectedParameter.metadata['name'];
        }

        this.$forceUpdate();
      },
    },
    vModelParameterMetadataDescription: {
      get() {
        if (typeof this.selectedParameter.metadata !== 'undefined') {
          if (typeof this.selectedParameter.metadata.description !== 'undefined') {
            return this.selectedParameter.metadata.description;
          }
        }
        return '';
      },
      set(val) {
        if (typeof this.selectedParameter.metadata === 'undefined') {
          this.selectedParameter['metadata'] = { description: val };
        } else {
          this.selectedParameter.metadata['description'] = val;
        }

        // if val is empty, remove object from ct
        if (val === '') {
          delete this.selectedParameter.metadata['description'];
        }

        this.$forceUpdate();
      },
    },
    vModelParameterMaxlength: {
      get() {
        if (typeof this.selectedParameter.maxlength !== 'undefined') {
          return this.selectedParameter.maxlength;
        }
        return '';
      },
      set(val) {
        let newValue = parseFloat(val);

        if (Number.isNaN(newValue)) {
          // set to old value, if input was not null
          if (typeof this.selectedParameter !== 'undefined' && val !== '') {
            newValue = this.selectedParameter.maxlength;
          // set to old value if new char was string not number
          } else if (typeof this.selectedParameter !== 'undefined' && val.length > 0) {
            newValue = this.selectedParameter.maxlength;
          // else set value to null
          } else {
            newValue = null;
          }
        }

        this.selectedParameter['maxlength'] = newValue;

        // if val is empty, remove object from ct
        if (val === '') {
          delete this.selectedParameter['maxlength'];
        }
        this.$forceUpdate();
      },
    },
    ignoreVisualizationDefined: {
      get() {
        return (typeof this.computationTemplate.metadata !== 'undefined')
          && (typeof this.computationTemplate.metadata.output !== 'undefined')
          && (typeof this.computationTemplate.metadata.output.ignore !== 'undefined')
          && (typeof this.computationTemplate.metadata.output.ignore.visualization !== 'undefined');
      },
    },
    ignoreDownloadDefined: {
      get() {
        return (typeof this.computationTemplate.metadata !== 'undefined')
          && (typeof this.computationTemplate.metadata.output !== 'undefined')
          && (typeof this.computationTemplate.metadata.output.ignore !== 'undefined')
          && (typeof this.computationTemplate.metadata.output.ignore.download !== 'undefined');
      },
    },
  },
  watch: {
    computationTemplate: {
      handler() {
        // reset iFrame, if computation task is modified
        const iFrameDiv = document.getElementById('iframe-div');
        iFrameDiv.innerHTML = '';

        // check if properties are empty and delete
        const emptyProperties = [];
        Object.entries(this.computationTemplate.configuration).forEach(([key, value]) => {
          if (value === '') {
            emptyProperties.push(key);
          }
        });
        emptyProperties.forEach((key) => delete this.computationTemplate.configuration[key]);

        // TODO: check if metadata.output is empty and delete

        // update generated CT in Vuex-Store
        this.$store.commit('updateGeneratedComputationTemplate', this.computationTemplate);

        // reset validation as it is no longer up-to-date
        this.validationResult = null;
        this.validationPartParameterResult = null;
        this.validationArgsResult = null;
        this.validationRunning = false;

        this.$forceUpdate();
      },
      deep: true,
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
    paramAccordeon(id) {
      return `${id}param`;
    },
    contentAccordeon(id) {
      return `${id}content`;
    },
    onInsert(event, isPart, part) {
      console.log(event);
      console.log(isPart);
      console.log(part);
      if (isPart) {
        part.parameters.splice(event.index, 0, event.data);
      } else {
        part.parts.splice(event.index, 0, event.data);
      }
    },
    onFileDrop(e) {
      if (e.type === 'file') {
        const file = {
          identifier: this.uuid(),
          path: '',
          metadata: {
            syntaxHighlighting: 'text',
          },
          parts: [],
        };
        if (!(this.computationTemplate.hasOwnProperty('files'))){
          this.computationTemplate['files'] = [];
        }
        this.computationTemplate.files.push(file);
      // add commandline parameters
      } else if (typeof this.computationTemplate.parameters === 'undefined') {
        this.computationTemplate.parameters = [];
        // remove possibility to add commandline params
        this.componentsFiles = ['file'];
      }
      this.$forceUpdate();
    },
    onPartDrop(e, file) {
      const part = {
        identifier: this.uuid(),
        access: 'modifiable',
        content: '',
      };
      file.parts.push(part);
    },
    onParameterDrop(e, part = null) {
      let parameter = {};
      if (e.type === 'input_field') {
        parameter = {
          mode: 'any',
          identifier: this.uuid(),
          metadata: {
            guiType: e.data,
            type: '',
            name: 'Name',
            description: 'Add your description here...',
          },
          default: [''],
          validation: 'none',
        };
      } else if (e.type === 'slider') {
        parameter = {
          mode: 'any',
          identifier: this.uuid(),
          metadata: {
            guiType: e.data,
            name: 'Name',
            description: 'Add your description here...',
            vertical: false,
          },
          default: [0],
          min: 0,
          max: 100,
          step: 1,
          validation: 'none',
        };
      } else if (e.type === 'editor') {
        parameter = {
          mode: 'any',
          identifier: this.uuid(),
          metadata: {
            guiType: e.type,
            name: 'Name',
            description: 'Add your description here...',
          },
          default: [''],
          validation: 'none',
        };
      } else if (e.type === 'checkbox') {
        parameter = {
          mode: 'fixed',
          identifier: this.uuid(),
          metadata: {
            guiType: e.type,
            name: 'Name',
            description: 'Add your description here...',
          },
          options: [
            {
              value: 'value',
              text: 'label',
              selected: false,
              disabled: false,
            },
          ],
          validation: 'anyof',
        };
      } else if (e.type === 'radio') {
        parameter = {
          mode: 'fixed',
          identifier: this.uuid(),
          metadata: {
            guiType: e.type,
            name: 'Name',
            description: 'Add your description here...',
          },
          options: [
            {
              value: 'value',
              text: 'label',
              selected: false,
              disabled: false,
            },
          ],
          validation: 'oneof',
        };
      } else if (e.type === 'dropdown') {
        parameter = {
          mode: 'fixed',
          identifier: this.uuid(),
          metadata: {
            guiType: e.type,
            name: 'Name',
            description: 'Add your description here...',
          },
          options: [
            {
              value: 'value',
              text: 'label',
              selected: false,
              disabled: false,
            },
          ],
          validation: 'oneof',
        };
      } else if (e.type === 'toggle') {
        parameter = {
          mode: 'fixed',
          identifier: this.uuid(),
          metadata: {
            guiType: e.type,
            name: 'Name',
            description: 'Add your description here...',
          },
          options: [
            {
              value: 'value',
              text: 'label',
              selected: false,
              disabled: false,
            },
          ],
          validation: 'anyof',
        };
      } else {
        parameter = {
          identifier: this.uuid(),
          metadata: { guiType: e.type },
        };
      }
      // if part in set, add parameter to part, else add it to commanline parameters
      if (part !== null) {
        part.parameters.push(parameter);
        console.log(part);
      } else {
        this.computationTemplate.parameters.push(parameter);
      }
      this.$forceUpdate();
    },
    remove(n) {
      const index = this.numbers.indexOf(n);
      this.numbers.splice(index, 1);
    },
    openWindow(event, type, content) {
      event.stopPropagation();
      this.closePreferences();
      this.preferences = true;
      if (type === 'parameter') {
        this.selectedParameter = content;
        this.showParameter = true;
      } else if (type === 'part') {
        this.selectedPart = content;
        this.showPart = true;
      } else if (type === 'file') {
        this.selectedFile = content;
        this.showFile = true;
      } else if (type === 'commands') {
        this.showCommands = true;
      } else {
        this.showTemplateConfig = true;
        if (this.computationTemplate.identifier === '') {
          this.computationTemplate.identifier = this.uuid();
        }
      }
    },
    toggleConfiguration() {
      this.showConfiguration = !this.showConfiguration;
    },
    toggleComponents() {
      this.showComponents = !this.showComponents;
    },
    closePreferences() {
      this.preferences = false;
      this.selectedParameter = {};
      this.selectedPart = {};
      this.selectedFile = {};
      this.showTemplateConfig = false;
      this.showParameter = false;
      this.showPart = false;
      this.showFile = false;
      this.showCommands = false;
    },
    /** create uuid for the parameters */
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
    /* eslint no-param-reassign: ["error", { "props": false }] */
    addOrRemoveParameters(selectedPart) {
      if (selectedPart.access === 'template' && (typeof selectedPart.parameters === 'undefined')) {
        this.selectedPart['parameters'] = [];
      } else if (selectedPart.access !== 'template') {
        delete selectedPart.parameters;
      }
    },
    /**
     * Delete Parameter from part or command line arguments and rerender
     */
    removeParameter(event, item, isInPart = true) {
      event.stopPropagation();
      if (isInPart) {
        Object.values(this.computationTemplate.files).forEach((file) => {
          Object.values(file.parts).forEach((part) => {
            Object.keys(part.parameters).forEach((parameter) => {
              const currentParameter = part.parameters[parameter];
              if (currentParameter.identifier === item.identifier) {
                delete part.parameters.splice(parameter, 1);
                this.closePreferences();
                this.preferences = true;
              }
            });
          });
        });
      } else {
        Object.keys(this.computationTemplate.parameters).forEach((argument) => {
          const currentParameter = this.computationTemplate.parameters[argument];
          if (currentParameter.identifier === item.identifier) {
            delete this.computationTemplate.parameters.splice(argument, 1);
            this.closePreferences();
            this.showCommands = true;
            this.preferences = true;
          }
        });
      }
      this.$forceUpdate();
    },
    /**
     * Delete file from json and rerender
     */
    removeFile(event, item) {
      event.stopPropagation();
      this.computationTemplate.files = this.computationTemplate.files.filter(
        (file) => file.identifier !== item.identifier
      );
      this.closePreferences();
      this.preferences = true;

      // if there are no files, remove ability to add parts
      if (this.computationTemplate.files.length === 0) {
        delete this.computationTemplate['files'];
      }

      this.$forceUpdate();
    },
    /**
     * Delete part from json and rerender
     */
    removePart(event, item) {
      event.stopPropagation();
      Object.values(this.computationTemplate.files).forEach((file) => {
        file.parts = file.parts.filter(
          (part) => part.identifier !== item.identifier
        )
      });
      this.closePreferences();
      this.preferences = true;
      this.$forceUpdate();
    },
    /**
     * Delete commandline args from json and rerender
     */
    removeCommandlineArgs(event) {
      event.stopPropagation();
      delete this.computationTemplate['parameters'];
      this.componentsFiles.push('commandline arguments');
      this.closePreferences();
      this.preferences = true;
      this.$forceUpdate();
    },
    removeConfig(event, isCsv, index) {
      console.log('removing config for csv');
      event.stopPropagation();
      if (isCsv) {
        this.computationTemplate.metadata.output.csv.splice(index,1);
        if (this.computationTemplate.metadata.output.csv.length === 0) {
          delete this.computationTemplate.metadata.output['csv'];
        }
      } else {
        this.computationTemplate.metadata.output.vtk.splice(index,1);
        if (this.computationTemplate.metadata.output.vtk.length === 0) {
          delete this.computationTemplate.metadata.output['vtk'];
        }
      }
      // delete metadata.output if empty
      if (typeof this.computationTemplate.metadata.output.viewer === 'undefined' && typeof this.computationTemplate.metadata.output.csv === 'undefined' && typeof this.computationTemplate.metadata.output.vtk === 'undefined') {
        delete this.computationTemplate.metadata['output'];
      }

      this.$forceUpdate();
    },
    removePlot(event, csv, plotConf) {
      event.stopPropagation();
      console.log('delete csv')
      const configObject = this.computationTemplate.metadata.output.csv;
      Object.values(configObject).forEach((configItem) => {
        if (configItem.basename === csv.basename) {
          Object.keys(configItem.plots).forEach((plot) => {
            if (configItem.plots[plot].key === plotConf.key) {
              delete configItem.plots[plot];
            }
          });
        }
      });
      this.$forceUpdate();
    },
    /**
     * input_field
     * adjust parts of input-field json, depending on type
     */
    adjustInputType(item) {
      const { type } = item.metadata;
      if (type === 'text') {
        delete item['min'];
        delete item['max'];
        delete item['step'];
      } else if (type === 'number') {
        delete item[ 'maxlength'];
      }
      item.default[0]= '';
    },
    /**
     * validation - type: pattern
     * adjust whether pattern-object exists in json
     */
    adjustPatternExistence(item) {
      const { validation } = item;
      if (validation !== 'pattern') {
        delete item.pattern;
      }
      this.$forceUpdate();
    },
    addConfig() {
      const env = this.computationTemplate.environment;
      if (typeof this.computationTemplate.configuration === 'undefined') {
        this.computationTemplate[ 'configuration'] = {};
      }
      if (typeof this.computationTemplate.configuration['running.timelimitInSeconds'] === 'undefined') {
        this.computationTemplate.configuration['running.timelimitInSeconds'] = 0;
      }
      // TODO: Add environments as they are supported by the backend
      // eslint-disable-next-line default-case
      switch (env) {
        // case "C":
        //   this.$set(this.computationTemplate.configuration, "compiling.sources", [ "" ]);
        //   this.$set(this.computationTemplate.configuration, "compiling.compiler", "");
        //   this.$set(this.computationTemplate.configuration, "compiling.flags", "");
        //   this.$set(this.computationTemplate.configuration, "checking.sources", [ "" ]);
        //   this.$set(this.computationTemplate.configuration, "checking.forbiddenCalls", "");
        //   this.$set(this.computationTemplate.configuration, "linking.flags", "");
        //   this.$set(this.computationTemplate.configuration, "running.commandLineArguments", "");
        //   break;
        // case "C++":
        //   this.$set(this.computationTemplate.configuration, "compiling.sources", [ "" ]);
        //   this.$set(this.computationTemplate.configuration, "compiling.compiler", "");
        //   this.$set(this.computationTemplate.configuration, "compiling.flags", "");
        //   this.$set(this.computationTemplate.configuration, "linking.flags", "");
        //   this.$set(this.computationTemplate.configuration, "running.commandLineArguments", "");
        //   break;
        // case "Java":
        //   this.$set(this.computationTemplate.configuration, "compiling.sources", [ "" ]);
        //   this.$set(this.computationTemplate.configuration, "compiling.flags", "");
        //   this.$set(this.computationTemplate.configuration, "checking.sources", [ "" ]);
        //   this.$set(this.computationTemplate.configuration, "checking.allowedCalls", "");
        //   this.$set(this.computationTemplate.configuration, "checking.forbiddenCalls", "");
        //   this.$set(this.computationTemplate.configuration, "running.commandLineArguments", "");
        //   this.$set(this.computationTemplate.configuration, "running.flags", "");
        //   this.$set(this.computationTemplate.configuration, "running.mainClass", "");
        //   break;
        // case "Matlab":
        //   this.$set(this.computationTemplate.configuration, "checking.sources", [ "" ]);
        //   this.$set(this.computationTemplate.configuration, "checking.allowedCalls", "");
        //   this.$set(this.computationTemplate.configuration, "running.stdinFilename", "");
        //   break;
        // case "Octave":
        //   this.$set(this.computationTemplate.configuration, "checking.sources", [ "" ]);
        //   this.$set(this.computationTemplate.configuration, "checking.allowedCalls", "");
        //   this.$set(this.computationTemplate.configuration, "running.stdinFilename", "");
        //   break;
        case 'Container':
          if (typeof this.computationTemplate.configuration['running.commandLineArguments'] === 'undefined') {
            this.computationTemplate.configuration['running.commandLineArguments'] = '';
          }
          if (typeof this.computationTemplate.configuration['running.entrypoint'] === 'undefined') {
            this.computationTemplate.configuration['running.entrypoint'] = '';
          }
          if (typeof this.computationTemplate.configuration['running.intermediateFilesPattern'] === 'undefined') {
            this.computationTemplate.configuration['running.intermediateFilesPattern'] = [''];
          }
          if (typeof this.computationTemplate.configuration['running.userId'] === 'undefined') {
            this.computationTemplate.configuration['running.userId'] = 0;
          }
          if (typeof this.computationTemplate.configuration['resources.image'] === 'undefined') {
            this.computationTemplate.configuration['resources.image'] = '';
          }
          if (typeof this.computationTemplate.configuration['resources.volume'] === 'undefined') {
            this.computationTemplate.configuration['resources.volume'] = '';
          }
          if (typeof this.computationTemplate.configuration['resources.memory'] === 'undefined') {
            this.computationTemplate.configuration['resources.memory'] = '';
          }
          if (typeof this.computationTemplate.configuration['resources.numCPUs'] === 'undefined') {
            this.computationTemplate.configuration['resources.numCPUs'] = 1;
          }
          break;
        // case "DuMuX":
        //   this.$set(this.computationTemplate.configuration, "running.commandLineArguments", "");
        //   this.$set(this.computationTemplate.configuration, "running.executable", "");
        //   break;
      }
    },
    /** Check if property exists in current config, or if it is undefined */
    ifConfigPropertyExists(property) {
      const config = this.computationTemplate.configuration;
      return typeof config[property] !== 'undefined';

    },
    addCsvConfig() {
      const outputConfig = {
        basename: 'csv-basename',
        xlabel: {
          key: 'x-key',
          label: 'x-label',
        },
        plots: [
          {
            key: 'y-key',
            label: 'y-label',
          },
        ],
      };
      if (typeof this.computationTemplate.metadata === 'undefined') {
        this.computationTemplate['metadata'] = { };
      }
      if (typeof this.computationTemplate.metadata.output === 'undefined') {
        this.computationTemplate.metadata['output'] = { };
      }
      if (typeof this.computationTemplate.metadata.output.csv === 'undefined') {
        this.computationTemplate.metadata.output['csv'] = [];
      }
      this.computationTemplate.metadata.output.csv.push(outputConfig);
    },
    // TODO merge visualization and download
    addIgnoreVisualization() {
      // output-ignore-visualization-input
      if (typeof this.computationTemplate.metadata === 'undefined') {
        this.computationTemplate['metadata'] = { };
      }
      if (typeof this.computationTemplate.metadata.output === 'undefined') {
        this.computationTemplate.metadata['output'] = { };
      }
      if (typeof this.computationTemplate.metadata.output.ignore === 'undefined') {
        this.computationTemplate.metadata.output['ignore'] = { };
      }
      if (typeof this.computationTemplate.metadata.output.ignore.visualization === 'undefined') {
        this.computationTemplate.metadata.output.ignore['visualization'] = [];
      }
      this.computationTemplate.metadata.output.ignore.visualization.push(this.outputIgnoreVisualization);
      this.outputIgnoreVisualization = '';
    },
    removeIgnoreVisualization(ignoreItem) {
      const itemIndex = this.computationTemplate.metadata.output.ignore.visualization.indexOf(ignoreItem);
      this.computationTemplate.metadata.output.ignore.visualization.splice(itemIndex, 1);
    },
    addIgnoreDownload() {
      // output-ignore-visualization-input
      if (typeof this.computationTemplate.metadata === 'undefined') {
        this.computationTemplate['metadata'] = { };
      }
      if (typeof this.computationTemplate.metadata.output === 'undefined') {
        this.computationTemplate.metadata['output'] = { };
      }
      if (typeof this.computationTemplate.metadata.output.ignore === 'undefined') {
        this.computationTemplate.metadata.output['ignore'] = { };
      }
      if (typeof this.computationTemplate.metadata.output.ignore.download === 'undefined') {
        this.computationTemplate.metadata.output.ignore['download'] = [];
      }
      this.computationTemplate.metadata.output.ignore.download.push(this.outputIgnoreDownload);
      this.outputIgnoreDownload = '';
    },
    removeIgnoreDownload(ignoreItem) {
      const itemIndex = this.computationTemplate.metadata.output.ignore.download.indexOf(ignoreItem);
      this.computationTemplate.metadata.output.ignore.download.splice(itemIndex, 1);
    },
    addCsvPlot(csvConfigIndex) {
      const plotConfig = {
        key: 'y-key',
        label: 'y-label',
      };
      if (typeof this.computationTemplate.metadata.output.csv[csvConfigIndex].plots === 'undefined') {
        this.computationTemplate.metadata.output.csv[csvConfigIndex]['plots'] = [];
      }
      this.computationTemplate.metadata.output.csv[csvConfigIndex].plots.push(plotConfig);
    },
    addVtkConfig() {
      const outputConfig = {
        basename: 'vtk-basename',
      };
      if (typeof this.computationTemplate.metadata === 'undefined') {
        this.computationTemplate['metadata'] = { };
      }
      if (typeof this.computationTemplate.metadata.output === 'undefined') {
        this.computationTemplate.metadata['output'] = { };
      }
      if (typeof this.computationTemplate.metadata.output.vtk === 'undefined') {
        this.computationTemplate.metadata.output['vtk'] = [];
      }
      this.computationTemplate.metadata.output.vtk.push(outputConfig);
    },
    updateContent(item, event) {
      // this.computationTemplate.files[fileIndex].parts[partIndex].content = event
      item.content = event;
    },
    setEditorValue(event) {
      this.selectedParameter.default[0] = event;
      this.$forceUpdate();
    },
    getNumberOfFields(paramId) {
      if (this.valueNumbers.get(paramId) === undefined) {
        this.valueNumbers.set(paramId, 1);
        return 1;
      }
      return this.valueNumbers.get(paramId);
    },
    setNumberOfFields(paramId, newValue) {
      if (this.selectedParameter.metadata.guiType === 'checkbox') {
        if (newValue < this.getNumberOfFields(paramId)) {
          this.selectedParameter.options.pop();
          this.$forceUpdate();
        }
      }
      this.valueNumbers.set(paramId, newValue);
      this.$forceUpdate();
    },
    getNumberofConfigFields(configName) {
      if (this.computationTemplate.configuration[configName] === undefined) {
        return 0;
      }
      return this.computationTemplate.configuration[configName].length;
    },
    setNumberOfConfigFields(configName, newValue) {
      if (newValue < this.getNumberofConfigFields(configName)) {
        this.computationTemplate.configuration[configName].pop();
        if (newValue === 0) {
          delete this.computationTemplate.configuration[configName];
        }
        this.$forceUpdate();
      } else if (newValue !== 0) {
        if (this.getNumberofConfigFields(configName) === 0) {
          this.computationTemplate.configuration[configName] = [''];
        } else {
          this.computationTemplate.configuration[configName].push('');
        }
      }
      this.$forceUpdate();
    },
    getConfigvModel(configName, index = 0) {
      if (index != null) {
        if (typeof this.computationTemplate.configuration[configName] !== 'undefined') {
          if (this.computationTemplate.configuration[configName].length > 0) {
            return this.computationTemplate.configuration[configName][index];
          }
        }
      } else if (typeof this.computationTemplate.configuration[configName] !== 'undefined') {
        return this.computationTemplate.configuration[configName];
      }
      return '';
    },
    setConfigvModel(configName, val, index = 0, isNumericalValue = false) {
      // if config element is an array
      if (index != null) {
        if (typeof this.computationTemplate.configuration[configName] !== 'undefined') {
          this.computationTemplate.configuration[configName][index] = val.target.value;
        } else {
          this.computationTemplate.configuration[configName] = [val.target.value];
        }

      // if config element is not an array
      } else {
        let newValue;

        // if the value has to be a number, check it
        if (isNumericalValue) {
          newValue = parseFloat(val.target.value);
          if (Number.isNaN(newValue)) {
            // set to old value, if input was not null
            console.log(val.target.value);
            if (typeof this.computationTemplate.configuration[configName] !== 'undefined' && val.target.value !== '') {
              newValue = this.computationTemplate.configuration[configName];
            // set to old value if new char was string not number
            } else if (typeof this.computationTemplate.configuration[configName] !== 'undefined' && val.target.value === '') {
              newValue = null;// this.computationTemplate.configuration[configName];
            // else set value to null
            } else {
              newValue = null;
            }
          }
        } else {
          newValue = val.target.value;
        }

        console.log(newValue);

        //TODO check and fix code and logic
        // set existing value or create config-element and set it
        if (typeof this.computationTemplate.configuration[configName] !== 'undefined') {
          this.computationTemplate.configuration[configName] = newValue;
        } else {
          this.computationTemplate.configuration[configName] = newValue;
        }

        // delete config element if set to null or empty string
        if (newValue === null || newValue === '') {
          delete this.computationTemplate.configuration[configName];
        }
      }
      this.$forceUpdate();
    },
    getSlidervModel(index) {
      if (this.selectedParameter.default.length > 0) {
        return this.selectedParameter.default[index];
      }
      return NaN;
    },
    setSlidervModel(val, index) {
      if (typeof this.selectedParameter !== 'undefined') {
        if (val.target.value === '') {
          this.selectedParameter.default[index] = '';
        } else {
          console.log(val.target.value);
          if (val.target.value === '0.0') {
            this.selectedParameter.default[index] = val.target.value;
          } else {
            this.selectedParameter.default[index] = parseFloat(val.target.value);
          }
        }
      }
      this.$forceUpdate();
    },
    getFixedParamvModel(index, whatToGet = 'value') {
      if (this.selectedParameter.options.length > 0) {
        if (typeof this.selectedParameter.options[index] === 'undefined') {
          const option = {
            value: '',
            text: '',
            selected: false,
            disabled: false,
          };
          this.selectedParameter.options.push(option);
        }
        return this.selectedParameter.options[index][whatToGet];
      }
      return '';
    },
    /**
     * Sets value, selected or disabled in options-object
     * whatToSet: "value" || "selected" || "disabled"
     */
    setFixedParamvModel(val, index, whatToSet) {
      if (typeof this.selectedParameter !== 'undefined') {
        if (typeof this.selectedParameter.options[index] === 'undefined') {
          const option = {
            value: '',
            selected: false,
            disabled: false,
          };
          this.selectedParameter.options.push(option);
        }
        // if selected or disabled, set value as boolean - not as string
        if (whatToSet === 'selected' || whatToSet === 'disabled') {
          const isSetTrue = (val.target.value === 'true');
          this.selectedParameter.options[index][whatToSet] = isSetTrue;
          if (this.selectedParameter.metadata.guiType === 'radio' && isSetTrue) {
            const radioOptions = this.selectedParameter.options;
            Object.keys(radioOptions).forEach((radioOption) => {
              if (radioOption !== index) {
                radioOptions[radioOption][whatToSet] = false;
              }
            });
          }
        } else if (val.target.value === '' && whatToSet === 'text') {
          delete this.selectedParameter.options[index]['text'];
        } else {
          this.selectedParameter.options[index][whatToSet] = val.target.value;
        }
        // if dropdown and multiple fields are selected
        if (this.selectedParameter.metadata.guiType === 'dropdown') {
          const selected = [];
          Object.keys(this.selectedParameter.options).forEach((opt) => {
            const keys = Object.keys(this.selectedParameter.options[opt]);
            if (keys.includes('selected')) {
              if (this.selectedParameter.options[opt].selected) {
                selected.push(opt);
              }
            }
          });
          if (selected.length > 1) {
            this.selectedParameter['multiple'] = true;
          } else {
            this.selectedParameter['multiple'] = false;
          }
        }
        this.$forceUpdate();
        // return this.slidervModel;
      }
    },
    getRadioSelected(index) {
      if (typeof this.selectedParameter.options[index] !== 'undefined') {
        return this.selectedParameter.options[index].selected;
      }
      return false;
    },
    getvModelTemplateMetadata(propertyName) {
      if (typeof this.computationTemplate.metadata === 'undefined') {
        this.computationTemplate['metadata'] = { };
      }
      if (typeof this.computationTemplate.metadata[propertyName] !== 'undefined') {
        return this.computationTemplate.metadata[propertyName];
      }
      return '';
    },
    setvModelTemplateMetadata(propertyName, val) {
      if (val.target.value !== '') {
        if (typeof this.computationTemplate.metadata[propertyName] !== 'undefined') {
          this.computationTemplate.metadata[propertyName] = val.target.value;
          this.$forceUpdate();
        } else if (typeof this.computationTemplate.metadata === 'undefined') {
          this.computationTemplate['metadata'] = { };
          this.computationTemplate.metadata[ propertyName] = val.target.value;
        } else {
          this.computationTemplate.metadata[ propertyName] = val.target.value;
        }
        // return this.computationTemplate.metadata[propertyName];
      // if val is empty delete displayName-element
      } else if (typeof this.computationTemplate.metadata[propertyName] !== 'undefined') {
        delete this.computationTemplate.metadata[propertyName];
        // this.$forceUpdate();
      }
      this.$forceUpdate();
    },
    /**
     * validate computation template and return whether button should be enabled
     */
    validateJson(event, uploaded = false) {
      if (!uploaded) {
        this.validationRunning = true;
      }

      // reset validation
      this.validationResult = null;
      this.validationPartParameterResult = null;
      this.validationArgsResult = null;

      // ct validation
      // TODO if environment can be more than "Container" validate depending on that
      const ajv = new Ajv();
      const validate = ajv.compile(this.schema);
      validate(this.computationTemplate);
      this.validationResult = validate.errors;

      // parameter validation
      const { files } = this.computationTemplate;
      const paramValidate = ajv.compile(this.paramSchema);
      Object.values(files).forEach((file) => {
        Object.values(file.parts).forEach((part) => {
          if (typeof part.parameters !== 'undefined') {
            paramValidate(part.parameters);
            this.validationPartParameterResult = paramValidate.errors;
          }
        });
      });

      // commandline arguments validation
      const commandlineValidate = ajv.compile(this.commandlineArgsSchema);
      if (typeof this.computationTemplate.parameters !== 'undefined') {
        commandlineValidate(this.computationTemplate.parameters);
        this.validationArgsResult = commandlineValidate.errors;
      }

      if (!uploaded) {
        // if everything is valid, set validationResult to "Template is Valid!"
        if (this.validationResult == null && this.validationPartParameterResult == null && this.validationArgsResult == null) {
          this.validationResult = 'Template is Valid!';
          setTimeout(() => { this.validationRunning = false; }, 2000);
          this.classValidity = 'valid-true';
          return true;
        }

        setTimeout(() => { this.validationRunning = false; }, 2000);
        this.classValidity = 'valid-false';
      } else if (this.validationResult == null && this.validationPartParameterResult == null && this.validationArgsResult == null) {
        return true;
      }
      return false;
    },
    /** Check if teacher-frontend was opened by a user that is signed in */
    isLoggedIn() {
      const appDiv = document.body;
      const dataMode = appDiv.getAttribute('data-mode');
      // if data-mode is set to "create-and-execute", user is logged in (if it is set to "created", the user is not logged in)
      return ( ( dataMode === 'create-and-execute' ) );
    },
    startGuide() {
      this.$tours.myTour.start();
    },
    /* upload existing Computation Template JSON */
    uploadCT(event) {
      const iFrameDiv = document.getElementById('iframe-div');
      iFrameDiv.innerHTML = '';
      const reader = new FileReader();
      reader.onload = this.onReaderLoad;
      reader.readAsText(event.target.files[0]);
    },
    /* get json from uploaded file und update DOM */
    onReaderLoad(event) {
      const obj = JSON.parse(event.target.result);

      // close preferences of previous template and show cofig of new ct in preferences-window
      this.closePreferences();
      this.preferences = true;

      //  add required elements that might be missing
      if (typeof obj.files !== 'undefined') {
        Object.values(obj.files).forEach((file) => {
          // add file-identifiers if missing
          if (typeof file.identifier === 'undefined') {
            file['identifier'] = this.uuid();
          }
          // add "parts"-elements
          if (typeof file.parts === 'undefined') {
            file['parts'] = [];
          }
          // add required elements in parts
          Object.values(file.parts).forEach((part) => {
            // add identifiers if missing
            if (typeof part.identifier === 'undefined') {
              part['identifier'] = this.uuid();
            }
            // add content if missing
            if (typeof part.content === 'undefined') {
              part['content'] = '';
            }
            // if access is already set to template
            if (typeof part.access !== 'undefined') {
              if (part.access === 'template') {
                // add parameters
                if (typeof part.parameters === 'undefined') {
                  part['parameters'] = [];
                }
              }
            }
          });
        });
      } else {
        obj['files'] =  [];
      }

      // add template identifier
      if (typeof obj.identifier === 'undefined') {
        obj['identifier'] = this.uuid();
      }

      // TODO: Container needs configuration, but other environments might not need it (take that into account as backend supports more)
      // add configutation
      if (typeof obj.configuration === 'undefined') {
        obj['configuration'] = {};
      }

      // TODO: Should also function without metadata as it is not required
      // add metadata if missing

      // save current template, as it will be overwritten to perform validation
      const tmp = this.computationTemplate;
      // set generatedTemplate/computationTemplate so validation can be performed
      this.$store.commit('updateGeneratedComputationTemplate', obj);
      const isValid = this.validateJson(true);
      if (!isValid) {
        this.$alert('Your template is not valid. Thus, it can not be imported!', 'Import Error', 'error');
        this.$store.commit('updateGeneratedComputationTemplate', tmp);
      } else {
        this.$store.commit('updateGeneratedComputationTemplate', obj);
        this.signifyChange = !this.signifyChange;
        // set number of options for configuring parameters and commandline arguments
        this.setNumbersOfOptions();
      }

      this.$forceUpdate();
    },
    setNumbersOfOptions() {
      // set numbers of parameter-values
      Object.values(this.computationTemplate.files).forEach((file) => {
        Object.values(file.parts)
          .filter((part) => part.access === 'template')
          .forEach((part) => {
            Object.values(part.parameters)
              .filter((currentParam) => currentParam.mode === 'fixed')
              .forEach((currentParam) => { this.valueNumbers.set(currentParam.identifier, currentParam.options.length); });
          });
      });
      // set number of commandline argument-values
      if (typeof this.computationTemplate.parameters !== 'undefined') {
        Object.values(this.computationTemplate.parameters)
          .filter((parmeter) => parmeter.mode === 'fixed')
          .forEach((parameter) => {
            this.valueNumbers.set(parameter.identifier, parameter.options.length);
          });
      }
    },
    /** Run created template in another tab */
    runTemplate() {
      if (this.validateJson()) {
        const url = window.location;
        const baseUrl = `${url.protocol}//${url.host}/`;

        // calculate data-template for frontend-preview
        const file = JSON.stringify(this.computationTemplate);
        const dataBase64url = base64url(Buffer.from(file).toString());

        // baseUrl = "http://localhost:3000/";
        fetch(`${baseUrl}sign`, {
          method: 'POST',
          body: dataBase64url,
        }).then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Request failed!');
        }, (networkError) => {
          console.log(networkError.message);
        }).then((jsonResponse) => {
          // get token from sign-endpoint
          const { token } = jsonResponse;

          // set all values in Vuex store
          this.$store.commit('updateModifiedByTeacher', true);
          this.$store.commit('updateJsonTemplate', this.computationTemplate);
          this.$store.commit('updateToken', token);
          this.$store.commit('updateDataTemplate', dataBase64url);

          // authenticate with new token
          /* this.ws = new WebSocket(this.$config.WEBSOCKET_API);
          let message = JSON.stringify({ type: "authenticate", content: { jwt: token } });
          this.sendWaiting(message) */

          // preview ct in iFrame
          const iFrameDiv = document.getElementById('iframe-div');
          iFrameDiv.innerHTML = '';
          const iFrame = document.createElement('iframe');
          iFrameDiv.appendChild(iFrame);
          iFrame.setAttribute('src', url.href.replace('#/teacher', ''));
          iFrame.setAttribute('width', '100%');
          iFrame.setAttribute('height', '315');
        });
      } else {
        this.$alert('Your template is not valid. Thus, it can not be executed!', 'Execution Error', 'error');
      }
    },
    downloadCT() {
      console.log('clicked');
      const isValid = this.validateJson();

      if (isValid) {
        const dataStr = `data:text/json;charset=utf-8,${
          encodeURIComponent(JSON.stringify(this.computationTemplate))}`;
        const exportName = this.computationTemplate.identifier;
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute('href', dataStr);
        downloadAnchorNode.setAttribute('download', `${exportName}.json`);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      } else {
        this.$alert('Your template is not valid. Thus, it can not be saved!', 'Download Error', 'error');
      }
    },
  },
  mounted() {
    // generate id for ct
    this.computationTemplate.identifier = this.uuid();
    this.setNumbersOfOptions();
  },
};
</script>

<style lang="scss">
body {
  /* Needed for the position sticky to work */
  overflow: unset !important;
}

#injected #teacher {

  .teacher-header {
    background: linear-gradient(110deg, #004191 60%, #00BEFF 60%);
  }
  .teacher-header .center {
    margin-left: auto;
    margin-right: auto;
  }


  .ct-docu-link {
    color: white;
  }

  .ct-docu-link:hover {
    color: #004191;
  }

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

  .header-intro {
    position: relative;
    z-index: 100;
  }

  .outer-div {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    padding: 10px;

    margin: 0 !important;
  }

  .main-div {
    /*position: relative;*/
    background-color: #fff;
    border-radius: calc(0.25rem - 1px);
    /*top: 200px;*/
  }

  .validation-div {
    position: relative;
    background-color: #fff;
    border-radius: calc(0.25rem - 1px);
  }

  .item-name {
    font-weight: bold;
    font-size: 14pt;
  }

  .drag {
    padding: 10px;
    background-color: rgba(0, 190, 255, 0.2);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 0 0 10px 0;
    /*font-size: 20px;*/
    transition: all 0.5s;
    width: 100%;
    text-align: center;
  }

  .type-allowed{
    background-color: rgba(0, 255, 0, .4);
  }

  .type-forbidden  {
    background-color: rgba(255, 0, 0, 0.2);
  }

  .card-body {
    height: 100% !important;
  }

  .group {
    display: flex;
    position:relative;
    background-color: #fff;
  }

  .teacher-section-wrap {
    position:relative;
    background-color: #fff;
  }

  .select-list {
    margin: 20px 10px 20px 10px;
    width: 20%;
  }

  .preferences-list {
    padding: 0 10px 10px 10px;
    word-break: break-word;
  }

  .dnd-window {
    position: relative;
    flex: 1;
    width: 70%;
    margin: 20px 10px 20px 10px;
  }

  .top-copy {
    /*border: 1px solid black;*/
    min-height: 100px;
    position: relative;
    flex: 1;
    width: 100%;
    height: 100%;
    font-size: 1em;
  }

  .top-copy::before {
    /*content: "Drop Components Here";*/
    color: rgba(0, 0, 0, 0.4);
    font-size: 25px;
    font-weight: bold;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 0;
  }

  .copy {
    border: 1px solid #dee2e6;
    min-height: 100px;
    margin: 20px auto 20px auto;
    position: relative;
    flex: 1;
    width: 80%;
  }

  .card {
    background-color: rgba(0, 0, 0, 0);
    height: 100%;
  }

  .card-body {
    padding: 0 !important;
  }

  .param-droplist {
    width: 80%;
    margin: auto;
  }

  .part-droplist {
    margin: 20px auto 20px auto;
    width: 80%;
  }

  .part-border {
    border: 1px solid #dee2e6;
  }

  .part-drag {
    /*border: 1px solid black;*/
    min-height: 100px;
    margin: 20px auto 20px auto;
    position: relative;
    flex: 1;
    /*width: 70%;*/
    cursor: pointer;
    z-index: 100;
  }

  .param {
    border: 1px solid #dee2e6;
    min-height: 100px;
    margin: 20px auto 20px auto;
    position: relative;
    flex: 1;
    cursor: pointer;
    z-index: 100;
  }

  .param-container {
    min-height: 100px;
  }

  .template, .file, .part {
    min-height: 100px;
    position: relative;
    flex: 1;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  .copy::before {
    //content: "COPY";
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: rgba(0, 0, 0, 0.4);
    font-size: 25px;
    font-weight: bold;
  }

  .drop-in {
    box-shadow: 0 0 5px rgba(0, 0, 255, 0.4);
  }

  .list-enter,
  .list-leave-to {
    opacity: 0;
  }

  .list-leave-active {
    position: absolute;
  }

  .part-content-field {
    padding: 10px 10px 10px 10px;
  }

  .collapsed > .when-open,
  .not-collapsed > .when-closed {
    display: none;
  }

  .btn {
    width: 100%;
  }

  .part .card .card-header .btn {
    color: #fff;
    background-color: #00BEFF;
    border-color: #00BEFF;
  }

  .b-form-spinbutton .btn {
    width: 100%;
    padding : 0 !important;
    height: 100%;
  }

  .tool-button {
    width: 30%;
    margin: 0 0 0 0;
  }

  .toggle-controls {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow-x: hidden !important;
    right: 0;
    /* top: 210px; */
  }

  #toggle-left-components a {
    position: absolute;
    transition: 0.3s;
    padding: 15px;
    width: 120px;
    text-decoration: none;
    color: white;
    z-index: 10;

    left: -70px;
    border-radius: 5px 5px 5px 5px;

    transform: rotate(-90deg);
    /* Legacy vendor prefixes that you probably don't need... */
    /* Safari */
    -webkit-transform: rotate(-90deg);
    /* Firefox */
    -moz-transform: rotate(-90deg);
    /* IE */
    -ms-transform: rotate(-90deg);
    /* Opera */
    -o-transform: rotate(-90deg);
    /* Internet Explorer */
    filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=3);
  }

  #toggle-left-components a:hover {
      left: -30px;
  }

  #toggle-right-config a {
    position: absolute;
    transition: 0.3s;
    padding: 15px;
    width: 120px;
    text-decoration: none;
    color: white;
    z-index: 10;

    right: -70px;
    border-radius: 5px 5px 5px 5px;

    transform: rotate(-270deg);
    /* Legacy vendor prefixes that you probably don't need... */
    /* Safari */
    -webkit-transform: rotate(-270deg);
    /* Firefox */
    -moz-transform: rotate(-270deg);
    /* IE */
    -ms-transform: rotate(-270deg);
    /* Opera */
    -o-transform: rotate(-270deg);
    /* Internet Explorer */
    filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=3);
  }

  #toggle-right-config a:hover {
      right: -30px;
  }

  #about {
      top: 20px;
      background-color: #00BEFF;
  }

  .toggle-content {
    padding: 0;
    position: relative;
    top: 10px !important;
  }

  .header-button {
    color: white;
    background-color: rgb(178,180,183);
    border-color: rgb(178,180,183);
    width: 90%;
    margin-bottom: 10px;
  }

  .header-button:hover {
    background-color: rgb(178,180,183);
    color: #323232;
    border-color: rgb(178,180,183);
  }

  #drag-components-here {
    min-width: 393px;
  }

  .v-tour__target--highlighted {
    box-shadow: 0 0 0 99999px rgba(0, 0, 0, .4);
  }

  #iframe-div {
    margin-top: 0.5rem;
  }

  #iframe-div > iframe {
    border-radius: calc(0.25rem - 1px) calc(0.25rem - 1px) calc(0.25rem - 1px) calc(0.25rem - 1px);
    border: 3px solid #6c757d;
  }

  @media (max-width: 799px) {
    .group {
      flex-direction: row;
      flex-wrap: wrap;
    }

    .select-list {
      width: 100%;
    }

    #drop-components-here {
      width: 100%;
    }
  }

  .validation-result-div pre {
    margin: 0;
  }

  .validation-result-div .valid-false {
    background: rgba(139, 0, 0, 0.2);
  }

  .validation-result-div .valid-false pre {
    color: darkred;
  }

  .validation-result-div .valid-true {
    background: rgba(0, 100, 0, 0.2);
  }

  .validation-result-div .valid-true pre {
    color: darkgreen;
  }

  .tooltip-icon {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  }
</style>
