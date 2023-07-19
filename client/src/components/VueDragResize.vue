<!-- Reference: https://github.com/kirillmurashov/vue-drag-resize -->
<script setup>
import { onMounted, onBeforeUnmount, ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
  stickSize: {
    type: Number, default: 8,
  },
  parentScaleX: {
    type: Number, default: 1,
  },
  parentScaleY: {
    type: Number, default: 1,
  },
  isActive: {
    type: Boolean, default: false,
  },
  preventActiveBehavior: {
    type: Boolean, default: false,
  },
  isDraggable: {
    type: Boolean, default: true,
  },
  isResizable: {
    type: Boolean, default: true,
  },
  aspectRatio: {
    type: Boolean, default: false,
  },
  parentLimitation: {
    type: Boolean, default: false,
  },
  snapToGrid: {
    type: Boolean, default: false,
  },
  gridX: {
    type: Number,
    default: 50,
    validator(val) {
      return val >= 0;
    },
  },
  gridY: {
    type: Number,
    default: 50,
    validator(val) {
      return val >= 0;
    },
  },
  parentW: {
    type: Number,
    default: 0,
    validator(val) {
      return val >= 0;
    },
  },
  parentH: {
    type: Number,
    default: 0,
    validator(val) {
      return val >= 0;
    },
  },
  w: {
    type: [String, Number],
    default: 200,
    validator(val) {
      return (typeof val === 'string') ? val === 'auto' : val >= 0;
    },
  },
  h: {
    type: [String, Number],
    default: 200,
    validator(val) {
      return (typeof val === 'string') ? val === 'auto' : val >= 0;
    },
  },
  minw: {
    type: Number,
    default: 50,
    validator(val) {
      return val >= 0;
    },
  },
  minh: {
    type: Number,
    default: 50,
    validator(val) {
      return val >= 0;
    },
  },
  x: {
    type: Number,
    default: 0,
    validator(val) {
      return typeof val === 'number';
    },
  },
  y: {
    type: Number,
    default: 0,
    validator(val) {
      return typeof val === 'number';
    },
  },
  z: {
    type: [String, Number],
    default: 'auto',
    validator(val) {
      return (typeof val === 'string') ? val === 'auto' : val >= 0;
    },
  },
  dragHandle: {
    type: String,
    default: null,
  },
  dragCancel: {
    type: String,
    default: null,
  },
  sticks: {
    type: Array,
    default() {
      return ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml'];
    },
  },
  axis: {
    type: String,
    default: 'both',
    validator(val) {
      return ['x', 'y', 'both', 'none'].indexOf(val) !== -1;
    },
  },
  contentClass: {
    type: String,
    required: false,
    default: '',
  },
});

const emit = defineEmits([
  'clicked',
  'dragging',
  'dragstop',
  'resizing',
  'resizestop',
  'activated',
  'deactivated',
]);

const vdr = ref('vdr');
const container = ref('container');
const domEvents = ref();
const active = ref(props.isActive);
const zIndex = ref(props.z);
const parentWidth = ref(props.parentW);
const parentHeight = ref(props.parentH);
const left = ref();
const top = ref();
const right = ref();
const bottom = ref();
const minWidth = ref(props.minw);
const minHeight = ref(props.minh);
const limits = ref({
  left: { min: null, max: null },
  right: { min: null, max: null },
  top: { min: null, max: null },
  bottom: { min: null, max: null },
});
const dimensionsBeforeMove = ref({ pointerX: 0, pointerY: 0, x: 0, y: 0, w: 0, h: 0 });
const aspectFactor = ref();
const currentStick = ref();
const stickDrag = ref(false);
const bodyDrag = ref(false);

const styleMapping = {
  y: {
    t: 'top',
    m: 'marginTop',
    b: 'bottom',
  },
  x: {
    l: 'left',
    m: 'marginLeft',
    r: 'right',
  },
};

