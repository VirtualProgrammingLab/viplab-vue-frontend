<template>
  <div class="inputfield-component">
    <div v-if="item.type=='text'">
        <label class="item-name mr-2" for="item.name">{{ item.name }}: </label>
        <input type="text" class="form-control" id="item.name" name="item.name" :maxlength="item.maxlength" v-model="$parent.form_v_model[parent_index]">
    </div>
    <div v-if="item.type=='number'">
        <label class="item-name mr-2" for="item.name">{{ item.name }}: </label>
        <input type="number" class="form-control" id="item.name" name="item.name" :max="item.max" :min="item.min" :step="item.step" v-model="$parent.form_v_model[parent_index]">
    </div>
  </div>
</template>

<script>
export default {
  name: 'InputField',
  props: {
    item: Object,
    parent_index: Number
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>