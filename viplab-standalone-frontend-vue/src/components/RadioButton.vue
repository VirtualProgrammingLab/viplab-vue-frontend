<template>
  <div class="radiobutton-component">
    <div class ="item-name">{{item.metadata.name}}:</div>
    <div class="radiobutton form-check custom-control custom-radio" v-for="(radio, index) in item.values" :key="'Radio' + parent_index + ' ' +index">
        <div v-if="radio.disabled">
          <input class="form-check-input custom-control-input" type="radio" :id="'RadioDis' + parent_index + ' ' +index" disabled :value="radio.value" v-model="vModel[parent_index]">
          <label class="form-check-label custom-control-label" for="'RadioDis' + parent_index + ' ' +index">{{ radio.value }}</label>
        </div>
        <div v-else>
          <input class="form-check-input custom-control-input" type="radio" :id="'Radio' + parent_index + ' ' +index" :value="radio.value" v-model="vModel[parent_index]">
          <label class="form-check-label custom-control-label" :for="'Radio' + parent_index + ' ' +index">{{ radio.value }}</label>        
        </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RadioButton',
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
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>