const vdrClass = computed(() => {
  const classNames = [];
  classNames.push('vdr');

  if (active.value || props.isActive) {
    classNames.push('active');
  } else {
    classNames.push('inactive');
  }

  if (!props.preventActiveBehavior) {
    classNames.push('movable');
  }

  if (props.contentClass) {
    classNames.push(props.contentClass);
  }

  return classNames.join(' ');
});

const positionStyle = computed(() => {
  return {
    top: top.value + 'px',
    left: left.value + 'px',
    zIndex: zIndex.value,
  };
});

const sizeStyle = computed(() => {
  return {
    width: props.w == 'auto' ? 'auto' : width.value + 'px',
    height: props.h == 'auto' ? 'auto' : height.value + 'px',
  };
});

const vdrStick = computed(() => {
  return (stick) => {
    const stickStyle = {
      width: `${props.stickSize / props.parentScaleX}px`,
      height: `${props.stickSize / props.parentScaleY}px`,
    };
    stickStyle[styleMapping.y[stick[0]]] = `${props.stickSize / props.parentScaleX / -2}px`;
    stickStyle[styleMapping.x[stick[1]]] = `${props.stickSize / props.parentScaleX / -2}px`;
    return stickStyle;
  };
});

const width = computed(() => {
  return parentWidth.value - left.value - right.value;
});

const height = computed(() => {
  return parentHeight.value - top.value - bottom.value;
});

const rect = computed(() => {
  return {
    left: Math.round(left.value),
    top: Math.round(top.value),
    width: Math.round(width.value),
    height: Math.round(height.value),
  };
});

function addEvents(events) {
  events.forEach((cb, eventName) => {
    document.documentElement.addEventListener(eventName, cb);
  });
}

function removeEvents(events) {
  events.forEach((cb, eventName) => {
    document.documentElement.removeEventListener(eventName, cb);
  });
}

function deselect() {
  if (props.preventActiveBehavior) {
    return;
  }
  active.value = false;
}

function move(ev) {
  if (!stickDrag.value && !bodyDrag.value) {
    return;
  }

  ev.stopPropagation();

  const pageX = typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
  const pageY = typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;

  const delta = {
    x: (dimensionsBeforeMove.value.pointerX - pageX) / props.parentScaleX,
    y: (dimensionsBeforeMove.value.pointerY - pageY) / props.parentScaleY,
  };

  if (stickDrag.value) {
    stickMove(delta);
  }

  if (bodyDrag.value) {
    if (props.axis === 'x') {
      delta.y = 0;
    } else if (props.axis === 'y') {
      delta.x = 0;
    } else if (props.axis === 'none') {
      return;
    }
    bodyMove(delta);
  }
}

function up(ev) {
  if (stickDrag.value) {
    stickUp(ev);
  } else if (bodyDrag.value) {
    bodyUp(ev);
  }
}

function bodyDown(ev) {
  const { target, button } = ev;

  if (!props.preventActiveBehavior) {
    active.value = true;
  }

  if (button && button !== 0) {
    return;
  }

  emit('clicked', ev);

  if (!active.value) {
    return;
  }

  if (props.dragHandle && target.getAttribute('data-drag-handle') !== vdr.value._uid.toString()) {
    return;
  }

  if (props.dragCancel && target.getAttribute('data-drag-cancel') === vdr.value._uid.toString()) {
    return;
  }

  if (typeof ev.stopPropagation !== 'undefined') {
    ev.stopPropagation();
  }

  if (typeof ev.preventDefault !== 'undefined') {
    ev.preventDefault();
  }

  if (props.isDraggable) {
    bodyDrag.value = true;
  }

  const pointerX = typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
  const pointerY = typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;

  saveDimensionsBeforeMove({ pointerX, pointerY });

  if (props.parentLimitation) {
    limits.value = calcDragLimitation();
  }
}

