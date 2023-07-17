<script setup>
import { ref, computed } from 'vue';
import VueDragResize from '@/components/VueDragResize.vue';

const props = defineProps({
  heading: {
    type: String,
    default: 'Tool',
  },
  initialX: {
    type: Number,
    default: 0,
  },
  initialY: {
    type: Number,
    default: 0,
  },
  initialZ: {
    type: Number,
    default: 100,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'activated', 'deactivated']);

const minWidth = ref(600);
const minHeight = ref(400);
const width = ref(600);
const height = ref(400);
const top = ref(props.initialY);
const left = ref(props.initialX);

const bodyStyle = computed(() => {
  return `height: ${height.value - 40}px;`;
});

function resize(newRect) {
  width.value = newRect.width;
  height.value = newRect.height;
  top.value = newRect.top;
  left.value = newRect.left;
}

function close(event) {
  emit('close');
}

function onMouseDown(event) {
  const tagName = event.target.tagName;

  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
    event.stopPropagation();
    event.target.focus();
  }
}

function activated() {
  emit('activated');
}

function deactivated() {
  emit('deactivated');
}
</script>

<template>
  <VueDragResize
    class="tool-window"
    :w="width"
    :h="height"
    :x="left"
    :y="top"
    :z="initialZ"
    :minw="minWidth"
    :minh="minHeight"
    :snapToGrid="true"
    :gridX="50"
    :gridY="50"
    :isActive="isActive"
    :isDraggable="true"
    :isResizable="true"
    @mousedown="onMouseDown"
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
            class="action"
            @click="close"
          >✖️</div>
        </div>
      </div>
    </template>

    <div
      class="body"
      :style="bodyStyle"
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
  overflow: auto;
}
</style>
