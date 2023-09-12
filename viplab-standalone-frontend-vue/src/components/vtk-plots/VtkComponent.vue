<template>
  <div id="vtk-content">
    <div class="vtk-viewer" ref="rootContainer">
      <div class="vtk-geometry-controls">
        <div class="geometry-control-group">
          <select
            name="select-geometry"
            v-model="representation"
            @change="representationOnChange($event)"
          >
            <option
              v-for="(item, index) in representationOptions"
              :key="'select-geometry: ' + index"
              :value="item.value"
            >
              {{ item.label }}
            </option>
          </select>
        </div>
        <div class="geometry-control-group with-padding">
          <vue-slider
            name="opacitySelector"
            class="opacity-slider"
            label="Opacity"
            :min="0"
            :max="100"
            :value="100"
            :interval="1"
            v-model="opacityVModel"
            @change="opacitySliderOnChange($event)"
          />
        </div>
        <div class="geometry-control-group">
          <select
            name="select-color"
            v-model="color"
            @change="handleColorByOnChange($event)"
          >
            <option
              v-for="(item, index) in colorByOptions"
              :key="'select-color: ' + index"
              :value="item.value"
            >
              {{ item.label }}
            </option>
          </select>
        </div>
      </div>

      <div ref="container"></div>

      <div v-if="files.length > 1" class="file-controller text-center">
        <div class="fixed-row-70 display-flex-center">
          <span> {{ fileIndex + 1 }}/{{ files.length }} </span>
        </div>
        <b-button-group>
          <b-button btn-variant="white" @click="resetFileIndex">
            <font-awesome-icon icon="fast-backward" />
          </b-button>
          <b-button btn-variant="white" @click="decreaseFileIndex">
            <font-awesome-icon icon="backward" />
          </b-button>
          <b-button btn-variant="white" @click="setEnableAutoPlay">
            <font-awesome-icon v-if="enableAutoPlay" icon="pause" />
            <font-awesome-icon v-else icon="play" />
          </b-button>
          <b-button btn-variant="white" @click="increaseFileIndex">
            <font-awesome-icon icon="forward" />
          </b-button>
          <b-button btn-variant="white" @click="setMaxFileIndex">
            <font-awesome-icon icon="fast-forward" />
          </b-button>
        </b-button-group>
        <div class="fixed-row-70 display-flex-center">
          <a :href="downloadURL" download>
            <b-button btn-variant="white">
              <font-awesome-icon icon="download" />
            </b-button>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';

import 'vtk.js/Sources/Rendering/Profiles/Geometry';

import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';

import {
  ColorMode,
  ScalarMode,
} from 'vtk.js/Sources/Rendering/Core/Mapper/Constants';
import vtkColorMaps from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps';

// Force the loading of HttpDataAccessHelper to support gzip decompression
// import "vtk.js/Sources/IO/Core/DataAccessHelper/HttpDataAccessHelper";

// IO
import vtkITKPolyDataReader from 'vtk.js/Sources/IO/Misc/ITKPolyDataReader';
import readPolyDataArrayBuffer from 'itk/readPolyDataArrayBuffer';

import itkConfig from 'itk/itkConfig';

