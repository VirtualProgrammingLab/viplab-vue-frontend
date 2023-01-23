<template>
  <div class="parameters-component">
    <div class="parameter-div" v-for="(item, parent_index) in parameters" :key=parent_index>
        <!-- render checkbox elements -->
        <!-- render after form_v_model[parent_index] is set, or else js error occurs (even though page looks perfectly fine) -->
        <div class="form-item" v-if="isCheckbox(item)">
            <check-box :item="item" :parent_index="parent_index" ></check-box>
        </div>
        <!-- render radio button elements -->
        <div class="form-item" v-if="isRadio(item)">
            <radio-button :item="item" :parent_index="parent_index"></radio-button>
        </div>
        <!-- render dropdown elements -->
        <div class="form-item" v-if="isDropdown(item)">
            <drop-down :item="item" :parent_index="parent_index"></drop-down>
        </div>
        <!-- render toggle button elements -->
        <div class="form-item toggle" v-if="isToggle(item)">
            <toggle-button :item="item" :parent_index="parent_index"></toggle-button>
        </div>
        <!-- render slider elements -->
        <div class="form-item" v-if="isSlider(item)" :key="'slider'+parent_index">
            <slider-element :item="item" :parent_index="parent_index"></slider-element>
        </div>
        <!-- render input field elements -->
        <div class="form-item" v-if="isInputField(item)">
            <input-field :item="item" :parent_index="parent_index"></input-field>
        </div>
        <!-- render items with no gui-type as editor elements -->
        <div class="form-item" v-if="isEditor(item) && item.value">
          <ace-editor-component
            :isParameter="true"
            :isHandlebar="false"
            :readonly="false"
            :item="item"
          ></ace-editor-component>
        </div>
        <!-- tooltip -->
        <div class="tooltip-icon">
            <!-- v-if="item.metadata.description" -->
            <b-icon-info-circle v-tooltip.top-center="item.metadata.description"></b-icon-info-circle>
        </div>
    </div>
  </div>
</template>

<script>
// own components
import CheckBox from './CheckBox.vue';
import RadioButton from './RadioButton.vue';
import DropDown from './DropDown.vue';
import ToggleButton from './ToggleButton.vue';
import SliderElement from './SliderElement.vue';
import InputField from './InputField.vue';
import AceEditorComponent from './EditorComponent-Ace.vue';

export default {
  components: {
    CheckBox,
    RadioButton,
    DropDown,
    ToggleButton,
    SliderElement,
    InputField,
    AceEditorComponent,
  },
  name: 'Parameters',
  props: {
    parameters: Array,
  },
  data() {
    return {
    };
  },
  methods: {
    /** check gui-types of the items */
    isCheckbox(item) {
      return item.metadata.guiType === 'checkbox';
    },
    isRadio(item) {
      return item.metadata.guiType === 'radio';
    },
    isDropdown(item) {
      return item.metadata.guiType === 'dropdown';
    },
    isToggle(item) {
      return item.metadata.guiType === 'toggle';
    },
    isSlider(item) {
      return item.metadata.guiType === 'slider';
    },
    isInputField(item) {
      return item.metadata.guiType === 'input_field';
    },
    isEditor(item) {
      return item.metadata.guiType === 'editor';
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.parameter-div {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.form-item {
  width: 98%;
  /*margin-bottom: 0 !important;*/
}

.tooltip-icon {
  margin: auto 0;
}

</style>
