<template>
  <!-- content -->
  <div
    id="app"
    class="flex-container"
  >
    <div class="main-div flex-left m-2 p-2">
      <h2>Teacher</h2>
      <h3>This site will help you create a Computation Template</h3>
    </div>
  </div>
</template>

<script>


export default {
  name: "app",
  components: {
    
  },
  data() {
    return {
      
    };
  },
  computed: {
    
  },
  methods: {
    
  },
  created() {
    
  },
  mounted() {
  },
};
</script>

<style lang="scss">
body {
  /* Needed for the position sticky to work */
  overflow: unset !important;
}

#injected {

  .header {
    overflow: hidden;
    position: relative;
  }

  /* Style the header links */
  .header img {
    float: left;
    border-radius: calc(0.25rem - 1px);
  }

  .header-right {
    text-align: center;
    font-size: 5vw;
    width: 50%;
    position: absolute;
    top: 50%;
    right: 0;
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
  }

  .outer-div {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    padding: 10px;
    /*margin: 0 10px;
    border-radius: 25px;
    max-width: 1170px;
    margin: 0 auto;
    background-color: #fff;*/
  }

  .main-div {
    background-color: #fff;
    border-radius: calc(0.25rem - 1px);
  }

  .item-name {
    font-weight: bold;
    font-size: 14pt;
  }
}
</style>
