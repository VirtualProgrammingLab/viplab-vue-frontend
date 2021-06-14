<template>
  <div class="parameters-component">
    <div v-for="(item, parent_index) in parameters" :key=parent_index>
        <!-- render checkbox elements -->
        <!-- render after form_v_model[parent_index] is set, or else js error occurs (even though page looks perfectly fine) -->
        <div class="form-item" v-if="isCheckbox(item) && v_model_var[parent_index]">
            <check-box :item="item" :parent_index="parent_index" :v_model_var="v_model_var"></check-box>
        </div>
        <!-- render radio button elements -->
        <div class="form-item" v-if="isRadio(item) && v_model_var[parent_index]">
            <radio-button :item="item" :parent_index="parent_index" :v_model_var="v_model_var"></radio-button>
        </div>
        <!-- render dropdown elements -->
        <div class="form-item" v-if="isDropdown(item) && v_model_var[parent_index]">
            <drop-down :item="item" :parent_index="parent_index" :v_model_var="v_model_var"></drop-down>
        </div>
        <!-- render toggle button elements -->
        <div class="form-item toggle" v-if="isToggle(item) && v_model_var[parent_index]">
            <toggle-button :item="item" :parent_index="parent_index" :v_model_var="v_model_var"></toggle-button>
        </div>
        <!-- render slider elements -->
        <div class="form-item" v-if="isSlider(item)" :key="'slider'+parent_index">
            <slider-element :item="item" :parent_index="parent_index" :v_model_var="v_model_var"></slider-element>
        </div>
        <!-- render input field elements -->
        <div class="form-item" v-if="isInputField(item)">
            <input-field :item="item" :parent_index="parent_index" :v_model_var="v_model_var"></input-field>
        </div>
        <!-- render items with no gui-type as editor elements -->
        <div class="form-item" v-if="isEditor(item) && v_model_var[parent_index]">
            <div class ="item-name">{{item.metadata.name}}:</div>
            <prism-editor class="my-editor top-editor bottom-editor" v-model="vModel[parent_index]" :highlight="highlighter" line-numbers></prism-editor>
        </div>
    </div>
  </div>
</template>

<script>
// import Prism Editor
import { PrismEditor } from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css"; // import the styles somewhere

// import highlighting library (you can use any library you want just return html string)
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css"; // import syntax highlighting styles

//own components
import CheckBox from "../components/CheckBox.vue";
import RadioButton from "../components/RadioButton.vue";
import DropDown from "../components/DropDown.vue";
import ToggleButton from "../components/ToggleButton.vue";
import SliderElement from "../components/SliderElement.vue";
import InputField from "../components/InputField.vue";

export default {
  components: {
    PrismEditor,
    CheckBox,
    RadioButton,
    DropDown,
    ToggleButton,
    SliderElement,
    InputField
  },
  name: 'Parameters',
  props: {
    parameters: Array,
    v_model_var: Array
  },
  data() {
    return {
      vModel: this.v_model_var  
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
    /** highlight the code in the editor */
    highlighter(code) {
      return highlight(code, languages.js); // languages.<insert language> to return html with markup
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>