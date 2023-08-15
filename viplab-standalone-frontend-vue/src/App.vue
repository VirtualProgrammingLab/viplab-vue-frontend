<template>
  <div id="injected">
    <router-view></router-view>
  </div>
</template>

<script>

// eslint-disable-next-line global-require
global.Buffer = global.Buffer || require('buffer').Buffer;

export default {
  name: 'app',
};
</script>

<style lang="scss">
body {
  /* Needed for the position sticky to work */
  overflow: unset !important;
}

#injected {
  .outer-div {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    padding: 10px;
  }

  .item-name {
    font-weight: bold;
    font-size: 14pt;
  }

}
</style>
