<template>
  <div class="footer">
    <div class="back-to-top-container">
      <img class="back-to-top" src="@/assets/Footer/back-to-top.png" alt="Back to top" @click="moveUp" :style="{ opacity: backToTopOpacity }" :disabled="isTop"/>
      <div class="divider"></div>
    </div>
    <div class="full-container">
      <div class="top-container">
        <div class="contact-container">
          <h2>Contactez-nous:</h2>
          <div class="link-box">
            <a class="links-contact-container" href="mailto:42projetsweb@gmail.com">
              <img src="@/assets/Footer/email.png" alt="Email">
            </a>
          </div>
        </div>
        <div class="logo-container">
          <div>
            <img src="@/assets/Footer/matcha.png" alt="Logo">
          </div>
          <div class="bottom-container">
            <q-item>
              <p>
                <a href="https://profile.intra.42.fr/users/bhamdi">Bhamdi</a>
                &amp;
                <a href="https://profile.intra.42.fr/users/mbouzaie">Mbouzae</a>
                Vous présentent
                <a href="https://projects.intra.42.fr/projects/42cursus-matcha">MATCHA © 2023</a>
              </p>
            </q-item>
          </div>
        </div>
        <div class="follow-container">
          <div class="follow-text-container">
            <h2>Suivez-nous:</h2>
          </div>
          <div class="follow-links-container link-box">
            <a class="links-follow-container" href="https://www.facebook.com/42Matcha">
              <img src="@/assets/Footer/fb.png" alt="Facebook">
            </a>
            <a class="links-follow-container" href="https://www.instagram.com/42matcha/">
              <img src="@/assets/Footer/inst.png" alt="Instagram">
            </a>
            <a class="links-follow-container" href="https://twitter.com/42Matcha">
              <img src="@/assets/Footer/tw.png" alt="Twitter">
            </a>
            <a class="links-follow-container" href="https://www.youtube.com/@42Matcha">
              <img src="@/assets/Footer/yt.png" alt="Youtube">
            </a>
          </div>
        </div>
      </div>
      <div class="divider"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FooterView',
  data() {
    return {
      scrollPosition: null,
      backToTopOpacity: 0,
      isTop: true,
    };
  },
  mounted() {
    window.addEventListener('scroll', this.updateScroll);
    this.updateScroll();
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.updateScroll);
  },
  methods: {
    updateScroll() {
      this.scrollPosition = window.scrollY;
      this.backToTopOpacity = Math.min(this.scrollPosition / 1000, 1);
      this.isTop = this.scrollPosition === 0;
    },
    moveUp() {
      window.scroll({ top: 0, behavior: 'smooth' })
    }
  }
}
</script>

<style scoped>
* {
  font-weight: bold;
  align-items: center;
  text-align: center;
  font-size: clamp(12px, 1em, 18px);
  max-height: fit-content;
}

.footer,
.footer::before {
  background: linear-gradient(to top, #000 0%, #fff 91%, rgba(255, 255, 255, 0) 100%);
}

.footer {
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
}

.footer::before {
  position: absolute;
  pointer-events: none;
}

.back-to-top-container,
.full-container {
  position: relative;
}

.back-to-top {
  position: absolute;
  max-height: 15vh;
  min-height: 13vh;
  cursor: pointer;
  right: 23px;
  bottom: 0px;
  z-index: 2;
}

.back-to-top:disabled {
  pointer-events: none;
}

.full-container {
  width: 95vw;
  min-width: 670px;
  margin: auto;
  max-height: 30vh;
  min-height: 10vh;
}

.top-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-end !important;
  align-items: stretch;
}

.contact-container,
.logo-container,
.follow-container {
  flex: 1;
  width: 33.33%;
  display: flex;
}

.contact-container {
  align-items: flex-start;
  flex-direction: column;
}

.logo-container {
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  padding: 0 20px;
}

.logo-container img {
  max-height: 11vh;
  min-height: 9vh;
  height: auto;
}

.follow-container {
  flex-direction: column;
  align-items: flex-end;
  font-size: clamp(14px, 1em, 20px);
  margin-left: auto;
}

.links-contact-container img,
.links-follow-container img {
  max-height: 5vh;
  min-height: 3vh;
}

.links-contact-container img {
  margin-right: 50px;
  border-right: 50px;
}

.links-follow-container img {
  height: 40px;
}

.link-box,
.follow-text-container,
.follow-links-container,
.bottom-container {
  display: flex;
}

.follow-links-container {
  gap: 30px;
}

.bottom-container {
  font-size: clamp(22px, 1em, 28px);
  text-align: center;
  margin-bottom: 17px;
}

.divider {
  position: relative;
  width: 100%;
  height: 1px;
  background: rgba(128, 128, 128, 0.467);
  margin-top: 17px;
  margin-bottom: 17px;
}

</style>