<template>
  <div class="checkbox-component">
    <div class ="item-name">{{item.metadata.name}}:</div>
    <div class="checkbox form-check custom-control custom-checkbox" v-for="(check, index) in item.values" :key=index>
        <input type="checkbox" class="form-check-input custom-control-input" :id="index" :value="check.value"  v-model="vModel[parent_index]">
        <label class="form-check-label custom-control-label" :for="index">{{ check.value }}</label>
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