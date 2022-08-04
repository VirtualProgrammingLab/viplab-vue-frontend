<template>
  <!-- content -->
  <div
    id="app"
    class=""
  >

  <div id="teacher">

    <div class="sample-header p-2">
          <div class="sample-header-section">
            <h2>Teacher</h2>
            <h3>
              This site will help you create a Computation Template
              <a class="ct-docu-link" href="https://virtualprogramminglab.github.io/documentation/viplab-3.0/computation_template/" title="Go to Documentation for more Info" alt="Documentation" target="_blank"><b-icon-book>Go to Documentation for more Info</b-icon-book></a>
            </h3>
            <b-button id="start-guide" variant="outline-primary" @click="startGuide">Start Guide</b-button>
            
            <input
                    type="file"
                    ref="upload"
                    style="display: none"
                    @change="uploadCT"
                    accept="application/JSON"
                  />
                  <b-button
                    class="btn mt-2"
                    id="start-guide"
                    variant="outline-primary"
                    @click="$refs.upload.click()"
                    v-tooltip.bottom="'Upload of previously created template'"
                  >
                    Modify existing Template
                    <b-icon icon="upload" aria-hidden="true"></b-icon>
                  </b-button>
          </div>
        </div>

    <div class="main-div pl-4 pr-4">

      <div class="toggle-controls mt-2">
        <div id="toggle-left-components">
          <a v-b-toggle="'components-collapse'" href="#" id="about">
            <div class="toggle-content">
              Toggle Components
            </div>
          </a>
        </div>

        <div id="toggle-right-config">
          <a v-b-toggle="'config-collapse'" href="#" id="about">
            <div class="toggle-content">
              Toggle Configuration
            </div>
          </a>
        </div>
      </div>

      <div class="sample-section-wrap">
      <div class="group">

        <!-- Components and Preferences -->
        <b-collapse class="select-list" id="components-collapse" visible>
          <b-card no-body>
                <b-tabs card class="files" id="component-selection" content-class="m-2" fill>
                  
                  <!-- Drag-and-Drop Components -->
                  <b-tab
                    title="Components"
                  >
                    <div v-if="showTemplate">
                      <div class="mb-2">Template:</div>
                      <transition-group name="list" tag="div">
                        <drag v-for="n in componentsFiles" :key="n" class="drag" :data="n">{{n}}</drag>
                      </transition-group>
                    </div>
                    <div v-if="showFile">
                      <div class="mb-2">File:</div>
                      <transition-group name="list" tag="div">
                        <drag v-for="n in componentsFiles.concat(componentsFile)" :key="n" class="drag" :data="n">{{n}}</drag>
                      </transition-group>
                    </div>
                    <div v-if="showPart && !thereIsTemplate">
                      <div class="mb-2">Part:</div>
                      <transition-group name="list" tag="div">
                        <drag v-for="n in componentsFiles.concat(componentsFile)" :key="n" class="drag" :data="n">{{n}}</drag>
                      </transition-group>
                    </div>
                    <div v-if="showPart && thereIsTemplate">
                      <div class="mb-2">Part:</div>
                      <transition-group name="list" tag="div">
                        <drag v-for="n in componentsFiles.concat(componentsPart).concat(availableGuiTypes)" :key="n" class="drag" :data="n">{{n}}</drag>
                      </transition-group>
                    </div>
                    <div v-if="showCommands">
                      <div class="mb-2">Commandline Arguments:</div>
                      <transition-group name="list" tag="div">
                        <drag v-for="n in componentsFiles.concat(componentsCommand).concat(availableGuiTypes)" :key="n" class="drag" :data="n">{{n}}</drag>
                      </transition-group>
                    </div>
                  </b-tab>

            </b-tabs>
          </b-card>
        </b-collapse>

        <!-- Graphical View of Template -->
        <div class="dnd-window" id="drag-components-here">
          <b-card no-body>
            <b-tabs card class="files" id="component-selection" content-class="m-2" fill>
              
              <!-- Drag-and-Drop Components -->
              <b-tab title="Drop Here">
                <drop class="top-copy" @drop="onFileDrop($event)" :accepts-data="(file) => ((file  === 'file') || (file === 'commandline arguments'))">
                  <div class="template p-2" @click="openWindow($event, 'template', computationTemplate)">
                    
                    <div v-for="(file, index) in computationTemplate.files" :key="file.identifier + '-' + index">
                      <drop class="copy" @drop="onPartDrop($event,file)" :accepts-data="(part) => part  === 'part'">
                        <div class="file p-2" @click="openWindow($event, 'file', file)">
                          
                          <b-row align-v="stretch">
                            <b-col cols="8">
                              File
                            </b-col>
                            <b-col cols="4">
                              <div class="text-right" @click="removeFile($event, file)">
                                <b-icon icon="x-circle" v-tooltip.top-center="'Delete File'"></b-icon>
                              </div>
                            </b-col>
                          </b-row>

                          <!--<div v-for="(part, index) in file.parts" :key="index">-->
                          <drop-list class="part-droplist" v-if="file.parts" :items="file.parts" @insert="onInsert($event, false, file)" @reorder="$event.apply(file.parts)" :accepts-data="(part) => false" :column="true">
                            <template v-slot:item="{item}"> 
                              <drag class="item part-drag" :key="item.identifier">           
                                <drop class="part-border" @drop="onParameterDrop($event, item)" :accepts-data="(param) => ((availableGuiTypes.includes(param))) && item.parameters">
                                  <div class="part p-2" @click="openWindow($event, 'part', item)">

                                    <b-row align-v="stretch" class="mb-2">
                                      <b-col cols="8">
                                        Part
                                      </b-col>
                                      <b-col cols="4">
                                        <div class="text-right" @click="removePart($event, item)">
                                          <b-icon icon="x-circle" v-tooltip.top-center="'Delete Part'"></b-icon>
                                        </div>
                                      </b-col>
                                    </b-row>
                                    
                                    <b-card v-if="item.parameters" no-body class="">
                                      <b-card-header header-tag="header" class="p-1" role="tab">
                                        <b-button block v-b-toggle:[paramAccordeon(item.identifier)] variant="info">
                                          Parameters
                                          <b-icon class="when-closed" icon="caret-down-fill"></b-icon>
                                          <b-icon class="when-open" icon="caret-up"></b-icon>
                                        </b-button>
                                      </b-card-header>
                                      <b-collapse :id="item.identifier+'param'" visible accordion="my-accordion-1" role="tabpanel">
                                        <b-card-body>
                                          <drop-list class="param-droplist" v-if="item.parameters" :items="item.parameters" @insert="onInsert($event, true ,item)" @reorder="$event.apply(item.parameters)" :accepts-data="(param) => false" :column="true">
                                            <template v-slot:item="{item}">
                                              <drag class="item param" :key="item.identifier">
                                                <b-container class="param-container p-2" @click="openWindow($event, 'parameter', item)">
                                                  
                                                  <b-row align-v="stretch">
                                                    <b-col cols="8">
                                                      {{item.metadata.guiType}}
                                                    </b-col>
                                                    <b-col cols="4">
                                                      <div class="text-right" @click="removeParameter($event, item)">
                                                        <b-icon icon="x-circle" v-tooltip.top-center="'Delete Parameter'"></b-icon>
                                                      </div>
                                                    </b-col>
                                                  </b-row>
                                                </b-container>
                                              </drag>
                                            </template>
                                            <template v-slot:feedback="{data}">
                                              <div class="item feedback" :key="data">{{data}}</div>
                                            </template>
                                          </drop-list>
                                        </b-card-body>
                                      </b-collapse>
                                    </b-card>

                                    <b-card no-body class="">
                                      <b-card-header header-tag="header" class="p-1" role="tab">
                                        <b-button block v-b-toggle:[contentAccordeon(item.identifier)] variant="info">
                                          Content
                                          <b-icon class="when-closed" icon="caret-down-fill"></b-icon>
                                          <b-icon class="when-open" icon="caret-up"></b-icon>
                                        </b-button>
                                      </b-card-header>
                                      <b-collapse :id="item.identifier+'content'" visible accordion="my-accordion-2" role="tabpanel">
                                        <b-card-body>
                                          <div class="part-content-field">
                                            <div class="d-flex"> 
                                              <div class="flex-grow-1">
                                                <label class="mr-2" for="item.content">content: </label>
                                              </div>
                                              <!-- tooltip -->
                                              <div class="tooltip-icon pl-2">
                                                  <b-icon-info-circle v-tooltip.top-center="'Content, that will be base64url-encoded automatically. Can contain Handlebars.js expressions with PARAM_IDs (identifiers) if the access type of this part is template.'"></b-icon-info-circle>
                                              </div>
                                            </div>
                                            <ace-editor-component 
                                              :isParameter="false" 
                                              :isMustache="false"
                                              :readonly="false"
                                              :item='{
                                                "identifier" : "Editor" + item.identifier,
                                                "content" : item.content
                                              }'
                                              v-on:update:item="updateContent(item, $event)"
                                            ></ace-editor-component>
                                          </div>
                                        </b-card-body>
                                      </b-collapse>
                                    </b-card>
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
                    <div v-if="computationTemplate.parameters">
                      <drop class="copy" @drop="onParameterDrop($event)" :accepts-data="(param) => ((availableGuiTypes.includes(param))) && computationTemplate.parameters">
                        <div class="file p-2" @click="openWindow($event, 'commands', computationTemplate.parameters)">
                        
                          <b-row align-v="stretch">
                            <b-col cols="10">
                              Commandline Arguments
                            </b-col>
                            <b-col cols="2">
                              <div class="text-right" @click="removeCommandlineArgs($event)">
                                <b-icon icon="x-circle" v-tooltip.top-center="'Delete Commandline Arguments'"></b-icon>
                              </div>
                            </b-col>
                          </b-row>

                          <drop-list class="param-droplist" v-if="computationTemplate.parameters" :items="computationTemplate.parameters" @insert="onInsert($event, true, item)" @reorder="$event.apply(computationTemplate.parameters)" :accepts-data="(param) => false" :column="true" :key="uuid()">
                            <template v-slot:item="{item}">
                              <drag class="item param" :key="item.identifier">
                                <b-container class="param-container p-2" @click="openWindow($event, 'parameter', item)">
                                  <b-row align-v="stretch">
                                    <b-col cols="8">
                                      {{item.metadata.guiType}}
                                    </b-col>
                                    <b-col cols="4">
                                      <div class="text-right" @click="removeParameter($event, item, false)">
                                        <b-icon icon="x-circle" v-tooltip.top-center="'Delete Argument'"></b-icon>
                                      </div>
                                    </b-col>
                                  </b-row>
                                </b-container>
                              </drag>
                            </template>
                            <template v-slot:feedback="{data}">
                              <div class="item feedback" :key="data">{{data}}</div>
                            </template>
                          </drop-list>

                        </div>
                      </drop>
                    </div>
                  </div>     
                </drop>
              </b-tab>
              <b-tab title="JSON Preview">
                <pre>{{ computationTemplate }}</pre>
              </b-tab>
            </b-tabs>
          </b-card>
        </div>

        <!-- Components and Preferences -->
        <b-collapse class="select-list" id="config-collapse" visible>
          <b-card no-body>
                <b-tabs card class="files" content-class="m-2" fill>

                  <!-- Configuration -->
                  <b-tab v-if="preferences" title="Configuration" active>
                    <div class="preferences-list">
                      <!-- Template Data -->
                      <div v-if="showTemplate">

                        <!-- Environment -->
                        <div id="run-configuration">
                          
                          <label class="mr-2" for="computationTemplate.environment">environment: </label>
                          <div class="d-flex form-group">  
                            <div class="dropdown flex-grow-1">
                              <select
                                class="form-control"
                                v-model="computationTemplate.environment"
                                @change="addConfig()"
                              >
                                <option disabled=true>C</option>
                                <option disabled=true>C++</option>
                                <option disabled=true>Java</option>
                                <option disabled=true>Matlab</option>
                                <option disabled=true>Octave</option>
                                <option>Container</option>
                                <option disabled=true>DuMuX</option>
                              </select>
                            </div>
                            <!-- tooltip -->
                            <div class="tooltip-icon pl-2">
                                <b-icon-info-circle v-tooltip.top-center="'Specifies the environment used for the Computation. It defines language, runtime, libraries and tools.'"></b-icon-info-circle>
                            </div>
                          </div>

                          <!-- Configuration -->
                          <div v-if="typeof computationTemplate.configuration != 'undefined' && computationTemplate.environment != ''" class="border mb-2 p-2">
                            
                            <!-- resources.image -->
                            <div v-if="computationTemplate.environment == 'Container'" id="image">
                              <label class="mr-2">resources.image*:</label>
                              <div class="d-flex form-group"> 
                                <div class="flex-grow-1">
                                  <input type="text" class="form-control" :value="getConfigvModel('resources.image', null)" @input="setConfigvModel('resources.image', $event, null)">
                                </div>
                                <!-- tooltip -->
                                <div class="tooltip-icon pl-2">
                                    <b-icon-info-circle v-tooltip.top-center="'Location of the image to be executed. Can have one of the following prefixes: name://, file://, id://'"></b-icon-info-circle>
                                </div>
                              </div>
                            </div>

                            <!-- running.timelimitInSeconds -->
                            <div v-if="computationTemplate.environment == 'Container'">
                              <label class="mr-2">running.timelimitInSeconds:</label>
                              <div class="d-flex form-group"> 
                                <div class="flex-grow-1">
                                  <input type="number" class="form-control" :value="getConfigvModel('running.timelimitInSeconds', null)" @input="setConfigvModel('running.timelimitInSeconds', $event, null, true)">
                                </div>
                                <!-- tooltip -->
                                <div class="tooltip-icon pl-2">
                                    <b-icon-info-circle v-tooltip.top-center="'CPU time limit.'"></b-icon-info-circle>
                                </div>
                              </div>
                            </div>

                            <!-- running.commandLineArguments -->
                            <div v-if="computationTemplate.environment == 'Container'">
                              <label class="mr-2">running.commandLineArguments:</label>
                              <div class="d-flex form-group"> 
                                <div class="flex-grow-1">
                                  <input type="text" class="form-control" :value="getConfigvModel('running.commandLineArguments', null)" @input="setConfigvModel('running.commandLineArguments', $event, null)">
                                </div>
                                <!-- tooltip -->
                                <div class="tooltip-icon pl-2">
                                    <b-icon-info-circle v-tooltip.top-center="'For C, C++, Java: arguments given to main() function; For DuMuX, Container: Additional command line arguments.'"></b-icon-info-circle>
                                </div>
                              </div>
                            </div>

                            <!-- running.entrypoint -->
                            <div v-if="computationTemplate.environment == 'Container'">
                              <label class="mr-2">running.entrypoint:</label>
                              <div class="d-flex form-group"> 
                                <div class="flex-grow-1">
                                  <input type="text" class="form-control" :value="getConfigvModel('running.entrypoint', null)" @input="setConfigvModel('running.entrypoint', $event, null)">
                                </div>
                                <!-- tooltip -->
                                <div class="tooltip-icon pl-2">
                                    <b-icon-info-circle v-tooltip.top-center="'Executable to run inside the Container. For Container: Can contain mustache template syntax for injecting PARAM_IDs.'"></b-icon-info-circle>
                                </div>
                              </div>
                            </div>

                            <!-- running.intermediateFilesPattern -->
                            <div v-if="computationTemplate.environment == 'Container'">
                              <label class="mr-2">running.intermediateFilesPattern:</label>
                              <div class="d-flex form-group"> 
                                <div class="flex-grow-1">
                                  <div class="ml-4 mr-4">
                                    <!-- set how many values the config should have -->
                                    <label for="'running.intermediateFilesPattern-sb-options'">How many running.intermediateFilesPattern should there be?</label>
                                    <b-form-spinbutton :id="'running.intermediateFilesPattern-sb-options'" placeholder="0" min="0" :value="getNumberofConfigFields('running.intermediateFilesPattern')" class="mb-2" @change="setNumberOfConfigFields('running.intermediateFilesPattern', $event)"></b-form-spinbutton>
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
                                    <b-icon-info-circle v-tooltip.top-center="'RegEx-Expression in Stdout which File(s) is ready to be transferred by the Backend to be displayed by the Frontend.'"></b-icon-info-circle>
                                </div>
                              </div>
                            </div>
                            
                            <!-- running.userId -->
                            <div v-if="computationTemplate.environment == 'Container'">
                              <label class="mr-2">running.userId:</label>
                              <div class="d-flex form-group"> 
                                <div class="flex-grow-1">
                                  <input type="number" class="form-control" :value="getConfigvModel('running.userId', null)" @input="setConfigvModel('running.userId', $event, null, true)">
                                </div>
                                <!-- tooltip -->
                                <div class="tooltip-icon pl-2">
                                    <b-icon-info-circle v-tooltip.top-center="'User id of the user that writes files inside the Container.'"></b-icon-info-circle>
                                </div>
                              </div>
                            </div>

                            <!-- resources.volume -->
                            <div v-if="computationTemplate.environment == 'Container'">
                              <label class="mr-2">resources.volume:</label>
                              <div class="d-flex form-group"> 
                                <div class="flex-grow-1">
                                  <input type="text" class="form-control" :value="getConfigvModel('resources.volume', null)" @input="setConfigvModel('resources.volume', $event, null)">
                                </div>
                                <!-- tooltip -->
                                <div class="tooltip-icon pl-2">
                                    <b-icon-info-circle v-tooltip.top-center="'Path in the Container where data is placed.'"></b-icon-info-circle>
                                </div>
                              </div>
                            </div>

                            <!-- resources.memory -->
                            <div v-if="computationTemplate.environment == 'Container'">
                              <label class="mr-2">resources.memory:</label>
                              <div class="d-flex form-group"> 
                                <div class="flex-grow-1">
                                  <input type="text" class="form-control" :value="getConfigvModel('resources.memory', null)" @input="setConfigvModel('resources.memory', $event, null)">
                                </div>
                                <!-- tooltip -->
                                <div class="tooltip-icon pl-2">
                                    <b-icon-info-circle v-tooltip.top-center="'Memory limit for the Container.'"></b-icon-info-circle>
                                </div>
                              </div>
                            </div>

                            <!-- resources.numCPUs -->
                            <div v-if="computationTemplate.environment == 'Container'">
                              <label class="mr-2">resources.numCPUs:</label>
                              <div class="d-flex form-group"> 
                                <div class="flex-grow-1">
                                  <input type="number" class="form-control" :value="getConfigvModel('resources.numCPUs', null)" @input="setConfigvModel('resources.numCPUs', $event, null, true)">
                                </div>
                                <!-- tooltip -->
                                <div class="tooltip-icon pl-2">
                                    <b-icon-info-circle v-tooltip.top-center="'Number of CPUs for the Container.'"></b-icon-info-circle>
                                </div>
                              </div>
                            </div>

                            <!-- TODO Config Props need to be added if ViPLab supports other environments than Container -->
                            <!-- <div v-if="ifConfigPropertyExists('compiling.sources')">
                              <label class="mr-2">compiling.sources*:</label>
                              <div class="ml-4 mr-4"> -->
                                <!-- set how many values the config should have -->
                                <!--<label for="'compiling-sources-sb-options'">How many compiling.sources should there be?</label>
                                <b-form-spinbutton :id="'compiling-sources-sb-options'" placeholder="1" :value="getNumberofConfigFields('compiling.sources')" class="mb-2" @change="setNumberOfConfigFields('compiling.sources', $event)"></b-form-spinbutton> -->
                                <!-- config-values -->
                                <!-- <div class="border mb-2 p-2" v-for="(field, index) in getNumberofConfigFields('compiling.sources')" :key="'compiling-sources-' + index"> -->
                                  <!-- value -->
                                  <!-- <label>Set values:</label>
                                  <input type="text" class="form-control" :value="getConfigvModel('compiling.sources', index)" @input="setConfigvModel('compiling.sources', $event, index)">
                                </div>
                              </div>
                            </div>
                            <div v-if="ifConfigPropertyExists('compiling.compiler')">
                              <label class="mr-2">compiling.compiler*:</label>
                              <input type="text" class="form-control" v-model="computationTemplate.configuration['compiling.compiler']">
                            </div>
                            <div v-if="ifConfigPropertyExists('compiling.flags')">
                              <label class="mr-2">compiling.flags*(Must for C, C++, optional for Java):</label>
                              <input type="text" class="form-control" v-model="computationTemplate.configuration['compiling.flags']">
                            </div>
                            <div v-if="ifConfigPropertyExists('checking.sources')">
                              <label class="mr-2">checking.sources*(must if checking should be performed):</label>
                              <div class="ml-4 mr-4"> -->
                                <!-- set how many values the config should have -->
                                <!-- <label for="'checking.sources-sb-options'">How many checking.sources should there be?</label>
                                <b-form-spinbutton :id="'checking.sources-sb-options'" placeholder="1" :value="getNumberofConfigFields('checking.sources')" class="mb-2" @change="setNumberOfConfigFields('checking.sources', $event)"></b-form-spinbutton> -->
                                <!-- input config-values -->
                                <!-- <div class="border mb-2 p-2" v-for="(field, index) in getNumberofConfigFields('checking.sources')" :key="'checking.sources-' + index"> -->
                                  <!-- value -->
                                  <!-- <label>Set values:</label>
                                  <input type="text" class="form-control" :value="getConfigvModel('checking.sources', index)" @input="setConfigvModel('checking.sources', $event, index)">
                                </div>
                              </div>
                            </div> -->
                            <!-- <div v-if="ifConfigPropertyExists('linking.flags')">
                              <label class="mr-2">linking.flags*:</label>
                              <input type="text" class="form-control" v-model="computationTemplate.configuration['linking.flags']">
                            </div>
                            <div v-if="ifConfigPropertyExists('running.stdinFilename')">
                              <label class="mr-2">running.stdinFilename*:</label>
                              <input type="text" class="form-control" v-model="computationTemplate.configuration['running.stdinFilename']">
                            </div>
                            <div v-if="ifConfigPropertyExists('running.executable')">
                              <label class="mr-2">running.executable*:</label>
                              <input type="text" class="form-control" v-model="computationTemplate.configuration['running.executable']">
                            </div>
                            <div v-if="ifConfigPropertyExists('checking.allowedCalls')">
                              <label class="mr-2">checking.allowedCalls(must if checking should be performed):</label>
                              <input type="text" class="form-control" v-model="computationTemplate.configuration['checking.allowedCalls']">
                            </div>
                            <div v-if="ifConfigPropertyExists('checking.forbiddenCalls')">
                              <label class="mr-2">checking.forbiddenCalls(must if checking should be performed):</label>
                              <input type="text" class="form-control" v-model="computationTemplate.configuration['checking.forbiddenCalls']">
                            </div>
                            <div v-if="ifConfigPropertyExists('running.flags')">
                              <label class="mr-2">running.flags:</label>
                              <input type="text" class="form-control" v-model="computationTemplate.configuration['running.flags']">
                            </div>
                            <div v-if="ifConfigPropertyExists('running.mainClass')">
                              <label class="mr-2">running.mainClass:</label>
                              <input type="text" class="form-control" v-model="computationTemplate.configuration['running.mainClass']">
                            </div> -->
                          </div>
                        </div>

                        <!-- Metadata -->
                        <div> <!-- v-if="computationTemplate.metadata"> -->
                          <label class="mr-2" for="computationTemplate.metadata">metadata: </label>
                          <div class="ml-4 mr-4">
                            <!-- display name -->
                            <div>
                              <label class="mr-2">displayName:</label>
                              <div class="d-flex form-group"> 
                                <div class="flex-grow-1">
                                  <input type="text" class="form-control" :value="getvModelTemplateMetadata('displayName')" @input="setvModelTemplateMetadata('displayName', $event)">
                                </div>
                                <!-- tooltip -->
                                <div class="tooltip-icon pl-2">
                                    <b-icon-info-circle v-tooltip.top-center="'Name of Computation Template shown in Frontend.'"></b-icon-info-circle>
                                </div>
                              </div>
                            </div>
                            <!-- description -->
                            <div>
                              <label class="mr-2">description:</label>
                              <div class="d-flex form-group"> 
                                <div class="flex-grow-1">
                                  <input type="text" class="form-control" :value="getvModelTemplateMetadata('description')" @input="setvModelTemplateMetadata('description', $event)">
                                </div>
                                <!-- tooltip -->
                                <div class="tooltip-icon pl-2">
                                    <b-icon-info-circle v-tooltip.top-center="'Short description of Computation Template shown in Frontend.'"></b-icon-info-circle>
                                </div>
                              </div>
                            </div>
                          </div>

                          <!-- output -->
                          <div id="define-output">
                            <label class="mr-2">output: </label>
                            <div class="ml-4 mr-4">
                              <!-- viewer -->
                              <div>
                                <label class="mr-2" for="computationTemplate.metadata.output.viewer">viewer: </label>
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
                                      <b-icon-info-circle v-tooltip.top-center="'When given, specific file extension, like .vtu are interpreted by the frontend for displaying results. Otherwise files are only downloadable.'"></b-icon-info-circle>
                                  </div>
                                </div>
                              </div>
                              <!-- csv -->
                              <div>
                                <div class="d-flex"> 
                                  <div class="flex-grow-1">
                                    <label class="mr-2" for="computationTemplate.metadata.output.csv">csv: </label>
                                  </div>
                                  <!-- tooltip -->
                                  <div class="tooltip-icon pl-2">
                                      <b-icon-info-circle v-tooltip.top-center="'Use this object to define connected csv-files, if there are intermediate results.'"></b-icon-info-circle>
                                  </div>
                                </div>
                                <b-button class="btn mb-3" @click="addCsvConfig()" v-tooltip.top-center="'Add Config for Group of CSV-Files'">
                                  <b-icon icon="plus" aria-hidden="true"></b-icon>
                                </b-button>
                                <div class="ml-4 mr-4 mb-2" v-if="(typeof computationTemplate.metadata != 'undefined') && (typeof computationTemplate.metadata.output != 'undefined') && (typeof computationTemplate.metadata.output.csv != 'undefined')">
                                  <div class="border p-2 mb-2" v-for="(csvConfig, index) in computationTemplate.metadata.output.csv" :key="'csvConfig-'+index">
                                    <!-- basename -->
                                    <div>
                                      <div class="d-flex"> 
                                        <div class="flex-grow-1">
                                          <label class="mr-2" :for="csvConfig.basename">basename: </label>
                                        </div>
                                        <!-- Delete CSV-Config -->
                                        <div class="tooltip-icon pl-2" @click="removeConfig($event, true, csvConfig)">
                                            <b-icon-x-circle v-tooltip.top-center="'Delete CSV-Config.'"></b-icon-x-circle>
                                        </div>
                                      </div>
                                      <div class="d-flex form-group"> 
                                        <div class="flex-grow-1">
                                          <input type="text" class="form-control" id="csvConfig.basename" v-model="csvConfig.basename">
                                        </div>
                                        <!-- tooltip -->
                                        <div class="tooltip-icon pl-2">
                                            <b-icon-info-circle v-tooltip.top-center="'Basename defines connected files: Path of file begins with basename.'"></b-icon-info-circle>
                                        </div>
                                      </div>
                                    </div>
                                    <!-- xlabel -->
                                    <div>
                                      <label class="mr-2" for="csvConfig.xlabel">xlabel: </label>
                                      <div class="ml-4 mr-4">
                                        <!-- key -->
                                        <label class="mr-2" for="csvConfig.xlabel.key">key: </label>
                                        <div class="d-flex form-group"> 
                                          <div class="flex-grow-1">
                                            <input type="text" class="form-control" id="csvConfig.xlabel.key" v-model="csvConfig.xlabel.key">
                                          </div>
                                          <!-- tooltip -->
                                          <div class="tooltip-icon pl-2">
                                              <b-icon-info-circle v-tooltip.top-center="'Key for x-axis given in csv header.'"></b-icon-info-circle>
                                          </div>
                                        </div>
                                        <!-- label -->
                                        <label class="mr-2" for="csvConfig.xlabel.label">label: </label>
                                        <div class="d-flex form-group"> 
                                          <div class="flex-grow-1">
                                            <input type="text" class="form-control" id="csvConfig.xlabel.label" v-model="csvConfig.xlabel.label">
                                          </div>
                                          <!-- tooltip -->
                                          <div class="tooltip-icon pl-2">
                                              <b-icon-info-circle v-tooltip.top-center="'X-axis label for diagram.'"></b-icon-info-circle>
                                          </div>
                                        </div>
                                        <!-- factor -->
                                        <label class="mr-2" for="csvConfig.xlabel.factor">factor: </label>
                                        <div class="d-flex form-group"> 
                                          <div class="flex-grow-1">
                                            <input type="number" class="form-control" id="csvConfig.xlabel.factor" v-model.number="csvConfig.xlabel.factor">
                                          </div>
                                          <!-- tooltip -->
                                          <div class="tooltip-icon pl-2">
                                              <b-icon-info-circle v-tooltip.top-center="'Multiply x-values with this factor.'"></b-icon-info-circle>
                                          </div>
                                        </div>
                                        <!-- format -->
                                        <label class="mr-2" for="csvConfig.xlabel.format">format: </label>
                                        <div class="d-flex form-group"> 
                                          <div class="flex-grow-1">
                                            <input type="text" class="form-control" id="csvConfig.xlabel.format" v-model="csvConfig.xlabel.format">
                                          </div>
                                          <!-- tooltip -->
                                          <div class="tooltip-icon pl-2">
                                              <b-icon-info-circle v-tooltip.top-center="'Format the x-axis values according to format string. For information on the avaliable formating take a look at the info given by Plotly (https://github.com/d3/d3-format/blob/main/README.md#locale_format); Example: To format a number to have two decimals, use 0.2f'"></b-icon-info-circle>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <!-- plots -->
                                    <div class="d-flex"> 
                                      <div class="flex-grow-1">
                                        <label class="mr-2" for="csvConfig.plots">plots: </label>
                                      </div>
                                      <!-- tooltip -->
                                      <div class="tooltip-icon pl-2">
                                          <b-icon-info-circle v-tooltip.top-center="'Define datasets: Provide y-axis labels for y-key given in csv. For each dataset one diagram is rendered in the result.'"></b-icon-info-circle>
                                      </div>
                                    </div>
                                    <b-button class="btn mb-3" @click="addCsvPlot(index)" v-tooltip.top-center="'Add Y-Axis to generate Plot from CSV-Files'">
                                      <b-icon icon="plus" aria-hidden="true"></b-icon>
                                    </b-button>
                                    <div class="ml-4 mr-4">
                                      <div class="border mb-2 p-2" v-for="(csvPlot, plotIndex) in csvConfig.plots" :key="csvConfig.identifier + '-plot-' + plotIndex">
                                        <!-- key -->
                                        <div class="d-flex form-group"> 
                                          <div class="flex-grow-1">
                                            <label class="mr-2" for="csvPlot.key">key: </label>
                                          </div>
                                          <!-- Delete CSV-Config -->
                                          <div class="tooltip-icon pl-2" @click="removePlot($event, csvConfig, csvPlot)">
                                              <b-icon-x-circle v-tooltip.top-center="'Delete CSV-Config.'"></b-icon-x-circle>
                                          </div>
                                        </div>
                                        <div class="d-flex form-group"> 
                                          <div class="flex-grow-1">
                                            <input type="text" class="form-control" id="csvPlot.key" v-model="csvPlot.key">
                                          </div>
                                          <!-- tooltip -->
                                          <div class="tooltip-icon pl-2">
                                              <b-icon-info-circle v-tooltip.top-center="'Key for y-axis given in csv header.'"></b-icon-info-circle>
                                          </div>
                                        </div>
                                        <!-- label -->
                                        <label class="mr-2" for="csvPlot.label">label: </label>
                                        <div class="d-flex form-group"> 
                                          <div class="flex-grow-1">
                                            <input type="text" class="form-control" id="csvPlot.label" v-model="csvPlot.label">
                                          </div>
                                          <!-- tooltip -->
                                          <div class="tooltip-icon pl-2">
                                              <b-icon-info-circle v-tooltip.top-center="'Y-axis label for diagram.'"></b-icon-info-circle>
                                          </div>
                                        </div>
                                        <!-- factor -->
                                        <label class="mr-2" for="csvPlot.factor">factor: </label>
                                        <div class="d-flex form-group"> 
                                          <div class="flex-grow-1">
                                            <input type="number" class="form-control" id="csvPlot.factor" v-model.number="csvPlot.factor">
                                          </div>
                                          <!-- tooltip -->
                                          <div class="tooltip-icon pl-2">
                                              <b-icon-info-circle v-tooltip.top-center="'Multiply y-values with this factor.'"></b-icon-info-circle>
                                          </div>
                                        </div>
                                        <!-- format -->
                                        <label class="mr-2" for="csvPlot.format">format: </label>
                                        <div class="d-flex form-group"> 
                                          <div class="flex-grow-1">
                                            <input type="text" class="form-control" id="csvPlot.format" v-model="csvPlot.format">
                                          </div>
                                          <!-- tooltip -->
                                          <div class="tooltip-icon pl-2">
                                              <b-icon-info-circle v-tooltip.top-center="'Format the y-axis values according to format string. For information on the avaliable formating take a look at the info given by Plotly (https://github.com/d3/d3-format/blob/main/README.md#locale_format); Example: To format a number to have two decimals, use 0.2f'"></b-icon-info-circle>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <!-- vtk -->
                              <div>
                                <div class="d-flex"> 
                                  <div class="flex-grow-1">
                                    <label class="mr-2" for="computationTemplate.metadata.output.vtk">vtk: </label>
                                  </div>
                                  <!-- tooltip -->
                                  <div class="tooltip-icon pl-2">
                                      <b-icon-info-circle v-tooltip.top-center="'Details for displaying vtk-files.'"></b-icon-info-circle>
                                  </div>
                                </div>
                                <b-button class="btn mb-3" @click="addVtkConfig()" v-tooltip.top-center="'Add Config for Group of VTK-Files'">
                                  <b-icon icon="plus" aria-hidden="true"></b-icon>
                                </b-button>
                                <div class="ml-4 mr-4" v-if="(typeof computationTemplate.metadata != 'undefined') && (typeof computationTemplate.metadata.output != 'undefined') && (typeof computationTemplate.metadata.output.csv != 'undefined')">
                                  <div class="border mb-2 p-2" v-for="vtkConfig in computationTemplate.metadata.output.vtk" :key="vtkConfig.identifier">
                                    <!-- basename -->
                                    <div>
                                      <div class="d-flex"> 
                                        <div class="flex-grow-1">
                                          <label class="mr-2" for="vtkConfig.basename">basename: </label>
                                        </div>
                                        <!-- Delete VTK-Config -->
                                        <div class="tooltip-icon pl-2" @click="removeConfig($event, false, vtkConfig)">
                                            <b-icon-x-circle v-tooltip.top-center="'Delete VTK-Config.'"></b-icon-x-circle>
                                        </div>
                                      </div>
                                      <div class="d-flex"> 
                                        <div class="flex-grow-1">
                                          <input type="text" class="form-control" id="vtkConfig.basename" v-model="vtkConfig.basename">
                                        </div>
                                        <!-- tooltip -->
                                        <div class="tooltip-icon pl-2">
                                            <b-icon-info-circle v-tooltip.top-center="'Basename defines connected files: Path of file begins with basename.'"></b-icon-info-circle>
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
                          <label class="mr-2" for="selectedFile.path">path: </label>
                          <div class="d-flex form-group"> 
                            <div class="flex-grow-1">
                              <input type="text" class="form-control" id="selectedFile.path" v-model="vModelFilePath">
                            </div>
                            <!-- tooltip -->
                            <div class="tooltip-icon pl-2">
                              <b-icon-info-circle v-tooltip.top-center="'Absolute path to file. It is not allowed to start with /.'"></b-icon-info-circle>
                            </div>
                          </div>
                        </div>
                        <!-- metadata -->
                        <div>
                          <label class="mr-2">metadata: </label>
                          <div class="ml-4 mr-4">
                            <div> <!--v-if="selectedFile.metadata.syntaxHighlighting">-->
                              <label class="mr-2">syntaxHighlighting:</label>
                              <div class="d-flex form-group"> 
                                <div class="flex-grow-1">
                                  <div class="dropdown">
                                    <select
                                      class="form-control"
                                      v-model="vModelFileMetadataSyntaxHighlighting"
                                    >
                                      <option>text</option>
                                      <option>ini</option>
                                      <option>c_cpp</option>
                                      <option>matlab</option>
                                      <option>java</option>
                                      <option></option>
                                    </select>
                                  </div>
                                </div>
                                <!-- tooltip -->
                                <div class="tooltip-icon pl-2">
                                  <b-icon-info-circle v-tooltip.top-center="'Mode of the ace editor. List can be found on github (https://github.com/ajaxorg/ace/tree/master/lib/ace/mode). Examples: ini, c_cpp, matlab, java.'"></b-icon-info-circle>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Part Data -->
                      <div v-else-if="showPart">
                        <!-- access -->
                        <div>
                          <label class="mr-2" for="selectedPart.access">access: </label>
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
                              <b-icon-info-circle v-tooltip.top-center="'Defines the access level of this part for the user.'"></b-icon-info-circle>
                            </div>
                          </div>
                        </div>
                        <!-- metadata -->
                        <div>
                          <label class="mr-2">metadata: </label>
                          <div class="ml-4 mr-4">
                            <label class="mr-2">name:</label>
                            <div class="d-flex form-group"> 
                              <div class="flex-grow-1">
                                <input type="text" class="form-control" id="selectedPart.metadata.name" v-model="vModelPartMetadataName">
                              </div>
                              <!-- tooltip -->
                              <div class="tooltip-icon pl-2">
                                <b-icon-info-circle v-tooltip.top-center="'Additional description of this part to be shown in the Frontend.'"></b-icon-info-circle>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Show Parameter Preferences -->
                      <div v-else-if="showParameter">
                        
                        <!-- identifier -->
                        <div>
                          <label class="mr-2" for="selectedParameter.identifier">identifier: </label>
                          <div class="d-flex form-group"> 
                            <div class="flex-grow-1">
                              <input type="text" class="form-control" id="selectedParameter.identifier" v-model="selectedParameter.identifier">
                            </div>
                            <!-- tooltip -->
                            <div class="tooltip-icon pl-2">
                              <b-icon-info-circle v-tooltip.top-center="'Unique id for this parameter. This id must be valid mustach template variable. Example: __BINARY__.'"></b-icon-info-circle>
                            </div>
                          </div>
                        </div>
                        <!-- name -->
                        <div>
                          <label class="mr-2" for="selectedParameter.metadata.name">name: </label>
                          <div class="d-flex form-group"> 
                            <div class="flex-grow-1">
                              <input type="text" class="form-control" id="selectedParameter.metadata.name" v-model="selectedParameter.metadata.name">
                            </div>
                            <!-- tooltip -->
                            <div class="tooltip-icon pl-2">
                              <b-icon-info-circle v-tooltip.top-center="'Label for the parameter to be shown in Frontend.'"></b-icon-info-circle>
                            </div>
                          </div>
                        </div>
                        <!-- description -->
                        <div>
                          <label class="mr-2" for="selectedParameter.metadata.description">description: </label>
                          <div class="d-flex form-group"> 
                            <div class="flex-grow-1">
                              <input type="text" class="form-control" id="selectedParameter.metadata.description" v-model="selectedParameter.metadata.description">
                            </div>
                            <!-- tooltip -->
                            <div class="tooltip-icon pl-2">
                              <b-icon-info-circle v-tooltip.top-center="'Description of the parameter. Will be shown in the Frontend as tooltip (just like this one you are hovering over).'"></b-icon-info-circle>
                            </div>
                          </div>
                        </div>

                        <!-- input_field -->
                        <div v-if="selectedParameter.metadata.guiType=='input_field'">
                          <!-- type -->
                          <div>
                            <label class="mr-2" for="selectedParameter.metadata.type">type: </label>
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
                              <label class="mr-2" for="selectedParameter.default">default value: </label>
                              <input v-if="selectedParameter.metadata.type == 'text'" type="text" class="form-control" id="selectedParameter.default" v-model="inputvModel">
                              <input v-else type="number" class="form-control" id="selectedParameter.default" v-model.number="selectedParameter.default[0]">
                            </div>
                            <!-- type: number - min, max, step -->
                            <div v-if="selectedParameter.metadata.type == 'number'">
                              <div>
                                <label class="mr-2" for="selectedParameter.min">min value: </label>
                                <input type="number" class="form-control" id="selectedParameter.min" v-model.number="selectedParameter.min">
                              </div>
                              <div>
                                <label class="mr-2" for="selectedParameter.max">max value: </label>
                                <input type="number" class="form-control" id="selectedParameter.max" v-model.number="selectedParameter.max">
                              </div>
                              <div>
                                <label class="mr-2" for="selectedParameter.step">step size: </label>
                                <input type="number" class="form-control" id="selectedParameter.step" v-model.number="selectedParameter.step">
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- slider -->
                        <div v-if="selectedParameter.metadata.guiType=='slider'">
                          <!-- vertical -->
                          <label class="mr-2" for="selectedParameter.metadata.vertical">vertical: </label>
                          <div class="radiobutton form-check custom-control custom-radio">
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
                          <div>
                            <label class="mr-2" for="selectedParameter.default">value(s): </label>
                            <div class="ml-4 mr-4">
                              <!-- set how many values the slider should have -->
                              <label for="selectedParameter.identifier + 'sb-default'">How many values should the slider have?</label>
                              <b-form-spinbutton :id="selectedParameter.identifier + 'sb-default'" placeholder="1" :value="getNumberofFields(selectedParameter.identifier)" class="mb-2" @change="setNumberOfFields(selectedParameter.identifier, $event)"></b-form-spinbutton>
                              <!-- input slider default-values -->
                              <div class="border mb-2 p-2" v-for="(field, index) in getNumberofFields(selectedParameter.identifier)" :key="selectedParameter.identifier + '-' + index">
                                <label>Set default values for slider-value:</label>
                                <input type="number" class="form-control" id="selectedParameter.default" :value="getSlidervModel(index)" @input="setSlidervModel($event, index)">
                              </div>
                            </div>
                          </div>
                          <!-- min -->
                          <div>
                            <label class="mr-2" for="selectedParameter.min">min value: </label>
                            <input type="number" class="form-control" id="selectedParameter.min" v-model="selectedParameter.min">
                          </div>
                          <!-- max -->
                          <div>
                            <label class="mr-2" for="selectedParameter.max">max value: </label>
                            <input type="number" class="form-control" id="selectedParameter.max" v-model="selectedParameter.max">
                          </div>
                          <!-- step -->
                          <div>
                            <label class="mr-2" for="selectedParameter.step">step size: </label>
                            <input type="number" class="form-control" id="selectedParameter.step" v-model="selectedParameter.step">
                          </div>
                        </div>

                        <!-- editor -->
                        <div class="mb-2" v-if="selectedParameter.metadata.guiType=='editor'">
                          <div>
                            <label class="mr-2" for="selectedParameter.default">value: </label>
                            <ace-editor-component 
                              :isParameter="false" 
                              :isMustache="false"
                              :readonly="false"
                              :item='{
                                "identifier" : "Editor" + selectedParameter.identifier,
                                "content" : selectedParameter.default[0]
                              }'
                              v-on:update:item="setEditorValue($event)"
                            ></ace-editor-component>
                          </div>
                        </div>

                        <!-- checkbox, dropdown, toggle, radio -->
                        <div v-if="selectedParameter.metadata.guiType=='checkbox' || selectedParameter.metadata.guiType=='dropdown' || selectedParameter.metadata.guiType=='toggle'|| selectedParameter.metadata.guiType=='radio'">
                          <!-- options -->
                          <div>
                            <label class="mr-2" for="selectedParameter.options">value(s): </label>
                            <div class="ml-4 mr-4">
                              <!-- set how many values the checkbox should have -->
                              <label for="selectedParameter.identifier + 'sb-options'">How many values should the parameter have?</label>
                              <b-form-spinbutton :id="selectedParameter.identifier + 'sb-options'" placeholder="1" :value="getNumberofFields(selectedParameter.identifier)" class="mb-2" @change="setNumberOfFields(selectedParameter.identifier, $event)"></b-form-spinbutton>
                              
                              <!-- input option-values -->
                              <div class="border mb-2 p-2" v-for="(field, index) in getNumberofFields(selectedParameter.identifier)" :key="selectedParameter.identifier + '-' + index">
                                <!-- value -->
                                <label>Set option values:</label>
                                <input type="text" class="form-control" id="field.value" :value="getFixedParamvModel(index)" @input="setFixedParamvModel($event, index, 'value')">
                                <!-- text -->
                                <label>Set option text for value:</label>
                                <input type="text" class="form-control" id="field.text" :value="getFixedParamvModel(index, 'text')" @input="setFixedParamvModel($event, index, 'text')">
                                <!-- selected - radio -->
                                <label class="mr-2">Is selected? </label>
                                <div v-if="selectedParameter.metadata.guiType=='radio'" class="radiobutton form-check custom-control custom-radio">
                                  <div>
                                    <input class="form-check-input custom-control-input" :id="selectedParameter.identifier+'-'+index+ '-'+'selected'" type="radio" :name="selectedParameter.identifier+'-'+index+'-'+'checkbox-selected'" :value=true @input="setFixedParamvModel($event, index, 'selected')" :checked="getRadioSelected(index) ? true : false" />
                                    <label class="form-check-label custom-control-label" :for="selectedParameter.identifier+'-'+index+ '-'+'selected'">selected</label><br>
                                  </div>
                                  <div>
                                    <input class="form-check-input custom-control-input" :id="selectedParameter.identifier+'-'+index+ '-'+'unselected'" type="radio" :name="selectedParameter.identifier+'-'+index+'-'+'checkbox-selected'" :value=false @input="setFixedParamvModel($event, index, 'selected')" :checked="getRadioSelected(index) ? false : true" />
                                    <label class="form-check-label custom-control-label" :for="selectedParameter.identifier+'-'+index+ '-'+'unselected'">not selected</label><br>
                                  </div>
                                </div>
                                <!-- selected checkbox, dropdown, toggle -->
                                <div v-else class="radiobutton form-check custom-control custom-radio">
                                  <div>
                                    <input class="form-check-input custom-control-input" :id="selectedParameter.identifier+'-'+index+ '-'+'selected'" type="radio" :name="selectedParameter.identifier+'-'+index+'-'+'checkbox-selected'" :value=true @input="setFixedParamvModel($event, index, 'selected')" :checked="getFixedParamvModel(index, 'selected')? true : false"/>
                                    <label class="form-check-label custom-control-label" :for="selectedParameter.identifier+'-'+index+ '-'+'selected'">selected</label><br>
                                  </div>
                                  <div>
                                    <input class="form-check-input custom-control-input" :id="selectedParameter.identifier+'-'+index+ '-'+'unselected'" type="radio" :name="selectedParameter.identifier+'-'+index+'-'+'checkbox-selected'" :value=false @input="setFixedParamvModel($event, index, 'selected')" :checked="getFixedParamvModel(index,'selected')? false : true" />
                                    <label class="form-check-label custom-control-label" :for="selectedParameter.identifier+'-'+index+ '-'+'unselected'">not selected</label><br>
                                  </div>
                                </div>
                                <!-- disabled -->
                                <label class="mr-2">Is disabled? </label>
                                <div class="radiobutton form-check custom-control custom-radio">
                                  <div>
                                    <input class="form-check-input custom-control-input" :id="selectedParameter.identifier+'-'+index+'-'+'disabled'" type="radio" :name="selectedParameter.identifier+'-'+index+'-'+'checkbox-disabled'" :value=true @input="setFixedParamvModel($event, index, 'disabled')" :checked="getFixedParamvModel(index,'disabled')? true : false"/>
                                    <label class="form-check-label custom-control-label" :for="selectedParameter.identifier+'-'+index+'-'+'disabled'">disabled</label><br>
                                  </div>
                                  <div>
                                    <input class="form-check-input custom-control-input" :id="selectedParameter.identifier+'-'+index+'-'+'enabled'" type="radio" :name="selectedParameter.identifier+'-'+index+'-'+'checkbox-disabled'" :value=false @input="setFixedParamvModel($event, index, 'disabled')" :checked="getFixedParamvModel(index,'disabled')? false : true" />
                                    <label class="form-check-label custom-control-label" :for="selectedParameter.identifier+'-'+index+'-'+'enabled'">enabled</label><br>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                          
                        <!-- Validation -->
                        <div>
                          <label class="mr-2" for="selectedParameter.validation">validation: </label>
                          
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
                                <b-icon-info-circle v-tooltip.top-center="'Set if and how the parameter should be validated.'"></b-icon-info-circle>
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
                                <b-icon-info-circle v-tooltip.top-center="'Set if and how the parameter should be validated.'"></b-icon-info-circle>
                              </div>
                            </div>
                          </div>
                      </div>
                    </div>
                </div>
              </b-tab>
            </b-tabs>
          </b-card>
        </b-collapse>
        </div>
        <div class="validation-div pl-2 pr-2 pb-2">
          <b-button @click="validateJson">Validate</b-button>
          <div class="validation-result-div">
            
            <b-card v-if="validationRunning" class="p-2">
              <b-skeleton animation="wave" width="85%"></b-skeleton>
              <b-skeleton animation="wave" width="55%"></b-skeleton>
              <b-skeleton animation="wave" width="70%"></b-skeleton>
            </b-card>
            <b-card :class="classValidity" class="p-2" v-if="!validationRunning && (validationArgsResult != null || validationPartParameterResult != null || validationResult != null)">
              <pre>{{validationResult}}</pre>
              <pre v-if="validationPartParameterResult != null">{{validationPartParameterResult}}</pre>
              <pre v-if="validationArgsResult != null">{{validationArgsResult}}</pre>
            </b-card>

          </div>
        </div>
        <div class="p-2" v-if="isLoggedIn">
          <b-button 
            variant="success"
            @click="runTemplate"
            :disabled="validateJson? false : true">
            Execute Template
            <b-icon icon="play" aria-hidden="true"></b-icon>
          </b-button>
          <div id="iframe-div"></div>
        </div>
      </div>
    </div>
    <v-tour name="myTour" :steps="steps" :options="{ highlight: true }"></v-tour>
  </div>
  </div>
