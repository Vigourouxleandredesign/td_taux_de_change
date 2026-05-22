<template>
  <div class="home">
    <div class="home__inner">
      <ExchangeBoardOptions />
    </div>
    <p class="step-link">
      <router-link to="/composition">
        Étape 2 — version refactorisée (Composition API) →
      </router-link>
    </p>
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

<style scoped>
.step-link {
  max-width: 920px;
  margin: 1.25rem auto 0;
  text-align: center;
  font-size: 0.8rem;
}

.step-link a {
  color: rgba(160, 200, 255, 0.9);
  text-decoration: none;
}

.step-link a:hover {
  text-decoration: underline;
}
</style>
