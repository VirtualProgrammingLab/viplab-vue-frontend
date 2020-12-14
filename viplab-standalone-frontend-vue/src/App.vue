<template>
  <div id="app">

    <div class="m-5">
      <h1>ViPLab Frontend</h1>

      <span>I found the following templates in example folder:</span>
      <div>
        <ul id="templates" v-for="temp in templates" :key="temp.id"> 
          <li><a :href="temp">{{ temp }}</a></li>  
        </ul>
      </div>
      <div>
        <button type="button" id="submit" disabled="true">Submit</button>
        digest
      </div>
    </div>

    <transition name="fade">
      <div class="form-group m-5">
        <div v-for="(item, key, parent_index) in parsedJson" :key=parent_index>
          <!-- render after form_v_model[parent_index] is set, or else js error occurs (even though page looks perfectly fine) -->
          <div class="m-2" v-if="isCheckbox(item) && form_v_model[parent_index]">
            <div class ="item-name">{{item.name}}:</div>
            <div class="checkbox form-check" v-for="(check, index) in item.values" :key=index>
              <input class="form-check-input" type="checkbox" :value="check" checked v-model="form_v_model[parent_index][index]">
              <label class="form-check-label" for="index">{{ check }}</label>
            </div>
          </div>
          <div class="m-2" v-if="isRadio(item) && form_v_model[parent_index]">
            <div class ="item-name">{{item.name}}:</div>
            <div class="radiobutton form-check" v-for="(radio, index) in itemWithoutDisabled(item)" :key="'Radio' + parent_index + ' ' +index">
              <input class="form-check-input" type="radio" :value="radio" v-model="form_v_model[parent_index]">
              <label class="form-check-label" for="index">{{ radio }}</label>
            </div>
            <div class="radiobutton form-check" v-for="(radio, index) in item.disabled" :key="'RadioDis' + parent_index + ' ' +index">
              <input class="form-check-input" type="radio" disabled :value="radio" v-model="form_v_model[parent_index]">
              <label class="form-check-label" for="index">{{ radio }}</label>
            </div>
          </div>
          <div class="m-2" v-if="isDropdown(item) && form_v_model[parent_index]">
            <div class ="item-name">{{item.name}}:</div>
            <div class="dropdown">
              <select v-if="!item.multiple" v-model="form_v_model[parent_index]">
                <option v-for="(disabled, index) in item.disabled" disabled :key="'dropdis'+parent_index + ' ' +index">{{ disabled }}</option>
                <option v-for="(drop, index) in itemWithoutDisabled(item)" :key="'drop'+parent_index + ' ' +index">{{ drop }}</option>
              </select>
              <select v-if="item.multiple" v-model="form_v_model[parent_index]" multiple>
                <option v-for="(disabled, index) in item.disabled" disabled :key="'dropdis'+parent_index + ' ' +index">{{ disabled }}</option>
                <option v-for="(drop, index) in itemWithoutDisabled(item)" :key="'drop'+parent_index + ' ' +index">{{ drop }}</option>
              </select>
            </div>
          </div>
          <div class="m-2 toggle" v-if="isToggle(item) && form_v_model[parent_index]">
            <div class ="item-name">{{item.name}}:</div>
            <div v-for="(toggle, index) in item.values" :key="'toggle'+parent_index + ' ' +index">
              <label>
                {{ toggle }}
                <input type="checkbox" :value="toggle" v-model="form_v_model[parent_index][index]">
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="m-2" v-if="isSlider(item)" :key="'slider'+parent_index">
            <div class ="item-name">{{item.name}}:</div>
            <div v-if="!item.multiple">
              <vue-slider v-model="form_v_model[parent_index]" :min="item.min" :max="item.max" :interval="item.step" :direction="sliderDirection(item)" :style="[item.vertical ? {'height': '300px'} : {}]"></vue-slider>
            </div>
            <div v-if="item.multiple">
              <vue-slider multiple v-model="form_v_model[parent_index]" :min="item.min" :max="item.max" :interval="item.step" :direction="sliderDirection(item)" style="height: 300px;[item.vertical ? {'height': '300px'} : {}]"></vue-slider>
            </div>
          </div>
          <div class="m-2" v-if="isInputField(item)">
              <div v-if="item.type=='text'">
                <label class="item-name mr-2" for="item.name">{{ item.name }}: </label>
                <input type="text" id="item.name" name="item.name" :maxlength="item.maxlength" v-model="form_v_model[parent_index]">
              </div>
              <div v-if="item.type=='number'">
                <label class="item-name mr-2" for="item.name">{{ item.name }}: </label>
                <input type="number" id="item.name" name="item.name" :max="item.max" :min="item.min" :step="item.step" v-model="form_v_model[parent_index]">
              </div>
            </div>
          <div class="m-2" v-if="!item.gui_type && form_v_model[parent_index]">
            <div class ="item-name">{{item.name}}:</div>
            <!--v-model="form_v_model[parent_index]" -->
            <prism-editor class="my-editor" v-model="form_v_model[parent_index]" :highlight="highlighter" line-numbers></prism-editor>
          </div>
        </div>
        <div class="m-5">
          <div v-for='n in form_v_model.length' :key=n>
            test: {{ form_v_model[n-1] }}
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';

