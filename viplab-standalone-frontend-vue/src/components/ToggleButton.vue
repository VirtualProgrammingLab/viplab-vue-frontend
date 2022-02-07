<template>
  <div class="togglebutton-component form-item toggle">
    <div class ="item-name">{{toggl.metadata.name}}:</div>
    <validation-provider :rules="`${onlyone ? 'toggleOneOf|required' : (minone ? 'toggleMinOne|required' : '')}`" v-slot="{ errors}">
      <div v-for="(toggle, index) in toggl.options" :key="'toggle'+ ' ' +index">
        <label>
          <p class="slider-label"> {{ toggle.value }}</p>
          <input type="checkbox" :value="toggle.value" v-model="vModel">
          <span class="slider"></span>
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
  message: 'This field is required'
});

extend('toggleOneOf', value => {
  //console.log("toggle oneof " + value);
  if (value.length > 0 && value.length == 1) {
    return true;
  }
  return 'Only choose one!'
});

extend('toggleMinOne', value => {
  //console.log("toggle minone " + value);
  if (value.length >= 1) {
    return true;
  }
  return 'Choose one or more!'
});

export default {
  name: 'ToggleButton',
  components: {
    ValidationProvider
  },
  props: {
    item: Object,
    parent_index: Number
  }, 
  computed: {
    vModel: {
      get: function () {
        return this.item.selected;
      },
      set: function (val) {
        this.$set(this.item , "selected", val);
        this.$forceUpdate();
        return this.vModel;
      }
    },
    onlyone: function() {
      if(this.toggl.validation === "onlyone") {
        return true;
      } else {
        return false;
      }
    }, 
    minone: function() {
      if(this.toggl.validation === "minone") {
        return true;
      } else {
        return true;
      }
    },
  },
  data() {
    return {
      toggl: this.item
    }
  }
}
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