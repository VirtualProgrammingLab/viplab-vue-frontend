<template>
  <div class="checkbox-component" :key="checkbox.identifier">
    <div class="item-name">{{ checkbox.metadata.name }}:</div>
    <validation-provider :rules="`${onlyone ? 'checkboxOneOf|required' : (minone ? 'checkboxMinOne|required' : '')}`" v-slot="{ errors}">
      <div
        class="checkbox form-check custom-control custom-checkbox"
        v-for="(check, index) in checkbox.options"
        :key="index"
      >
        <input
          type="checkbox"
          class="form-check-input custom-control-input"
          :id="checkbox.identifier + '-' + index"
          :value="check.value"
          v-model="vModel"
        />
        <label class="form-check-label custom-control-label" :for="checkbox.identifier + '-' + index">
          {{ check.text || check.value }}
        </label>
      </div>
      <span class="error">{{ errors[0] }}</span>
    </validation-provider>
  </div>
</template>

<script>
import { ValidationProvider, extend } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';

extend('required', {
  ...required,
  message: 'This field is required',
});

extend('checkboxOneOf', (value) => {
  // console.log("checkbox oneof " + value);
  if (value.length > 0 && value.length === 1) {
    return true;
  }
  return 'Only choose one!';
});

extend('checkboxMinOne', (value) => {
  if (value.length >= 1) {
    return true;
  }
  return 'Choose one or more!';
});

export default {
  name: 'CheckBox',
  components: {
    ValidationProvider,
  },
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
    onlyone() {
      return this.checkbox.validation === 'onlyone';
    },
    minone() {
      return this.checkbox.validation === 'minone';
    },
  },
  data() {
    return {
      checkbox: this.item,
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.error{
  color: red;
}
</style>
