<template>
  <div class="dropdown-component">
    <div class ="item-name">{{item.name}}:</div>
    <div class="dropdown form-group">
        <select class="form-control" v-if="!item.multiple" v-model="$parent.form_v_model[parent_index]">
            <option v-for="(disabled, index) in item.disabled" disabled :key="'dropdis'+parent_index + ' ' +index">{{ disabled }}</option>
            <option v-for="(drop, index) in itemWithoutDisabled(item)" :key="'drop'+parent_index + ' ' +index">{{ drop }}</option>
        </select>
        <select class="form-control" v-if="item.multiple" v-model="$parent.form_v_model[parent_index]" multiple>
            <option v-for="(disabled, index) in item.disabled" disabled :key="'dropdis'+parent_index + ' ' +index">{{ disabled }}</option>
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
    parent_index: Number
  }, 
  methods: {
    /** get all values of an item that are not disabled */
    itemWithoutDisabled: function(item){
      var array = item.values;
      for(var i = 0; i < item.disabled.length; i++){
        const indexOfItemToRemove = array.indexOf(item.disabled[i]);
        if(indexOfItemToRemove > -1){
          array.splice(indexOfItemToRemove, 1);
        }
      }
      return array;
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>