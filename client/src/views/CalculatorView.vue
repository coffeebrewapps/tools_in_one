<script setup>
import { ref, computed } from 'vue';
import ToolWindow from '@/components/ToolWindow.vue';
import { useWindowsStore } from '@/stores/windows.js';

const windowsStore = useWindowsStore();

const emit = defineEmits(['activated']);

const calcWindow = computed(() => {
  const { found } = windowsStore.findWindow({ id: 'calculator' });
  return found;
});

function activated() {
  emit('activated', calcWindow.value);
}

const input = ref();
const result = computed(() => {
  if (input.value) {
    return eval(input.value);
  } else {
    return null;
  }
});

const showTooltip = ref(false);

const tooltipClass = computed(() => {
  if (showTooltip.value) {
    return 'tooltip show';
  } else {
    return 'tooltip';
  }
});

function copyResult() {
  navigator.clipboard.writeText(result.value);
  showTooltip.value = true;
  setTimeout(() => showTooltip.value = false, 3000);
}
</script>

<template>
  <ToolWindow
    heading="Calculator"
    v-model:x="calcWindow.x"
    v-model:y="calcWindow.y"
    v-model:z="calcWindow.z"
    v-model:w="calcWindow.w"
    v-model:h="calcWindow.h"
    v-model:is-active="calcWindow.active"
    v-model:is-visible="calcWindow.visible"
    v-model:prevent-active="calcWindow.preventActive"
    @activated="activated"
  >
    <template #body>
      <div class="body">
        <div class="input-field">
          <div class="heading">Input:</div>

          <textarea
            v-model="input"
          />
        </div>

        <div class="output-field">
          <div class="heading">Result:</div>

          <button
            v-if="result"
            class="btn"
            @click="copyResult"
          >📋</button>

          <div
            :class="tooltipClass"
          >Copied result!</div>

          <pre>
            <code>
{{ result }}
            </code>
          </pre>
        </div>
      </div>
    </template>
  </ToolWindow>
</template>

<style scoped>
.body {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.body .input-field textarea {
  width: 100%;
  min-height: 100px;
}

.body .input-field .heading,
.body .output-field .heading {
  font-weight: 600;
}

.body .output-field {
  position: relative;
}

.body .output-field pre {
  padding: 1rem;
  width: 100%;
  overflow: auto;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.body pre code {
  font-size: 0.8rem;
}

.body .output-field .btn {
  position: absolute;
  top: 2rem;
  right: 1rem;
}

.body .output-field .tooltip {
  display: none;
  position: absolute;
  top: 4rem;
  right: 1rem;
  padding: 0.5rem;
  text-align: center;
  font-size: 0.8rem;
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  opacity: 0.8;
  z-index: 1;
}

.body .output-field .tooltip.show {
  display: inline-block;
}
</style>
