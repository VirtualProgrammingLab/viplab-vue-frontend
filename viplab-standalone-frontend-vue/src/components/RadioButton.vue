<template>
  <div class="radiobutton-component">
    <div class ="item-name">{{item.name}}:</div>
    <div class="radiobutton form-check custom-control custom-radio" v-for="(radio, index) in itemWithoutDisabled(item)" :key="'Radio' + parent_index + ' ' +index">
        <input class="form-check-input custom-control-input" type="radio" :id="'Radio' + parent_index + ' ' +index" :value="radio" v-model="$parent.form_v_model[parent_index]">
        <label class="form-check-label custom-control-label" :for="'Radio' + parent_index + ' ' +index">{{ radio }}</label>        
    </div>
    <div class="radiobutton form-check custom-control custom-radio" v-for="(radio, index) in item.disabled" :key="'RadioDis' + parent_index + ' ' +index">
        <input class="form-check-input custom-control-input" type="radio" :id="'RadioDis' + parent_index + ' ' +index" disabled :value="radio" v-model="$parent.form_v_model[parent_index]">
        <label class="form-check-label custom-control-label" for="'RadioDis' + parent_index + ' ' +index">{{ radio }}</label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RadioButton',
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