<template>
  <div class="csvplot-component border">
    <div class="plot-div">
      <Plotly
        ref="plot"
        :data="data"
        :layout="layout"
        :display-mode-bar="true"
        :to-image-button-options="imageConfig"
      ></Plotly>
    </div>
    <div v-if="csvs.length > 1" class="file-controller text-center">
      <div class="fixed-row-70 display-flex-center">
        <span> {{ fileIndex + 1 }}/{{ csvs.length }} </span>
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
    </div>
  </div>
</template>

<script>

import { Plotly } from '@rleys/vue-plotly-basic';
import plotlyjs from 'plotly.js';

import base64url from 'base64url';

export default {
  name: 'CsvPlot',
  components: {
    Plotly,
  },
  props: {
    areUrlsProp: Boolean,
    csvsProp: Array,
    datasetProp: Object,
    labelProp: Object,
  },
  data() {
    return {
      csvs: this.csvsProp, // this is bad! csvs will never get updated!!
      fileIndex: 0,
      data: [],
      layout: {
        title: '',
      },
      datasetList: [],
      imageConfig: {
        format: 'svg',
        filename: 'graph',
      },
      enableAutoPlay: false,
      interval: undefined,
    };
  },
  watch: {
    enableAutoPlay() {
      this.watchAutoPlayOrPause();
    },
    fileIndex() {
      if (this.areUrlsProp) {
        this.loadData(this);
      } else {
        this.loadBase64Data(this.csvs[this.fileIndex]);
      }
    },
  },
  mounted() {
    if (this.areUrlsProp) {
      this.loadData(this);
    } else {
      this.loadBase64Data(this.csvs[this.fileIndex]);
    }
  },
  methods: {
    // "http://localhost:8080/" + inputFile
    loadData(context) {
      // plotlyjs.d3.csv("https://raw.githubusercontent.com/plotly/datasets/master/2014_apple_stock.csv", function(data){
      // plotlyjs.d3.csv("http://localhost:8080/plotly-test.csv", function(data){
      plotlyjs.d3.csv(context.csvs[context.fileIndex], (data) => {
        context.processData(data);
      });
    },
    loadBase64Data(base64Data, delimiter = ',') {
      const decodedData = base64url.decode(base64Data);
      // get header: slice first line of first string and split by delimiter
      const headers = decodedData.slice(0, decodedData.indexOf('\n')).split(delimiter);
      // slice the rest of the string at line endings (\n)
      const splitrows = decodedData.slice(decodedData.indexOf('\n') + 1).split('\n');
      // filter empty rows
      const rows = splitrows.filter((n) => n);
      // map the row-values to the header to create header:value type entries
      const data = rows.map((row) => {
        const values = row.split(delimiter);
        return headers.reduce((object, header, index) => {
          const newObject = object;
          newObject[header] = values[index];
          return newObject;
        }, {});
      });
      this.processData(data);
    },
    processData(data) {
      const traces = [];

      // create an object, where there is an array for each column name
      const obj = [];
      const keys = Object.keys(data[0]);
      keys.forEach((element) => { obj[element] = []; });
      // fill the object with the data depending on the keys (column names)
      for (let i = 0; i < data.length; i += 1) {
        const row = data[i];
        keys.forEach((element) => obj[element].push(row[element]));
      }

      let xkey = keys[0];
      if (this.labelProp.key !== undefined) {
        if (keys[0] !== this.labelProp.key) {
          xkey = this.labelProp.key;
        }
      }

      // multiply x-axis by factor if given
      if (this.labelProp.factor !== undefined) {
        for (let j = 0; j < obj[(xkey)].length; j += 1) {
          obj[(xkey)][j] *= this.labelProp.factor;
        }
      }
      const xKeyIndex = keys.indexOf(xkey);
      if (xKeyIndex > -1) {
        keys.splice(xKeyIndex, 1);
      }
      // create traces to be rendered later; the first column is always x; the others are ys
      for (let k = 0; k < keys.length; k += 1) {
        if (this.datasetProp.key) {
          // multiply y-axis by factor if given
          if (keys[k] === this.datasetProp.key || this.datasetProp.key.includes(keys[k])) {
            if (this.datasetProp.factor !== undefined) {
              for (let j = 0; j < obj[(xkey)].length; j += 1) {
                obj[(keys[k])][j] *= this.datasetProp.factor;
              }
            }
            const trace = {
              x: obj[(xkey)],
              y: obj[(keys[k])],
              name: (typeof this.datasetProp.key === 'string') ? this.datasetProp.label : keys[k],
            };
            traces.push(trace);
          }
        } else {
          const trace = {
            x: obj[(xkey)],
            y: obj[(keys[k])],
            name: keys[k],
          };
          traces.push(trace);
        }
      }

      // set x-Axis label and title
      // TODO: allow title in metadata? (id in dumux web-app)
      let title = 'Graph';
      if (this.areUrlsProp) {
        let startIndex = this.csvs[this.fileIndex].lastIndexOf('/');
        startIndex = (startIndex !== -1) ? startIndex : 0;
        let endIndex = this.csvs[this.fileIndex].lastIndexOf('?');
        endIndex = (endIndex !== -1) ? endIndex : this.csvs[this.fileIndex].length;
        title = this.csvs[this.fileIndex].substring(startIndex + 1, endIndex);
      }

      const xformat = (this.labelProp.format) ? this.labelProp.format : '.1f';
      const yformat = (this.datasetProp.format) ? this.datasetProp.format : '.1f';
      const ytext = this.datasetProp.label || ((keys.length <= 2) ? keys[1] : '');

      this.layout = {
        title,
        xaxis: {
          title: {
            text: this.labelProp.label || xkey,
          },
          tickformat: xformat,
        },
        yaxis: {
          title: {
            text: ytext,
          },
          tickformat: yformat,
        },
      };

      this.fillPlotWithData(traces);
    },
    fillPlotWithData(traces) {
      this.data = traces;
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
    decreaseFileIndex() {
      this.fileIndex = Math.max(this.fileIndex - 1, 0);
      return this.fileIndex;
    },
    increaseFileIndex() {
      this.fileIndex = Math.min(this.fileIndex + 1, this.csvs.length - 1);
      return this.fileIndex;
    },
    resetFileIndex() {
      this.fileIndex = 0;
      return this.fileIndex;
    },
    setMaxFileIndex() {
      this.fileIndex = this.csvs.length - 1;
      return this.fileIndex;
    },
    setEnableAutoPlay() {
      this.enableAutoPlay = !this.enableAutoPlay;
      return this.enableAutoPlay;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.csvplot-component {
  border-radius: calc(0.25rem - 1px);
}

.file-controller {
  min-height: 66px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #ffffff;
}

.fixed-row-70 {
  flex-grow: 0;
  flex-shrink: 0;
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
</style>
