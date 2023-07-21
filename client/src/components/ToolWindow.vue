<script setup>
import { ref, computed } from 'vue';
import VueDragResize from '@/components/VueDragResize.vue';
import { useWindowsStore } from '@/stores/windows.js';

const windowsStore = useWindowsStore();

const props = defineProps({
  id: {
    type: String,
    default: null,
  },
  heading: {
    type: String,
    default: 'Tool',
  },
  w: {
    type: Number,
    default: 600,
  },
  h: {
    type: Number,
    default: 400,
  },
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
  z: {
    type: Number,
    default: 100,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  preventActive: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'update:w',
  'update:h',
  'update:x',
  'update:y',
  'update:z',
  'update:isActive',
  'update:isVisible',
  'update:preventActive',
  'activated',
]);

const currentWindow = ref({
  id: props.id,
  x: props.x,
  y: props.y,
  z: props.z,
  w: props.w,
  h: props.h,
  active: props.isActive,
  visible: props.isVisible,
  preventActive: props.preventActive,
});

const minWidth = ref(600);
const minHeight = ref(400);

const width = computed(() => {
  return props.w;
});

const height = computed(() => {
  return props.h;
});

const top = computed(() => {
  return props.y;
});

const left = computed(() => {
  return props.x;
});

const collapsed = ref(false);

const toolWindowClass = computed(() => {
  const classNames = [];
  classNames.push('tool-window');

  if (collapsed.value) {
    classNames.push('collapsed');
  }

  return classNames.join(' ');
});

function resize(newRect) {
  currentWindow.value.x = newRect.left;
  currentWindow.value.y = newRect.top;
  currentWindow.value.w = newRect.width;
  currentWindow.value.h = newRect.height;

  saveWindow();

  emit('update:x', currentWindow.value.x);
  emit('update:y', currentWindow.value.y);
  emit('update:w', currentWindow.value.w);
  emit('update:h', currentWindow.value.h);
}

function hide() {
  collapsed.value = true;
}

function show() {
  collapsed.value = false;
}

function close() {
  currentWindow.value.visible = false;
  saveWindow();
  emit('update:isVisible', currentWindow.value.visible);
}

function pin() {
  currentWindow.value.preventActive = !currentWindow.value.preventActive;
  currentWindow.value.active = false;
  saveWindow();
  emit('update:isActive', currentWindow.value.active);
  emit('update:preventActive', currentWindow.value.preventActive);
}

function activated() {
  currentWindow.value.z = 101;
  currentWindow.value.active = true;

  saveWindow();

  emit('update:z', currentWindow.value.z);
  emit('update:isActive', currentWindow.value.active);
  emit('activated', currentWindow.value);
}

function deactivated() {
  currentWindow.value.z = 100;
  currentWindow.value.active = false;

  saveWindow();

  emit('update:z', currentWindow.value.z);
  emit('update:isActive', currentWindow.value.active);
}

function saveWindow() {
  windowsStore.updateWindow(currentWindow.value);
}
</script>

<template>
  <VueDragResize
    :content-class="toolWindowClass"
    :w="width"
    :h="height"
    :x="left"
    :y="top"
    :z="z"
    :minw="minWidth"
    :minh="minHeight"
    :snapToGrid="true"
    :gridX="50"
    :gridY="50"
    :isActive="isActive"
    :isDraggable="true"
    :isResizable="true"
    :preventActiveBehavior="preventActive"
    @resizing="resize"
    @dragging="resize"
    @activated="activated"
    @deactivated="deactivated"
  >
    <template #header>
      <div
        class="heading"
      >
        <div class="text">
          {{ heading }}
        </div>

        <div class="actions">
          <div
            v-if="!collapsed"
            class="action"
            @click="hide"
          >➖</div>

          <div
            v-if="collapsed"
            class="action"
            @click="show"
          >➕</div>
          <div
            class="action"
            @click="close"
          >✖️</div>

          <div
            class="action"
            @click="pin"
          >📌</div>
        </div>
      </div>
    </template>

    <div
      class="body"
    >
      <slot name="body"/>
    </div>
  </VueDragResize>
</template>

<style scoped>
.tool-window {
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.tool-window.collapsed {
  height: 40px;
  overflow: hidden;
}

.tool-window .heading {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: var(--retro-orange);
  color: var(--halloween-navy);
}

.tool-window .heading .actions {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  z-index: 1000;
}

.tool-window .heading .actions .action:hover {
  cursor: pointer;
}

.tool-window .heading .text {
  flex-grow: 1;
  font-weight: 600;
}

.tool-window .body {
  padding: 1rem;
  height: 100%;
  overflow: auto;
}
</style>
