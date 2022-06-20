<template>
  <!-- content -->
  <div
    id="app"
    class="flex-container"
  >
    <div id="teacher" class="main-div flex-left m-2 p-2">
      <h2>Teacher</h2>
      <h3>This site will help you create a Computation Template</h3>

      <div class="group">

        <!-- Components and Preferences -->
        <div class="select-list">
          <b-card no-body>
                <b-tabs card class="files" content-class="m-2" fill>
                  
                  <!-- Drag-and-Drop Components -->
                  <b-tab
                    title="Components"
                  >
                    <div v-if="showTemplate">
                      Template
                      <transition-group name="list" tag="div">
                        <drag v-for="n in componentsFiles" :key="n" class="drag" :data="n">{{n}}</drag>
                      </transition-group>
                    </div>
                    <div v-if="showFile">
                      File
                      <transition-group name="list" tag="div">
                        <drag v-for="n in componentsFiles.concat(componentsFile)" :key="n" class="drag" :data="n">{{n}}</drag>
                      </transition-group>
                    </div>
                    <div v-if="showPart && !thereIsTemplate">
                      Part
                      <transition-group name="list" tag="div">
                        <drag v-for="n in componentsFiles.concat(componentsFile)" :key="n" class="drag" :data="n">{{n}}</drag>
                      </transition-group>
                    </div>
                    <div v-if="showPart && thereIsTemplate">
                      Part
                      <transition-group name="list" tag="div">
                        <drag v-for="n in componentsFiles.concat(componentsPart).concat(availableGuiTypes)" :key="n" class="drag" :data="n">{{n}}</drag>
                      </transition-group>
                    </div>
                    <div v-if="showCommands">
                      Commandline Arguments
                      <transition-group name="list" tag="div">
                        <drag v-for="n in componentsFiles.concat(componentsCommand).concat(availableGuiTypes)" :key="n" class="drag" :data="n">{{n}}</drag>
                      </transition-group>
                    </div>
                  </b-tab>

                  <!-- Preferences -->
                  <b-tab v-if="preferences" title="Preferences">
                    <div class="preferences-list">
                      <!-- Template Data -->
                      <div v-if="showTemplate">
                        <!-- Metadata -->
                        <div v-if="copied.metadata">
                          <label class="item-name mr-2" for="copied.metadata">metadata: </label>
                          <!-- display name -->
                          <div>
                            <label class="item-name mr-2">displayName:</label>
                            <input type="text" class="form-control" v-model="copied.metadata.displayName">
                          </div>
                          <!-- description -->
                          <div>
                            <label class="item-name mr-2">description:</label>
                            <input type="text" class="form-control" v-model="copied.metadata.description">
                          </div>
                          <!-- output -->
                          <div>
                            <label class="item-name mr-2" for="copied.metadata.output">output: </label>
                            <!-- viewer -->
                            <div>
                              <label class="item-name mr-2" for="copied.metadata.output.viewer">viewer: </label>
                              <div class="dropdown form-group">
                                  <select
                                    class="form-control"
                                    v-model="copied.metadata.output.viewer"
                                    multiple
                                  >
                                    <option>Image</option>
                                    <option>ParaView</option>
                                    <option>CSV</option>
                                    <option>ViPLabGraphics</option>
                                  </select>
                                </div>
                            </div>
                            <!-- csv -->
                            <div>
                              <label class="item-name mr-2" for="copied.metadata.output.csv">csv: </label>
                              <b-button class="btn mb-3" @click="addCsvConfig()" v-tooltip.top-center="'Add Config for Group of CSV-Files'">
                                <b-icon icon="plus" aria-hidden="true"></b-icon>
                              </b-button>
                              <div class="ml-4 mr-4">
                                <div class="border p-2" v-for="csvConfig in copied.metadata.output.csv" :key="csvConfig.identifier">
                                  <!-- identifier -->
                                  <div>
                                    <label class="item-name mr-2" for="csvConfig.identifier">identifier: </label>
                                    <input type="text" class="form-control" id="csvConfig.identifier" v-model="csvConfig.identifier" disabled>
                                  </div>
                                  <!-- basename -->
                                  <div>
                                    <label class="item-name mr-2" for="csvConfig.basename">basename: </label>
                                    <input type="text" class="form-control" id="csvConfig.basename" v-model="csvConfig.basename">
                                  </div>
                                  <!-- xlabel -->
                                  <div>
                                    <label class="item-name mr-2" for="csvConfig.xlabel">xlabel: </label>
                                    <div class="ml-4 mr-4">
                                      <!-- key -->
                                      <label class="item-name mr-2" for="csvConfig.xlabel.key">key: </label>
                                      <input type="text" class="form-control" id="csvConfig.xlabel.key" v-model="csvConfig.xlabel.key">
                                      <!-- label -->
                                      <label class="item-name mr-2" for="csvConfig.xlabel.label">label: </label>
                                      <input type="text" class="form-control" id="csvConfig.xlabel.label" v-model="csvConfig.xlabel.label">
                                      <!-- factor -->
                                      <label class="item-name mr-2" for="csvConfig.xlabel.factor">factor: </label>
                                      <input type="number" class="form-control" id="csvConfig.xlabel.factor" v-model="csvConfig.xlabel.factor">
                                      <!-- format -->
                                      <label class="item-name mr-2" for="csvConfig.xlabel.format">format: </label>
                                      <input type="text" class="form-control" id="csvConfig.xlabel.format" v-model="csvConfig.xlabel.format">
                                    </div>
                                  </div>
                                  <!-- plots -->
                                  <label class="item-name mr-2" for="csvConfig.plots">plots: </label>
                                  <b-button class="btn mb-3" @click="addCsvPlot(csvConfig)" v-tooltip.top-center="'Add Y-Axis to generate Plot from CSV-Files'">
                                    <b-icon icon="plus" aria-hidden="true"></b-icon>
                                  </b-button>
                                  <div class="ml-4 mr-4">
                                    <div class="border mb-2 p-2" v-for="(csvPlot, plotIndex) in csvConfig.plots" :key="csvConfig.identifier + '-plot-' + plotIndex">
                                      <!-- key -->
                                      <label class="item-name mr-2" for="csvPlot.key">key: </label>
                                      <input type="text" class="form-control" id="csvPlot.key" v-model="csvPlot.key">
                                      <!-- label -->
                                      <label class="item-name mr-2" for="csvPlot.label">label: </label>
                                      <input type="text" class="form-control" id="csvPlot.label" v-model="csvPlot.label">
                                      <!-- factor -->
                                      <label class="item-name mr-2" for="csvPlot.factor">factor: </label>
                                      <input type="number" class="form-control" id="csvPlot.factor" v-model="csvPlot.factor">
                                      <!-- factor -->
                                      <label class="item-name mr-2" for="csvPlot.format">format: </label>
                                      <input type="text" class="form-control" id="csvPlot.format" v-model="csvPlot.format">
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <!-- vtk -->
                            <div>
                              <label class="item-name mr-2" for="copied.metadata.output.vtk">vtk: </label>
                              <b-button class="btn mb-3" @click="addVtkConfig()" v-tooltip.top-center="'Add Config for Group of VTK-Files'">
                                <b-icon icon="plus" aria-hidden="true"></b-icon>
                              </b-button>
                              <div class="ml-4 mr-4">
                                <div class="border mb-2 p-2" v-for="vtkConfig in copied.metadata.output.vtk" :key="vtkConfig.identifier">
                                  <!-- identifier -->
                                  <div>
                                    <label class="item-name mr-2" for="vtkConfig.identifier">identifier: </label>
                                    <input type="text" class="form-control" id="vtkConfig.identifier" v-model="vtkConfig.identifier" disabled>
                                  </div>
                                  <!-- basename -->
                                  <div>
                                    <label class="item-name mr-2" for="vtkConfig.basename">basename: </label>
                                    <input type="text" class="form-control" id="vtkConfig.basename" v-model="vtkConfig.basename">
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <!-- Environment -->
                        <div>
                          <label class="item-name mr-2" for="copied.environment">environment: </label>
                          <div class="dropdown form-group">
                              <select
                                class="form-control"
                                v-model="copied.environment"
                                @change="addConfig()"
                              >
                                <option>C</option>
                                <option>C++</option>
                                <option>Java</option>
                                <option>Matlab</option>
                                <option>Octave</option>
                                <option>Container</option>
                                <option>DuMuX</option>
                              </select>
                            </div>
                        </div>
                        <!-- Configuration -->
                        <div v-if="copied.configuration">
                          <label class="item-name mr-2">configuration: </label>
                          <div v-if="ifConfigPropertyExists('compiling.sources')">
                            <label class="item-name mr-2">compiling.sources*:</label>
                            <input type="text" class="form-control" v-model="copied.configuration['compiling.sources']">
                          </div>
                          <div v-if="ifConfigPropertyExists('compiling.compiler')">
                            <label class="item-name mr-2">compiling.compiler*:</label>
                            <input type="text" class="form-control" v-model="copied.configuration['compiling.compiler']">
                          </div>
                          <div v-if="ifConfigPropertyExists('compiling.flags')">
                            <label class="item-name mr-2">compiling.flags*(Must for C, C++, optional for Java):</label>
                            <input type="text" class="form-control" v-model="copied.configuration['compiling.flags']">
                          </div>
                          <div v-if="ifConfigPropertyExists('checking.sources')">
                            <label class="item-name mr-2">checking.sources*(must if checking should be performed):</label>
                            <input type="text" class="form-control" v-model="copied.configuration['checking.sources']">
                          </div>
                          <div v-if="ifConfigPropertyExists('checking.allowedCalls')">
                            <label class="item-name mr-2">checking.allowedCalls(must if checking should be performed):</label>
                            <input type="text" class="form-control" v-model="copied.configuration['checking.allowedCalls']">
                          </div>
                          <div v-if="ifConfigPropertyExists('checking.forbiddenCalls')">
                            <label class="item-name mr-2">checking.forbiddenCalls(must if checking should be performed):</label>
                            <input type="text" class="form-control" v-model="copied.configuration['checking.forbiddenCalls']">
                          </div>
                          <div v-if="ifConfigPropertyExists('linking.flags')">
                            <label class="item-name mr-2">linking.flags*:</label>
                            <input type="text" class="form-control" v-model="copied.configuration['linking.flags']">
                          </div>
                          <div v-if="ifConfigPropertyExists('running.stdinFilename')">
                            <label class="item-name mr-2">running.stdinFilename*:</label>
                            <input type="text" class="form-control" v-model="copied.configuration['running.stdinFilename']">
                          </div>
                          <div v-if="ifConfigPropertyExists('running.timelimitInSeconds')">
                            <label class="item-name mr-2">running.timelimitInSeconds:</label>
                            <input type="number" class="form-control" v-model="copied.configuration['running.timelimitInSeconds']">
                          </div>
                          <div v-if="ifConfigPropertyExists('running.commandLineArguments')">
                            <label class="item-name mr-2">running.commandLineArguments:</label>
                            <input type="text" class="form-control" v-model="copied.configuration['running.commandLineArguments']">
                          </div>
                          <div v-if="ifConfigPropertyExists('running.flags')">
                            <label class="item-name mr-2">running.flags:</label>
                            <input type="text" class="form-control" v-model="copied.configuration['running.flags']">
                          </div>
                          <div v-if="ifConfigPropertyExists('running.mainClass')">
                            <label class="item-name mr-2">running.mainClass:</label>
                            <input type="text" class="form-control" v-model="copied.configuration['running.mainClass']">
                          </div>
                          <div v-if="ifConfigPropertyExists('running.executable')">
                            <label class="item-name mr-2">running.executable*:</label>
                            <input type="text" class="form-control" v-model="copied.configuration['running.executable']">
                          </div>
                          <div v-if="ifConfigPropertyExists('running.entrypoint')">
                            <label class="item-name mr-2">running.entrypoint:</label>
                            <input type="text" class="form-control" v-model="copied.configuration['running.entrypoint']">
                          </div>
                          <div v-if="ifConfigPropertyExists('running.intermediateFilesPattern')">
                            <label class="item-name mr-2">running.intermediateFilesPattern:</label>
                            <input type="text" class="form-control" v-model="copied.configuration['running.intermediateFilesPattern']">
                          </div>
                          <div v-if="ifConfigPropertyExists('resources.image')">
                            <label class="item-name mr-2">resources.image*:</label>
                            <input type="text" class="form-control" v-model="copied.configuration['resources.image']">
                          </div>
                          <div v-if="ifConfigPropertyExists('resources.volume')">
                            <label class="item-name mr-2">resources.volume:</label>
                            <input type="text" class="form-control" v-model="copied.configuration['resources.volume']">
                          </div>
                          <div v-if="ifConfigPropertyExists('resources.memory')">
                            <label class="item-name mr-2">resources.memory:</label>
                            <input type="text" class="form-control" v-model="copied.configuration['resources.memory']">
                          </div>
                          <div v-if="ifConfigPropertyExists('resources.numCPUs')">
                            <label class="item-name mr-2">resources.numCPUs:</label>
                            <input type="number" class="form-control" v-model="copied.configuration['resources.numCPUs']">
                          </div>
                        </div>
                      </div>

                      <!-- Files Data -->
                      <div v-else-if="showFile">
                        <!-- path -->
                        <div>
                          <label class="item-name mr-2" for="selectedFile.path">path: </label>
                          <input type="text" class="form-control" id="selectedFile.path" v-model="selectedFile.path">
                        </div>
                        <!-- metadata -->
                        <div>
                          <label class="item-name mr-2">metadata: </label>
                          <div v-if="selectedFile.metadata.syntaxHighlighting">
                            <label class="item-name mr-2">syntaxHighlighting:</label>
                            <div class="dropdown form-group">
                              <select
                                class="form-control"
                                v-model="selectedFile.metadata.syntaxHighlighting"
                              >
                                <option>text</option>
                                <option>ini</option>
                                <option>c_cpp</option>
                                <option>matlab</option>
                                <option>java</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Part Data -->
                      <div v-else-if="showPart">
                        <!-- access -->
                        <div>
                          <label class="item-name mr-2" for="selectedPart.access">access: </label>
                          <div class="dropdown form-group">
                            <select
                              class="form-control"
                              v-model="selectedPart.access"
                              @change="addOrRemoveParameters(selectedPart)"
                            >
                              <option>invisible</option>
                              <option>visible</option>
                              <option>modifiable</option>
                              <option>template</option>
                            </select>
                          </div>
                        </div>
                        <!-- metadata -->
                        <div>
                          <label class="item-name mr-2">metadata: </label>
                          <div v-if="selectedPart.metadata.name">
                            <label class="item-name mr-2">name:</label>
                            <input type="text" class="form-control" id="selectedPart.metadata.name" v-model="selectedPart.metadata.name">
                          </div>
                        </div>
                      </div>

                      <!-- Show Parameter Preferences -->
                      <div v-else-if="showParameter">
                        
                        <!-- identifier -->
                        <div>
                          <label class="item-name mr-2" for="selectedParameter.identifier">identifier: </label>
                          <input type="text" class="form-control" id="selectedParameter.identifier" v-model="selectedParameter.identifier" disabled>
                        </div>
                        <!-- name -->
                        <div>
                          <label class="item-name mr-2" for="selectedParameter.metadata.name">name: </label>
                          <input type="text" class="form-control" id="selectedParameter.metadata.name" v-model="selectedParameter.metadata.name">
                        </div>
                        <!-- description -->
                        <div>
                          <label class="item-name mr-2" for="selectedParameter.metadata.description">description: </label>
                          <input type="text" class="form-control" id="selectedParameter.metadata.description" v-model="selectedParameter.metadata.description">
                        </div>

                        <!-- input_field -->
                        <div v-if="selectedParameter.metadata.guiType=='input_field'">
                          <!-- type -->
                          <div>
                            <label class="item-name mr-2" for="selectedParameter.metadata.type">type: </label>
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
                              <label class="item-name mr-2" for="selectedParameter.default">default value: </label>
                              <!-- TODO: de- and encode default value of type text -->
                              <input v-if="selectedParameter.metadata.type == 'text'" type="text" class="form-control" id="selectedParameter.default" v-model="inputvModel">
                              <input v-else type="number" class="form-control" id="selectedParameter.default" v-model="selectedParameter.default[0]">
                            </div>
                            <!-- type: number - min, max, step -->
                            <div v-if="selectedParameter.metadata.type == 'number'">
                              <div>
                                <label class="item-name mr-2" for="selectedParameter.min">min value: </label>
                                <input type="number" class="form-control" id="selectedParameter.min" v-model="selectedParameter.min">
                              </div>
                              <div>
                                <label class="item-name mr-2" for="selectedParameter.max">max value: </label>
                                <input type="number" class="form-control" id="selectedParameter.max" v-model="selectedParameter.max">
                              </div>
                              <div>
                                <label class="item-name mr-2" for="selectedParameter.step">step size: </label>
                                <input type="number" class="form-control" id="selectedParameter.step" v-model="selectedParameter.step">
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- slider -->
                        <div v-if="selectedParameter.metadata.guiType=='slider'">
                          <!-- vertical -->
                          <label class="item-name mr-2" for="selectedParameter.metadata.vertical">vertical: </label>
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
                            <label class="item-name mr-2" for="selectedParameter.default">value(s): </label>
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
                            <label class="item-name mr-2" for="selectedParameter.min">min value: </label>
                            <input type="number" class="form-control" id="selectedParameter.min" v-model="selectedParameter.min">
                          </div>
                          <!-- max -->
                          <div>
                            <label class="item-name mr-2" for="selectedParameter.max">max value: </label>
                            <input type="number" class="form-control" id="selectedParameter.max" v-model="selectedParameter.max">
                          </div>
                          <!-- step -->
                          <div>
                            <label class="item-name mr-2" for="selectedParameter.step">step size: </label>
                            <input type="number" class="form-control" id="selectedParameter.step" v-model="selectedParameter.step">
                          </div>
                        </div>

                        <!-- editor -->
                        <div v-if="selectedParameter.metadata.guiType=='editor'">
                          <div>
                            <label class="item-name mr-2" for="selectedParameter.default">value: </label>
                            <!--<input class="form-control" id="selectedParameter.default" v-model="inputvModel">-->
                            <ace-editor-component 
                                        :isParameter="false" 
                                        :isMustache="false"
                                        :readonly="false"
                                        :item='{
                                          "identifier" : "Editor" + selectedParameter.identifier,
                                          "content" : ""
                                        }'
                                        v-on:update:item="setEditorValue($event)"
                                      ></ace-editor-component>
                          </div>
                        </div>

                        <!-- checkbox, dropdown, toggle, radio -->
                        <div v-if="selectedParameter.metadata.guiType=='checkbox' || selectedParameter.metadata.guiType=='dropdown' || selectedParameter.metadata.guiType=='toggle'|| selectedParameter.metadata.guiType=='radio'">
                          <!-- options -->
                          <div>
                            <label class="item-name mr-2" for="selectedParameter.options">value(s): </label>
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
                                    <input class="form-check-input custom-control-input" :id="selectedParameter.identifier+'-'+index+ '-'+'selected'" type="radio" :name="selectedParameter.identifier+'-'+index+'-'+'checkbox-selected'" :value=true @input="setFixedParamvModel($event, index, 'selected')" />
                                    <label class="form-check-label custom-control-label" :for="selectedParameter.identifier+'-'+index+ '-'+'selected'">selected</label><br>
                                  </div>
                                  <div>
                                    <input class="form-check-input custom-control-input" :id="selectedParameter.identifier+'-'+index+ '-'+'unselected'" type="radio" :name="selectedParameter.identifier+'-'+index+'-'+'checkbox-selected'" :value=false @input="setFixedParamvModel($event, index, 'selected')" checked />
                                    <label class="form-check-label custom-control-label" :for="selectedParameter.identifier+'-'+index+ '-'+'unselected'">not selected</label><br>
                                  </div>
                                </div>
                                <!-- disabled -->
                                <label class="mr-2">Is disabled? </label>
                                <div class="radiobutton form-check custom-control custom-radio">
                                  <div>
                                    <input class="form-check-input custom-control-input" :id="selectedParameter.identifier+'-'+index+'-'+'disabled'" type="radio" :name="selectedParameter.identifier+'-'+index+'-'+'checkbox-disabled'" :value=true @input="setFixedParamvModel($event, index, 'disabled')" />
                                    <label class="form-check-label custom-control-label" :for="selectedParameter.identifier+'-'+index+'-'+'disabled'">disabled</label><br>
                                  </div>
                                  <div>
                                    <input class="form-check-input custom-control-input" :id="selectedParameter.identifier+'-'+index+'-'+'enabled'" type="radio" :name="selectedParameter.identifier+'-'+index+'-'+'checkbox-disabled'" :value=false @input="setFixedParamvModel($event, index, 'disabled')" checked />
                                    <label class="form-check-label custom-control-label" :for="selectedParameter.identifier+'-'+index+'-'+'enabled'">enabled</label><br>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                          
                        <!-- Validation -->
                        <div>
                          <label class="item-name mr-2" for="selectedParameter.validation">validation: </label>
                          
                          <!-- mode: any -->
                          <div class="dropdown form-group" v-if="selectedParameter.mode === 'any'">
                            <select
                              class="form-control"
                              v-model="selectedParameter.validation"
                              @change="adjustPatternExistence(selectedParameter)"
                            >
                              <option value="pattern">Set a regex-pattern the text-value has to fulfill</option>
                              <option value="range">Set range for the value</option>
                              <option value="none" selected="selected">Any value is allowed</option>
                            </select>

                            <!-- pattern -->
                            <div class="ml-4 mr-4" v-if="selectedParameter.validation === 'pattern'">
                              <div>
                                <label class="item-name mr-2" for="selectedParameter.pattern">pattern: </label>
                                <input type="text" class="form-control" id="selectedParameter.pattern" v-model="selectedParameter.pattern">
                              </div>
                            </div>

                          </div>

                          <!-- mode: fixed -->
                          <div class="dropdown form-group" v-else>
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

                      </div>
                </div>
              </b-tab>
            </b-tabs>
          </b-card>
        </div>

        <!-- Graphical View of Template -->
        <div class="dnd-window">
          <drop class="top-copy" @drop="onFileDrop($event)" :accepts-data="(file) => ((file  === 'file') || (file === 'commandline arguments'))">
            <div class="template" @click="openWindow($event, 'template', copied)">
              Files
              <div v-for="(file, index) in copied.files" :key="file.identifier + '-' + index">
                <drop class="copy" @drop="onPartDrop($event,file)" :accepts-data="(part) => part  === 'part'">
                  <div class="file p-2" @click="openWindow($event, 'file', file)">
                    
                    <b-row align-v="stretch">
                      <b-col cols="10">
                        File
                      </b-col>
                      <b-col cols="2">
                        <div class="text-right" @click="removeFile($event, file)">
                          <b-icon icon="x-circle"></b-icon>
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
                                <b-col cols="10">
                                  Part
                                </b-col>
                                <b-col cols="2">
                                  <div class="text-right" @click="removePart($event, item)">
                                    <b-icon icon="x-circle"></b-icon>
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
                                          <b-container class="param-container" @click="openWindow($event, 'parameter', item)">
                                            <b-row align-v="stretch">
                                              <b-col cols="10">
                                                {{item.metadata.guiType}}
                                                <br>
                                                {{item.identifier}}
                                              </b-col>
                                              <b-col cols="2">
                                                <div class="text-right" @click="removeParameter($event, item)">
                                                  <b-icon icon="x-circle"></b-icon>
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
                                      <label class="item-name mr-2" for="item.content">content: </label>
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
              <div v-if="copied.parameters">
                <drop class="copy" @drop="onParameterDrop($event)" :accepts-data="(param) => ((availableGuiTypes.includes(param))) && copied.parameters">
                  <div class="file" @click="openWindow($event, 'commands', copied.parameters)">
                  
                    Commandline Arguments
                    <drop-list class="param-droplist" v-if="copied.parameters" :items="copied.parameters" @insert="onInsert($event, true, item)" @reorder="$event.apply(copied.parameters)" :accepts-data="(param) => false" :column="true" :key="uuid()">
                      <template v-slot:item="{item}">
                        <drag class="item param" :key="item.identifier">
                          <b-container class="param-container" @click="openWindow($event, 'parameter', item)">
                            <b-row align-v="stretch">
                              <b-col cols="10">
                                {{item.metadata.guiType}}
                                <br>
                                {{item.identifier}}
                              </b-col>
                              <b-col cols="2">
                                <div class="text-right" @click="removeParameter($event, item, false)">
                                  <b-icon icon="x-circle"></b-icon>
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
        </div>
      </div>
      <pre>{{ JSON.stringify(copied, null, 2) }}</pre>
    </div>
  </div>
