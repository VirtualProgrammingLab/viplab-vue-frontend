<template>
  <div class="dropdown-component">
      <div class="item-name">{{ dropitem.metadata.name }}:</div>
      <div class="dropdown form-group">
        <select
          class="form-control"
          v-if="dropitem.multiple == true"
          v-model="vModel"
          multiple
        >
          <option
            v-for="(disabled, index) in itemsDisabled(dropitem)"
            disabled
            :key="'dropdis' + ' ' + index"
          >
            {{ disabled }}
          </option>
          <option
            v-for="(drop, index) in itemWithoutDisabled(dropitem)"
            :key="'drop' + ' ' + index"
          >
            {{ drop }}
          </option>
        </select>
        <select class="form-control" v-else v-model="vModel">
          <option
            v-for="(disabled, index) in itemsDisabled(dropitem)"
            disabled
            :key="'dropdis' + ' ' + index"
          >
            {{ disabled }}
          </option>
          <option
            v-for="(drop, index) in itemWithoutDisabled(dropitem)"
            :key="'drop' + ' ' + index"
          >
            {{ drop }}
          </option>
        </select>
      </div>
    </div>
</template>

<script>
export default {
  name: 'DropDown',
  props: {
    item: Object,
    parent_index: Number, 
  },
  watch: {
    /* Make the json change with the clicks of the user */
    vModel() {
      this.dropitem.selected = this.vModel;
    },
  },
  data() {
    return {
      dropitem: this.item,
      vModel: this.item.selected  
    }
  },
  methods: {
    /** get all values of an item that are not disabled */
    itemWithoutDisabled: function(item){
      var array = [];
      for(var i = 0; i < item.options.length; i++){
        if(!item.options[i].disabled){
          array.push(item.options[i].value);
        }
      }
      return array;
    },
    itemsDisabled: function(item){
      var array = [];
      for(var i = 0; i < item.options.length; i++){
        if(item.options[i].disabled){
          array.push(item.options[i].value);
        }
      }
      return array;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>