<template>
  <div class="checkbox-component">
    <div class ="item-name">{{item.name}}:</div>
    <div class="checkbox form-check custom-control custom-checkbox" v-for="(check, index) in item.values" :key=index>
        <input type="checkbox" class="form-check-input custom-control-input" :id="index" :value="check" checked v-model="vModel[parent_index][index]">
        <label class="form-check-label custom-control-label" :for="index">{{ check }}</label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CheckBox',
  props: {
    item: Object,
    parent_index: Number, 
    v_model_var: Array
  },
  data() {
    return {
      vModel: this.v_model_var  
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>