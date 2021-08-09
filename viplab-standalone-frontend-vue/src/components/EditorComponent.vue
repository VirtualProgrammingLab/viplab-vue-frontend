<template>
  <div class="editor-component">
    <div v-if="isParameter == true">
      <div class="item-name">{{ editor.metadata.name }}:</div>
    </div>
    <div v-if="readonly == true">
      <!--v-bind:class="{
                            'top-editor': partParent_index == 0,
                            'bottom-editor':
                              partParent_index == file.parts.length - 1,
                          }"-->
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

export default {
  name: "EditorComponent",
  components: {
    PrismEditor,
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
          console.log("get: " + this.decodeBase64(this.editor.value));
          return this.decodeBase64(this.editor.value);
        } else {
          return this.decodeBase64(this.editor.content);
        }
      },
      set: function (val) {
        if (this.isParameter) {
          this.$set(this.editor , "value", val);
          this.editor.value = btoa(val);
        } else {
          this.editor.content = btoa(val);
        }
        this.$forceUpdate();
        return this.vModel;
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
</style>