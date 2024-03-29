<template>
  <div class="editor-component-ace">
    <div v-if="isParameter == true">
      <div class="item-name">{{ editor.metadata.name }}:</div>
    </div>
    <!-- if validation is set to pattern -->
    <validation-provider v-if="pattern" :rules="{required: true, editorRegex: editor.pattern}" v-slot="{ validate, errors }">
      <div class="ace-editor-parent">
        <div
          class="ace-editor-div"
          :id=editor.identifier
          @DOMSubtreeModified="validate(vModel)">
        </div>
      </div>
      <span class="error">{{ errors[0] }}</span>
    </validation-provider>
    <!-- if validation is set to range -->
    <validation-provider v-else-if="editor.validation === 'range'" :rules="{required: true, editorRange: [editor.min, editor.max]}" v-slot="{ validate, errors }">
      <div class="ace-editor-parent">
        <div
          class="ace-editor-div"
          :id=editor.identifier
          @DOMSubtreeModified="validate(vModel)">
        </div>
      </div>
      <span class="error">{{ errors[0] }}</span>
    </validation-provider>
    <!-- if validation is set to none -->
    <div v-else>
      <div class="ace-editor-parent">
        <div
          class="ace-editor-div"
          :id=editor.identifier>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ValidationProvider, extend } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';

import 'ace-builds';
import 'ace-builds/webpack-resolver';

import base64url from 'base64url';

extend('required', {
  ...required,
  message: 'This field is required',
});

extend('editorRegex', (value, arg) => {
  // console.log("editor oneof " + value + " arg: " + arg);
  // console.log("validation: " + value);
  const regex = new RegExp(arg);
  if (regex.test(value)) {
    return true;
  }
  return `Field format invalid! Has to be: ${arg}`;
});

extend('editorRange', (value, [min, max]) => {
  // console.log("editor oneof " + value + " min: " + min + " max: " + max);
  // console.log("validation: " + value);
  const val = Number(value);
  if (val >= min && val <= max) {
    return true;
  }
  return `Value has to be between ${min} and ${max}!`;
});

export default {
  name: 'AceEditorComponent',
  components: {
    ValidationProvider,
  },
  props: {
    item: Object,
    readonly: Boolean,
    isParameter: Boolean,
    isHandlebar: Boolean,
    lang: String,
    startLineNumber: Number,
  },
  data() {
    return {
      editor: this.item,
      aceEditor: Object,
      vModel: '',
      isSettingContent: false,
    };
  },
  watch: {
    editor: {
      handler(val) {
        // check whether a change was made to the value of the text editor
        // set value of isSettingContent to true such that the value change doesn't result in a loop triggering the OnChange-Listener, which in turn would trigger this watch-function again
        if (this.isParameter) {
          if (Array.isArray(val.value)) {
            if (this.vModel !== base64url.decode(val.value[0])) {
              this.isSettingContent = true;
            }
          } else if (this.vModel !== base64url.decode(val.value)) {
            this.isSettingContent = true;
          }
        } else if (this.vModel !== base64url.decode(val.content)) {
          this.isSettingContent = true;
        }

        if (this.isSettingContent) {
          if (this.isParameter) {
            if (Array.isArray(val.value)) {
              this.vModel = base64url.decode(val.value[0]);
            } else {
              this.vModel = base64url.decode(val.value);
            }
          } else if (this.isHandlebar) {
            this.vModel = val.content;
          } else {
            this.vModel = base64url.decode(val.content);
          }

          try {
            this.aceEditor.setValue(this.vModel, 1);
          } finally {
            this.isSettingContent = false;
          }
        }
      },
      deep: true,
    },
  },
  computed: {
    pattern() {
      if (this.editor.validation === 'pattern') {
        return true;
      }
      return false;
    },
  },
  methods: {
    initvModel() {
      if (this.isParameter) {
        if (Array.isArray(this.editor.value)) {
          this.vModel = base64url.decode(this.editor.value[0]);
        } else {
          this.vModel = base64url.decode(this.editor.value);
        }
      } else if (this.isHandlebar) {
        this.vModel = this.editor.content;
      } else {
        this.vModel = base64url.decode(this.editor.content);
      }
      this.aceEditor.setValue(this.vModel, 1);
    },
    initAce() {
      const lang = this.lang || 'text';
      const firstLine = this.startLineNumber || 1;

      this.aceEditor = window.ace.edit(this.editor.identifier, {
        useWorker: false,
      });

      this.initvModel();

      // set editor to readonly depending on parameter
      this.aceEditor.setReadOnly(this.readonly);

      // set mode and theme
      this.aceEditor.getSession().setMode(`ace/mode/${lang}`);
      if (this.readonly) {
        this.aceEditor.setTheme('ace/theme/katzenmilch');
      } else {
        this.aceEditor.setTheme('ace/theme/xcode');
      }

      // set font size to inherit
      this.aceEditor.setOptions({
        fontSize: 'inherit',
        firstLineNumber: firstLine,
      });
      // firstLineNumber: 10
      // var lines = editor.session.doc.getAllLines() => Number of lines

      // make the editor as high and wide as the surrounding div
      this.aceEditor.resize();

      this.aceEditor.container.style.lineHeight = 2;
      this.aceEditor.renderer.updateFontSize();

      // disable the vertical grey line at 80 chars visible in the editor
      this.aceEditor.setShowPrintMargin(false);

      this.aceEditor.on('change', () => {
        this.beforeContent = this.aceEditor.getValue();
        this.vModel = this.aceEditor.getValue();
        if (!this.isSettingContent) {
          if (this.isParameter) {
            this.$set(this.editor, 'value', this.vModel);
            this.editor.value = [base64url(this.vModel)];
          } else if (this.isHandlebar) {
            this.$set(this.editor, 'content', this.vModel);
            this.editor.content = this.vModel;
          } else {
            this.$set(this.editor, 'content', base64url(this.vModel));
            this.editor.content = base64url(this.vModel);
          }
          // autoscroll if new input is added to the log (editor readonly, e.g. for stdout and stderr)
          if (this.readonly) {
            this.aceEditor.renderer.scrollToLine(Number.POSITIVE_INFINITY);
          }
          this.$emit('update:item', base64url(this.vModel));
          // console.log("on-change " + this.aceEditor.getValue() + " - " + this.editor.content + " " + this.editor.value);
          /* set size
          this.aceEditor.setOptions({
            maxLines: this.aceEditor.getSession().getDocument().getLength() + 1
          });
          this.aceEditor.resize(); */
        }
      });
    },
  },
  mounted() {
    this.initAce();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.ace_editor, .ace_editor *{
font-family: "Monaco", "Menlo", "Ubuntu Mono", "Droid Sans Mono", "Consolas", monospace !important;
font-size: inherit !important;
font-weight: 400 !important;
letter-spacing: 0 !important;
}

.ace-editor-parent {
  height: 250px;
  position: relative;
}

.ace-editor-div {
  border: 1px solid #ddd;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.error {
  color: red;
}
</style>