function bodyMove(delta) {
  let newTop = dimensionsBeforeMove.value.top - delta.y;
  let newBottom = dimensionsBeforeMove.value.bottom + delta.y;
  let newLeft = dimensionsBeforeMove.value.left - delta.x;
  let newRight = dimensionsBeforeMove.value.right + delta.x;

  if (props.snapToGrid) {
    let alignTop = true;
    let alignLeft = true;

    let diffT = newTop - Math.floor(newTop / props.gridY) * props.gridY;
    let diffB = (parentHeight.value - newBottom) -
            Math.floor((parentHeight.value - newBottom) / props.gridY) * props.gridY;
    let diffL = newLeft - Math.floor(newLeft / props.gridX) * props.gridX;
    let diffR = (parentWidth.value - newRight) -
            Math.floor((parentWidth.value - newRight) / props.gridX) * props.gridX;

    if (diffT > (props.gridY / 2)) {
      diffT -= props.gridY;
    }
    if (diffB > (props.gridY / 2)) {
      diffB -= props.gridY;
    }
    if (diffL > (props.gridX / 2)) {
      diffL -= props.gridX;
    }
    if (diffR > (props.gridX / 2)) {
      diffR -= props.gridX;
    }

    if (Math.abs(diffB) < Math.abs(diffT)) {
      alignTop = false;
    }
    if (Math.abs(diffR) < Math.abs(diffL)) {
      alignLeft = false;
    }

    newTop -= (alignTop ? diffT : diffB);
    newBottom = parentHeight.value - height.value - newTop;
    newLeft -= (alignLeft ? diffL : diffR);
    newRight = parentWidth.value - width.value - newLeft;
  }

  ({
    newLeft: left.value,
    newRight: right.value,
    newTop: top.value,
    newBottom: bottom.value,
  } = rectCorrectionByLimit({ newLeft, newRight, newTop, newBottom }));

  emit('dragging', rect.value);
}

function bodyUp() {
  bodyDrag.value = false;
  emit('dragging', rect.value);
  emit('dragstop', rect.value);

  dimensionsBeforeMove.value = { pointerX: 0, pointerY: 0, x: 0, y: 0, w: 0, h: 0 };

  limits.value = {
    left: { min: null, max: null },
    right: { min: null, max: null },
    top: { min: null, max: null },
    bottom: { min: null, max: null },
  };
}

function stickDown(stick, ev, force = false) {
  if ((!props.isResizable || !active.value) && !force) {
    return;
  }

  stickDrag.value = true;

  const pointerX = typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
  const pointerY = typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;

  saveDimensionsBeforeMove({ pointerX, pointerY });

  currentStick.value = stick;

  limits.value = calcResizeLimits();
}

function saveDimensionsBeforeMove({ pointerX, pointerY }) {
  dimensionsBeforeMove.value.pointerX = pointerX;
  dimensionsBeforeMove.value.pointerY = pointerY;

  dimensionsBeforeMove.value.left = left.value;
  dimensionsBeforeMove.value.right = right.value;
  dimensionsBeforeMove.value.top = top.value;
  dimensionsBeforeMove.value.bottom = bottom.value;

  dimensionsBeforeMove.value.width = width.value;
  dimensionsBeforeMove.value.height = height.value;

  aspectFactor.value = width.value / height.value;
}

