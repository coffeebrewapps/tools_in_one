<script setup>
</script>

<template>
  <main>
    <div class="bordered">
      <h1>This home page</h1>
      <p>Hello world!</p>
    </div>
  </main>
</template>

<style scoped>
.bordered {
  border: 1px solid var(--color-border);
}

.bordered:hover {
  border: 1px solid var(--color-border-hover);
}

@media (min-width: 1024px) {
  main {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
