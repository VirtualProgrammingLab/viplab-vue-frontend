<template>
  <div class="editor-component">
    <div v-if="isParameter == true">
      <div class="item-name">{{ editor.metadata.name }}:</div>
    </div>
    <!-- if validation is set to pattern -->
    <validation-provider v-if="pattern" :rules="{required: true, editorRegex: editor.pattern}" v-slot="{ errors }">
      <div v-if="readonly == true">
        <prism-editor
          class="my-editor editor-readonly"
          :readonly="true"
          v-model="vModel"
          :highlight="highlighter"
          line-numbers
        ></prism-editor>
      </div>
      <div v-else>
        <prism-editor
          class="my-editor"
          v-model="vModel"
          :highlight="highlighter"
          line-numbers
        ></prism-editor>
      </div>
      <span class="error">{{ errors[0] }}</span>
    </validation-provider>
    <!-- if validation is set to range -->
    <validation-provider v-else-if="editor.validation === 'range'" :rules="{required: true, editorRange: [editor.min, editor.max]}" v-slot="{ errors }">
      <div v-if="readonly == true">
        <prism-editor
          class="my-editor editor-readonly"
          :readonly="true"
          v-model="vModel"
          :highlight="highlighter"
          line-numbers
        ></prism-editor>
      </div>
      <div v-else>
        <prism-editor
          class="my-editor"
          v-model="vModel"
          :highlight="highlighter"
          line-numbers
        ></prism-editor>
      </div>
      <span class="error">{{ errors[0] }}</span>
    </validation-provider>
    <!-- if validation is set to none -->
    <div v-else>
      <div v-if="readonly == true">
        <prism-editor
          class="my-editor editor-readonly"
          :readonly="true"
          v-model="vModel"
          :highlight="highlighter"
          line-numbers
        ></prism-editor>
      </div>
      <div v-else>
        <prism-editor
          class="my-editor"
          v-model="vModel"
          :highlight="highlighter"
          line-numbers
        ></prism-editor>
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

import { ValidationProvider, extend } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';

extend('required', {
  ...required,
  message: 'This field is required'
});

extend('editorRegex', (value, arg) => {
  //console.log("editor oneof " + value + " arg: " + arg);
  const regex = new RegExp(arg);
  if (regex.test(value)) {
    return true;
  }
  return 'Field format invalid! Has to be: ' + arg;
});

extend('editorRange', (value, [min, max]) => {
  //console.log("editor oneof " + value + " min: " + min + " max: " + max);
  if (value >= min && value <= max) {
    return true;
  }
  return 'Value has to be between ' + min + ' and ' + max + '!'
});

export default {
  name: "EditorComponent",
  components: {
    PrismEditor,
    ValidationProvider
  },
  props: {
    item: Object,
    readonly: Boolean,
    isParameter: Boolean,
  },
  computed: {
    vModel: {
      get: function () {
        if (this.isParameter === true) {
          //console.log("get: " + this.decodeBase64(this.editor.value));
          if (Array.isArray(this.editor.value)) {
            return this.decodeBase64(this.editor.value[0]);
          } else {
            return this.decodeBase64(this.editor.value);
          }
          
        } else {
          return this.decodeBase64(this.editor.content);
        }
      },
      set: function (val) {
        if (this.isParameter) {
          this.$set(this.editor , "value", val);
          this.editor.value = [btoa(val)];
        } else {
          this.editor.content = btoa(val);
        }
        this.$forceUpdate();
        return this.vModel;
      }
    },
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
    };
  },
  methods: {
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
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.my-editor{
  border: 1px solid #ddd;
}
.error{
  color: red;
}
</style>