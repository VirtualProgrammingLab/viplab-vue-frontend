<template>
  <div class="dropdown-component">
    <div class="item-name">{{ dropitem.metadata.name }}:</div>
    <validation-provider :rules="`${onlyone ? 'dropdownOneOf|required' : (minone ? 'dropdownMinOne|required' : '')}`" v-slot="{ errors }">
      <div class="dropdown form-group">
        <select
          class="form-control"
          v-if="dropitem.multiple == true"
          v-model="vModel"
          multiple
        >
          <option
            v-for="(disabled, index) in itemsDisabled(dropitem)"
            disabled
            :key="'dropdis' + ' ' + index"
            :label="disabled.text || disabled.value"
          >
            {{ disabled.value }}
          </option>
          <option
            v-for="(drop, index) in itemWithoutDisabled(dropitem)"
            :key="'drop' + ' ' + index"
            :label="drop.text || drop.value"
          >
            {{ drop.value }}
          </option>
        </select>
        <select class="form-control" v-else v-model="vModel">
          <option
            v-for="(disabled, index) in itemsDisabled(dropitem)"
            disabled
            :key="'dropdis' + ' ' + index"
            :label="disabled.text || disabled.value"
          >
            {{ disabled.value }}
          </option>
          <option
            v-for="(drop, index) in itemWithoutDisabled(dropitem)"
            :key="'drop' + ' ' + index"
            :label="drop.text || drop.value"
          >
            {{ drop.value }}
          </option>
        </select>
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

extend('dropdownOneOf', (value) => {
  // console.log("dropdown oneof " + value);
  if (!Array.isArray(value)) {
    return true;
  }
  return 'Only choose one!';
});

extend('dropdownMinOne', (value) => {
  // console.log("dropdown minone  " + value);
  if (value.length >= 1) {
    return true;
  }
  return 'Choose one or more!';
});

export default {
  name: 'DropDown',
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
      return this.dropitem.validation === 'onlyone';
    },
    minone() {
      return this.dropitem.validation === 'minone';
    },
  },
  data() {
    return {
      dropitem: this.item,
    };
  },
  methods: {
    /** get all values of an item that are not disabled */
    itemWithoutDisabled(item) {
      const array = [];
      for (let i = 0; i < item.options.length; i += 1) {
        if (!item.options[i].disabled) {
          array.push(item.options[i]);
        }
      }
      return array;
    },
    itemsDisabled(item) {
      const array = [];
      for (let i = 0; i < item.options.length; i += 1) {
        if (item.options[i].disabled) {
          array.push(item.options[i]);
        }
      }
      return array;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.error{
  color: red;
}
</style>
