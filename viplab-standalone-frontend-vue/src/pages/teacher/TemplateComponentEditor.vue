<script>
import AceEditorComponent from "@/components/EditorComponent-Ace.vue";

export default {
  name: "TemplateComponentEditor",
  components: { AceEditorComponent },
  props: {
    editorIdentifier: String,
    editorContent: Object,
  },
  methods: {
    setEditorValue( event ) {
      this.$emit('updated', event);
    },
  }
}
</script>

<template>
  <div>
    <label class="mr-2" for="editorParameter.default">Value: </label>
    <ace-editor-component
      :isParameter="false"
      :isHandlebar="false"
      :readonly="false"
      :item='{
                                "identifier" : "Editor" + editorIdentifier,
                                "content" : editorContent
                              }'
      v-on:update:item="setEditorValue($event)"
    ></ace-editor-component>
  </div>
</template>

<style scoped>

</style>
