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

const availWindows = [
  {
    id: 'jsonformatter',
    x: 0,
    y: 0,
    z: 100,
    w: 600,
    h: 400,
    active: false,
    visible: false,
    preventActive: false,
  },

  {
    id: 'colorcodes',
    x: 600,
    y: 0,
    z: 100,
    w: 600,
    h: 400,
    active: false,
    visible: false,
    preventActive: false,
  },

  {
    id: 'htmlformatter',
    x: 0,
    y: 440,
    z: 100,
    w: 600,
    h: 400,
    active: false,
    visible: false,
    preventActive: false,
  },

  {
    id: 'calculator',
    x: 600,
    y: 440,
    z: 100,
    w: 600,
    h: 400,
    active: false,
    visible: false,
    preventActive: false,
  },
];

function showWindow(id) {
  windowsStore.showWindow({ id });
}

function initWindows() {
  availWindows.forEach((win) => {
    windowsStore.addWindow(win);
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
      if (win.visible) {
        windowsStore.showWindow(win);
      }
    });

    availWindows.forEach((win) => {
      const { found } = windowsStore.findWindow(win);
      if (!found) {
        windowsStore.addWindow(win);
      }
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
  <div class="container">
    <main>
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

      <div class="wrapper">
        <div class="content">
          <a
            href="https://www.flaticon.com/free-icons/hammer"
            title="Hammer icons created by Freepik - Flaticon"
            alt="Hammer icons created by Freepik - Flaticon"
            target="_blank"
          >
            <img class="icon" src="/hammer.png"/>
          </a>

          <div>All your tools in one.</div>
        </div>

        <div class="links">
          <a href="https://github.com/coffeebrewapps/tools_in_one/issues/1" target="_blank">Feature request</a>
          <div>|</div>
          <a href="https://www.buymeacoffee.com/gohkhoonhiang" target="_blank">Support dev</a>
        </div>
      </div>
    </main>

    <header>
      <nav>
        <a @click="showWindow('jsonformatter')">
          📃 JSON Formatter
        </a>

        <a @click="showWindow('colorcodes')">
          📃 Color Code
        </a>

        <a @click="showWindow('htmlformatter')">
          📃 HTML Formatter
        </a>

        <a @click="showWindow('calculator')">
          📃 Calculator
        </a>
      </nav>
    </header>
  </div>
</template>

<style scoped>
.container main .wrapper {
  display: flex;
  flex-direction: column;
  place-items: center;
  place-content: center;
}

.container main .wrapper .content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.container main .wrapper .content a:hover {
  background-color: initial;
}

.container main .wrapper .content .icon {
  width: 1.5rem;
}

.container main .wrapper .links {
  display: flex;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.container header {
  position: absolute;
  top: 2rem;
  right: 0;
  width: 120px;
}

.container header nav {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.container header nav a {
  display: inline-block;
}

.container header nav a:hover {
  cursor: pointer;
}

@media (min-width: 1024px) {
  .container main {
    min-height: 100vh;
    display: flex;
    align-items: center;
    padding: 0;
  }

  .container header nav {
    text-align: left;
    margin-top: 1rem;
    margin-left: -1rem;
    font-size: 0.8rem;
    padding: 1rem 0;
  }
}
</style>
