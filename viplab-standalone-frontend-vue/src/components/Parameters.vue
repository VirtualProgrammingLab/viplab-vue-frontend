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
            :isMustache="false"
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
//own components
import CheckBox from "../components/CheckBox.vue";
import RadioButton from "../components/RadioButton.vue";
import DropDown from "../components/DropDown.vue";
import ToggleButton from "../components/ToggleButton.vue";
import SliderElement from "../components/SliderElement.vue";
import InputField from "../components/InputField.vue";
import AceEditorComponent from "../components/EditorComponent-Ace.vue"

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
    parameters: Array
  },
  data() {
    return {
    }
  }, 
  methods: {
    /** check gui-types of the items */
    isCheckbox: function (item) {
      return item.metadata.guiType === "checkbox" ? true : false;
    },
    isRadio: function (item) {
      return item.metadata.guiType === "radio" ? true : false;
    },
    isDropdown: function (item) {
      return item.metadata.guiType === "dropdown" ? true : false;
    },
    isToggle: function (item) {
      return item.metadata.guiType === "toggle" ? true : false;
    },
    isSlider: function (item) {
      return item.metadata.guiType === "slider" ? true : false;
    },
    isInputField: function (item) {
      return item.metadata.guiType === "input_field" ? true : false;
    },
    isEditor: function (item) {
      return item.metadata.guiType === "editor" ? true : false;
    },
  }
}
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