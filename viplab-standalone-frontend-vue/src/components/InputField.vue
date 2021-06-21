<template>
  <div class="inputfield-component">
    <div v-if="input.metadata.type=='text'">
        <label class="item-name mr-2" for="input.metadata.name">{{ input.metadata.name }}: </label>
        <input type="text" class="form-control" id="input.metadata.name" name="input.metadata.name" :maxlength="input.maxlength" v-model="input.value">
    </div>
    <div v-if="input.metadata.type=='number'">
        <label class="item-name mr-2" for="input.metadata.name">{{ input.metadata.name }}: </label>
        <input type="number" class="form-control" id="input.metadata.name" name="input.metadata.name" :max="input.max" :min="input.min" :step="input.step" v-model="input.value" :state="true">
    </div>
  </div>
</template>

<script>
export default {
  name: 'InputField',
  props: {
    item: Object,
    parent_index: Number
  }, 
  data() {
    return {
      input: this.item  
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>