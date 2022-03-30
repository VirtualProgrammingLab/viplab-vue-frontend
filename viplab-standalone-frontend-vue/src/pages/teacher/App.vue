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
        <div class="select-list">
          <b-card no-body>
                <b-tabs card class="files" content-class="m-2" fill>
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
                        <drag v-for="n in componentsFile" :key="n" class="drag" :data="n">{{n}}</drag>
                      </transition-group>
                    </div>
                    <div v-if="showPart && !thereIsTemplate">
                      Part
                      <transition-group name="list" tag="div">
                        <drag v-for="n in componentsFile" :key="n" class="drag" :data="n">{{n}}</drag>
                      </transition-group>
                    </div>
                    <div v-if="showPart && thereIsTemplate">
                      Part
                      <transition-group name="list" tag="div">
                        <drag v-for="n in componentsPart" :key="n" class="drag" :data="n">{{n}}</drag>
                      </transition-group>
                    </div>
                  </b-tab>
                  <b-tab v-if="preferences" title="Preferences">
                    <div class="preferences-list">
                      <div v-if="showTemplate">
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
                        <div v-if="copied.configuration">
                          <label class="item-name mr-2">configuration: </label>
                          <div v-if="ifConfigPropertyExists('compiling.sources')">
                            <label class="item-name mr-2">compiling.sources:</label>
                          </div>
                          <div v-if="ifConfigPropertyExists('compiling.compiler')">
                            <label class="item-name mr-2">compiling.compiler:</label>
                          </div>
                          <div v-if="ifConfigPropertyExists('compiling.flags')">
                            <label class="item-name mr-2">compiling.flags:</label>
                          </div>
                          <div v-if="ifConfigPropertyExists('checking.sources')">
                            <label class="item-name mr-2">checking.sources:</label>
                          </div>
                          <div v-if="ifConfigPropertyExists('checking.allowedCalls')">
                            <label class="item-name mr-2">checking.allowedCalls:</label>
                          </div>
                          <div v-if="ifConfigPropertyExists('checking.forbiddenCalls')">
                            <label class="item-name mr-2">checking.forbiddenCalls:</label>
                          </div>
                          <div v-if="ifConfigPropertyExists('linking.flags')">
                            <label class="item-name mr-2">linking.flags:</label>
                          </div>
                          <div v-if="ifConfigPropertyExists('running.stdinFilename')">
                            <label class="item-name mr-2">running.stdinFilename:</label>
                          </div>
                          <div v-if="ifConfigPropertyExists('running.timelimitInSeconds')">
                            <label class="item-name mr-2">running.timelimitInSeconds:</label>
                          </div>
                          <div v-if="ifConfigPropertyExists('running.commandLineArguments')">
                            <label class="item-name mr-2">running.commandLineArguments:</label>
                          </div>
                          <div v-if="ifConfigPropertyExists('running.flags')">
                            <label class="item-name mr-2">running.flags:</label>
                          </div>
                          <div v-if="ifConfigPropertyExists('running.mainClass')">
                            <label class="item-name mr-2">running.mainClass:</label>
                          </div>
                          <div v-if="ifConfigPropertyExists('running.executable')">
                            <label class="item-name mr-2">running.executable:</label>
                          </div>
                          <div v-if="ifConfigPropertyExists('running.entrypoint')">
                            <label class="item-name mr-2">running.entrypoint:</label>
                          </div>
                          <div v-if="ifConfigPropertyExists('running.intermediateFilesPattern')">
                            <label class="item-name mr-2">running.intermediateFilesPattern:</label>
                          </div>
                          <div v-if="ifConfigPropertyExists('resources.image')">
                            <label class="item-name mr-2">resources.image:</label>
                          </div>
                          <div v-if="ifConfigPropertyExists('resources.volume')">
                            <label class="item-name mr-2">resources.volume:</label>
                          </div>
                          <div v-if="ifConfigPropertyExists('resources.memory')">
                            <label class="item-name mr-2">resources.memory:</label>
                          </div>
                          <div v-if="ifConfigPropertyExists('resources.numCPUs')">
                            <label class="item-name mr-2">resources.numCPUs:</label>
                          </div>
                        </div>
                      </div>

                      <div v-else-if="showFile">
                        <div>
                            <label class="item-name mr-2" for="selectedFile.path">path: </label>
                            <input type="text" class="form-control" id="selectedFile.path" v-model="selectedFile.path">
                          </div>
                      </div>

                      <div v-else-if="showPart">
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
                      </div>

                      <div v-else-if="showParameter">
                        <div v-if="selectedParameter.metadata.guiType=='input_field'">
                          <div>
                            <label class="item-name mr-2" for="selectedParameter.metadata.name">name: </label>
                            <input type="text" class="form-control" id="selectedParameter.metadata.name" v-model="selectedParameter.metadata.name">
                          </div>
                          <div>
                            <label class="item-name mr-2" for="selectedParameter.metadata.type">type: </label>
                            <div class="dropdown form-group">
                              <select
                                class="form-control"
                                v-model="selectedParameter.metadata.type"
                              >
                                <option>number</option>
                                <option>text</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div v-if="selectedParameter.metadata.type">
                          <div>
                            <label class="item-name mr-2" for="selectedParameter.default">default value: </label>
                            <input v-if="selectedParameter.metadata.type == 'text'" type="text" class="form-control" id="selectedParameter.default" v-model="selectedParameter.default[0]">
                            <input v-else type="number" class="form-control" id="selectedParameter.default" v-model="selectedParameter.default[0]">
                          </div>
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

                        <div>
                          <label class="item-name mr-2" for="selectedParameter.validation">validation: </label>
                          <div class="dropdown form-group">
                            <select
                              class="form-control"
                              v-model="selectedParameter.validation"
                            >
                              <option value="onlyone">Only one option selectable</option>
                              <option value="minone">Set at min one value</option>
                              <option value="any" selected="selected">Any value is allowed</option>
                            </select>
                          </div>
                        </div>

                      </div>
                </div>
              </b-tab>
            </b-tabs>
          </b-card>
        </div>

        <div class="dnd-window">
          <drop class="top-copy" @drop="onFileDrop" :accepts-data="(file) => file  === 'file'">
            <div class="template" @click="openWindow($event, 'template', copied)">
              Files
              <div v-for="(file, index) in copied.files" :key="index">
                <drop class="copy" @drop="onPartDrop($event,file)" :accepts-data="(part) => part  === 'part'">
                  <div class="file" @click="openWindow($event, 'file', file)">
                    File
                    
                    <!--<div v-for="(part, index) in file.parts" :key="index">-->
                    <drop-list class="part-droplist" v-if="file.parts" :items="file.parts" @insert="onInsert($event, false, file)" @reorder="$event.apply(file.parts)" :accepts-data="(part) => false" :column="true">
                      <template v-slot:item="{item}"> 
                        <drag class="item part-drag" :key="item.identifier">           
                          <drop class="copy" @drop="onCopyDrop($event, item)" :accepts-data="(param) => ((param  === 'input_field' || param  === 'checkbox' || param  === 'slider')) && item.parameters">
                            <div class="part" @click="openWindow($event, 'part', item)">
                              Part

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
                                          <b-container class="param-container">
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
            </div>     
          </drop>
        </div>
      </div>
      {{copied}}
    </div>
  </div>
