<script setup>
import { onMounted, ref, computed } from 'vue';
import ToolWindow from '@/components/ToolWindow.vue';
import { useWindowsStore } from '@/stores/windows.js';
import Prism from 'prismjs';
import { prettyPrint } from 'html';

const windowsStore = useWindowsStore();

const emit = defineEmits(['activated']);

const htmlWindow = computed(() => {
  const { found } = windowsStore.findWindow({ id: 'htmlformatter' });
  return found;
});

function activated() {
  emit('activated', htmlWindow.value);
}

const spacing = ref(4);
const rawHtml = ref();

const htmlData = computed(() => {
  return rawHtml.value;
});

const html = computed(() => {
  if (htmlData.value) {
    return prettyPrint(
      htmlData.value,
      {
        indent_size: parseInt(spacing.value),
      }
    );
  } else {
    return '';
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

function copyCode() {
  navigator.clipboard.writeText(html.value);
  showTooltip.value = true;
  setTimeout(() => showTooltip.value = false, 3000);
}

onMounted(() => {
  Prism.highlightAll(false);
});
</script>

<template>
  <ToolWindow
    heading="HTML Formatter"
    v-model:x="htmlWindow.x"
    v-model:y="htmlWindow.y"
    v-model:z="htmlWindow.z"
    v-model:w="htmlWindow.w"
    v-model:h="htmlWindow.h"
    v-model:is-active="htmlWindow.active"
    v-model:is-visible="htmlWindow.visible"
    v-model:prevent-active="htmlWindow.preventActive"
    @activated="activated"
  >
    <template #body>
      <div class="body">
        <div class="input-field">
          <div class="heading">Raw HTML:</div>

          <textarea
            v-model="rawHtml"
          />

          <select v-model="spacing">
            <option value="2">2-space</option>
            <option value="4">4-space</option>
          </select>
        </div>

        <div class="output-field">
          <div class="heading">Formatted:</div>

          <button
            v-if="html"
            class="btn"
            @click="copyCode"
          >📋</button>

          <div
            :class="tooltipClass"
          >Copied formatted HTML!</div>

          <pre class="language-html">
            <code>
{{ html }}
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
