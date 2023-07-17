<template>
  <div class="about">
    <h1>This is an about page</h1>
    <div class="success">This is a good news.</div>
    <div class="warning">This is a warning.</div>
    <div class="error">This is an error.</div>
  </div>
</template>

<style scoped>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    place-items: center;
    place-content: center;
  }
}
</style>
