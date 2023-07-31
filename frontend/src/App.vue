<script setup>
import HelloWorld from '@/components/HelloWorld.vue'
import TheWelcome from '@/components/TheWelcome.vue'
import NavbarView from '@/views/NavbarView.vue'
import FooterView from '@/views/FooterView.vue'

</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <NavbarView />
    <q-page-container>
      <router-view />
    </q-page-container>
    <FooterView class="footer" />
  </q-layout>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

.content {
  flex: 1 0 auto;
  position: relative;
  margin-bottom: 250px;
}

.content::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background-image: linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}

.footer {
  position: fixed;
  bottom: 0;
  margin-top: 0;
  width: 100%;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}

</style>
