<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import ToolWindow from '@/components/ToolWindow.vue';
import { useWindowsStore } from '@/stores/windows.js';

const windowsStore = useWindowsStore();

const emit = defineEmits(['activated']);

const colorWindow = computed(() => {
  const { found } = windowsStore.findWindow({ id: 'colorcodes' });
  return found;
});

const colorInput = ref('colorInput');
const selectedHex = ref('#000000');
const colors = ref([]);
const colorCopied = ref(null);

const selectedHue = ref(0);
const selectedSat = ref(0);
const selectedLum = ref(0);

const selectedRed = ref(0);
const selectedGreen = ref(0);
const selectedBlue = ref(0);

const colorCopiedMessageClass = computed(() => {
  if (colorCopied.value) {
    return 'color-copied-msg show';
  } else {
    return 'color-copied-msg';
  }
});

function activated() {
  emit('activated', colorWindow.value);
}

function saveColor() {
  colors.value.push(selectedHex.value);
}

function unsaveColor(color) {
  const index = colors.value.findIndex(c => c === color);
  if (index > -1) {
    colors.value.splice(index, 1);
  }
}

function copyColor(color) {
  navigator.clipboard.writeText(color);
  colorCopied.value = color;
  setTimeout(() => colorCopied.value = null, 3000);
}

function convertFromHex() {
  const hex = selectedHex.value.split('#')[1];

  const [r, g, b] = hexToRgb(hex);
  selectedRed.value = r;
  selectedGreen.value = g;
  selectedBlue.value = b;

  const [h, s, l] = rgbToHsl(r, g, b);
  selectedHue.value = h;
  selectedSat.value = s;
  selectedLum.value = l;
}

function convertFromRgb() {
  const r = parseInt(selectedRed.value);
  const g = parseInt(selectedGreen.value);
  const b = parseInt(selectedBlue.value);
  selectedHex.value = rgbToHex(r, g, b);

  const [h, s, l] = rgbToHsl(r, g, b);
  selectedHue.value = h;
  selectedSat.value = s;
  selectedLum.value = l;
}

function convertFromHsl() {
  const h = parseInt(selectedHue.value);
  const s = parseInt(selectedSat.value);
  const l = parseInt(selectedLum.value);

  const [r, g, b] = hslToRgb(h, s, l);
  selectedRed.value = r;
  selectedGreen.value = g;
  selectedBlue.value = b;

  selectedHex.value = rgbToHex(r, g, b);
}

// Reference: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
  const bigint = parseInt(hex, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function rgbToHex(r, g, b) {
  return [
    '#',
    r.toString(16).padStart(2, '0'),
    g.toString(16).padStart(2, '0'),
    b.toString(16).padStart(2, '0'),
  ].join('');
}

function hexToHsl(hex) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

// Reference: https://www.baeldung.com/cs/convert-color-hsl-rgb
function hslToRgb(hue, sat, lum) {
  const _hue = hue;
  const _sat = Math.min(Math.max((sat / 100), 0), 1);
  const _lum = Math.min(Math.max((lum / 100), 0), 1);

  const _huep = _hue / 60;
  const c = (1 - Math.abs(2 * _lum - 1)) * _sat;
  const x = c * (1 - Math.abs(_huep % 2 - 1));
  const m = _lum - c / 2;

  let r = 0.0;
  let g = 0.0;
  let b = 0.0;

  if (_huep >= 0 && _huep < 1) {
    r = c;
    g = x;
    b = 0;
  } else if (_huep >= 1 && _huep < 2) {
    r = x;
    g = c;
    b = 0;
  } else if (_huep >= 2 && _huep < 3) {
    r = 0;
    g = c;
    b = x;
  } else if (_huep >= 3 && _huep < 4) {
    r = 0;
    g = x;
    b = c;
  } else if (_huep >= 4 && _huep < 5) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  r = parseFloat((r + m).toFixed(3));
  g = parseFloat((g + m).toFixed(3));
  b = parseFloat((b + m).toFixed(3));

  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255),
  ];
}

