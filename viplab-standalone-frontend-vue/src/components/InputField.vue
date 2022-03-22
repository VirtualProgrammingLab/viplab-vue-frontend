<template>
  <div class="inputfield-component">
    <!-- if validation is set to pattern -->
    <validation-provider v-if="pattern" :rules="{required: true, inputFieldRegex: input.pattern}" v-slot="{ errors}">
      <div v-if="input.metadata.type=='text'">
          <label class="item-name mr-2" for="input.metadata.name">{{ input.metadata.name }}: </label>
          <input type="text" class="form-control" id="input.metadata.name" :name="input.metadata.name" :maxlength="input.maxlength" v-model="vModel">
      </div>
      <div v-if="input.metadata.type=='number'">
          <label class="item-name mr-2" for="input.metadata.name">{{ input.metadata.name }}: </label>
          <input type="number" class="form-control" id="input.metadata.name" :name="input.metadata.name" :max="input.max" :min="input.min" :step="input.step" v-model="vModel" :state="true">
      </div>
      <span class="error">{{ errors[0] }}</span>
    </validation-provider>
    <!-- if validation is set to range -->
    <validation-provider v-else-if="range" :rules="{required: true, inputFieldRange:[input.min, input.max]}" v-slot="{ errors}">
      <div v-if="input.metadata.type=='text'">
          <label class="item-name mr-2" for="input.metadata.name">{{ input.metadata.name }}: </label>
          <input type="text" class="form-control" id="input.metadata.name" :name="input.metadata.name" :maxlength="input.maxlength" v-model="vModel">
      </div>
      <div v-if="input.metadata.type=='number'">
          <label class="item-name mr-2" for="input.metadata.name">{{ input.metadata.name }}: </label>
          <input type="number" class="form-control" id="input.metadata.name" :name="input.metadata.name" :max="input.max" :min="input.min" :step="input.step" v-model="vModel" :state="true">
      </div>
      <span class="error">{{ errors[0] }}</span>
    </validation-provider>
    <!-- if validation is set to none -->
    <div v-else>
      <div v-if="input.metadata.type=='text'">
          <label class="item-name mr-2" for="input.metadata.name">{{ input.metadata.name }}: </label>
          <input type="text" class="form-control" id="input.metadata.name" :name="input.metadata.name" :maxlength="input.maxlength" v-model="vModel">
      </div>
      <div v-if="input.metadata.type=='number'">
          <label class="item-name mr-2" for="input.metadata.name">{{ input.metadata.name }}: </label>
          <input type="number" class="form-control" id="input.metadata.name" :name="input.metadata.name" :max="input.max" :min="input.min" :step="input.step" v-model="vModel" :state="true">
      </div>
    </div>
  </div>
</template>

<script>
import { ValidationProvider, extend } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';

import base64url from "base64url";

extend('required', {
  ...required,
  message: 'This field is required'
});

extend('inputFieldRegex', (value, arg) => {
  //console.log("inputfield oneof " + value + " arg: " + arg);
  const regex = new RegExp(arg);
  if (regex.test(value)) {
    return true;
  }
  return 'Field format invalid! Has to be: ' + arg;
});

extend('inputFieldRange', (value, [min, max]) => {
  //console.log("inputfield oneof " + value + " min: " + min + " max: " + max);
  if (value >= min && value <= max) {
    return true;
  }
  return 'Value has to be between ' + min + ' and ' + max + '!'
});

export default {
  name: 'InputField',
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
        if (this.item.metadata.type === "number") {
          return this.item.value;
        } else {
          return base64url.decode(this.item.value);
        }
      },
      set: function (val) {
        if (this.item.metadata.type === "number") {
          this.$set(this.item , "value", val);
        } else {
          this.$set(this.item , "value", base64url(val));
        }
        this.$forceUpdate();
        return this.vModel;
      }
    },
    range: function() {
      if(this.input.validation === "range") {
        return true;
      } else {
        return false;
      }
    }, 
    pattern: function() {
      if(this.input.validation === "pattern") {
        return true;
      } else {
        return false;
      }
    },
  },
  data() {
    return {
      input: this.item
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.error{
  color: red;
}
</style>