</template>

<script>
import { Drag, Drop, DropList } from "vue-easy-dnd";

// import Ace
import AceEditorComponent from "../../components/EditorComponent-Ace.vue"

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
      componentsFiles: ["file"],
      componentsFile: ["file", "part"], 
      componentsPart: ["file", "part", "input_field", "checkbox", "slider"],
      copied: {"identifier" : "", "version" : "3.0.0", "environment": "", "files": [], configuration: {}}, 
      preferences: true,
      selectedParameter: {},
      selectedPart: {},
      selectedFile: {},
      showTemplate: true,
      showFile: false,
      showPart: false, 
      showParam: false,
      showParameter: false,
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
    }
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
    onFileDrop() {
      let file = {
        "identifier" : this.uuid(), 
        "path" : "", 
        "parts": []
      };
      this.copied.files.push(file);
    },
    onPartDrop(e, file) {
      let part = {
        "identifier" : this.uuid(),
        "access" : "modifiable",
        "metadata" : {
          "name" : "",
        },
        "content" : ""
      }
      file.parts.push(part);
    },
    onCopyDrop(e, part) {
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
          "validation" : "any",
        };
      } else {
        parameter = { 
          "identifier" : this.uuid(), 
          "metadata" : { "guiType" : e.data}};
      }
      part.parameters.push(parameter);
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
    removeParameter: function(event, item) {
      event.stopPropagation();
      console.log(item);
      for (var file in this.copied.files) {
        for (var part in this.copied.files[file].parts) {
          var currentPart = this.copied.files[file].parts[part];
          for (var parameter in currentPart.parameters) {
            var currentParameter = currentPart.parameters[parameter];
            if (currentParameter.identifier === item.identifier) {
              delete this.copied.files[file].parts[part].parameters.splice(parameter, 1);
            }
          }
        }

      }
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
    updateContent: function (item, event) {
      //this.copied.files[fileIndex].parts[partIndex].content = event
      item.content = event;
    },
  },
  created() {
    
  },
  mounted() {
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
    width: 80%;
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

  .card-body {
    padding: 0 !important;
  }

  .param-droplist {
    width: 80%;
    margin: auto;
  }

  .part-droplist {
    margin: 20px auto 20px auto;
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

}
</style>