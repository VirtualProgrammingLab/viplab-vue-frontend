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
    <div class="file-controller text-center">
      <div class="fixed-row-70 display-flex-center">
        <span> {{ fileIndex + 1 }}/{{ urls.length }} </span>
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

import { Plotly } from "vue-plotly";
import plotlyjs from "plotly.js";

export default {
  name: "CsvPlot",
  components: {
    Plotly,
  },
  props: {
    urlsProp: Array
  },
  data() {
    return {
      urls: this.urlsProp,
      fileIndex: 0,
      data: [],
      layout: {
        title: "",
      },
      datasetList: [],
      imageConfig: {
        format: "svg",
        filename: "graph",
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
      this.loadData(this);
    },
  },
  mounted() {
    this.loadData(this);
  },
  methods: {
    //"http://localhost:8080/" + inputFile
    loadData: function(context) {
        //plotlyjs.d3.csv("https://raw.githubusercontent.com/plotly/datasets/master/2014_apple_stock.csv", function(data){ 
        //plotlyjs.d3.csv("http://localhost:8080/plotly-test.csv", function(data){ 
        plotlyjs.d3.csv(context.urls[context.fileIndex], function(data){   
          context.processData(data);
        });
    },
    processData: function(data) {
        var traces = [];

        // create an object, where there is an array for each column name
        var obj = []
        var keys = Object.keys(data[0]);
        keys.forEach(element => obj[element] = []);

        // fill the object with the data depending on the keys (column names)
        for (var i=0; i<data.length; i++) {
          let row = data[i];
          keys.forEach(element => obj[element].push(row[element]));
        }

        // create traces to be rendered later; the first column is always x; the others are ys
        for (var k = 1; k < keys.length; k++) {
          var trace = {
            x: obj[(keys[0])],
            y: obj[(keys[k])],
            name: keys[k]
          }
          traces.push(trace);
        }

        // set x-Axis label and title
        let lastIndex = this.urls[this.fileIndex].lastIndexOf('/');
        let title = this.urls[this.fileIndex].substr(lastIndex + 1, this.urls[this.fileIndex].length);
        this.layout = {
          title: title,
          xaxis: {
            title: {
              text: keys[0]
            }
          }
        }

        this.fillPlotWithData(traces);
    },
    fillPlotWithData: function(traces) {
        this.data = traces;
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
    decreaseFileIndex: function () {
      this.fileIndex = Math.max(this.fileIndex - 1, 0);
      return this.fileIndex;
    },
    increaseFileIndex: function () {
      this.fileIndex = Math.min(this.fileIndex + 1, this.urls.length - 1);
      return this.fileIndex;
    },
    resetFileIndex: function () {
      this.fileIndex = 0;
      return this.fileIndex;
    },
    setMaxFileIndex: function () {
      this.fileIndex = this.urls.length - 1;
      return this.fileIndex;
    },
    setEnableAutoPlay: function () {
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