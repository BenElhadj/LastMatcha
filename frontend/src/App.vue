<script setup>
import { onMounted } from 'vue'
import NavbarView from '@/views/NavbarView.vue'
import FooterView from '@/views/FooterView.vue'

const components = {
  NavbarView,
  FooterView
};

onMounted(() => {
  window.initMap = function () {
    // Votre code ici
  }
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_APP_GOOGLE_KEY}&callback=initMap`;
  
  script.async = true;
  script.defer = true;
  document.body.prepend(script);
});

</script>


<template>
  <q-layout view="lHh lpR fFf">

    <q-header>
      <NavbarView/>
    </q-header>

    <q-page-container >
      <router-view />
    </q-page-container>

    <q-footer >
      <FooterView />
    </q-footer>

  </q-layout>
</template>


<style scoped>
*,
*::after,
*::before {
  box-sizing: inherit;
  font-family: 'Elliane' !important;
  margin: 0;
  padding: 0;
  color: black;
}

html {
  box-sizing: border-box;
}

::selection {
  background-color: var(--color-primary);
  color: var(--color-white);
}

header {
  line-height: 1.5;
  height: 80px;
  background-color: transparent;
}

.heading {
  border-bottom: 1px solid #999;
}

.app {
  overflow-x: hidden;
}

footer {
  position: fixed;
  bottom: 0px;
  margin-bottom: 0;
  margin-top: 0;
  width: 100%;
  height: 145px;
  background-color: transparent;
}


.q-page-container {
  padding-bottom: 50vh;
  margin-top: calc(var(--header-height) + var(--footer-height) + 20px);
  margin-bottom: calc(var(--header-height) + var(--footer-height) + 20px);
  
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

.strap {
  height: 4rem;
  flex-shrink: 0;
}

.avatar {
  transform: translateY(-8rem);
  position: relative;
  flex-shrink: 0;
}

.cover__btn {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(-50%, 50%);
}

.avatar__btn,
.avatar__like {
  position: absolute;
  top: 85%;
  left: 85%;
  transform: translate(-50%, -50%) scale(.95);
}

.avatar__like {
  top: 15%;
  left: 85%;
}

.q-btn--floating:not(.q-btn--depressed):not(.q-btn--flat),
.q-btn--floating:not(.q-btn--depressed):not(.q-btn--flat):focus {
  box-shadow: 0 0 3px rgba(0, 0, 0, .2) inset;
}
.q-layout {
 padding-bottom: 70px !important;
}

.avatar__img {
  box-shadow: 0 0 0 3px #f5f5f5,
    0 1px 5px rgba(0, 0, 0, .2);
}

.profile {
  padding-top: 4.5rem;
}

.main {
  margin-top: -2.75rem;
}

@keyframes point {
  0% {
    opacity: .3;
  }
  100% {
    opacity: 1;
  }
}

.typing {
  display: flex;
  align-items: center;
  justify-content: center;
}

.typing_point {
  margin: 7.5px 2px;
  width: 5px;
  height: 5px;
  background: var(--color-primary);
  border-radius: 50%;
  animation-name: point;
  animation-duration: .9s;
  animation-iteration-count:infinite;
}

.typing_point:nth-child(1) {
  animation-delay: 0s;
}

.typing_point:nth-child(2) {
  animation-delay: .3s;
}

.typing_point:nth-child(3) {
  animation-delay: .6s;
}

.editor_dialog {
  overflow: hidden
}

@media only screen and (max-width: 600px) {
  .heading {
    font-size: 2.5em !important;
    padding-bottom: .5rem !important;
  }
  .title {
    font-size: 16px !important;
  }
  .q-chip__content {
    transform: scale(.9);
  }
  .chat_container {
    font-size: 85% !important;
  }
  .badge {
    text-align: center !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
  .parallax {
    height: 20rem;
  }
  .color_picker {
    height: 3.5rem !important;
    width: 3.5rem !important;
  }
  .header_content > * {
    transform: scale(.9) !important;
  }
  .header_content > .header_center > h1 {
    font-size: 1rem;
  }
}

@media only screen and (max-width: 400px) {
  .timeline_container {
    transform: scale(.8) translate(-5%, -10%);
  }
  .title {
    font-size: 14px !important;
  }
  .chat_container {
    font-size: 80% !important;
  }
  .color_picker {
    height: 3rem !important;
    width: 3rem !important;
  }
  .header_content > * {
    transform: scale(.8) !important;
  }
  .header_content > .header_center > h1 {
    font-size: .7rem;
  }
}

@media only screen and (max-width: 350px) {
  .timeline_container {
    transform: scale(.7) translate(-10%, -20%);
  }
  .title {
    font-size: 12px !important;
  }
  .q-chip__content {
    transform: scale(.8);
  }
  .chat_container {
    font-size: 70% !important;
  }
  .parallax {
    height: 15rem;
  }
  .color_picker {
    height: 2.5rem !important;
    width: 2.5rem !important;
  }
  .header_content > * {
    transform: scale(.7) !important;
  }
  .header_content > .header_center > h1 {
    font-size: .6rem;
  }
}

</style>
