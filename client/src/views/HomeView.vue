<script setup>
import { onBeforeMount, onMounted, onBeforeUnmount, ref, computed } from 'vue';
import JsonFormatterView from '@/views/JsonFormatterView.vue';
import HtmlFormatterView from '@/views/HtmlFormatterView.vue';
import ColorCodesView from '@/views/ColorCodesView.vue';
import CalculatorView from '@/views/CalculatorView.vue';
import { useWindowsStore } from '@/stores/windows.js';

const windowsStore = useWindowsStore();

const refreshInterval = ref();

const jsonWindow = computed(() => {
  const { found } = windowsStore.findWindow({ id: 'jsonformatter' });
  return found;
});

const colorWindow = computed(() => {
  const { found } = windowsStore.findWindow({ id: 'colorcodes' });
  return found;
});

const htmlWindow = computed(() => {
  const { found } = windowsStore.findWindow({ id: 'htmlformatter' });
  return found;
});

const calcWindow = computed(() => {
  const { found } = windowsStore.findWindow({ id: 'calculator' });
  return found;
});

function initWindows() {
  windowsStore.addWindow({
    id: 'jsonformatter',
    x: 0,
    y: 0,
    z: 100,
    w: 600,
    h: 400,
    active: false,
    visible: true,
  });

  windowsStore.addWindow({
    id: 'colorcodes',
    x: 600,
    y: 0,
    z: 100,
    w: 600,
    h: 400,
    active: false,
    visible: true,
  });

  windowsStore.addWindow({
    id: 'htmlformatter',
    x: 0,
    y: 440,
    z: 100,
    w: 600,
    h: 400,
    active: false,
    visible: true,
  });

  windowsStore.addWindow({
    id: 'calculator',
    x: 600,
    y: 440,
    z: 100,
    w: 600,
    h: 400,
    active: false,
    visible: true,
  });
}

function activated(activatedWin) {
  windowsStore.windows.forEach((win) => {
    if (win.id === activatedWin.id) { return; }

    windowsStore.updateWindow(Object.assign({}, win, {
      z: 100,
      active: false,
    }));
  });
}

function autoSave() {
  console.log(`[${new Date()}] Saving windows state...`);
  localStorage.setItem('toolsinone.windows', JSON.stringify(windowsStore.windows));
}

function loadSave() {
  const existing = localStorage.getItem('toolsinone.windows');
  if (existing) {
    const saved = JSON.parse(existing);
    saved.forEach((win) => {
      windowsStore.addWindow(win);
    });
  } else {
    initWindows();
  }
}

onBeforeMount(() => {
  loadSave();
});

onMounted(() => {
  refreshInterval.value = setInterval(autoSave, 60000);
});

onBeforeUnmount(() => {
  clearInterval(refreshInterval.value);
});
</script>

<template>
  <main>
    <ul>
      <li>
        <a @click="jsonWindow.visible = true">
          JSON Formatter
        </a>
      </li>

      <li>
        <a @click="colorWindow.visible = true">
          Color Code
        </a>
      </li>

      <li>
        <a @click="htmlWindow.visible = true">
          HTML Formatter
        </a>
      </li>

      <li>
        <a @click="calcWindow.visible = true">
          Calculator
        </a>
      </li>
    </ul>

    <JsonFormatterView
      v-if="jsonWindow.visible"
      @activated="activated"
    >
    </JsonFormatterView>

    <ColorCodesView
      v-if="colorWindow.visible"
      @activated="activated"
    >
    </ColorCodesView>

    <HtmlFormatterView
      v-if="htmlWindow.visible"
      @activated="activated"
    >
    </HtmlFormatterView>

    <CalculatorView
      v-if="calcWindow.visible"
      @activated="activated"
    >
    </CalculatorView>
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