function stickMove(delta) {
  let newTop = dimensionsBeforeMove.value.top;
  let newBottom = dimensionsBeforeMove.value.bottom;
  let newLeft = dimensionsBeforeMove.value.left;
  let newRight = dimensionsBeforeMove.value.right;
  switch(currentStick.value[0]) {
    case 'b':
      newBottom = dimensionsBeforeMove.value.bottom + delta.y;

      if (props.snapToGrid) {
        newBottom = parentHeight.value -
          Math.round((parentHeight.value - newBottom) / props.gridY) * props.gridY;
      }

      break;

    case 't':
      newTop = dimensionsBeforeMove.value.top - delta.y;

      if (props.snapToGrid) {
        newTop = Math.round(newTop / props.gridY) * props.gridY;
      }

      break;
    default:
      break;
  }

  switch(currentStick.value[1]) {
    case 'r':
      newRight = dimensionsBeforeMove.value.right + delta.x;

      if (props.snapToGrid) {
        newRight = parentWidth.value - Math.round((parentWidth.value - newRight) / props.gridX) * props.gridX;
      }

      break;

    case 'l':
      newLeft = dimensionsBeforeMove.value.left - delta.x;

      if (props.snapToGrid) {
        newLeft = Math.round(newLeft / props.gridX) * props.gridX;
      }

      break;
    default:
      break;
  }

  ({
    newLeft,
    newRight,
    newTop,
    newBottom,
  } = rectCorrectionByLimit({ newLeft, newRight, newTop, newBottom }));

  if (props.aspectRatio) {
    ({
      newLeft,
      newRight,
      newTop,
      newBottom,
    } = rectCorrectionByAspectRatio({ newLeft, newRight, newTop, newBottom }));
  }

  left.value = newLeft;
  right.value = newRight;
  top.value = newTop;
  bottom.value = newBottom;

  emit('resizing', rect.value);
}

function stickUp() {
  stickDrag.value = false;
  dimensionsBeforeMove.value = {
    pointerX: 0,
    pointerY: 0,
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  };
  limits.value = {
    left: { min: null, max: null },
    right: { min: null, max: null },
    top: { min: null, max: null },
    bottom: { min: null, max: null },
  };

  emit('resizing', rect.value);
  emit('resizestop', rect.value);
}

function calcDragLimitation() {
  return {
    left: { min: 0, max: parentWidth.value - width.value },
    right: { min: 0, max: parentWidth.value - width.value },
    top: { min: 0, max: parentHeight.value - height.value },
    bottom: { min: 0, max: parentHeight.value - height.value },
  };
}

function calcResizeLimits() {
  const parentLim = props.parentLimitation ? 0 : null;

  if (props.aspectRatio) {
    if (minWidth.value / minHeight.value > aspectFactor.value) {
      minHeight.value = minWidth.value / aspectFactor.value;
    } else {
      minWidth.value = aspectFactor.value * minHeight.value;
    }
  }

  const _limits = {
    left: { min: parentLim, max: left.value + (width.value - minWidth.value) },
    right: { min: parentLim, max: right.value + (width.value - minWidth.value) },
    top: { min: parentLim, max: top.value + (height.value - minHeight.value) },
    bottom: { min: parentLim, max: bottom.value + (height.value - minHeight.value) },
  };

  if (props.aspectRatio) {
    const aspectLimits = {
      left: {
        min: left.value - (Math.min(top.value, bottom.value) * aspectFactor.value) * 2,
        max: left.value + ((((height.value - minHeight.value) / 2) * aspectFactor.value) * 2),
      },
      right: {
        min: right.value - (Math.min(top.value, bottom.value) * aspectFactor.value) * 2,
        max: right.value + ((((height.value - minHeight.value) / 2) * aspectFactor.value) * 2),
      },
      top: {
        min: top.value - (Math.min(left.value, right.value) / aspectFactor.value) * 2,
        max: top.value + ((((width.value - minWidth.value) / 2) / aspectFactor.value) * 2),
      },
      bottom: {
        min: bottom.value - (Math.min(left.value, right.value) / aspectFactor.value) * 2,
        max: bottom.value + ((((width.value - minWidth.value) / 2) / aspectFactor.value) * 2),
      },
    };

    if (currentStick.value[0] === 'm') {
      _limits.left = {
        min: Math.max(_limits.left.min, aspectLimits.left.min),
        max: Math.min(_limits.left.max, aspectLimits.left.max),
      };
      _limits.right = {
        min: Math.max(_limits.right.min, aspectLimits.right.min),
        max: Math.min(_limits.right.max, aspectLimits.right.max),
      };

    } else if (currentStick.value[1] === 'm') {
      _limits.top = {
        min: Math.max(_limits.top.min, aspectLimits.top.min),
        max: Math.min(_limits.top.max, aspectLimits.top.max),
      };
      _limits.bottom = {
        min: Math.max(_limits.bottom.min, aspectLimits.bottom.min),
        max: Math.min(_limits.bottom.max, aspectLimits.bottom.max),
      };
    }
  }

  return _limits;
}

