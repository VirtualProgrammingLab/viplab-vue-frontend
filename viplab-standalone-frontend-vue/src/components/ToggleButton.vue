<template>
  <div class="togglebutton-component form-item toggle">
    <div class ="item-name">{{toggl.metadata.name}}:</div>
    <VForm :rules="`${onlyone ? 'toggleOneOf|required' : (minone ? 'toggleMinOne|required' : '')}`" v-slot="{ errors}">
      <div v-for="(toggle, index) in toggl.options" :key="'toggle'+ ' ' +index">
        <label>
          <p class="slider-label"> {{ toggle.text || toggle.value }}</p>
          <input type="checkbox" :value="toggle.value" v-model="vModel">
          <span class="slider"></span>
        </label>
      </div>
      <span class="error">{{ errors[0] }}</span>
    </VForm>
  </div>
</template>

<script>
import { Form, defineRule } from 'vee-validate';
import { required } from '@vee-validate/rules';

defineRule(
  'required',
  (value) => (required(value) ? true : 'This field is required'),
);

defineRule('toggleOneOf', (value) => {
  // console.log("toggle oneof " + value);
  if (value.length > 0 && value.length === 1) {
    return true;
  }
  return 'Only choose one!';
});

defineRule('toggleMinOne', (value) => {
  // console.log("toggle minone " + value);
  if (value.length >= 1) {
    return true;
  }
  return 'Choose one or more!';
});

export default {
  name: 'ToggleButton',
  components: {
    VForm: Form,
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
        this.item.selected = val;
        this.$forceUpdate();
        return this.vModel;
      },
    },
    onlyone() {
      if (this.toggl.validation === 'onlyone') {
        return true;
      }
      return false;
    },
    minone() {
      if (this.toggl.validation === 'minone') {
        return true;
      }
      return true;
    },
  },
  data() {
    return {
      toggl: this.item,
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.error{
  color: red;
}

.slider-label {
  margin-bottom: 2em;
}
</style>
