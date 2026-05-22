<template>
  <router-view />
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  -webkit-text-size-adjust: 100%;
}

html,
body {
  margin: 0;
  padding: 0;
  min-height: 100%;
  width: 100%;
  overflow-x: clip;
  background: #050d18;
}

#app {
  width: 100%;
  min-height: 100vh;
  font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