</template>

<script>
import { Drag, Drop, DropList } from "vue-easy-dnd";

// import Ace
import AceEditorComponent from "../../components/EditorComponent-Ace.vue"

import base64url from "base64url";

// for validation
// var Validator = require('jsonschema').Validator;
import ctSchema from './json-schema/computation-template-container.json';
import parameterSchema from './json-schema/parameters.json';
import Ajv from "ajv"

// import $ from 'jquery';

export default {
  name: "app",
  components: {
    Drag,
    Drop,
    DropList,
    AceEditorComponent
  },
  data() {
    return {
      componentsFiles: ["file", "commandline arguments"],
      componentsFile: ["part"], 
      componentsPart: ["part"],
      componentsCommand: [],
      availableGuiTypes : ["input_field", "editor", "slider", "checkbox", "radio", "dropdown", "toggle"],
      preferences: true,
      selectedParameter: {},
      selectedPart: {},
      selectedFile: {},
      showTemplate: true,
      showFile: false,
      showPart: false, 
      showParameter: false,
      showCommands: false,
      valueNumbers: new Map(),
      schema: ctSchema,
      paramSchema: parameterSchema,
      validationResult: null,
      validationPartParameterResult: null,
      validationArgsResult: null,
      steps: [
        {
          target: '#start-guide', 
          content: `Tour the <strong>ViPLab Computation Template Generator</strong>!`
        },
        {
          target: '#run-configuration',
          content: 'Choose the Environment! How is your Application run? After that, Configure other parameters for the execution.'
        },
        {
          target: '#component-selection',
          content: 'Add components, like files, parts of files and gui-elements to your template by dragging and dropping them to the middle-section.'
        },
        {
          target: '#drag-components-here',
          content: 'By clicking on the different components in the middle-section, you can modify the configuration of each component on the right.',
          params: {
            placement: 'top'
          }
        },
        {
          target: '#define-output',
          content: 'Last, define, what the output should look like.',
          params: {
            placement: 'top'
          }
        }
      ],
      validationRunning: false,
      classValidity: ""
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
    computationTemplate: {
      get () {
        this.$forceUpdate()
        return this.$store.state.generatedComputationTemplate;
      },
      set (newValue) {
        this.$store.commit("updateGeneratedComputationTemplate", newValue)
      }
    },
    thereIsTemplate() {
      for (var file in this.computationTemplate.files) {
        for (var part in this.computationTemplate.files[file].parts) {
          var currentPart = this.computationTemplate.files[file].parts[part]
          if (currentPart.access === "template") {
            return true;
          }
        }
      }
      return false;
    },
    inputvModel: {
      get: function () {
        if (this.selectedParameter.default.length > 0) {
          return base64url.decode(this.selectedParameter.default[0]);
        } 
        return "";
      },
      set: function (val) {
        if (typeof this.selectedParameter !== "undefined") {
          this.$set(this.selectedParameter.default , 0, base64url(val));
          this.$forceUpdate();
          return this.inputvModel;
        }
      }
    },
    vModelOutputViewer: {
      get: function () {
        if (typeof this.computationTemplate.metadata != "undefined") {
          if (typeof this.computationTemplate.metadata.output != "undefined") {
            if (typeof this.computationTemplate.metadata.output.viewer != "undefined") {
              return this.computationTemplate.metadata.output.viewer;
            } 
          }
        }
        return [];
      },
      set: function (val) {
        // create objects (metadata, output, viewer) if not set yet
        if (typeof this.computationTemplate.metadata == "undefined") { 
          this.$set(this.computationTemplate, "metadata", { });
        }
        if (typeof this.computationTemplate.metadata.output == "undefined") { 
          this.$set(this.computationTemplate.metadata, "output", { });
        }
        if (typeof this.computationTemplate.metadata.output.viewer == "undefined") { 
          this.$set(this.computationTemplate.metadata.output, "viewer", []);
        }

        // set viewer if the user wants to have special output formats
        if (val.length > 1 || (val.length === 1 && val[0] !== "")) {
          if (typeof this.computationTemplate.metadata.output.viewer !== "undefined") {
            this.$set(this.computationTemplate.metadata.output, "viewer", val);
          } 
        // delete viewer-object if user doesn't want special formats
        } else {
          this.$delete(this.computationTemplate.metadata.output, "viewer")
        }
        this.$forceUpdate();
      }
    },
    vModelFilePath: {
      get: function () {
        if (typeof this.selectedFile.path != "undefined") { 
          return this.selectedFile.path;
        }
        return "";
      },
      set: function (val) {
        this.$set(this.selectedFile, "path", val);
        if (val == "") {
          this.$delete(this.selectedFile, "path")
        }
        this.$forceUpdate();
      }
    },
    vModelFileMetadataSyntaxHighlighting: {
      get: function () {
        if (typeof this.selectedFile.metadata != "undefined") {
          if (typeof this.selectedFile.metadata.syntaxHighlighting != "undefined") {
            return this.selectedFile.metadata.syntaxHighlighting;
          } 
        }
        return "";
      },
      set: function (val) {
        // if file-metadata object does not exist, create it
        if (typeof this.selectedFile.metadata == "undefined") { 
          this.$set(this.selectedFile, "metadata", { });
        }
        if (typeof this.selectedFile.metadata.syntaxHighlighting !== "undefined") {
          this.$set(this.selectedFile.metadata, "syntaxHighlighting", val);
        } else {
          this.$set(this.selectedFile, "metadata", { "syntaxHighlighting": val});
        }

        // if val is empty, remove object from ct
        if (val == "") {
          this.$delete(this.selectedFile, "metadata")
        }

        this.$forceUpdate();
      }
    },
    vModelPartAccess: {
      get: function () {
        if (typeof this.selectedPart.access !== "undefined") {
          return this.selectedPart.access;
        } else {
          this.$set(this.selectedPart, "access", "")
        }
        return "";
      },
      set: function (val) {
        if (typeof this.selectedPart.access !== "undefined") {
          this.$set(this.selectedPart, "access", val);
        }

        this.$forceUpdate();
        return this.selectedPart.access;
      }
    }, 
    vModelPartMetadataName: {
      get: function () {
        if (typeof this.selectedPart.metadata !== "undefined") {
          if (typeof this.selectedPart.metadata.name !== "undefined") {
            return this.selectedPart.metadata.name;
          }
        }
        return "";
      },
      set: function (val) {
        if (typeof this.selectedPart.metadata !== "undefined") {
          this.$set(this.selectedPart.metadata, "name", "")
        } else {
          this.$set(this.selectedPart, "metadata", {"name": ""})
        }

        if (typeof this.selectedPart.metadata.name !== "undefined") {
          this.$set(this.selectedPart.metadata, "name", val);
        }

        // if val is empty, remove object from ct
        if (val == "") {
          this.$delete(this.selectedPart, "metadata")
        }

        this.$forceUpdate();
      }
    }
  }, 
  watch: {
    computationTemplate: {
      handler: function () {
        // reset iFrame, if computation task is modified
        let iFrameDiv = document.getElementById("iframe-div")
        iFrameDiv.innerHTML = ""

        // check if properties are empty and delete
        for (const [key, value] of Object.entries(this.computationTemplate.configuration)) {
          if (value == "") {
            this.$delete(this.computationTemplate.configuration, key)
          }
        }

        // TODO: check if metadata.output is empty and delete
        // if (typeof this.computationTemplate.metadata.output !== "undefined") {
        //   if ($.isEmptyObject(this.computationTemplate.metadata.output)) {
        //     console.log("watch - output empty")
        //     this.$delete(this.computationTemplate.metadata, "output")
        //     this.$forceUpdate();
        //   }
        // }

        // update generated CT in Vuex-Store
        this.$store.commit("updateGeneratedComputationTemplate", this.computationTemplate)

        // reset validation as is is no longer up-to-date
        this.validationResult = null;
        this.validationPartParameterResult = null;
        this.validationArgsResult = null;
        this.validationRunning = false; 
      },
      deep: true
    },
  },
  methods: {
    // Make the function wait until the connection is made...
    waitForSocketConnection: function(context, socket, callback) {
      setTimeout(
        function () {
          if (socket.readyState === 1) {
            //console.log('Connection is made')
            if (callback != null) {
              callback()
            }
          } else {
            //console.log('wait for connection...')
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
    paramAccordeon(id) {
      return id + "param";
    },
    contentAccordeon(id) {
      return id + "content";
    },
    onInsert(event, isPart, part) {
      if (isPart) {
        part.parameters.splice(event.index, 0, event.data);
      } else {
        part.parts.splice(event.index, 0, event.data);
      }
    },
    onFileDrop(e) {
      if (e.data === "file") {
        let file = {
          "identifier" : this.uuid(), 
          "path" : "", 
          "metadata" : {
            "syntaxHighlighting" : "text"
          },
          "parts": []
        };
        this.computationTemplate.files.push(file);
        // add possibility to add "parts"
        this.componentsCommand = this.componentsPart;
      } else {
        // add commandline parameters
        if (typeof this.computationTemplate.parameters === "undefined") {
          this.computationTemplate.parameters = [];
          // remove possibility to add commandline params
          this.componentsFiles = ["file"];
          this.$forceUpdate();
        }
      }
      
    },
    onPartDrop(e, file) {
      let part = {
        "identifier" : this.uuid(),
        "access" : "modifiable",
        "metadata" : {
          "name" : "New Part",
        },
        "content" : ""
      }
      file.parts.push(part);
    },
    onParameterDrop(e, part = null) {
      let parameter = {};
      if (e.data === "input_field") {
        parameter = { 
          "mode" : "any",
          "identifier" : this.uuid(),
          "metadata" : { 
            "guiType" : e.data,
            "type" : "",
            "name": ""
          },
          "default" : [],
          "validation" : "none",
        };
      } else if (e.data === "slider") {
        parameter = { 
          "mode" : "any",
          "identifier" : this.uuid(),
          "metadata" : { 
            "guiType" : e.data,
            "name": "",
            "vertical" : false
          },
          "default" : [],
          "min": 0,
          "max" : 100,
          "step" : 1,
          "validation" : "none",
        };
      } else if (e.data === "editor") {
        parameter = { 
          "mode" : "any",
          "identifier" : this.uuid(),
          "metadata" : { 
            "guiType" : e.data,
            "name": ""
          },
          "default" : [ "" ],
          "validation" : "none",
        };
      } else if (e.data === "checkbox") {
        parameter = { 
          "mode" : "fixed",
          "identifier" : this.uuid(),
          "metadata" : { 
            "guiType" : e.data,
            "name": ""
          },
          "options" : [],
          "validation" : "none",
        };
      } else if (e.data === "radio") {
        parameter = { 
          "mode" : "fixed",
          "identifier" : this.uuid(),
          "metadata" : { 
            "guiType" : e.data,
            "name": ""
          },
          "options" : [],
          "validation" : "none",
        };
      } else if (e.data === "dropdown") {
        parameter = { 
          "mode" : "fixed",
          "identifier" : this.uuid(),
          "metadata" : { 
            "guiType" : e.data,
            "name": ""
          },
          "options" : [],
          "validation" : "none",
        };
      } else if (e.data === "toggle") {
        parameter = { 
          "mode" : "fixed",
          "identifier" : this.uuid(),
          "metadata" : { 
            "guiType" : e.data,
            "name": ""
          },
          "options" : [],
          "validation" : "none",
        };
      } else {
        parameter = { 
          "identifier" : this.uuid(), 
          "metadata" : { "guiType" : e.data}}
      }
      // if part in set, add parameter to part, else add it to commanline parameters
      if (part !== null) {
        part.parameters.push(parameter);
      } else {
        this.computationTemplate.parameters.push(parameter);
      }
      this.$forceUpdate();
    },
    remove(n) {
      let index = this.numbers.indexOf(n);
      this.numbers.splice(index, 1);
    },
    openWindow: function(event, type, content) {
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
        if (this.computationTemplate.identifier == "") {
          this.computationTemplate.identifier = this.uuid();
        }
        this.showTemplate = true;
      }
    },
    closePreferences: function() {
      this.preferences = false;
      this.selectedParameter = {};
      this.selectedPart = {};
      this.selectedFile = {};
      this.showParameter = false;
      this.showPart = false;
      this.showFile = false;
      this.showTemplate = false;
      this.showCommands = false;
    },
    /** create uuid for the parameters */
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
    addOrRemoveParameters: function(selectedPart) {
      if (selectedPart.access === "template" && (typeof selectedPart.parameters === "undefined")) {
        this.$set(selectedPart, "parameters", []);
      } else if (selectedPart.access !== "template") {
        delete selectedPart.parameters;
      }
    }, 
    /**
     * Delete Parameter from part or command line arguments and rerender
     */
    removeParameter: function(event, item, isInPart = true) {
      event.stopPropagation();
      if (isInPart) {
        for (var file in this.computationTemplate.files) {
          for (var part in this.computationTemplate.files[file].parts) {
            var currentPart = this.computationTemplate.files[file].parts[part];
            for (var parameter in currentPart.parameters) {
              let currentParameter = currentPart.parameters[parameter];
              if (currentParameter.identifier === item.identifier) {
                delete this.computationTemplate.files[file].parts[part].parameters.splice(parameter, 1);
                this.closePreferences();
                this.showTemplate = true;
                this.preferences = true;
              }
            }
          }
        }
      } else {
        for (let argument in this.computationTemplate.parameters) {
          let currentParameter = this.computationTemplate.parameters[argument];
          if (currentParameter.identifier === item.identifier) {
            delete this.computationTemplate.parameters.splice(argument, 1);
            this.closePreferences();
            this.showCommands = true;
            this.preferences = true;
          }
        }
      }
      this.$forceUpdate();
    },
    /**
     * Delete file from json and rerender
     */
    removeFile: function(event, item) {
      event.stopPropagation();
      for (let fileIndex in this.computationTemplate.files) {
        if (this.computationTemplate.files[fileIndex].identifier == item.identifier) {
          delete this.computationTemplate.files.splice(fileIndex, 1);
        }
      }
      this.closePreferences();
      this.preferences = true;
      this.showTemplate = true;
      this.$forceUpdate();
    },
    /**
     * Delete part from json and rerender
     */
    removePart: function(event, item) {
      event.stopPropagation();
      for (let fileIndex in this.computationTemplate.files) {
        for (let partIndex in this.computationTemplate.files[fileIndex].parts) {
          if (this.computationTemplate.files[fileIndex].parts[partIndex].identifier == item.identifier) {
            delete this.computationTemplate.files[fileIndex].parts.splice(partIndex, 1);
          }
        }
      }
      this.closePreferences();
      this.preferences = true;
      this.showTemplate = true;
      this.$forceUpdate();
    },
    /**
     * Delete commandline args from json and rerender
     */
    removeCommandlineArgs: function(event) {
      event.stopPropagation();
      delete this.computationTemplate.parameters;
      this.componentsFiles.push("commandline arguments")
      this.closePreferences();
      this.preferences = true;
      this.showTemplate = true;
      this.$forceUpdate();
    },
    removeConfig: function(event, isCsv, config) {
      event.stopPropagation();
      let configObject;
      if (isCsv) {
        configObject = this.computationTemplate.metadata.output.csv;
      } else {
        configObject = this.computationTemplate.metadata.output.vtk;
      }
      for (let configItem in configObject) {
        if (configObject[configItem].basename == config.basename) {
          this.$delete(configObject, configItem)
          
          // if csv-object is empty, delete it
          if (configObject.length === 0) {
            if (isCsv) {
              this.$delete(this.computationTemplate.metadata.output, "csv")
            } else {
              this.$delete(this.computationTemplate.metadata.output, "vtk")
            }
          }

          this.$forceUpdate();
        }
      }
      this.$forceUpdate();
    },
    removePlot: function(event, csv, plotConf) {
      event.stopPropagation();
      let configObject = this.computationTemplate.metadata.output.csv;
      for (let configItem in configObject) {
        if (configObject[configItem].basename == csv.basename) {
          for (let plot in configObject[configItem].plots) {
            if (configObject[configItem].plots[plot].key == plotConf.key) {
              this.$delete(configObject[configItem].plots, plot)
            }
          }
        }
      }
      this.$forceUpdate();
    },
    /**
     * input_field
     * adjust parts of input-field json, depending on type
     */
    adjustInputType: function(item) {
      let type = item.metadata.type;
      if (type == "text") {
        delete item["min"];
        delete item["max"];
        delete item["step"];
      }
    },
    /**
     * validation - type: pattern
     * adjust whether pattern-object exists in json
     */
    adjustPatternExistence: function(item) {
      let validation = item.validation;
      if (validation != "pattern") {
        delete item["pattern"];
      }
      this.$forceUpdate();
    },
    addConfig: function() {
      let env = this.computationTemplate.environment;
      if (typeof this.computationTemplate.configuration == "undefined") {
        this.$set(this.computationTemplate, "configuration", {});
      }
      if (typeof this.computationTemplate.configuration["running.timelimitInSeconds"] == "undefined") {
        this.$set(this.computationTemplate.configuration, "running.timelimitInSeconds", 0);
      }
      // TODO: Add environments as they are supported by the backend
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
        case "Container":
          if (typeof this.computationTemplate.configuration["running.commandLineArguments"] == "undefined") {
            this.$set(this.computationTemplate.configuration, "running.commandLineArguments", "");
          }
          if (typeof this.computationTemplate.configuration["running.entrypoint"] == "undefined") {
            this.$set(this.computationTemplate.configuration, "running.entrypoint", "");
          }
          if (typeof this.computationTemplate.configuration["running.intermediateFilesPattern"] == "undefined") {
            this.$set(this.computationTemplate.configuration, "running.intermediateFilesPattern", [ "" ]);
          }
          if (typeof this.computationTemplate.configuration["running.userId"] == "undefined") {
            this.$set(this.computationTemplate.configuration, "running.userId", 0);
          }
          if (typeof this.computationTemplate.configuration["resources.image"] == "undefined") {
            this.$set(this.computationTemplate.configuration, "resources.image", "");
          }
          if (typeof this.computationTemplate.configuration["resources.volume"] == "undefined") {
            this.$set(this.computationTemplate.configuration, "resources.volume", "");
          }
          if (typeof this.computationTemplate.configuration["resources.memory"] == "undefined") {
            this.$set(this.computationTemplate.configuration, "resources.memory", "");
          }
          if (typeof this.computationTemplate.configuration["resources.numCPUs"] == "undefined") {
            this.$set(this.computationTemplate.configuration, "resources.numCPUs", 1);
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
      let config = this.computationTemplate.configuration;
      //console.log(config[property]);
      if (typeof config[property] !== "undefined") {
        return true;
      }
      return false;
    },
    addCsvConfig: function () {
      let outputConfig = {
        "basename": "csv-basename",
        "xlabel" : {
          "key" : "x-key",
          "label" : "x-label"
        },
        "plots": [
          {
            "key" : "y-key",
            "label" : "y-label"
          }
        ]
      };
      if (typeof this.computationTemplate.metadata == "undefined") { 
        this.$set(this.computationTemplate, "metadata", { });
      }
      if (typeof this.computationTemplate.metadata.output == "undefined") { 
        this.$set(this.computationTemplate.metadata, "output", { });
      }
      if (typeof this.computationTemplate.metadata.output.csv == "undefined") { 
        this.$set(this.computationTemplate.metadata.output, "csv", []);
      }
      this.computationTemplate.metadata.output.csv.push(outputConfig);
    },
    addCsvPlot: function (csvConfigIndex) {
      let plotConfig = {
        "key" : "y-key",
        "label" : "y-label"
      };
      if (typeof this.computationTemplate.metadata.output.csv[csvConfigIndex].plots == "undefined") { 
        this.$set(this.computationTemplate.metadata.output.csv[csvConfigIndex], "plots", []);
      }
      this.computationTemplate.metadata.output.csv[csvConfigIndex].plots.push(plotConfig);
    },
    addVtkConfig: function () {
      let outputConfig = {
        "basename": "vtk-basename"
      };
      if (typeof this.computationTemplate.metadata == "undefined") { 
        this.$set(this.computationTemplate, "metadata", { });
      }
      if (typeof this.computationTemplate.metadata.output == "undefined") { 
        this.$set(this.computationTemplate.metadata, "output", { });
      }
      if (typeof this.computationTemplate.metadata.output.vtk == "undefined") { 
        this.$set(this.computationTemplate.metadata.output, "vtk", []);
      }
      this.computationTemplate.metadata.output.vtk.push(outputConfig);
    },
    updateContent: function (item, event) {
      //this.computationTemplate.files[fileIndex].parts[partIndex].content = event
      item.content = event;
    },
    setEditorValue: function (event) {
      this.$set(this.selectedParameter.default, 0, event);
      this.$forceUpdate();
    },
    getNumberofFields: function (paramId) {
      if (this.valueNumbers.get(paramId) == undefined) {
        this.valueNumbers.set(paramId, 1);
        return 1;
      } else {
        return this.valueNumbers.get(paramId);
      }
    },
    setNumberOfFields: function (paramId, newValue) {
      if (this.selectedParameter.metadata.guiType == "checkbox") {
        if (newValue < this.getNumberofFields(paramId)) {
          this.selectedParameter.options.pop();
          this.$forceUpdate();
        }
      }
      this.valueNumbers.set(paramId, newValue);
      this.$forceUpdate();
    },
    getNumberofConfigFields: function (configName) {
      if (this.computationTemplate.configuration[configName] == undefined) {
        return 0;
      } else {
        return this.computationTemplate.configuration[configName].length;
      }
    },
    setNumberOfConfigFields: function (configName, newValue) {
      if (newValue < this.getNumberofConfigFields(configName)) {
        this.computationTemplate.configuration[configName].pop();
        if (newValue == 0) {
          this.$delete(this.computationTemplate.configuration, configName);
        }
        this.$forceUpdate();
      } else if (newValue != 0) {
        if (this.getNumberofConfigFields(configName) == 0) {
          this.computationTemplate.configuration[configName] = [ "" ];
        } else {
          this.computationTemplate.configuration[configName].push("");
        }
      }
      this.$forceUpdate();
    },
    getConfigvModel: function (configName, index = 0) {
      if (index != null) {
        if (typeof this.computationTemplate.configuration[configName] != "undefined") {
          if (this.computationTemplate.configuration[configName].length > 0) {
            return this.computationTemplate.configuration[configName][index];
          }
        }
      } else {
        if (typeof this.computationTemplate.configuration[configName] != "undefined") {
            return this.computationTemplate.configuration[configName];
        }
      }
      return "";
    },
    setConfigvModel: function (configName, val, index = 0, isNumericalValue = false) {
      // if config element is an array
      if (index != null) {
        if (typeof this.computationTemplate.configuration[configName] != "undefined") {
          this.$set(this.computationTemplate.configuration[configName], index, val.target.value);
        } else {
          this.computationTemplate.configuration[configName] = [val.target.value];
        }

      // if config element is not an array
      } else {
        let newValue;

        // if the value has to be a number, check it
        if (isNumericalValue) {
          newValue = parseFloat(val.target.value);
          if(isNaN(newValue)) {
            // set to old value, if input was not null
            if (typeof this.computationTemplate.configuration[configName] != "undefined" && val.target.value !== "") {
              newValue = this.computationTemplate.configuration[configName];
            // set to old value if new char was string not number
            } else if (typeof this.computationTemplate.configuration[configName] != "undefined") {
              newValue = this.computationTemplate.configuration[configName];
            // else set value to null
            } else {
              newValue = null;
            }
          }
        } else {
          newValue = val.target.value;
        }
        
        // set existing value or create config-element and set it
        if (typeof this.computationTemplate.configuration[configName] != "undefined") {
          this.$set(this.computationTemplate.configuration, configName, newValue);
        } else {
          this.computationTemplate.configuration[configName] = newValue;
        }

        // delete config element if set to null or empty string
        if (newValue === null || newValue === "") {
          this.$set(this.computationTemplate.configuration, configName, newValue);
          this.$delete(this.computationTemplate.configuration, configName);
        }
      }
      this.$forceUpdate();
    },
    getSlidervModel: function (index) {
      if (this.selectedParameter.default.length > 0) {
        return this.selectedParameter.default[index];
      }
      return 0;
    },
    setSlidervModel: function (val, index) {
      if (typeof this.selectedParameter !== "undefined") {
        this.$set(this.selectedParameter.default , index, Number(val.target.value));
        this.$forceUpdate();
        return this.slidervModel;
      }
    },
    getFixedParamvModel: function (index, whatToGet = "value") {
      if (this.selectedParameter.options.length > 0) {
        if (typeof this.selectedParameter.options[index] == "undefined") {
          let option = {
              "value" : "",
              "text" : "",
              "selected" : false,
              "disabled" : false
            };
          this.selectedParameter.options.push(option);
        }
        return this.selectedParameter.options[index][whatToGet];
      }
      return "";
    },
    /**
     * Sets value, selected or disabled in options-object
     * whatToSet: "value" || "selected" || "disabled"
     */
    setFixedParamvModel: function (val, index, whatToSet) {
      if (typeof this.selectedParameter !== "undefined") {
        if (typeof this.selectedParameter.options[index] == "undefined") {
          let option = {
              "value" : "",
              "text" : "",
              "selected" : false,
              "disabled" : false
            };
          this.selectedParameter.options.push(option);
        }
        // if selected or disabled, set value as boolean - not as string
        if (whatToSet == "selected" || whatToSet == "disabled") {
          let isSetTrue = (val.target.value === 'true');
          this.$set(this.selectedParameter.options[index] , whatToSet, isSetTrue);
          if (this.selectedParameter.metadata.guiType === "radio" && isSetTrue) {
            let radioOptions = this.selectedParameter.options;
            for (let radioOption in radioOptions) {
              if (radioOption != index) {
                this.$set(radioOptions[radioOption], whatToSet, false);
              }
            }
          }
        } else {
          this.$set(this.selectedParameter.options[index] , whatToSet, val.target.value);
        }
        // if dropdown and multiple fields are selected
        if (this.selectedParameter.metadata.guiType === "dropdown") {
          let selected = [];
          for (let opt in this.selectedParameter.options) {
            let keys = Object.keys(this.selectedParameter.options[opt])
            if (keys.includes("selected")) {
              if (this.selectedParameter.options[opt].selected) {
                selected.push(opt);
              }
            }
          }
          if (selected.length > 1) {
            this.$set(this.selectedParameter, "multiple", true);
          } else {
            this.$set(this.selectedParameter, "multiple", false);
          }
        }
        this.$forceUpdate();
        return this.slidervModel;
      }
    },
    getRadioSelected: function(index) {
      if (typeof this.selectedParameter.options[index] != "undefined") {
        return this.selectedParameter.options[index].selected;
      }
      return false;
    },
    getvModelTemplateMetadata: function (propertyName) {
        if (typeof this.computationTemplate.metadata == "undefined") { 
          this.$set(this.computationTemplate, "metadata", { });
        }
        if (typeof this.computationTemplate.metadata[propertyName] != "undefined") {
          return this.computationTemplate.metadata[propertyName];
        } 
        return "";
      },
    setvModelTemplateMetadata: function (propertyName, val) {
      if (val.target.value != "") {
        if (typeof this.computationTemplate.metadata[propertyName] !== "undefined") {
          this.$set(this.computationTemplate.metadata, propertyName, val.target.value);
          this.$forceUpdate();
        } else if (typeof this.computationTemplate.metadata == "undefined") {
          this.$set(this.computationTemplate, "metadata", { });
          this.$set(this.computationTemplate.metadata, propertyName, val.target.value);
        } else {
          this.$set(this.computationTemplate.metadata, propertyName, val.target.value);
        }
        return this.computationTemplate.metadata[propertyName];
      } else {
        // if val is empty delete displayName-element
        if (typeof this.computationTemplate.metadata[propertyName] !== "undefined") {
          this.$delete(this.computationTemplate.metadata, propertyName);
          this.$forceUpdate();
        }
      }
    },
    /**
     * validate computation template and return whether button should be enabled
     */
    validateJson: function () {
      this.validationRunning = true;
      
      // reset validation
      this.validationResult = null;
      this.validationPartParameterResult = null;
      this.validationArgsResult = null;

      // ct validation
      // TODO if environment can be more than "Container" validate depending on that
      const ajv = new Ajv()
      const validate = ajv.compile(this.schema)
      validate(this.computationTemplate)
      // console.log(validate.errors)
      this.validationResult = validate.errors

      // parameter validation
      let files = this.computationTemplate.files;
      const paramValidate = ajv.compile(this.paramSchema)
      for (let file in files) {
        let parts = files[file].parts;
        for (let part in parts) {
          if (typeof parts[part].parameters !== "undefined") {
            paramValidate(parts[part].parameters)
            // console.log(paramValidate.errors)
            this.validationPartParameterResult = paramValidate.errors;
          }
        }
      }

      // commandline arguments validation
      const commandlineValidate = ajv.compile(this.paramSchema)
      if (typeof this.computationTemplate.parameters !== "undefined" && this.computationTemplate.parameters !== []) {
        commandlineValidate(this.computationTemplate.parameters)
        // console.log(commandlineValidate.errors)
        this.validationArgsResult = paramValidate.errors
      }

      // if everything is valid, set validationResult to "Template is Valid!"
      if (this.validationResult == null && this.validationPartParameterResult == null && this.validationArgsResult == null) {
        this.validationResult = "Template is Valid!";
        setTimeout(() => this.validationRunning = false, 2000);
        this.classValidity = "valid-true";
        return true;
      }

      setTimeout(() => this.validationRunning = false, 2000);
      this.classValidity = "valid-false"
      return false;
    },
    validateUpload: function(ct) {
      let validationResult = null;
      let validationPartParameterResult = null;
      let validationArgsResult = null;

      // ct validation
      // TODO if environment can be more than "Container" validate depending on that
      const ajv = new Ajv()
      const validate = ajv.compile(this.schema)
      validate(ct)
      // console.log(validate.errors)
      validationResult = validate.errors

      // parameter validation
      let files = ct.files;
      const paramValidate = ajv.compile(this.paramSchema)
      for (let file in files) {
        let parts = files[file].parts;
        for (let part in parts) {
          if (typeof parts[part].parameters !== "undefined") {
            paramValidate(parts[part].parameters)
            // console.log(paramValidate.errors)
            validationPartParameterResult = paramValidate.errors;
          }
        }
      }

      // commandline arguments validation
      const commandlineValidate = ajv.compile(this.paramSchema)
      if (typeof ct.parameters !== "undefined" && ct.parameters !== []) {
        commandlineValidate(ct.parameters)
        // console.log(commandlineValidate.errors)
        validationArgsResult = paramValidate.errors
      }

      // if everything is valid, set validationResult to "Template is Valid!"
      if (validationResult == null && validationPartParameterResult == null && validationArgsResult == null) {
        return true;
      }
      return false;
    },
    /** Check if teacher-frontend was opened by a user that is signed in */
    isLoggedIn: function() {
      let appDiv = document.body;
      let dataMode = appDiv.getAttribute("data-mode");
      // if data-mode is set to "create-and-execute", user is logged in (if it is set to "created", the user is not logged in)
      let loggedIn = ( (dataMode == "create-and-execute")? true : false );
      return loggedIn;
    },
    startGuide: function() {
      this.$tours['myTour'].start()
    },
    /*upload existing Computation Template JSON */
    uploadCT: function (event) {
      let iFrameDiv = document.getElementById("iframe-div")
      iFrameDiv.innerHTML = ""
      var reader = new FileReader();
      reader.onload = this.onReaderLoad;
      reader.readAsText(event.target.files[0]);
    },
    /*get json from uploaded file und update DOM */
    onReaderLoad: function (event) {
      let obj = JSON.parse(event.target.result);
      

      // close preferences of previous template and show cofig of new ct in preferences-window
      this.closePreferences();
      this.preferences = true;
      this.showTemplate = true;

      //  add required elements that might be missing
      if (typeof obj.files !== "undefined") {
        for (let file in obj.files) {
          // add file-identifiers if missing
          if (typeof obj.files[file].identifier == "undefined") {
            this.$set(obj.files[file], "identifier", this.uuid())
          }
          // add "parts"-elements
          if (typeof obj.files[file].parts == "undefined") {
            this.$set(obj.files[file], "parts", []);
          }
          // add required elements in parts
          for (let part in obj.files[file].parts) {
            // add identifiers if missing
            if (typeof obj.files[file].parts[part].identifier == "undefined") {
              this.$set(obj.files[file].parts[part], "identifier", this.uuid())
            }
            // add content if missing
            if (typeof obj.files[file].parts[part].content == "undefined") {
              this.$set(obj.files[file].parts[part], "content", "")
            }
            // if access is already set to template
            if (typeof obj.files[file].parts[part].access !== "undefined") {
              if (obj.files[file].parts[part].access === "template") {
                // add parameters 
                if (typeof obj.files[file].parts[part].parameters == "undefined") {
                  this.$set(obj.files[file].parts[part], "parameters", [])
                } 
              }
            }
            
          }
        }
      } else {
        this.$set(obj, "files", []);
      }

      // add template identifier
      if (typeof obj.identifier == "undefined") {
        this.$set(obj, "identifier", this.uuid())
      }

      // TODO: Container needs configuration, but other environments might not need it (take that into account as backend supports more)
      // add configutation
      if (typeof obj.configuration == "undefined") {
        this.$set(obj, "configuration", {})
      }

      // TODO: Should also function without metadata as it is not required
      // add metadata if missing
      // if (typeof obj.metadata == "undefined") {
      //   obj["metadata"] = { "displayName" : "", "description": "", "output": { "viewer": [], "csv" : [], "vtk" : [] } };
      // } else {
      //   if (typeof obj.metadata.output == "undefined") {
      //     obj.metadata["output"] = { "viewer": [], "csv" : [], "vtk" : [] };
      //   }
      // }
      
      let isValid = this.validateUpload(obj)
      if (!isValid) {
        this.$alert("Your template is not valid. Thus, it can not be imported!", "Import Error", "error");
      } else {
        console.log(obj)
        this.$store.commit("updateGeneratedComputationTemplate", obj)
        //this.computationTemplate = obj
        // set number of options for configuring parameters and commandline arguments
        this.setNumbersOfOptions();
      }
      
      this.$forceUpdate();
    },
    setNumbersOfOptions: function() {
      // set numbers of parameter-values
      for (let file in this.computationTemplate.files) {
        for (let part in this.computationTemplate.files[file].parts) {
          if (this.computationTemplate.files[file].parts[part].access == "template") {
            for (let parameter in this.computationTemplate.files[file].parts[part].parameters) {
              let currentParam = this.computationTemplate.files[file].parts[part].parameters[parameter];
              if (currentParam.mode == "fixed") {
                this.valueNumbers.set(currentParam.identifier, currentParam.options.length);
              }
            }
          }
        }
      }
      // set number of commandline argument-values
      if (typeof this.computationTemplate.parameters != undefined) {
        for (let arg in this.computationTemplate.parameters) {
          this.valueNumbers.set(this.computationTemplate.parameters[arg].identifier, this.computationTemplate.parameters[arg].options.length);
        }
      }
    },
    /** Run created template in another tab */
    runTemplate: function() {
      let url = window.location
      let baseUrl = url.protocol + "//" + url.host + "/"

      // calculate data-template for frontend-preview
      let file = JSON.stringify(this.computationTemplate);
      let dataBase64url = base64url(Buffer.from(file).toString());
      
      //baseUrl = "http://localhost:3000/";
      fetch(baseUrl + "sign", {
        method: 'POST',
        body: dataBase64url
      }).then(response => {
        if(response.ok){
          return response.json();  
        }
          throw new Error('Request failed!');
      }, networkError => {
        console.log(networkError.message);
      }).then(jsonResponse => {
        // get token from sign-endpoint
        let token = jsonResponse.token;
          
        // set all values in Vuex store
        this.$store.commit("updateJsonTemplate", this.computationTemplate)
        this.$store.commit("updateToken", token);
        this.$store.commit("updateDataTemplate", dataBase64url);

        // authenticate with new token
        this.ws = new WebSocket(this.$config.WEBSOCKET_API);
        let message = JSON.stringify({ type: "authenticate", content: { jwt: token } });
        this.sendWaiting(message)
        
        // preview ct in iFrame
        let iFrameDiv = document.getElementById("iframe-div")
        iFrameDiv.innerHTML = ""
        let iFrame = document.createElement("iframe");
        iFrameDiv.appendChild(iFrame)
        iFrame.setAttribute("src", url.href.replace("#/teacher", ""))
        iFrame.setAttribute("width", "100%")
        iFrame.setAttribute("height", "315")
      })
    }
  },
  created() {

  },
  mounted() {
    // generate id for ct
    this.computationTemplate.identifier = this.uuid();
    this.setNumbersOfOptions();
    //this.$tours['myTour'].start()
  },
};
</script>

<style lang="scss">
body {
  /* Needed for the position sticky to work */
  overflow: unset !important;
}

#injected #teacher {

  .sample-header {
    position: fixed;
    height: 200px;
    left: 0;
    right: 0;
    top: 0;
    background: linear-gradient(110deg, #004191 60%, #00BEFF 60%);
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    z-index: 0;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sample-header::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    /*background-color: MidnightBlue;*/
    opacity: 0.3;
  }

  .sample-header-section {
    position: relative;
    margin-top: auto;
    margin-bottom: auto;
    color: white;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
    font-family: "Montserrat", sans-serif;
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

    /*margin: 0 10px;
    border-radius: 25px;
    max-width: 1170px;
    margin: 0 auto;
    background-color: #fff;*/
  }

  .main-div {
    position: relative;
    background-color: #fff;
    border-radius: calc(0.25rem - 1px);
    top: 200px;
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

  .drop-allowed{
    background-color: rgba(0, 255, 0, .4) !important;
  }

  .drop-forbidden  {
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

  .sample-section-wrap {
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
    /*width: 70%;*/
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

  .drop-allowed {
    background-color: rgba(0, 255, 0, 0.2);
  }

  .drop-forbidden {
    background-color: rgba(255, 0, 0, 0.2);
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
    margin: 0px 0px 0px 0px;
  }

  .toggle-controls {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow-x: hidden !important;
    right: 0;
    top: 10px;
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

  #start-guide {
    color: white;
    background-color: rgb(178,180,183);
    border-color: rgb(178,180,183);
    width: 100%;
  }

  #start-guide:hover {
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