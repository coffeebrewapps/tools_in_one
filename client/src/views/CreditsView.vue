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
          title="hammer icons"
          alt="Hammer icons created by Freepik - Flaticon"
          target="_blank"
        >Hammer Icon</a>
      </div>

      <div class="link">
        <img src="/sun.png" />
        <a
          href="https://www.flaticon.com/free-icons/sun"
          title="sun icons"
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

    <div class="links">
      <div class="link">
        <img src="/minus.png" />
        <a
          href="https://www.flaticon.com/free-icons/minus"
          title="minus icons"
          alt="Minus icons created by Freepik - Flaticon"
          target="_blank"
        >Minus Icon</a>
      </div>

      <div class="link">
        <img src="/plus.png" />
        <a
          href="https://www.flaticon.com/free-icons/plus"
          title="plus icons"
          alt="Plus icons created by Freepik - Flaticon"
          target="_blank"
        >Plus Icon</a>
      </div>

      <div class="link">
        <img src="/cancel.png" />
        <a
          href="https://www.flaticon.com/free-icons/cancel"
          title="cancel icons"
          alt="Cancel icons created by Freepik - Flaticon"
          target="_blank"
        >Cancel Icon</a>
      </div>

      <div class="link">
        <img src="/pin.png" />
        <a
          href="https://www.flaticon.com/free-icons/push-pin"
          title="push pin icons"
          alt="Push pin icons created by Freepik - Flaticon"
          target="_blank"
        >Push Pin Icon</a>
      </div>
    </div>

    <div class="links">
      <div class="link">
        <img src="/clipboard.png" />
        <a
          href="https://www.flaticon.com/free-icons/plus"
          title="plus icons"
          alt="Plus icons created by Freepik - Flaticon"
          target="_blank"
        >Clipboard Icon</a>
      </div>

      <div class="link">
        <img src="/save.png" />
        <a
          href="https://www.flaticon.com/free-icons/flash-disk"
          title="flash disk icons"
          alt="Flash disk icons created by Freepik - Flaticon"
          target="_blank"
        >Save Icon</a>
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