function sideCorrectionByLimit(limit, current) {
  let value = current;

  if (limit.min !== null && current < limit.min) {
    value = limit.min;
  } else if (limit.max !== null && limit.max < current) {
    value = limit.max;
  }

  return value;
}

function rectCorrectionByLimit(rect) {
  let { newRight, newLeft, newBottom, newTop } = rect;

  newLeft = sideCorrectionByLimit(limits.value.left, newLeft);
  newRight = sideCorrectionByLimit(limits.value.right, newRight);
  newTop = sideCorrectionByLimit(limits.value.top, newTop);
  newBottom = sideCorrectionByLimit(limits.value.bottom, newBottom);

  return {
    newLeft,
    newRight,
    newTop,
    newBottom,
  };
}

function rectCorrectionByAspectRatio(rect) {
  let { newLeft, newRight, newTop, newBottom } = rect;

  let newWidth = parentWidth.value - newLeft - newRight;
  let newHeight = parentHeight.value - newTop - newBottom;

  if (currentStick.value[1] === 'm') {
    const deltaHeight = newHeight - dimensionsBeforeMove.value.height;

    newLeft -= (deltaHeight * aspectFactor.value) / 2;
    newRight -= (deltaHeight * aspectFactor.value) / 2;
  } else if (currentStick.value[0] === 'm') {
    const deltaWidth = newWidth - dimensionsBeforeMove.value.width;

    newTop -= (deltaWidth / aspectFactor.value) / 2;
    newBottom -= (deltaWidth / aspectFactor.value) / 2;
  } else if (newWidth / newHeight > aspectFactor.value) {
    newWidth = aspectFactor.value * newHeight;

    if (currentStick.value[1] === 'l') {
      newLeft = parentWidth.value - newRight - newWidth;
    } else {
      newRight = parentWidth.value - newLeft - newWidth;
    }
  } else {
    newHeight = newWidth / aspectFactor.value;

    if (currentStick.value[0] === 't') {
      newTop = parentHeight.value - newBottom - newHeight;
    } else {
      newBottom = parentHeight.value - newTop - newHeight;
    }
  }

  return { newLeft, newRight, newTop, newBottom };
}

onMounted(() => {
  const parentElement = vdr.value.parentNode;
  parentWidth.value = props.parentW ? props.parentW : parentElement.clientWidth;
  parentHeight.value = props.parentH ? props.parentH : parentElement.clientHeight;

  left.value = props.x;
  top.value = props.y;
  right.value = parentWidth.value - (props.w === 'auto' ? container.value.scrollWidth : props.w) - left.value;
  bottom.value = parentHeight.value - (props.h === 'auto' ? container.value.scrollHeight : props.h) - top.value;

  domEvents.value = new Map([
    ['mousemove', move],
    ['mouseup', up],
    ['mouseleave', up],
    ['mousedown', deselect],
    ['touchmove', move],
    ['touchend', up],
    ['touchcancel', up],
    ['touchstart', up],
  ]);

  addEvents(domEvents.value);

  if (props.dragHandle) {
    [...vdr.value.querySelectorAll(props.dragHandle)].forEach((dragHandle) => {
      dragHandle.setAttribute('data-drag-handle', vdr.value._uid);
    });
  }

  if (props.dragCancel) {
    [...vdr.value.querySelectorAll(props.dragCancel)].forEach((cancelHandle) => {
      cancelHandle.setAttribute('data-drag-cancel', vdr.value._uid);
    });
  }
});

onBeforeUnmount(() => {
    removeEvents(domEvents.value);
});

watch(active, (newVal) => {
  if (newVal) {
    emit('activated');
  } else {
    emit('deactivated');
  }
});

watch(() => props.isActive, (newVal) => {
  active.value = newVal;
}, { immediate: true });

