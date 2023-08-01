<template>
  <q-layout>
    <q-page>
      <div class="header">
        <div class="header_layout"></div>
        <div class="header_content row justify-center align-center">
          <div class="header_center">
            <h1 class="display-3 hidden-xs-only text-xs-center mb-5">
              Si vous n'aimez pas vos imperfections, <br />quelqu'un les aimera pour vous
            </h1>
            <div class="row justify-center">
              <div class="col-8">
                <div class="column">
                  <h4 class="mb-4 custom-title">
                    Afficher
                  </h4>
                  <q-btn-toggle v-model="model" spread no-caps toggle-color="blue" color="white" text-color="black" :options="[ {label: 'Hommes', value: 'man'}, {label: 'Femmes', value: 'women'} ]"></q-btn-toggle>
                  <h4 class="mb-4 custom-title">
                    Localisation
                  </h4>
                  <q-input v-model="location" class="home_location_input mb-4" color="primary" outlined solo icon="map_marker"/>
                  <h4 class="custom-age">
                    Age
                  </h4>
                  <q-range v-model="age" :min="18" :max="85" :step="1" label-always thumb-label="always" class="custom-slider mx-3 mb-4 pt-3"></q-range>
                  <!-- <q-range v-model="age" class="custom-slider mx-3 mb-4 pt-3" :min="18" :max="85" :step="1" :thumb-size="25" label-always thumb-label="always"/> -->
                  <div class="row justify-center">
                    <q-btn outlined color="primary" class="home_clear_btn" @click="mainSearch">
                      <q-icon name="mdi-heart" /><span>Allons y</span>
                    </q-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </q-page>
  </q-layout>
</template>

<script>
import { reactive, toRefs, ref} from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'UsersView',
  setup () {
    const store = useStore()
    const router = useRouter()

    const state = reactive({
      gender: null,
      location: null,
      age: [],
      tags: store.getters.tags      
    })
    const mainSearch = () => {
      router.push(`/search?gender=${state.gender}&location=${state.location}&min=${state.age[0]}&max=${state.age[1]}`)
    }
    return {
      ...toRefs(state),
      mainSearch,
      model: ref('one'),
      secondModel: ref('one'),
      age: ref({
        min: 18,
        max: 85
      })
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.cdnfonts.com/css/elliane-2');
* {
  font-weight: bold;
  color: #000000 !important;
}

.custom-slider .q-slider__thumb-label, .custom-slider .q-slider__thumb-container .q-slider__thumb-label__container {
  font-size: 27px !important;
}
.custom-slider {
  display: block;
}
.custom-title {
  margin-top: 50px !important;
}

.custom-age {
  margin-bottom: 50px !important;
}

/* .header_layout, */
.header_content {
  height: 100%;
  width: 100%;
}

.header_center {
  z-index: 3;
}

.header_layout {
  z-index: 0;
  position: absolute;
}

.header {
  /* font-size: 30px;
  font-weight: 300px; */
  height: calc(100vh - 64px);
  background-image: url(@/assets/bg.jpg);
  background-position: center;
  background-size: cover;
}

.header > h1 {
  font-size: 5em !important;
}

.q-app .mb-5 {
  font-family: 'Elliane' !important;
}

.home_toggle.theme--light.q-btn-toggle {
  /* background: transparent !important; */
  display: flex;
  justify-content: center;
}

.home_toggle_btn {
  flex: 1 1 50% !important;
}

.home_loaction_input > .q-input__control > .q-input__slot,
.home_tags_menu > .q-input__control > .q-input__slot {
  border: 2px solid var(--color-primary) !important;
}

.q-select-list.q-card.theme--light {
  background: transparent;
}

.q-select-list.q-card.theme--light > .q-list.theme--light {
  background: rgba(0, 0, 0, .4);
  color: #fff;
}

.complete::-webkit-scrollbar-track {
  box-shadow: none;
  background: rgba(0, 0, 0, .4);
}

.complete::-webkit-scrollbar-thumb {
  background-color: var(--color-primary);
  border-radius: 4px;
}

.complete::-webkit-scrollbar {
  width: .45em;
}

.home_clear_btn {
  height: 56px;
}

.slogan {
  text-align: center;
  font-size: 70px!important;
  line-height: 70px;
}
</style>
