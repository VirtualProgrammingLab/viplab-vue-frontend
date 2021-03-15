<template>
  <div class="slider-component">
    <div class ="item-name">{{item.metadata.name}}:</div>
    <div v-if="vModel[parent_index].length > 1">
        <vue-slider multiple v-model="vModel[parent_index]" :min="item.min" :max="item.max" :interval="item.step" :direction="sliderDirection(item)" style="height: 300px;[item.metadata.vertical ? {'height': '300px'} : {}]"></vue-slider>
    </div>
    <div v-else>
        <vue-slider v-model="vModel[parent_index]" :min="item.min" :max="item.max" :interval="item.step" :direction="sliderDirection(item)" :style="[item.metadata.vertical ? {'height': '300px'} : {}]"></vue-slider>
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
    v_model_var: Array
  }, 
  data() {
    return {
      vModel: this.v_model_var  
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