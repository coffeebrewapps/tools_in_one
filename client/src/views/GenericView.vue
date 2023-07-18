<script setup>
import { ref, computed } from 'vue';
import ToolWindow from '@/components/ToolWindow.vue';
import { useWindowsStore } from '@/stores/windows.js';

const windowsStore = useWindowsStore();

const props = defineProps({
  id: {
    type: String,
    default: null,
  },
  heading: {
    type: String,
    default: null,
  },
  src: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['activated']);

const currentWindow = computed(() => {
  const { found } = windowsStore.findWindow({ id: props.id });
  return found;
});

function activated() {
  emit('activated', currentWindow.value);
}
</script>

<template>
  <ToolWindow
    :heading="heading"
    v-model:x="currentWindow.x"
    v-model:y="currentWindow.y"
    v-model:z="currentWindow.z"
    v-model:w="currentWindow.w"
    v-model:h="currentWindow.h"
    v-model:is-active="currentWindow.active"
    v-model:is-visible="currentWindow.visible"
    @activated="activated"
  >
    <template #body>
      <div class="body">
        <iframe
          :src="src"
          width="100%"
          height="100%"
        />
      </div>
    </template>
  </ToolWindow>
</template>
