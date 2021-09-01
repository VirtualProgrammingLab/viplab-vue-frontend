<template>
  <div class="togglebutton-component form-item toggle">
    <div class ="item-name">{{toggl.metadata.name}}:</div>
        <div v-for="(toggle, index) in toggl.options" :key="'toggle'+ ' ' +index">
        <label>
            {{ toggle.value }}
            <input type="checkbox" :value="toggle.value" v-model="vModel">
            <span class="slider"></span>
        </label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ToggleButton',
  props: {
    item: Object,
    parent_index: Number
  }, 
  computed: {
    vModel: {
      get: function () {
        return this.item.selected;
      },
      set: function (val) {
        this.$set(this.item , "selected", val);
        this.$forceUpdate();
        return this.vModel;
      }
    },
  },
  data() {
    return {
      toggl: this.item
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>