export default {
  name: 'VtkComponent',
  components: {
    VueSlider,
  },
  props: {
    propFiles: Array,
  },
  data() {
    return {
      files: this.propFiles,
      fileIndex: 0,
      fullScreenRenderer: Object,
      renderer: Object,
      renderWindow: Object,
      actor: Object,
      representation: '1:2:0',
      representationOptions: [
        {
          label: 'Wireframe',
          value: '1:1:0',
        },
        {
          label: 'Surface',
          value: '1:2:0',
        },
        {
          label: 'Surface with Edges',
          value: '1:2:1',
        },
      ],
      opacityVModel: '100',
      color: ':',
      colorByOptions: [
        {
          value: ':',
          label: 'Solid color',
        },
      ],
      mapper: Object,
      source: Object,
      dataRange: Array,
      lookupTable: Object,
      enableAutoPlay: false,
      interval: undefined,
      latestRepresentationEvent: null,
      latestOpacityEvent: null,
      latestColorEvent: null,
      downloadURL: null,
    };
  },
  watch: {
    enableAutoPlay() {
      this.watchAutoPlayOrPause();
    },
    fileIndex() {
      this.renderNewFile();

      // reset v-model values for upper form
      /* this.representation = "1:2:0";
      this.color = ":";
      this.opacityVModel = "100"; */
    },
  },
  methods: {
    // set onchange hooks
    representationOnChange(event) {
      this.latestRepresentationEvent = event;
      const representation = event.target.value;

      // apply representation
      const [visibility, repr, edgeVisibility] = representation
        .split(':')
        .map(Number);
      this.actor.getProperty().setRepresentation(repr);
      this.actor.getProperty().setEdgeVisibility(edgeVisibility);
      this.actor.setVisibility(!!visibility);

      this.renderWindow.render();
    },
    opacitySliderOnChange(value) {
      this.latestOpacityEvent = value;
      const opacity = Number(value) / 100;

      // apply opacity
      this.actor.getProperty().setOpacity(opacity);

      this.renderWindow.render();
    },
    handleColorByOnChange(event) {
      this.latestColorEvent = event;
      const color = event.target.value;
      const mapperConfig = this.getMapperConfig(color);
      // console.log(mapperConfig);
      this.mapper.set(mapperConfig);
      this.mapper.setLookupTable(this.lookupTable);
      this.applyPreset();

      this.renderWindow.render();
    },
    getMapperConfig(value) {
      const [location, colorByArrayName] = value.split(':');
      // console.log(location);
      const interpolateScalarsBeforeMapping = location === 'PointData';
      let colorMode = ColorMode.DEFAULT;
      let scalarMode = ScalarMode.DEFAULT;
      const scalarVisibility = location.length > 0;
      if (scalarVisibility) {
        const dataArray = this.source[`get${location}`]().getArrayByName(colorByArrayName);
        const newDataRange = dataArray.getRange();
        // console.log(newDataRange);
        this.dataRange[0] = newDataRange.at(0);
        this.dataRange[1] = newDataRange.at(1);
        colorMode = ColorMode.MAP_SCALARS;
        scalarMode = location === 'PointData'
          ? ScalarMode.USE_POINT_FIELD_DATA
          : ScalarMode.USE_CELL_FIELD_DATA;
      }

      return {
        colorByArrayName,
        colorMode,
        interpolateScalarsBeforeMapping,
        scalarMode,
        scalarVisibility,
      };
    },
    applyPreset() {
      const defaultLutName = 'erdc_rainbow_bright';
      const preset = vtkColorMaps.getPresetByName(defaultLutName);
      this.lookupTable.applyColorMap(preset);
      this.lookupTable.setMappingRange(this.dataRange[0], this.dataRange[1]);
      this.lookupTable.updateRange();
      // console.log(this.lookupTable);
    },
    decreaseFileIndex() {
      this.fileIndex = Math.max(this.fileIndex - 1, 0);
      return this.fileIndex;
    },
    increaseFileIndex() {
      this.fileIndex = Math.min(this.fileIndex + 1, this.files.length - 1);
      return this.fileIndex;
    },
    resetFileIndex() {
      this.fileIndex = 0;
      return this.fileIndex;
    },
    setMaxFileIndex() {
      this.fileIndex = this.files.length - 1;
      return this.fileIndex;
    },
    setEnableAutoPlay() {
      this.enableAutoPlay = !this.enableAutoPlay;
      return this.enableAutoPlay;
    },
    async renderFile() {
      this.fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
        background: [0.4, 0.44, 0.52],
        rootContainer: this.$refs.rootContainer,
        container: this.$refs.container,
      });
      this.renderer = this.fullScreenRenderer.getRenderer();
      this.renderWindow = this.fullScreenRenderer.getRenderWindow();

      this.renderNewFile();
    },
    async renderNewFile() {
      const inputFileUrl = this.files[this.fileIndex];

      const url = new URL(inputFileUrl).pathname;
      const lastIndex = url.lastIndexOf('/');
      const inputFile = url.substr(lastIndex + 1);

      // initialize buffer for the ITK reader
      vtkITKPolyDataReader.setReadPolyDataArrayBufferFromITK(
        readPolyDataArrayBuffer,
      );

      // let myRequest = new Request("http://localhost:8080/" + inputFile);
      const myRequest = new Request(inputFileUrl);
      // let myRequest = new Request("http://localhost:8080/cow.vtp");

      const reader = await fetch(myRequest, {
        method: 'GET',
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.blob();
        })
        .then((response) => {
          const readRawData = ({ fileName: rawFileName, data }) => new Promise((resolve, reject) => {
            const sourceType = null;
            const vtkReader = vtkITKPolyDataReader.newInstance();

            // if file was fetched from a blob-url (created from base64-content, in App.vue), get filename from File-response-object
            const fileName = (!rawFileName.endsWith('.vtu') && !rawFileName.endsWith('.vtp')) ? response.name : rawFileName;
            vtkReader.setFileName(fileName);
            try {
              const ds = vtkReader.parseAsArrayBuffer(data);
              Promise.resolve(ds)
                .then((dataset) => resolve({
                  dataset, reader: vtkReader, sourceType, name: fileName,
                }))
                .catch(reject);
            } catch (e) {
              reject(e);
            }
          });

          return new Promise((resolve, reject) => {
            const io = new FileReader();
            io.onload = function onLoad() {
              readRawData({ fileName: inputFile, data: io.result })
                .then((result) => resolve(result))
                .catch((error) => reject(error));
            };
            io.readAsArrayBuffer(response);
          });
        })
        .then((response) => {
          this.renderer.resetCamera();
          this.renderWindow.render();
          return response.reader;
        });

      this.lookupTable = vtkColorTransferFunction.newInstance();

      this.source = reader.getOutputData();
      const scalars = this.source.getPointData().getScalars();
      this.dataRange = [].concat(scalars ? scalars.getRange() : [0, 1]);

      this.downloadURL = inputFileUrl;
      this.applyPreset();

      this.colorByOptions = [{ value: ':', label: 'Solid color' }].concat(
        this.source
          .getPointData()
          .getArrays()
          .map((a) => ({
            label: `(p) ${a.getName()}`,
            value: `PointData:${a.getName()}`,
          })),
        this.source
          .getCellData()
          .getArrays()
          .map((a) => ({
            label: `(c) ${a.getName()}`,
            value: `CellData:${a.getName()}`,
          })),
      );

      const table = this.lookupTable;
      this.mapper = vtkMapper.newInstance({
        interpolateScalarsBeforeMapping: false,
        useLookupTableScalarRange: true,
        table,
        scalarVisibility: false,
      });
      this.mapper.setInputConnection(reader.getOutputPort());

      this.actor = vtkActor.newInstance();
      this.actor.setMapper(this.mapper);

      this.renderer.removeAllActors();
      this.renderer.addActor(this.actor);

      this.renderer.resetCamera();
      this.renderWindow.render();

      // set color, representation, opacity in case it was already set on another connected file
      if (this.latestRepresentationEvent != null) {
        this.representationOnChange(this.latestRepresentationEvent);
      }
      if (this.latestOpacityEvent != null) {
        this.opacitySliderOnChange(this.latestOpacityEvent);
      }
      if (this.latestColorEvent != null) {
        this.handleColorByOnChange(this.latestColorEvent);
      }
    },
    watchAutoPlayOrPause() {
      if (this.enableAutoPlay) {
        this.interval = setInterval(() => {
          this.increaseFileIndex();
        }, 1000);
      } else {
        clearInterval(this.interval);
      }
    },
  },
  async mounted() {
    // console.log("vtk-component mounted");
    await this.renderFile(this);
  },
  beforeCreate() {
    // TODO: Is there a better solution for this?
    // before creation change the path of the itk modules such that they can be moved to the dist/js-folder upon build
    itkConfig.itkModulesPath = this.$config.ITK_PATH;
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#vtk-content {
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  align-items: stretch;
  justify-content: flex-start;
  flex-grow: 1;
  padding: 0;
  overflow: hidden;
  border-radius: calc(0.25rem - 1px);
}

.file-controller {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  min-height: 66px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #ffffff;
}

.fixed-row-70 {
  flex-basis: 90px;
  flex-grow: 0;
  flex-shrink: 0;
}

.vtk-geometry-controls {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  min-height: 66px;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1.5rem;
  background: rgba(0, 0, 0, 0.15);
}

.geometry-control-group {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

div.btn-group {
  margin: 0 auto;
  text-align: center;
  width: 100%;
  display: inline-block;
}

div.btn-group > .btn {
  margin: 0 0 1px 1px;
}

.geometry-control-group .form-group {
  margin-bottom: 0;
  flex-grow: 1;
}

.with-padding {
  padding: 0 18px;
}

.opacity-slider {
  width: 100% !important;
}
</style>
