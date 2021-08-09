<template>
  <div class="checkbox-component">
    <div class="item-name">{{ checkbox.metadata.name }}:</div>
    <div
      class="checkbox form-check custom-control custom-checkbox"
      v-for="(check, index) in checkbox.options"
      :key="index"
    >
      <input
        type="checkbox"
        class="form-check-input custom-control-input"
        :id="index"
        :value="check.value"
        v-model="vModel"
      />
      <label class="form-check-label custom-control-label" :for="index">{{
        check.value
      }}</label>
    </div>
  </div>
</template>

<script>
export default {
  name: "CheckBox",
  props: {
    item: Object,
    parent_index: Number,
  },
  watch: {
    /* Make the json change with the clicks of the user */
    vModel() {
      this.checkbox.selected = this.vModel;
    },
  },
  data() {
    return {
      checkbox: this.item,
      vModel: this.item.selected
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>