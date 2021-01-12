<template>
  <div class="togglebutton-component">
    <div class ="item-name">{{item.name}}:</div>
        <div v-for="(toggle, index) in item.values" :key="'toggle'+parent_index + ' ' +index">
        <label>
            {{ toggle }}
            <input type="checkbox" :value="toggle" v-model="$parent.form_v_model[parent_index][index]">
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
    parent_index: Number
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>