// Reference: https://gist.github.com/mjackson/5311256
// Reference: https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB
function rgbToHsl(r, g, b) {
  const _r = r / 255;
  const _g = g / 255;
  const _b = b / 255;

  const max = Math.max(_r, _g, _b);
  const min = Math.min(_r, _g, _b);

  const c = max - min;
  const l = (max + min) / 2;
  const v = l + c / 2;

  let h, s = 0;

  if (c === 0) {
    h = 0;
  } else if (v === _r) {
    h = 60 * (((_g - _b) / c) % 6);
  } else if (v === _g) {
    h = 60 * (((_b - _r) / c) + 2);
  } else if (v === _b) {
    h = 60 * (((_r - _g) / c) + 4);
  }

  if (v === 0) {
    s = 0;
  } else {
    s = c / v;
  }

  return [
    Math.round(h),
    Math.round(s * 100),
    Math.round(l * 100),
  ];
}

const refreshInterval = ref();

function autoSave() {
  localStorage.setItem('toolsinone.colors', JSON.stringify(colors.value));
}

function loadSave() {
  const existing = localStorage.getItem('toolsinone.colors');
  if (existing) {
    colors.value = JSON.parse(existing);
  } else {
    colors.value = [];
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
    heading="Color Code"
    v-model:x="colorWindow.x"
    v-model:y="colorWindow.y"
    v-model:z="colorWindow.z"
    v-model:w="colorWindow.w"
    v-model:h="colorWindow.h"
    v-model:is-active="colorWindow.active"
    v-model:is-visible="colorWindow.visible"
    v-model:prevent-active="colorWindow.preventActive"
    @activated="activated"
  >
    <template #body>
      <div class="input-container">
        <div class="picker">
          <div class="color-field">
            <input
              ref="colorInput"
              type="color"
              class="color-input"
              v-model="selectedHex"
            />
          </div>

          <div class="color-field-raw">
            <input class="color-input-raw" name="hex" v-model="selectedHex" />
          </div>

          <div class="actions">
            <button
              class="btn"
              @click="convertFromHex"
            >Convert from Hex</button>

            <button
              class="btn"
              @click="copyColor(selectedHex)"
            ><img src="/clipboard.png" /></button>

            <button
              class="btn"
              @click="saveColor"
            ><img src="/save.png" /></button>
          </div>
        </div> <!-- picker -->

        <div class="displays">
          <div class="fields">
            <div class="color-field">
              <div class="label">R:</div>
              <div class="input"><input name="red" v-model="selectedRed" /></div>
            </div>

            <div class="color-field">
              <div class="label">G:</div>
              <div class="input"><input name="green" v-model="selectedGreen" /></div>
            </div>

            <div class="color-field">
              <div class="label">B:</div>
              <div class="input"><input name="blue" v-model="selectedBlue" /></div>
            </div>

            <div class="actions">
              <button
                class="btn"
                @click="convertFromRgb"
              >Convert from RGB</button>

              <button
                class="btn"
                @click="copyColor(`${selectedRed},${selectedGreen},${selectedBlue}`)"
              ><img src="/clipboard.png" /></button>
            </div>
          </div>

          <div class="fields">
            <div class="color-field">
              <div class="label">H(°):</div>
              <div class="input"><input name="hue" v-model="selectedHue" /></div>
            </div>

            <div class="color-field">
              <div class="label">S(%):</div>
              <div class="input"><input name="sat" v-model="selectedSat" /></div>
            </div>

            <div class="color-field">
              <div class="label">L(%):</div>
              <div class="input"><input name="lum" v-model="selectedLum" /></div>
            </div>

            <div class="actions">
              <button
                class="btn"
                @click="convertFromHsl"
              >Convert from HSL</button>

              <button
                class="btn"
                @click="copyColor(`${selectedHue},${selectedSat},${selectedLum}`)"
              ><img src="/clipboard.png" /></button>
            </div>
          </div> <!-- fields -->
        </div> <!-- displays -->
      </div> <!-- input-container -->

      <div class="colors-container">
        <div class="title">Recently saved</div>

        <div
          :class="colorCopiedMessageClass"
        >Color {{ colorCopied }} copied!</div>

        <div class="colors">
          <div
            v-for="(color, i) in colors"
            :key="i"
            class="color"
          >
            <div
              class="color-square"
              :style="`background-color: ${color};`"
            >
              <div class="color-details">
                <div class="item">
                  <div class="label">RGB:</div>
                  <div class="value">({{ hexToRgb(color.split('#')[1]).join(',') }})</div>
                </div>

                <div class="item">
                  <div class="label">HSL:</div>
                  <div class="value">({{ hexToHsl(color.split('#')[1]).join(',') }})</div>
                </div>
              </div>
            </div>

            <div
              class="color-value"
              @click="copyColor(color)"
            >
              <span class="value">{{ color }}</span>
              <span class="tooltip">Click to copy</span>
            </div>

            <div
              class="color-action"
              @click="unsaveColor(color)"
            ><img src="/cancel.png" /></div>
          </div>
        </div>
      </div>
    </template>
  </ToolWindow>
</template>

<style scoped>
.input-container {
  display: flex;
  place-items: center;
  place-content: center;
  gap: 4rem;
  margin-bottom: 1rem;
}

.input-container .picker {
  display: flex;
  flex-direction: column;
  place-items: center;
  place-content: center;
  gap: 4px;
  padding: 0.5rem;
}

.input-container .picker .color-field .color-input {
  width: 100px;
  height: 4rem;
}

.input-container .picker .color-field-raw {
  padding: 4px;
}

.input-container .picker .color-field-raw .color-input-raw {
  width: 100px;
}

.input-container .picker .actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.input-container .displays {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.input-container .displays .fields {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-container .displays .fields .color-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  width: 100%;
}

.input-container .displays .fields .color-field .label {
  font-size: 0.8rem;
  font-weight: 600;
}

.input-container .displays .fields .actions {
  display: flex;
  place-items: center;
  place-content: center;
  gap: 4px;
}

.colors-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.colors-container .title {
  font-weight: 600;
}

.colors-container .color-copied-msg {
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

.colors-container .color-copied-msg.show {
  display: inline-block;
}

.colors-container .colors {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.colors-container .colors .color {
  display: flex;
  place-items: center;
  gap: 4px;
}

.colors-container .colors .color .color-value {
  position: relative;
}

.colors-container .colors .color .color-value:hover {
  cursor: pointer;
}

.colors-container .colors .color .color-value:hover .value {
  font-weight: 600;
}

.colors-container .colors .color .color-value .tooltip {
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

.colors-container .colors .color .color-value:hover .tooltip {
  display: inline-block;
}

.colors-container .colors .color .color-square {
  position: relative;
  width: 1rem;
  height: 1rem;
  border-radius: 4px;
}

.colors-container .colors .color .color-square:hover {
  cursor: pointer;
}

.colors-container .colors .color .color-square .color-details {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: none;
  padding: 0.5rem;
  width: auto;
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  z-index: 1;
}

.colors-container .colors .color .color-square:hover .color-details {
  display: flex;
  flex-direction: column;
}

.colors-container .colors .color .color-square .color-details .item {
  display: flex;
  gap: 4px;
}

.colors-container .colors .color .color-square .color-details .item .label {
  font-weight: 600;
}

.colors-container .colors .color .color-action {
  font-size: 0.7rem;
}

.colors-container .colors .color .color-action:hover {
  cursor: pointer;
}

.colors-container .colors .color .color-action img {
  width: 1rem;
  height: 1rem;
  opacity: 0.8;
}

.colors-container .colors .color .color-action:hover img {
  opacity: 1;
}
</style>
