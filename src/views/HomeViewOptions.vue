<template>
  <div class="home">
    <div class="home__inner">
      <ExchangeBoardOptions />
    </div>
  </div>
</template>

<script>
import ExchangeBoardOptions from '@/components/ExchangeBoardOptions.vue'

export default {
  name: 'HomeViewOptions',
  components: {
    ExchangeBoardOptions
  }
}
</script>

<style scoped src="./home-view.css"></style>
