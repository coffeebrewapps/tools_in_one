<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="container">
    <div class="title">Icons</div>

    <div class="links">
      <div class="link">
        <img src="/hammer.png"/>
        <a
          href="https://www.flaticon.com/free-icons/hammer"
          title="Hammer icons created by Freepik - Flaticon"
          alt="Hammer icons created by Freepik - Flaticon"
          target="_blank"
        >Hammer Icon</a>
      </div>

      <div class="link">
        <img src="/sun.png" />
        <a
          href="https://www.flaticon.com/free-icons/sun"
          title="Sun icons created by Freepik - Flaticon"
          alt="Sun icons created by Freepik - Flaticon"
          target="_blank"
        >Sun Icon</a>
      </div>

      <div class="link">
        <img src="/moon.png" />
        <a
          href="https://www.flaticon.com/free-icons/moon"
          title="moon icons"
          alt="Moon icons created by Freepik - Flaticon"
          target="_blank"
        >Moon Icon</a>
      </div>
    </div>

    <div class="link">
      <RouterLink to="/">Back to home</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.container .title {
  font-weight: 600;
}

.container .links {
  display: flex;
  gap: 1rem;
}

.container .links .link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
}

.container .links .link img {
  width: 1rem;
}

.container a {
  font-size: 0.8rem;
}
</style>
