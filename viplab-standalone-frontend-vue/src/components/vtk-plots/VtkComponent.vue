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

      <div class="file-controller text-center">
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
          <b-button btn-variant="white" @click="download($event)">
            <font-awesome-icon icon="download" />
          </b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VueSlider from "vue-slider-component";
import "vue-slider-component/theme/default.css";

import "vtk.js/Sources/Rendering/Profiles/Geometry";

import vtkFullScreenRenderWindow from "vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow";
import vtkActor from "vtk.js/Sources/Rendering/Core/Actor";
import vtkMapper from "vtk.js/Sources/Rendering/Core/Mapper";
import vtkColorTransferFunction from "vtk.js/Sources/Rendering/Core/ColorTransferFunction";

import {
  ColorMode,
  ScalarMode,
} from "vtk.js/Sources/Rendering/Core/Mapper/Constants";
import vtkColorMaps from "vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps";

// Force the loading of HttpDataAccessHelper to support gzip decompression
// import "vtk.js/Sources/IO/Core/DataAccessHelper/HttpDataAccessHelper";

// IO
import vtkITKPolyDataReader from "vtk.js/Sources/IO/Misc/ITKPolyDataReader";
import readPolyDataArrayBuffer from "itk/readPolyDataArrayBuffer.js";

export default {
  name: "VtkComponent",
  components: {
    VueSlider,
  },
  props: {
    //files: Array
  },
  data() {
    return {
      files: [
        "triangle_mesh_linear.vtu",
        "case1_single_onep_fracture_mpfa_0-00000.vtu",
        "vtp-test.vtp",
        "earth.vtp",
        "cow.vtp",
      ],
      fileIndex: 0,
      fullScreenRenderer: Object,
      renderer: Object,
      renderWindow: Object,
      actor: Object,
      representation: "1:2:0",
      representationOptions: [
        {
          label: "Wireframe",
          value: "1:1:0",
        },
        {
          label: "Surface",
          value: "1:2:0",
        },
        {
          label: "Surface with Edges",
          value: "1:2:1",
        },
      ],
      opacityVModel: "100",
      color: ":",
      colorByOptions: [
        {
          value: ":",
          label: "Solid color",
        },
      ],
      mapper: Object,
      source: Object,
      dataRange: Array,
      lookupTable: Object,
      enableAutoPlay: false,
      interval: undefined,
    };
  },
  watch: {
    enableAutoPlay() {
      this.watchAutoPlayOrPause();
    },
    fileIndex(newValue, oldValue) {
      console.log(oldValue + " " + newValue);
      this.renderNewFile();

      // reset v-model values for upper form
      this.representation = "1:2:0";
      this.color = ":";
      this.opacityVModel = "100";
    },
  },
  methods: {
    // set onchange hooks
    representationOnChange: function (event) {
      const representation = event.target.value;

      // apply representation
      const [visibility, repr, edgeVisibility] = representation
        .split(":")
        .map(Number);
      this.actor.getProperty().setRepresentation(repr);
      this.actor.getProperty().setEdgeVisibility(edgeVisibility);
      this.actor.setVisibility(!!visibility);

      this.renderWindow.render();
    },
    opacitySliderOnChange: function (value) {
      const opacity = Number(value) / 100;

      //apply opacity
      this.actor.getProperty().setOpacity(opacity);

      this.renderWindow.render();
    },
    handleColorByOnChange: function (event) {
      const color = event.target.value;

      const mapperConfig = this.getMapperConfig(color);
      this.mapper.set(mapperConfig);
      this.applyPreset();

      this.renderWindow.render();
    },
    getMapperConfig: function (value) {
      const [location, colorByArrayName] = value.split(":");
      const interpolateScalarsBeforeMapping = location === "PointData";
      let colorMode = ColorMode.DEFAULT;
      let scalarMode = ScalarMode.DEFAULT;
      const scalarVisibility = location.length > 0;
      if (scalarVisibility) {
        const dataArray =
          this.source[`get${location}`]().getArrayByName(colorByArrayName);
        const newDataRange = dataArray.getRange();
        this.dataRange[0] = newDataRange[0];
        this.dataRange[1] = newDataRange[1];
        colorMode = ColorMode.MAP_SCALARS;
        scalarMode =
          location === "PointData"
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
    applyPreset: function () {
      const defaultLutName = "erdc_rainbow_bright";
      const preset = vtkColorMaps.getPresetByName(defaultLutName);
      this.lookupTable.applyColorMap(preset);
      this.lookupTable.setMappingRange(this.dataRange[0], this.dataRange[1]);
      this.lookupTable.updateRange();
    },
    decreaseFileIndex: function () {
      this.fileIndex = Math.max(this.fileIndex - 1, 0);
      return this.fileIndex;
    },
    increaseFileIndex: function () {
      this.fileIndex = Math.min(this.fileIndex + 1, this.files.length - 1);
      return this.fileIndex;
    },
    resetFileIndex: function () {
      this.fileIndex = 0;
      return this.fileIndex;
    },
    setMaxFileIndex: function () {
      this.fileIndex = this.files.length - 1;
      return this.fileIndex;
    },
    setEnableAutoPlay: function () {
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
      const inputFile = this.files[this.fileIndex];

      // initialize buffer for the ITK reader
      vtkITKPolyDataReader.setReadPolyDataArrayBufferFromITK(
        readPolyDataArrayBuffer
      );

      let myRequest = new Request("http://localhost:8080/" + inputFile);

      const reader = await fetch(myRequest)
        .then(function (response) {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.blob();
        })
        .then(function (response) {
          const readRawData = ({ fileName, data }) => {
            return new Promise((resolve, reject) => {
              const sourceType = null;
              const reader = vtkITKPolyDataReader.newInstance();
              reader.setFileName(fileName);
              try {
                const ds = reader.parseAsArrayBuffer(data);
                Promise.resolve(ds)
                  .then((dataset) =>
                    resolve({ dataset, reader, sourceType, name: fileName })
                  )
                  .catch(reject);
              } catch (e) {
                reject(e);
              }
            });
          };

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

      this.applyPreset();

      this.colorByOptions = [{ value: ":", label: "Solid color" }].concat(
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
          }))
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
    },
    watchAutoPlayOrPause: function () {
      if (this.enableAutoPlay) {
        this.interval = setInterval(function() {
          this.increaseFileIndex();
        }.bind(this), 1000);
      } else {
        clearInterval(this.interval);
      }
    },
    async download(event) {
      console.log(event);
      event.preventDefault();

      //TODO: Unterscheidung: files in content als Base64 => so wie hier
      //    über S3 einfach diese URL zurück geben
      //generate objectUrl of blob of the currently displayed file
      const inputFile = this.files[this.fileIndex];
      let myRequest = new Request("http://localhost:8080/" + inputFile);
      const blob = await fetch(myRequest)
        .then(function (response) {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.blob();
        })
        .then(function (myBlob) {
          var objectURL = URL.createObjectURL(myBlob);
          return objectURL.toString();
        });

      // set target url of button and redirect to url for download
      event.target.href = blob;
      location.href = event.target.href;
    },
  },
  async mounted() {
    await this.renderFile(this);
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