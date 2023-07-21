<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { RouterView } from 'vue-router';

// true: dark, false: light
const theme = ref(true);

const refreshInterval = ref();

function toggleTheme() {
  theme.value = !theme.value;
}

watch(theme, (newVal) => {
  if (newVal) {
    document.body.classList.toggle('light', false);
    document.body.classList.toggle('dark', true);
  } else {
    document.body.classList.toggle('light', true);
    document.body.classList.toggle('dark', false);
  }
});

function autoSave() {
  localStorage.setItem('toolsinone.theme', theme.value);
}

function loadSave() {
  const existing = localStorage.getItem('toolsinone.theme');
  if (existing) {
    theme.value = JSON.parse(existing);
  } else {
    theme.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}

onMounted(() => {
  loadSave();
  refreshInterval.value = setInterval(autoSave, 60000);
});

onBeforeUnmount(() => {
  clearInterval(refreshInterval.value);
});
</script>

<template>
  <RouterView />

  <div
    class="theme-toggle"
    @click="toggleTheme"
  >
    <div v-if="!theme">☀️</div>
    <div v-if="theme">🌙</div>
  </div>
</template>

<style scoped>
.theme-toggle {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  text-align: center;
  border-radius: 50%;
}

.theme-toggle:hover {
  cursor: pointer;
  opacity: 0.5;
}

@media (min-width: 1024px) {
}
</style>
