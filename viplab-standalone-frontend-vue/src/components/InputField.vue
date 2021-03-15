<template>
  <div class="inputfield-component">
    <div v-if="item.metadata.type=='text'">
        <label class="item-name mr-2" for="item.metadata.name">{{ item.metadata.name }}: </label>
        <input type="text" class="form-control" id="item.metadata.name" name="item.metadata.name" :maxlength="item.maxlength" v-model="vModel[parent_index]">
    </div>
    <div v-if="item.metadata.type=='number'">
        <label class="item-name mr-2" for="item.metadata.name">{{ item.metadata.name }}: </label>
        <input type="number" class="form-control" id="item.metadata.name" name="item.metadata.name" :max="item.max" :min="item.min" :step="item.step" v-model="vModel[parent_index]">
    </div>
  </div>
</template>

<script>
export default {
  name: 'InputField',
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