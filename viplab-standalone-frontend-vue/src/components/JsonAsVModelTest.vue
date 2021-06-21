<template>
  <div class="json-test-component">
    <div class="checkbox-component">
      <div class="item-name">{{ checkbox.metadata.name }}:</div>
      <div
        class="checkbox form-check custom-control custom-checkbox"
        v-for="(check, index) in checkbox.values"
        :key="index"
      >
        <input
          type="checkbox"
          class="form-check-input custom-control-input"
          :id="index"
          :value="check.value"
          v-model="checkbox.selected"
        />
        <label class="form-check-label custom-control-label" :for="index">{{
          check.value
        }}</label>
      </div>
    </div>

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

    <div class="dropdown-component">
      <div class="item-name">{{ dropJ.metadata.name }}:</div>
      <div class="dropdown form-group">
        <select
          class="form-control"
          v-if="dropJ.selected.constructor.name === 'Array'"
          v-model="dropJ.selected"
          multiple
        >
          <option
            v-for="(disabled, index) in itemsDisabled(dropJ)"
            disabled
            :key="'dropdis' + ' ' + index"
          >
            {{ disabled }}
          </option>
          <option
            v-for="(drop, index) in itemWithoutDisabled(dropJ)"
            :key="'drop' + ' ' + index"
          >
            {{ drop }}
          </option>
        </select>
        <select class="form-control" v-else v-model="dropJ.selected">
          <option
            v-for="(disabled, index) in itemsDisabled(dropJ)"
            disabled
            :key="'dropdis' + ' ' + index"
          >
            {{ disabled }}
          </option>
          <option
            v-for="(drop, index) in itemWithoutDisabled(dropJ)"
            :key="'drop' + ' ' + index"
          >
            {{ drop }}
          </option>
        </select>
      </div>
    </div>

    <div class="dropdown-component">
      <div class="item-name">{{ dropJM.metadata.name }}:</div>
      <div class="dropdown form-group">
        <select
          class="form-control"
          v-if="dropJM.selected.constructor.name === 'Array'"
          v-model="dropJM.selected"
          multiple
        >
          <option
            v-for="(disabled, index) in itemsDisabled(dropJM)"
            disabled
            :key="'dropdis' + ' ' + index"
          >
            {{ disabled }}
          </option>
          <option
            v-for="(drop, index) in itemWithoutDisabled(dropJM)"
            :key="'drop' + ' ' + index"
          >
            {{ drop }}
          </option>
        </select>
        <select class="form-control" v-else v-model="dropJ.selected">
          <option
            v-for="(disabled, index) in itemsDisabled(dropJM)"
            disabled
            :key="'dropdis' + ' ' + index"
          >
            {{ disabled }}
          </option>
          <option
            v-for="(drop, index) in itemWithoutDisabled(dropJM)"
            :key="'drop' + ' ' + index"
          >
            {{ drop }}
          </option>
        </select>
      </div>
    </div>

  <div class="togglebutton-component form-item toggle">
    <div class ="item-name">{{toggl.metadata.name}}:</div>
        <div v-for="(toggle, index) in toggl.values" :key="'toggle'+ ' ' +index">
        <label>
            {{ toggle.value }}
            <input type="checkbox" :value="toggle.value" v-model="toggl.selected">
            <span class="slider"></span>
        </label>
    </div>
  </div>

  <div class="slider-component">
    <div class ="item-name">{{sliderSingle.metadata.name}}:</div>
    <div v-if="sliderSingle.value.length > 1">
        <vue-slider multiple v-model="sliderSingle.value" :min="sliderSingle.min" :max="sliderSingle.max" :interval="sliderSingle.step" :direction="sliderDirection(sliderSingle)" style="height: 300px;[sliderSingle.metadata.vertical ? {'height': '300px'} : {}]"></vue-slider>
    </div>
    <div v-else>
        <vue-slider v-model="sliderSingle.value" :min="sliderSingle.min" :max="sliderSingle.max" :interval="sliderSingle.step" :direction="sliderDirection(sliderSingle)" :style="[sliderSingle.metadata.vertical ? {'height': '300px'} : {}]"></vue-slider>
    </div>
  </div>

  <div class="slider-component">
    <div class ="item-name">{{sliderMultiple.metadata.name}}:</div>
    <div v-if="sliderMultiple.value.length > 1">
        <vue-slider multiple v-model="sliderMultiple.value" :min="sliderMultiple.min" :max="sliderMultiple.max" :interval="sliderMultiple.step" :direction="sliderDirection(sliderMultiple)" style="height: 300px;[sliderMultiple.metadata.vertical ? {'height': '300px'} : {}]"></vue-slider>
    </div>
    <div v-else>
        <vue-slider v-model="sliderMultiple.value" :min="sliderMultiple.min" :max="sliderMultiple.max" :interval="sliderMultiple.step" :direction="sliderDirection(sliderMultiple)" :style="[sliderMultiple.metadata.vertical ? {'height': '300px'} : {}]"></vue-slider>
    </div>
  </div>

  <div class="inputfield-component">
    <div v-if="inputMax.metadata.type=='text'">
        <label class="item-name mr-2" for="inputMax.metadata.name">{{ inputMax.metadata.name }}: </label>
        <input type="text" class="form-control" id="inputMax.metadata.name" name="inputMax.metadata.name" :maxlength="inputMax.maxlength" v-model="inputMax.value">
    </div>
    <div v-if="inputMax.metadata.type=='number'">
        <label class="item-name mr-2" for="inputMax.metadata.name">{{ inputMax.metadata.name }}: </label>
        <input type="number" class="form-control" id="inputMax.metadata.name" name="inputMax.metadata.name" :max="inputMax.max" :min="inputMax.min" :step="inputMax.step" v-model="inputMax.value" :state="true">
    </div>
  </div>

  <div class="inputfield-component">
    <div v-if="inputWoMax.metadata.type=='text'">
        <label class="item-name mr-2" for="inputWoMax.metadata.name">{{ inputWoMax.metadata.name }}: </label>
        <input type="text" class="form-control" id="inputWoMax.metadata.name" name="inputWoMax.metadata.name" :maxlength="inputWoMax.maxlength" v-model="inputWoMax.value">
    </div>
    <div v-if="inputWoMax.metadata.type=='number'">
        <label class="item-name mr-2" for="inputWoMax.metadata.name">{{ inputWoMax.metadata.name }}: </label>
        <input type="number" class="form-control" id="inputWoMax.metadata.name" name="inputWoMax.metadata.name" :max="inputWoMax.max" :min="inputWoMax.min" :step="inputWoMax.step" v-model="inputWoMax.value" :state="true">
    </div>
  </div>

  <div class="inputfield-component">
    <div v-if="inputNumber.metadata.type=='text'">
        <label class="item-name mr-2" for="inputNumber.metadata.name">{{ inputNumber.metadata.name }}: </label>
        <input type="text" class="form-control" id="inputNumber.metadata.name" name="inputNumber.metadata.name" :maxlength="inputNumber.maxlength" v-model="inputNumber.value">
    </div>
    <div v-if="inputNumber.metadata.type=='number'">
        <label class="item-name mr-2" for="inputNumber.metadata.name">{{ inputNumber.metadata.name }}: </label>
        <input type="number" class="form-control" id="inputNumber.metadata.name" name="inputNumber.metadata.name" :max="inputNumber.max" :min="inputNumber.min" :step="inputNumber.step" v-model="inputNumber.value" :state="true">
    </div>
  </div>

  <div class="form-item" v-if="isEditor(defaultJson) && defaultJson.value">
    <div class ="item-name">{{defaultJson.metadata.name}}:</div>
    <prism-editor class="my-editor top-editor bottom-editor" v-model="vModel" :highlight="highlighter" line-numbers></prism-editor>
  </div>

  <div class="form-item" v-if="isEditor(defaultJava) && defaultJava.value">
    <div class ="item-name">{{defaultJava.metadata.name}}:</div>
    <prism-editor class="my-editor top-editor bottom-editor" v-model="defaultJava.value" :highlight="highlighter" line-numbers></prism-editor>
  </div>

  </div>
