<script setup>
import { ref, computed } from 'vue';
import ToolWindow from '@/components/ToolWindow.vue';

const jsonWindowVisible = ref(true);
const jsonWindowZ = ref(100);
const jsonWindowActive = ref(false);

function jsonWindowClose() {
  jsonWindowVisible.value = false;
}

function jsonWindowActivated() {
  jsonWindowZ.value = 101;
  colorWindowZ.value = 100;
  jsonWindowActive.value = true;
  colorWindowActive.value = false;
}

function jsonWindowDeactivated() {
  jsonWindowZ.value = 100;
  jsonWindowActive.value = false;
}

const colorWindowVisible = ref(true);
const colorWindowZ = ref(100);
const colorWindowActive = ref(false);

function colorWindowClose() {
  colorWindowVisible.value = false;
}

function colorWindowActivated() {
  colorWindowZ.value = 101;
  jsonWindowZ.value = 100;
  colorWindowActive.value = true;
  jsonWindowActive.value = false;
}

function colorWindowDeactivated() {
  colorWindowZ.value = 100;
  colorWindowActive.value = false;
}

const jsonData = ref([
  {
    heading: 'JSON Formatter',
    initialX: 0,
    initialY: 0,
    initialZ: jsonWindowZ.value,
    isActive: jsonWindowActive.value,
  },
  {
    heading: 'Color Code',
    initialX: 0,
    initialY: 0,
    initialZ: colorWindowZ.value,
    isActive: colorWindowActive.value,
  },
]);

const rawJson = computed({
  get: () => {
    return JSON.stringify(jsonData.value);
  },
  set: (val) => {
    jsonData.value = JSON.parse(val);
  },
});

const json = computed(() => {
  return JSON.stringify(
    jsonData.value,
    false,
    4
  );
});
</script>

<template>
  <main>
    <ul>
      <li>
        <a @click="jsonWindowVisible = true">
          JSON Formatter
        </a>
      </li>

      <li>
        <a @click="colorWindowVisible = true">
          Color Code
        </a>
      </li>
    </ul>

    <ToolWindow
      v-if="jsonWindowVisible"
      heading="JSON Formatter"
      :initial-x="0"
      :initial-y="0"
      :initial-z="jsonWindowZ"
      :is-active="jsonWindowActive"
      @close="jsonWindowClose"
      @activated="jsonWindowActivated"
      @deactivated="jsonWindowDeactivated"
    >
      <template #body>
        <div class="body">
          <textarea v-model="rawJson" />

          <pre>
            <code>
  {{ json }}
            </code>
          </pre>
        </div>
      </template>
    </ToolWindow>

    <ToolWindow
      v-if="colorWindowVisible"
      heading="Color Code"
      :initial-x="600"
      :initial-y="0"
      :initial-z="colorWindowZ"
      :is-active="colorWindowActive"
      @close="colorWindowClose"
      @activated="colorWindowActivated"
      @deactivated="colorWindowDeactivated"
    >
      <template #body>
        <div
          v-for="(_, i) in Array(20)"
          :key="i"
          :style="`background-color:rgb(${(i + 3) * 13}, ${(i + 2) * 7}, ${(i + 1) * 5});`"
        >
          rgb({{(i + 3) * 13}}, {{(i + 2) * 7}}, {{(i + 1) * 5}})
        </div>
      </template>
    </ToolWindow>
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
