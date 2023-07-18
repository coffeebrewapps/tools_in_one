<script setup>
import { onBeforeMount, ref, computed } from 'vue';
import ToolWindow from '@/components/ToolWindow.vue';
import JsonFormatterView from '@/views/JsonFormatterView.vue';
import ColorCodesView from '@/views/ColorCodesView.vue';
import { useWindowsStore } from '@/stores/windows.js';

const windowsStore = useWindowsStore();

const jsonWindow = computed(() => {
  const { found } = windowsStore.findWindow({ id: 'jsonformatter' });
  return found;
});

const colorWindow = computed(() => {
  const { found } = windowsStore.findWindow({ id: 'colorcodes' });
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

onBeforeMount(() => {
  initWindows();
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