</template>

<script>
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';

// import Prism Editor
import { PrismEditor } from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css"; // import the styles somewhere

// import highlighting library (you can use any library you want just return html string)
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css"; // import syntax highlighting styles

export default {
  name: "JsonVModelTest",
  components: {
    VueSlider,
    PrismEditor
  },
  props: {},
  data() {
    return {
      //structure changed
      checkbox: JSON.parse(
        '{ "type" : "fixed-value", "identifier" : "__checkbox__",  "metadata" : { "guiType": "checkbox", "name": "options"},"values": [{"value" : "verbose","selected" : true},{"value" : "debug"},{"value" : "make_plot"}], "selected" : ["verbose"]}'
      ),
      //structure changed
      rad: JSON.parse(
        '{"type" : "fixed-value","identifier" : "__radioButton__","metadata" : {"guiType": "radio","name": "backend"},"values": [{"value" : "debug"},{"value" : "serial","selected" : true},{"value" : "hpc", "disabled" : true},{"value" : "test"}], "selected" : "serial"}'
      ),
      //structure changed
      dropJ: JSON.parse(
        '{"type" : "fixed-value","identifier" : "__dropdownSingle__", "metadata" : {"guiType": "dropdown","name": "model"},"values": [{"value" : "Please choose one","disabled" : true},{"value" : "1p","selected" : true},{"value" : "1pnc"},{"value" : "1pncmin"},{"value" : "2p"},{"value" : "2p1c"}], "selected" : "1p"}'
      ),
      //structure changed
      dropJM: JSON.parse('{"type" : "fixed-value","identifier" : "__dropdownMultiple__", "metadata" : {"guiType": "dropdown","name": "model"},"values": [{"value" : "Please choose multiple","disabled" : true},{"value" : "1p","selected" : true},{"value" : "1pnc"},{"value" : "1pncmin"},{"value" : "2p", "selected" : true},{"value" : "2p1c", "disabled" : true}], "selected" : ["1p", "2p"]}'),
      //structure changed
      toggl: JSON.parse('{"type" : "fixed-value","identifier" : "__toggle__", "metadata" : {"guiType": "toggle","name": "options"},"values": [{"value" : "verbose","selected" : true},{"value" : "debug"},{"value" : "make_plot"}], "selected" : ["verbose"]}'),
      sliderSingle: JSON.parse('{"type" : "any-value","identifier" : "__sliderMultiple__", "metadata" : {"guiType" : "slider","name": "temperature","vertical": false},"value": [10],"min": 0,"max": 100,"step": 5}'),
      sliderMultiple: JSON.parse('{"type" : "any-value","identifier" : "__sliderMultiple__", "metadata" : {"guiType" : "slider","name": "temperature","vertical": true},"value": [25,50,75],"min": 0,"max": 100,"step": 5}'),
      inputMax: JSON.parse('{"type" : "any-value","identifier" : "__inputTextWMaxlength__", "metadata" : {"guiType" : "input_field","type": "text","name": "file_name"},"maxlength": 200 }'),
      inputWoMax: JSON.parse('{"type" : "any-value","identifier" : "__inputTextWOMaxlangth__", "metadata" : {"guiType" : "input_field","type": "text","name": "file_name"}}'),
      inputNumber: JSON.parse('{"type" : "any-value","identifier" : "__inputNumber__", "metadata" : {"guiType" : "input_field","type": "number","name": "time_delay"},"value": 10,"min": 0,"max": 500,"step": 0.1}'),
      defaultJson: JSON.parse('{"type" : "any-value","identifier" : "__defaultJson__", "metadata" : {"guiType" : "editor", "name": "code 1"}, "value": "I2luY2x1ZGUgPHN0ZGlvLmg-Cg"}'),
      defaultJava: JSON.parse('{"type" : "any-value","identifier" : "__defaultJava__", "metadata" : {"guiType" : "editor","name": "code 2"},"value": "dm9pZCBiYXIoKSB7IC8qIFNjaHJlaWJlbiBTaWUgaGllciBDb2RlLCBkZXIgImJhciIgYXVzZ2lidC4gKi8KCn0K"}'),
    };
  },
  computed: {
    /*  
    testMap: function () {
      var map = new Map();
      map.set("__checkbox__", ["verbose"])
      return map;
    },*/
    /*
    vModel: {
        get: function() {
            return this.testMap.get("__checkbox__")
        },
        set: function (val) {
            console.log("val: " + val);
            //var value = this.testMap.get("__checkbox__")
            //value.push(val);
            //console.log("value: " + value);
            //var uniq = Array.from(new Set(value));
            //console.log("uniq: " + uniq);
            this.testMap.set("__checkbox__", val);
        } 
    } */
    vModel: {
        get: function() {
            return this.decodeBase64(this.defaultJson.value)
        },
        set: function (val) {
            console.log("val: " + val);
            this.defaultJson.value = btoa(val);
        } 
    } 
  },
  methods: {
    /** get all values of an item that are not disabled */
    itemWithoutDisabled: function (item) {
      //item = item.dropJ;
      var array = [];
      for (var i = 0; i < item.values.length; i++) {
        if (!item.values[i].disabled) {
          array.push(item.values[i].value);
        }
      }
      return array;
    },
    itemsDisabled: function (item) {
      //item = item.dropJ;
      var array = [];
      for (var i = 0; i < item.values.length; i++) {
        if (item.values[i].disabled) {
          array.push(item.values[i].value);
        }
      }
      return array;
    },
    /** parse slider direction for the usage in the vue-slider */
    sliderDirection: function(sliderItem){
      if(sliderItem.metadata.vertical){
        return "ttb";
      }
    return "ltr";
    }, 
    isEditor: function (item) {
      return item.metadata.guiType === "editor" ? true : false;
    },
    /** highlight the code in the editor */
    highlighter(code) {
      return highlight(code, languages.js); // languages.<insert language> to return html with markup
    },
    rewriteToBase64: function (base64urlEncodedString) {
      // Replace base64 characters with base64url characters
      base64urlEncodedString = base64urlEncodedString
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      // Pad for base64
      var padding = base64urlEncodedString.length % 4;
      if (padding) {
        if (padding === 1) {
          throw new Error(
            "InvalidLengthError: Input base64url string is the wrong length to determine padding"
          );
        }
        base64urlEncodedString += new Array(5 - padding).join("=");
      }
      return base64urlEncodedString;
    },
    decodeBase64: function (base64urlEncodedString) {
      var encodedString = this.rewriteToBase64(base64urlEncodedString);

      var decodedString = window.atob(encodedString);
      return decodedString;
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>