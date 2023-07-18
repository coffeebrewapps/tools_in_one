<script setup>
import { computed } from 'vue';
import ToolWindow from '@/components/ToolWindow.vue';
import { useWindowsStore } from '@/stores/windows.js';

const windowsStore = useWindowsStore();

const emit = defineEmits(['activated']);

const colorWindow = computed(() => {
  const { found } = windowsStore.findWindow({ id: 'colorcodes' });
  return found;
});

function activated() {
  emit('activated', colorWindow.value);
}
</script>

<template>
  <ToolWindow
    heading="Color Code"
    v-model:x="colorWindow.x"
    v-model:y="colorWindow.y"
    v-model:z="colorWindow.z"
    v-model:w="colorWindow.w"
    v-model:h="colorWindow.h"
    v-model:is-active="colorWindow.active"
    v-model:is-visible="colorWindow.visible"
    @activated="activated"
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
</template>
