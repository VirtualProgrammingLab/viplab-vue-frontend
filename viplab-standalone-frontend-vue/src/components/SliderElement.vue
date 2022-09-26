<template>
  <div class="slider-component">
    <div class ="item-name">{{slider.metadata.name}}:</div>
    <div v-if="slider.value.length > 1" :class="slider.metadata.vertical? 'mt-3' : 'mt-5'">
        <vue-slider v-model="vModel" :min="slider.min" :max="slider.max" :interval="slider.step" :direction="sliderDirection(slider)" style="height: 300px;[slider.metadata.vertical ? {'height': '300px'} : {}]" tooltip="always" :tooltipPlacement="slider.metadata.vertical? 'right' : 'top'" :order="false"></vue-slider>
    </div>
    <div v-else :class="slider.metadata.vertical? 'mt-3' : 'mt-5'">
        <vue-slider v-model="vModel" :min="slider.min" :max="slider.max" :interval="slider.step" :direction="sliderDirection(slider)" :style="[slider.metadata.vertical ? {'height': '300px'} : {}]" tooltip="always" :tooltipPlacement="slider.metadata.vertical? 'right' : 'top'"></vue-slider>
    </div>
  </div>
</template>

<script>
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';

export default {
  components: {
    VueSlider
  },
  name: 'SliderElement',
  props: {
    item: Object,
    parent_index: Number,
  }, 
  computed: {
    vModel: {
      get: function () {
        return this.item.value;
      },
      set: function (val) {
        this.$set(this.item , "value", val);
        this.$forceUpdate();
        return this.vModel;
      }
    },
  },
  data() {
    return {
      slider: this.item
    }
  },
  methods: {
    /** parse slider direction for the usage in the vue-slider */
    sliderDirection: function(sliderItem){
      if(sliderItem.metadata.vertical){
        return "ttb";
      }
    return "ltr";
    }, 
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>