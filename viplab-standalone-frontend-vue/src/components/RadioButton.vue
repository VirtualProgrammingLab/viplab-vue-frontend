<template>
  <div class="radiobutton-component">
      <div class="item-name">{{ rad.metadata.name }}:</div>
      <div
        class="radiobutton form-check custom-control custom-radio"
        v-for="(radio, index) in rad.values"
        :key="'Radio' + ' ' + index"
      >
        <div v-if="radio.disabled">
          <input
            class="form-check-input custom-control-input"
            type="radio"
            :id="'RadioDis' + ' ' + index"
            disabled
            :value="radio.value"
            v-model="rad.selected"
          />
          <label
            class="form-check-label custom-control-label"
            for="'RadioDis' + ' ' +index"
            >{{ radio.value }}</label
          >
        </div>
        <div v-else>
          <input
            class="form-check-input custom-control-input"
            type="radio"
            :id="'Radio' + ' ' + index"
            :value="radio.value"
            v-model="rad.selected"
          />
          <label
            class="form-check-label custom-control-label"
            :for="'Radio' + ' ' + index"
            >{{ radio.value }}</label
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
  data() {
    return {
      rad: this.item  
    }
  }, 
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>