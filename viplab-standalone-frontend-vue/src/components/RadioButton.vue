<template>
  <div class="radiobutton-component">
    <div class="item-name">{{ rad.metadata.name }}:</div>
    <div
      class="radiobutton form-check custom-control custom-radio"
      v-for="(radio, index) in rad.options"
      :key="'Radio' + ' ' + index"
    >
      <div v-if="radio.disabled">
        <input
          class="form-check-input custom-control-input"
          type="radio"
          :id="rad.identifier + 'RadioDis' + ' ' + index"
          disabled
          :name="rad.identifier"
          :value="radio.value"
          v-model="vModel"
        />
        <label
          class="form-check-label custom-control-label"
          for="rad.identifier + 'RadioDis' + ' ' + index"
          >{{ radio.text || radio.value }}</label
        >
      </div>
      <div v-else>
        <input
          class="form-check-input custom-control-input"
          type="radio"
          :id="rad.identifier + 'Radio' + ' ' + index"
          :name="rad.identifier"
          :value="radio.value"
          v-model="vModel"
        />
        <label
          class="form-check-label custom-control-label"
          :for="rad.identifier + 'Radio' + ' ' + index"
          >{{ radio.text || radio.value }}</label
        >
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
  },
  computed: {
    vModel: {
      get() {
        return this.item.selected;
      },
      set(val) {
        this.$set(this.item, 'selected', val);
        this.$forceUpdate();
        return this.vModel;
      },
    },
  },
  data() {
    return {
      rad: this.item,
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
