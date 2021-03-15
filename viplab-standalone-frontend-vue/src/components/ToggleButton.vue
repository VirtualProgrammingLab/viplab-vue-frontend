<template>
  <div class="togglebutton-component">
    <div class ="item-name">{{item.metadata.name}}:</div>
        <div v-for="(toggle, index) in item.values" :key="'toggle'+parent_index + ' ' +index">
        <label>
            {{ toggle.value }}
            <input type="checkbox" :value="toggle.value" v-model="vModel[parent_index][index]">
            <span class="slider"></span>
        </label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ToggleButton',
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