// import Prism Editor
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css'; // import the styles somewhere

// import highlighting library (you can use any library you want just return html string)
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css'; // import syntax highlighting styles

export default {
  name: 'app',
  components: {
    VueSlider, 
    PrismEditor
  }, 
  data () {
    return {
      /* eslint-disable-next-line */
      json: '{ "identifier"  : "11483f23-95bf-424a-98a5-ee5868c85c3e","metadata": { "display_name" : "Aufgabe 1", "description" : "Schreiben Sie eine C-Funktion..."},"environment" : "C","files" : [{ "identifier": "22483f42-95bf-984a-98a5-ee9485c85c3e", "path"      : "code.c","metadata"  : {  "MIMEtype": "text/plain",  "syntaxHighlighting": "C" },"parts" :  [{ "identifier": "preamble","access"    : "visible",  "metadata"  : { "name"    : "Info: source before your code.","emphasis"  : "low"},"content"   : "I2luY2x1ZGUgPHN0ZGlvLmg-Cg" },{ "identifier": "codeFromStudent","access"    : "modifiable","metadata"  :{ "name"    : "Fill in your code!","emphasis"  : "medium"},"content" : "dm9pZCBiYXIoKSB7IC8qIFNjaHJlaWJlbiBTaWUgaGllciBDb2RlLCBkZXIgImJhciIgYXVzZ2lidC4gKi8KCn0K"},{ "identifier": "postscript","access"    : "visible","metadata"  :{ "name"      : "Info: source after your code calling bar() in it.", "emphasis"  : "low"}, "content" : "aW50IG1haW4oKSB7IGJhcigpOyByZXR1cm4gMDsgfQ" }] }],"parameters" : { "__checkbox__" : { "gui_type": "checkbox", "name": "options", "values": ["verbose", "debug", "make_plot"], "selected": ["verbose"]}, "__radioButton__" : { "gui_type": "radio", "name": "backend", "values": ["debug", "serial", "hpc", "test"], "selected": "serial", "disabled" : ["hpc"]}, "__dropdownSingle__" : { "gui_type": "dropdown", "name": "model", "values" : ["Please choose one", "1p", "1pnc", "1pncmin", "2p", "2p1c"], "selected" : "1p", "disabled" : ["Please choose one"], "multiple" : false }, "__dropdownMultiple__" : { "gui_type": "dropdown", "name": "model", "values" : ["Please choose multiple", "1p", "1pnc", "1pncmin", "2p", "2p1c"], "selected" : ["1p", "2p"], "disabled" : ["Please choose multiple", "2p1c"], "multiple" : true }, "__toggle__" : { "gui_type": "toggle", "name": "options", "values" : ["verbose", "debug", "make_plot"], "selected" : ["verbose"]}, "__sliderSingle__" : { "gui_type": "slider", "name": "temperature", "value" : 10, "min" : 0, "max" : 500, "step" : 10, "multiple" : false, "vertical" : false}, "__sliderMultiple__" : { "gui_type": "slider", "name": "temperature", "value" : [25, 50, 75], "min" : 0, "max" : 100, "step" : 5, "multiple" : true, "vertical" : true}, "__inputTextWMaxlength__" : { "gui_type": "input_field", "name": "file_name", "type" : "text", "maxlength" : 200}, "__inputTextWOMaxlangth__" : { "gui_type": "input_field", "name": "file_name", "type" : "text"}, "__inputNumber__" : { "gui_type": "input_field", "name": "time_delay", "type" : "number", "value" : 10, "min" : 0, "max" : 500, "step" : 0.1}, "__defaultJson__" : { "name": "code 1", "code" : "I2luY2x1ZGUgPHN0ZGlvLmg-Cg"}, "__defaultJava__" : { "name": "code 2", "code" : "dm9pZCBiYXIoKSB7IC8qIFNjaHJlaWJlbiBTaWUgaGllciBDb2RlLCBkZXIgImJhciIgYXVzZ2lidC4gKi8KCn0K"}, "__git__" :{ "gui_type" : "input_field","name"     : "stepwidth","type"     : "number","value"    : 0.001, "min"      : 0, "max"      : 1 ,"step"     : 0.001 ,"validation" : "range"}}, "configuration" : { "compiling.compiler" : "gcc", "compiling.flags"    : "-O2 -Wall" ,"checking.sources"   : ["codeFromStudent"], "checking.forbiddenCalls": "system execve" ,"linking.flags"      : "-lm" ,"running.commandLineArguments" : "--stepwidth {{ __STEPWIDTH__ }}"}}',
      templates: require.context('./input/', false, /^.*\.json$/).keys(),
      form_v_model: [],
      value: 10
    };
  }, 
  computed: {
    parsedJson: function() {
      var parsed = JSON.parse(this.json).parameters;
      return parsed;
    }
  },
  methods: {
    importAll (r) {
      const cache = {};
      r.keys().forEach(key => cache[key] = r(key));
    }, 
    fillForm_v_model: function() {
      var parsedJson = JSON.parse(this.json).parameters;
      for (var item in parsedJson) {
        if(parsedJson[item].gui_type == "checkbox" || parsedJson[item].gui_type == "toggle"){
            this.form_v_model.push([]);
            for(var i = 0; i < parsedJson[item].values.length; i++){
              var isChecked = false;
              if(parsedJson[item].selected.includes(parsedJson[item].values[i])){
                isChecked = true;
              }
              this.form_v_model[this.form_v_model.length-1].push(isChecked);
            }
        } else if(parsedJson[item].gui_type == "radio" || parsedJson[item].gui_type == "dropdown"){
          this.form_v_model.push(parsedJson[item].selected);
        } else if(parsedJson[item].gui_type == "slider" || (parsedJson[item].gui_type == "input_field" && parsedJson[item].type == "number")){
          this.form_v_model.push(parsedJson[item].value);
        } else if(parsedJson[item].gui_type == "input_field" && parsedJson[item].type == "text"){
          this.form_v_model.push("");
        } else {
          // wie sieht das JSON f�r den Editor aus?
          this.form_v_model.push(this.decodeBase64(parsedJson[item].code));
        }
      }
    },
    isCheckbox: function(item) {
      return item.gui_type === 'checkbox' ? true : false;
    },
    isRadio: function(item) {
      return item.gui_type === 'radio' ? true : false;
    }, 
    isDropdown: function(item) {
      return item.gui_type === 'dropdown' ? true : false;
    }, 
    isToggle: function(item) {
      return item.gui_type === 'toggle' ? true : false;
    }, 
    isSlider: function(item) {
      return item.gui_type === 'slider' ? true : false;
    }, 
    isInputField: function(item) {
      return item.gui_type === 'input_field' ? true : false;
    }, 
    itemWithoutDisabled: function(dropdownItem){
      var array = dropdownItem.values;
      for(var i = 0; i < dropdownItem.disabled.length; i++){
        const indexOfItemToRemove = array.indexOf(dropdownItem.disabled[i]);
        if(indexOfItemToRemove > -1){
          array.splice(indexOfItemToRemove, 1);
        }
      }
      return array;
    },
    sliderDirection: function(sliderItem){
      if(sliderItem.vertical){
        return "ttb";
      }
    return "ltr";
    }, 
    rewriteToBase64: function(base64urlEncodedString) {
		// Replace base64 characters with base64url characters
		base64urlEncodedString = base64urlEncodedString.replace(/-/g, '+').replace(/_/g, '/');

		// Pad for base64
		var padding = base64urlEncodedString.length % 4;
		if(padding) {
			if(padding === 1) {
			
				throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
			}
			
			base64urlEncodedString += new Array(5-padding).join('=');
		}
		
		return base64urlEncodedString;
  },
  decodeBase64: function(base64urlEncodedString){
		var encodedString = this.rewriteToBase64(base64urlEncodedString);

		var decodedString = window.atob(encodedString);
		return decodedString;
	},
    highlighter(code) {
        return highlight(code, languages.js); // languages.<insert language> to return html with markup
    }
  }, 
  mounted() {
    this.fillForm_v_model();
  }
}
</script>

<style>
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.fade-enter-active, .fade-leave-active {
  transition: all 1s ease-in-out;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}

.item-name {
  font-weight: bold;
  font-size: 14pt;
}

.toggle label {
  position: relative;
  display: inline-block;
  width: 10em;
  height: 3.5em;
}

.toggle input {
  display: none;
}
 
.toggle .slider { /* Grundfl�che */
  position: absolute;
  cursor: pointer;
  top: 1.5em; 
  left: 2em;
  width: 3.5em;
  height: 1.5em;
  background-color: #c32e04; 
  border-radius: 1em; 
  transition: all .3s ease-in-out;
}
 
.toggle  .slider::before {  /* verschiebbarer Button */
  position: absolute;
  content: "";
  height: 1.1em;
  width: 1.1em;
  left: .2em;
  bottom: .2em;
  background-color: white;
  border-radius: 50%;
  transition: all .3s ease-in-out;
}

.toggle input:checked + .slider {
  background-color: #5a9900; 
}
 
.toggle  input:checked + .slider::before {
  transform: translateX(1.9em);
}

/* required class */
.my-editor {
  /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
  background: white;
  color: #ccc;
  outline: 1px solid #2d2d2d;

  /* you must provide font-family font-size line-height. Example: */
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
}
</style>
