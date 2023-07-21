<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
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
const savedResults = ref([]);
const result = computed(() => {
  if (input.value) {
    try {
      return eval(input.value);
    } catch (err) {
      return null;
    }
  } else {
    return null;
  }
});

function saveResult() {
  savedResults.value.push({
    input: input.value,
    result: result.value,
  });
}

const showTooltip = ref(false);
const showHistoryTooltip = ref(false);

const tooltipClass = computed(() => {
  if (showTooltip.value) {
    return 'tooltip show';
  } else {
    return 'tooltip';
  }
});

const historyTooltipClass = computed(() => {
  if (showHistoryTooltip.value) {
    return 'tooltip show';
  } else {
    return 'tooltip';
  }
});

function copyText(text) {
  navigator.clipboard.writeText(text);
  showHistoryTooltip.value = true;
  setTimeout(() => showHistoryTooltip.value = false, 3000);
}

function copyResult() {
  navigator.clipboard.writeText(result.value);
  showTooltip.value = true;
  setTimeout(() => showTooltip.value = false, 3000);
}

function unsaveResult(i) {
  savedResults.value.splice(i, 1);
}

const refreshInterval = ref();

function autoSave() {
  localStorage.setItem('toolsinone.calculator', JSON.stringify(savedResults.value));
}

function loadSave() {
  const existing = localStorage.getItem('toolsinone.calculator');
  if (existing) {
    savedResults.value = JSON.parse(existing);
  } else {
    savedResults.value = [];
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

          <div class="actions">
            <button
              v-if="result"
              class="btn"
              @click="copyResult"
            >📋</button>

            <button
              v-if="result"
              class="btn"
              @click="saveResult"
            >💾</button>
          </div>

          <div
            :class="tooltipClass"
          >Copied result!</div>

          <pre>
            <code>
{{ result }}
            </code>
          </pre>
        </div> <!-- output-field -->

        <div class="history">
          <div class="title">Recently saved</div>

          <div
            v-for="(saved, i) in savedResults"
            :key="i"
            class="results"
          >
            <div class="result">
              <div
                class="clickable"
                @click="copyText(saved.input)"
              >
                {{ saved.input }}
                <span class="tooltip">Copy input</span>
              </div >
              =
              <div
                class="clickable"
                @click="copyText(saved.result)"
              >
                {{ saved.result }}
                <span class="tooltip">Copy result</span>
              </div>

              <div
                class="action"
                @click="unsaveResult(i)"
              >❌</div>
            </div> <!-- result -->
          </div> <!-- results -->

          <div
            :class="historyTooltipClass"
          >
            Copied!
          </div>
        </div> <!-- history -->
      </div> <!-- body -->
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
  padding: 0 1rem;
  width: 100%;
  height: 4rem;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.body pre code {
  font-size: 0.8rem;
}

.body .output-field .actions {
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

.body .history {
  position: relative;
}

.body .history .title {
  font-weight: 600;
  margin-bottom: 1rem;
}

.body .history .results .result {
  display: flex;
  align-items: center;
  gap: 4px;
}

.body .history .results .result .clickable:hover {
  cursor: pointer;
  font-weight: 600;
}

.body .history .results .result .clickable {
  position: relative;
}

.body .history .results .result .clickable .tooltip {
  position: absolute;
  top: 1rem;
  left: 2rem;
  display: none;
  padding: 0.5rem;
  width: 100px;
  text-align: center;
  font-size: 0.8rem;
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  opacity: 0.8;
  z-index: 1;
}

.body .history .results .result .clickable:hover .tooltip {
  display: inline-block;
}

.body .history .results .result .action {
  font-size: 0.7rem;
}

.body .history .results .result .action:hover {
  cursor: pointer;
  font-size: 0.8rem;
}

.body .history .tooltip {
  display: none;
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem;
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.8rem;
  opacity: 0.8;
  z-index: 1;
}

.body .history .tooltip.show {
  display: inline-block;
}
</style>
