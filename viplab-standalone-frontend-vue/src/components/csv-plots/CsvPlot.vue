<template>
  <div class="2dplot-component border">
    <div class="plot-div">
      <Plotly
        ref="plot"
        :data="data"
        :layout="layout"
        :display-mode-bar="true"
        :to-image-button-options="imageConfig"
      ></Plotly>
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
  data() {
    return {
      data: [],
      layout: {
        title: "My graph",
      },
      datasetList: [],
      imageConfig: {
        format: "svg",
        filename: "graph",
      },
    };
  },
  mounted() {
    this.loadData(this);
  },
  methods: {
    //"http://localhost:8080/" + inputFile
    loadData: function(context) {
        //plotlyjs.d3.csv("https://raw.githubusercontent.com/plotly/datasets/master/2014_apple_stock.csv", function(data){ 
        plotlyjs.d3.csv("http://localhost:8080/plotly-test.csv", function(data){ 
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
            y: obj[(keys[k])]
          }
          traces.push(trace);
        }

        this.fillPlotWithData(traces);
    },
    fillPlotWithData: function(traces) {
        this.data = traces;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>