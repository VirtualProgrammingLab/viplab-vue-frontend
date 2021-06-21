<template>
  <div class="dropdown-component">
      <div class="item-name">{{ dropitem.metadata.name }}:</div>
      {{dropitem.selected}}
      <div class="dropdown form-group">
        <select
          class="form-control"
          v-if="dropitem.selected.constructor.name === 'Array'"
          v-model="dropitem.selected"
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
        <select class="form-control" v-else v-model="dropitem.selected">
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
  data() {
    return {
      dropitem: this.item  
    }
  },
  methods: {
    /** get all values of an item that are not disabled */
    itemWithoutDisabled: function(item){
      var array = [];
      for(var i = 0; i < item.values.length; i++){
        if(!item.values[i].disabled){
          array.push(item.values[i].value);
        }
      }
      return array;
    },
    itemsDisabled: function(item){
      var array = [];
      for(var i = 0; i < item.values.length; i++){
        if(item.values[i].disabled){
          array.push(item.values[i].value);
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