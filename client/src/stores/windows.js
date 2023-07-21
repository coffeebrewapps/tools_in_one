import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useWindowsStore = defineStore('windows', () => {
  const windows = ref([]);

  function addWindow(win) {
    const { index } = findWindow(win);

    if (index > -1) { return; }

    windows.value.push(win);
  }

  function updateWindow(win) {
    const { index } = findWindow(win);

    if (index < -1) { return; }

    const existing = windows.value[index];
    const updated = Object.assign({}, existing, win);

    windows.value[index] = updated;
    return updated;
  }

  function findWindow(win) {
    const index = windows.value.findIndex(w => w.id === win.id);
    const found = windows.value[index];

    return { index, found };
  }

  function removeWindow(win) {
    const { index } = findWindow(win);

    if (index > -1) {
      windows.value.splice(index, 1);
    }
  }

  return { windows, addWindow, updateWindow, findWindow, removeWindow };
});
