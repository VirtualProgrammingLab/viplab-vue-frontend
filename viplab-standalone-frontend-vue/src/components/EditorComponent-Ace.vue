<template>
  <div class="editor-component-ace">
    <validation-provider v-if="pattern" :rules="{required: true, editorRegex: editor.pattern}" v-slot="{ errors }">
      <div 
        :id=editor.identifier 
        style="width: 100%; height: 100%;">
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

extend('editorRegex', (value, arg) => {
  //console.log("editor oneof " + value + " arg: " + arg);
  console.log("validation: " + value);
  const regex = new RegExp(arg);
  if (regex.test(value)) {
    return true;
  }
  return 'Field format invalid! Has to be: ' + arg;
});
/*
extend('editorRange', (value, [min, max]) => {
  //console.log("editor oneof " + value + " min: " + min + " max: " + max);
  if (value >= min && value <= max) {
    return true;
  }
  return 'Value has to be between ' + min + ' and ' + max + '!'
});*/

import 'ace-builds'
import 'ace-builds/webpack-resolver'

export default {
  name: "AceEditorComponent",
  components: {
    ValidationProvider
  },
  props: {
    item: Object,
    readonly: Boolean,
    isParameter: Boolean,
    lang: String,
  },
  computed: {
    pattern: function() {
      if(this.editor.validation === "pattern") {
        return true;
      } else {
        return false;
      }
    },
  },
  data() {
    return {
      editor: this.item,
      aceEditor: Object,
    };
  },
  methods: {
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
    },
  },
  mounted () {
    const lang = this.lang || 'text'
  
		this.aceEditor = window.ace.edit(this.editor.identifier, {
      useWorker: false
    });
    
    if (this.isParameter) {
      if (Array.isArray(this.editor.value)) {
        this.vModel =  this.decodeBase64(this.editor.value[0]);
      } else {
        this.vModel = this.decodeBase64(this.editor.value);
      }
      this.aceEditor.setValue(this.vModel, 1)
    } else {
      this.vModel = this.decodeBase64(this.editor.content);
      this.aceEditor.setValue(this.vModel, 1)
    }

    // set editor to readonly depending on parameter
    this.aceEditor.setReadOnly(this.readonly);
    
    // set mode and theme
    this.aceEditor.getSession().setMode(`ace/mode/${lang}`)
    if(this.readonly) {
      this.aceEditor.setTheme(`ace/theme/katzenmilch`)
    } else {
      this.aceEditor.setTheme(`ace/theme/xcode`)
    }

    // set font size to inherit
    this.aceEditor.setOptions({
      fontFamily: "Consolas",
      fontSize: "inherit"
    });

    // disable the vertical grey line at 80 chars visible in the editor
    this.aceEditor.setShowPrintMargin(false);

    this.aceEditor.on('change', () => {
      this.beforeContent = this.aceEditor.getValue()
      this.$emit('change-content', this.aceEditor.getValue())
      this.vModel = this.aceEditor.getValue();
      if (this.isParameter) {
        this.$set(this.editor , "value", this.vModel);
        this.editor.value = [btoa(this.vModel)];
      } else {
        this.editor.content = btoa(this.vModel);
      }
      console.log("on-change " + this.aceEditor.getValue() + " - " + this.editor.content);
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.editor-component-ace{
  height: 100px;
  border: 1px solid #ddd;
}

.error{
  color: red;
}
</style>