watch(() => props.z, (newVal) => {
  if (newVal >= 0 || newVal === 'auto') {
    zIndex.value = newVal;
  }
}, { immediate: true });

watch(() => props.x, (newVal, oldVal) => {
  if (stickDrag.value || bodyDrag.value || (newVal === left.value)) {
    return;
  }

  const delta = oldVal - newVal;

  bodyDown({ pageX: left.value, pageY: top.value });
  bodyMove({ x: delta, y: 0 });

  nextTick(() => {
    bodyUp();
  });
});

watch(() => props.y, (newVal, oldVal) => {
  if (stickDrag.value || bodyDrag.value || (newVal === top.value)) {
    return;
  }

  const delta = oldVal - newVal;

  bodyDown({ pageX: left.value, pageY: top.value });
  bodyMove({ x: 0, y: delta });

  nextTick(() => {
    bodyUp();
  });
});

watch(() => props.w, (newVal, oldVal) => {
  if (stickDrag.value || bodyDrag.value || (newVal === width.value)) {
    return;
  }

  const stick = 'mr';
  const delta = oldVal - newVal;

  stickDown(stick, { pageX: right.value, pageY: top.value + (height.value / 2) }, true);
  stickMove({ x: delta, y: 0 });

  nextTick(() => {
    stickUp();
  });
});

watch(() => props.h, (newVal, oldVal) => {
  if (stickDrag.value || bodyDrag.value || (newVal === height.value)) {
    return;
  }

  const stick = 'bm';
  const delta = oldVal - newVal;

  stickDown(stick, { pageX: left.value + (width.value / 2), pageY: bottom.value }, true);
  stickMove({ x: 0, y: delta });

  nextTick(() => {
    stickUp();
  });
});

watch(() => props.parentW, (newVal) => {
  right.value = newVal - width.value - left.value;
  parentWidth.value = newVal;
});

watch(() => props.parentH, (newVal) => {
  bottom.value = newVal - height.value - top.value;
  parentHeight.value = newVal;
});
</script>

<template>
  <div
    ref="vdr"
    :class="vdrClass"
    :style="positionStyle"
  >
    <!-- Reference: https://github.com/kirillmurashov/vue-drag-resize/issues/181 -->
    <div
      class="header"
      @mousedown="bodyDown($event)"
      @touchstart="bodyDown($event)"
      @touchend="up($event)"
    >
      <slot name="header"></slot>
    </div>

    <div :style="sizeStyle" class="content-container" ref="container">
      <slot></slot>
    </div>

    <div
      v-for="(stick, i) in sticks"
      :key="i"
      class="vdr-stick"
      :class="['vdr-stick-' + stick, isResizable ? '' : 'not-resizable']"
      @mousedown.stop.prevent="stickDown(stick, $event)"
      @touchstart.stop.prevent="stickDown(stick, $event)"
      :style="vdrStick(stick)">
    </div>
  </div>
</template>

<style>
.vdr {
  position: absolute;
  box-sizing: border-box;
}

.vdr.movable .header:hover {
  cursor: move;
}

.vdr.active:before {
  content: '';
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  outline: 1px dashed #d6d6d6;
}

.vdr-stick {
  box-sizing: border-box;
  position: absolute;
  font-size: 1px;
  background: #ffffff;
  border: 1px solid #6c6c6c;
  box-shadow: 0 0 2px #bbb;
}

.inactive .vdr-stick {
  display: none;
}

.vdr-stick-tl, .vdr-stick-br {
  cursor: nwse-resize;
}

.vdr-stick-tm, .vdr-stick-bm {
  left: 50%;
  cursor: ns-resize;
}

.vdr-stick-tr, .vdr-stick-bl {
  cursor: nesw-resize;
}

.vdr-stick-ml, .vdr-stick-mr {
  top: 50%;
  cursor: ew-resize;
}

.vdr-stick.not-resizable {
  display: none;
}

.content-container {
  display: block;
  position: relative;
}
</style>
