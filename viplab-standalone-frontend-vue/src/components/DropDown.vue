<template>
  <div class="dropdown-component">
    <div class ="item-name">{{item.metadata.name}}:</div>
    <div class="dropdown form-group">
        <select class="form-control" v-if="vModel[parent_index].constructor.name === 'Array'" v-model="vModel[parent_index]" multiple>
            <option v-for="(disabled, index) in itemsDisabled(item)" disabled :key="'dropdis'+parent_index + ' ' +index">{{ disabled }}</option>
            <option v-for="(drop, index) in itemWithoutDisabled(item)" :key="'drop'+parent_index + ' ' +index">{{ drop }}</option>
        </select>
        <select class="form-control" v-else v-model="vModel[parent_index]">
            <option v-for="(disabled, index) in itemsDisabled(item)" disabled :key="'dropdis'+parent_index + ' ' +index">{{ disabled }}</option>
            <option v-for="(drop, index) in itemWithoutDisabled(item)" :key="'drop'+parent_index + ' ' +index">{{ drop }}</option>
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
    v_model_var: Array
  },
  data() {
    return {
      vModel: this.v_model_var  
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