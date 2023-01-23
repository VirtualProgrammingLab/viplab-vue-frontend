<template>
    <div class="ansi-output-component">
        <div class="ansi-editor d-flex flex-row">
            <div class="line-numbers-div text-center" :id="divId+'-lines'">
                <pre><span v-for="index in lines.length" :key="index">{{index}}<br/></span></pre>
            </div>
            <div class="console-output pl-1 pr-1" :id="divId+'-content'">
                <!-- pre needed to not squeeze white space, i.e., for asci graphics -->
                <pre><span v-for="(line, index) in lines" :key="index"
                      v-html="line"></span></pre>
            </div>
        </div>
    </div>
</template>

<script>
const AU = require('ansi_up');

export default {
  name: 'AnsiOutput',
  props: {
    divId: String,
    content: String,
  },
  data() {
    return {
      /* TODO: adjust height of stdout to height of right tab,
                    maybe need computed variable for that;
                    in css below height can be "v-bind(height)"
            height: '300px', */
      ansi: undefined,
      lines: [],
    };
  },
  watch: {
    content(concat_content, old_content) {
      if (concat_content === '') {
        // should never come to that branch; instead component is mounted again
        // when content resets
        console.log('Clearing out content of ansioutput');
        this.lines = [];
      } else {
        const new_content = concat_content.substring(old_content.length);
        this.renderContent(new_content);
      }
    },
  },
  /* TODO: would be nice feature
    updated () {
    // auto-scroll to the bottom when the DOM is updated
    this.$el.scrollTop = this.$el.scrollHeight
    }, */
  beforeMount() {
    this.ansi = new AU.default();
  },
  mounted() {
    this.renderContent(this.content);
    // console.log("ansi in mounted")
  },
  methods: {
    renderContent(content) {
      // console.log(this.lines.length);
      const new_lines = content.split(/\r?\n/);
      for (const line_idx in new_lines) {
        this.lines.push(`${this.ansi.ansi_to_html(
          new_lines[line_idx],
        )}<br/>`);
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.ansi-output-component {
    min-height: 250px;
    height: 325px;
    font-family: monospace;
    font-size: inherit;
    line-height: 2;
    border: 1px solid #ddd;
    background-color: #f3f2f3;
    color: rgba(15, 0, 9, 1.0);
    overflow: auto;
}

.ansi-editor {
    align-items: stretch;
}

.line-numbers-div {
    min-width: 43px;
    max-width: 43px;
    color: #333;
    background: #e8e8e8;
    background-color: rgb(232, 232, 232);
    cursor: default;
}

.console-output {
    white-space: nowrap;
}
</style>