</template>

<script>
import { Drag, Drop, DropList } from "vue-easy-dnd";

// import Ace
import AceEditorComponent from "../../components/EditorComponent-Ace.vue"

import base64url from "base64url";

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
      copied: {"identifier" : "", "version" : "3.0.0", "metadata": { "displayName" : "", "description": "", "output": { "viewer": [], "csv" : [], "vtk" : [] } }, "environment": "", "files": [], "configuration": {}}, 
      availableGuiTypes : ["input_field", "editor", "slider", "checkbox", "radio", "dropdown", "toggle"],
      preferences: true,
      selectedParameter: {},
      selectedPart: {},
      selectedFile: {},
      showTemplate: true,
      showFile: false,
      showPart: false, 
      showParam: false,
      showParameter: false,
      showCommands: false,
      valueNumbers: new Map(),
    };
  },
  computed: {
    thereIsTemplate() {
      for (var file in this.copied.files) {
        for (var part in this.copied.files[file].parts) {
          var currentPart = this.copied.files[file].parts[part]
          if (currentPart.access === "template") {
            return true;
          }
        }
      }
      return false;
    },
    inputvModel: {
      get: function () {
        console.log("get vModel - " + this.selectedParameter.default[0])
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
  },
  methods: {
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
        this.copied.files.push(file);
        // add possibility to add "parts"
        this.componentsCommand = this.componentsPart;
      } else {
        // add commandline parameters
        if (typeof this.copied.parameters === "undefined") {
          this.copied.parameters = [];
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
          "default" : [],
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
        this.copied.parameters.push(parameter);
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
        console.log("commands clicked");
        this.showCommands = true;
      } else {
        if (this.copied.identifier == "") {
          this.copied.identifier = this.uuid();
        }
        this.showTemplate = true;
      }
      console.log("clicked");
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
      if (selectedPart.access === "template") {
        this.$set(selectedPart, "parameters", []);
      } else {
        delete selectedPart.parameters;
      }
    }, 
    /**
     * Delete Parameter from part or command line arguments and rerender
     */
    removeParameter: function(event, item, isInPart = true) {
      console.log("Delete following Parameter - " + item.metadata.guiType);
      event.stopPropagation();
      if (isInPart) {
        for (var file in this.copied.files) {
          for (var part in this.copied.files[file].parts) {
            var currentPart = this.copied.files[file].parts[part];
            for (var parameter in currentPart.parameters) {
              let currentParameter = currentPart.parameters[parameter];
              if (currentParameter.identifier === item.identifier) {
                delete this.copied.files[file].parts[part].parameters.splice(parameter, 1);
                this.closePreferences();
                this.showTemplate = true;
                this.preferences = true;
              }
            }
          }
        }
      } else {
        for (let argument in this.copied.parameters) {
          let currentParameter = this.copied.parameters[argument];
          if (currentParameter.identifier === item.identifier) {
            delete this.copied.parameters.splice(argument, 1);
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
      for (let fileIndex in this.copied.files) {
        if (this.copied.files[fileIndex].identifier == item.identifier) {
          delete this.copied.files.splice(fileIndex, 1);
        }
      }
      this.$forceUpdate();
    },
    /**
     * Delete part from json and rerender
     */
    removePart: function(event, item) {
      event.stopPropagation();
      for (let fileIndex in this.copied.files) {
        for (let partIndex in this.copied.files[fileIndex].parts) {
          if (this.copied.files[fileIndex].parts[partIndex].identifier == item.identifier) {
            delete this.copied.files[fileIndex].parts.splice(partIndex, 1);
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
      let env = this.copied.environment;
      this.$set(this.copied, "configuration", {});
      this.$set(this.copied.configuration, "running.timelimitInSeconds", "");
      switch (env) {
        case "C":
          this.$set(this.copied.configuration, "compiling.sources", "test");
          this.$set(this.copied.configuration, "compiling.compiler", "");
          this.$set(this.copied.configuration, "compiling.flags", "");
          this.$set(this.copied.configuration, "checking.sources", "");
          this.$set(this.copied.configuration, "checking.forbiddenCalls", "");
          this.$set(this.copied.configuration, "linking.flags", "");
          this.$set(this.copied.configuration, "running.commandLineArguments", "");
          break;
        case "C++":
          this.$set(this.copied.configuration, "compiling.sources", "");
          this.$set(this.copied.configuration, "compiling.compiler", "");
          this.$set(this.copied.configuration, "compiling.flags", "");
          this.$set(this.copied.configuration, "linking.flags", "");
          this.$set(this.copied.configuration, "running.commandLineArguments", "");
          break;
        case "Java":
          this.$set(this.copied.configuration, "compiling.sources", "");
          this.$set(this.copied.configuration, "compiling.flags", "");
          this.$set(this.copied.configuration, "checking.sources", "");
          this.$set(this.copied.configuration, "checking.allowedCalls", "");
          this.$set(this.copied.configuration, "checking.forbiddenCalls", "");
          this.$set(this.copied.configuration, "running.commandLineArguments", "");
          this.$set(this.copied.configuration, "running.flags", "");
          this.$set(this.copied.configuration, "running.mainClass", "");
          break;
        case "Matlab":
          this.$set(this.copied.configuration, "checking.sources", "");
          this.$set(this.copied.configuration, "checking.allowedCalls", "");
          this.$set(this.copied.configuration, "running.stdinFilename", "");
          break;
        case "Octave":
          this.$set(this.copied.configuration, "checking.sources", "");
          this.$set(this.copied.configuration, "checking.allowedCalls", "");
          this.$set(this.copied.configuration, "running.stdinFilename", "");
          break;
        case "Container":
          this.$set(this.copied.configuration, "running.commandLineArguments", "");
          this.$set(this.copied.configuration, "running.entrypoint", "");
          this.$set(this.copied.configuration, "running.intermediateFilesPattern", "");
          this.$set(this.copied.configuration, "resources.image", "");
          this.$set(this.copied.configuration, "resources.volume", "");
          this.$set(this.copied.configuration, "resources.memory", "");
          this.$set(this.copied.configuration, "resources.numCPUs", "");
          break;
        case "DuMuX":
          this.$set(this.copied.configuration, "running.commandLineArguments", "");
          this.$set(this.copied.configuration, "running.executable", "");
          break;
      }
    },
    /** Check if property exists in current config, or if it is undefined */
    ifConfigPropertyExists(property) {
      let config = this.copied.configuration;
      //console.log(config[property]);
      if (typeof config[property] !== "undefined") {
        return true;
      }
      return false;
    },
    addCsvConfig: function () {
      let outputConfig = {
        "identifier" : this.uuid(),
        "basename": "csv-basename",
        "xlabel" : {
          "key" : "x-key",
          "label" : "x-label",
          "factor" : "",
          "format" : "" 
        },
        "plots": [
          {
            "key" : "y-key",
            "label" : "y-label",
            "factor" : ""
          }
        ]
      };
      this.copied.metadata.output.csv.push(outputConfig);
    },
    addCsvPlot: function (csvConfig) {
      let plotConfig = {
        "key" : "y-key",
        "label" : "y-label",
        "factor" : "",
        "format" : ""
      };
      csvConfig.plots.push(plotConfig);
    },
    addVtkConfig: function () {
      let outputConfig = {
        "identifier" : this.uuid(),
        "basename": "vtk-basename"
      };
      this.copied.metadata.output.vtk.push(outputConfig);
    },
    updateContent: function (item, event) {
      //this.copied.files[fileIndex].parts[partIndex].content = event
      item.content = event;
    },
    setEditorValue: function (event) {
      console.log(event)
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
    }
  },
  created() {
    
  },
  mounted() {
    // generate id for ct
    this.copied.identifier = this.uuid();
  },
};
</script>

<style lang="scss">
body {
  /* Needed for the position sticky to work */
  overflow: unset !important;
}

#injected #teacher {

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

  .main-div {
    background-color: #fff;
    border-radius: calc(0.25rem - 1px);
  }

  .item-name {
    font-weight: bold;
    font-size: 14pt;
  }

  .drag {
    padding: 10px;
    background-color: rgb(220, 220, 255);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 10px 10px 0 10px;
    font-size: 20px;
    transition: all 0.5s;
  }

  .drop-allowed{
    background-color: rgba(0, 255, 0, .4) !important;
  }

  .drop-forbidden  {
    background-color: rgba(255, 0, 0, 0.2);
  }

  .group {
    display: flex;
  }

  .select-list {
    margin: 20px 10px 20px 10px;
    width: 30%;
    border: solid 1px black;
  }

  .preferences-list {
    padding: 10px 10px 10px 10px;
    word-break: break-word;
  }

  .dnd-window {
    position: relative;
    flex: 1;
    width: 70%;
    margin: 20px 10px 20px 10px;
  }

  .top-copy {
    border: 1px solid black;
    min-height: 100px;
    position: relative;
    flex: 1;
    width: 100%;
    height: 100%;
  }

  .copy {
    border: 1px solid black;
    min-height: 100px;
    margin: 20px auto 20px auto;
    position: relative;
    flex: 1;
    width: 80%;
  }

  .card {
    background-color: rgba(0, 0, 0, 0);
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
    border: 1px solid black;
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
    border: 1px solid black;
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

  .b-form-spinbutton .btn {
    width: 100%;
    padding : 0 !important;
    height: 100%;
  }

}

.tooltip-icon {
  margin: auto 0;
}
</style>