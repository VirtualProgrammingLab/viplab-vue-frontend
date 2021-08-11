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
        plotlyjs.d3.csv("https://raw.githubusercontent.com/plotly/datasets/master/2014_apple_stock.csv", function(data){ 
            context.processData(data);
        });
    },
    processData: function(data) {
        console.log(data);
        var x = [], y = [];

        // TODO: Wie heißen die Spalten und sind es immer nur zwei?
        for (var i=0; i<data.length; i++) {
            let row = data[i];
            x.push( row['AAPL_x'] );
            y.push( row['AAPL_y'] );
        }
        //console.log('X',x, 'Y',y);
        this.fillPlotWithData(x, y);
    },
    fillPlotWithData: function(x, y) {
        this.data = [
            {
                x: x,
                y: y
            }
        ];
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>