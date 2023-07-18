<script setup>
import { ref, computed } from 'vue';
import ToolWindow from '@/components/ToolWindow.vue';
import { useWindowsStore } from '@/stores/windows.js';

const windowsStore = useWindowsStore();

const emit = defineEmits(['activated']);

const jsonWindow = computed(() => {
  const { found } = windowsStore.findWindow({ id: 'jsonformatter' });
  return found;
});

function activated() {
  emit('activated', jsonWindow.value);
}

const jsonData = ref([
  jsonWindow.value,
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
  <ToolWindow
    heading="JSON Formatter"
    v-model:x="jsonWindow.x"
    v-model:y="jsonWindow.y"
    v-model:z="jsonWindow.z"
    v-model:w="jsonWindow.w"
    v-model:h="jsonWindow.h"
    v-model:is-active="jsonWindow.active"
    v-model:is-visible="jsonWindow.visible"
    @activated="activated"
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
</template>
