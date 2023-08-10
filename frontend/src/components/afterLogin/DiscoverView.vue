<template>
  <q-page>
    <div v-if="isComplete" class="discover">
      <q-page-container v-if="loaded" class="pt-5 px-0">
        <q-layout class="row wrap justify-center">
          
          <div class="col-2">
            <q-page-container class="px-5">
              <q-layout class="column">
                <h4 class="title mb-4">Afficher</h4>
                <q-btn-toggle v-model="gender" spread no-caps toggle-color="blue" color="white" text-color="black" :options="[ {label: 'Homme', value: 'male', icon: 'mdi-gender-male'}, {label: 'Femme', value: 'female', icon: 'mdi-gender-female'} ]"/>
                
                <h4 class="title mb-3">Distance</h4>
                <q-range v-model="distance" :min="0" :max="maxDis" :step="step" label-always thumb-label="always" thumb-size="30" class="custom-slider mx-3 mb-5 pt-3"></q-range>
                
                <h4 class="title mb-3">Age</h4>
                <q-range v-model="age" :min="18" :max="85" :step="1" label-always thumb-label="always" thumb-size="25" class="custom-slider mx-3 mb-4 pt-3"></q-range>
                
                <h4 class="title mb-3">Note</h4>
                <q-range v-model="rating" :min="0" :max="5" :step="0.5" label-always thumb-label="always" thumb-size="25" class="mx-3 mb-5 pt-3"></q-range>
                
                <h4 class="title mb-4">Localisation</h4>
                <q-input v-model="location" class="location_input mb-5" color="primary" hide-details outlined solo text>
                  <template v-slot:append>
                    <q-icon name="mdi-map-marker" />
                  </template>
                </q-input>

                <h4 class="title mb-4">Interêts</h4>
                <q-select v-model="interests" :options="allTags" multiple hide-dropdown-icon label="Select tag" style="width: 250px" outlined/>
  
                <div class="row justify-between mb-4">
                  <h4 class="title">Sort by</h4>
                  <q-btn @click="changeSort" flat round style="width: 10px" color="primary" icon="mdi-sort" :class="`sort_icon ${sortDir < 0 ? 'flip' : ''}`" class="clear_btn"/>
                </div>
                <q-select v-model="sort" outlined solo hide-dropdown-icon :options="sortTypes" label="Sort by" class="sort_select"/>
                
                <div class="row justify-between mb-4">
                  <h4 class="title mb-4">Reset all</h4>
                  <q-btn @click="reset" flat round style="width: 10px" class="clear_btn" color="primary" icon="mdi-refresh"/>
                </div>

              </q-layout>
            </q-page-container>
          </div>

          <div class="col-10 md9 sm12">
            <div class="row wrap justify-center">
                <div v-for="user in sorted" :key="user.user_id" class="user col-xl-2 col-lg-3 col-sm-3 ma-3 grow">
                <router-link :to="{ name: 'userprofile', params: { id: user.user_id } }">
                  <user-card :user="user" />
                </router-link>
              </div>
            </div>
          </div>

        </q-layout>

      </q-page-container>
      <LoaderView v-else />
    </div>

    <q-page-container v-else class="my-3">
      <div class="row wrap justify-center">
        <h2 class="text-xs-center pt-4 pb-3 mb-4 grey--text mx-auto">
          Complétez votre profil pour avoir l'opportunité de découvrir des utilisateurs qui vous correspondent !
        </h2>
        <div class="col-6 col-md-4">
          <q-btn block outlined large to="/settings" color="primary">
            <q-icon left name="mdi-chevron-left"></q-icon>

            <span>Aller au</span>
          </q-btn>
        </div>
      </div>
    </q-page-container>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import UserCard from '@/components/afterLogin/UserCard.vue'
import LoaderView from '@/views/LoaderView.vue'
import countries from '@/nats.json'
import utility from '@/utility'
import { matMenu } from '@quasar/extras/material-icons'
import { mdiAbTesting } from '@quasar/extras/mdi-v5'

const store = useStore()
const { user, allTags, status, online, blocked, blockedBy } = store.getters

const userLocation = store.state.location

const model = ref(null)
const max = ref(0)
const step = ref(0)
const sortDir = ref(1)
const sort = ref(null)
const users = ref([])
const interests = ref([])
const gender = ref(null)
const location = ref(null)
const hasBoth = ref(false)
const loaded = ref(false)
const age = ref({min: 18, max: 85})
const rating = ref({min: 0, max: 5})
const distance = ref({min: 0, max: 0})
const maxDis = ref(null)
const alltags = ref([])
const sortTypes = ['age', 'distance', 'rating', 'interests']
const nats = ref(countries)

const filters = {
  self: val => val.user_id !== user.id,
  blocked: val => !blocked.includes(val.user_id),
  blockedBy: val => !blockedBy.includes(val.user_id),
  rating: val => val.rating >= rating.value.min && val.rating <= rating.value.max,
  gender: val => !gender.value || val.gender === gender.value,
  location: val => !location.value || [val.country, val.address, val.city].some(cur => cur.includes(location.value)),
  distance: val => {
    if (val.lat && val.lng) {
      const { lat, lng } = val
      const distanceCalc = utility.calculateDistance(userLocation, { lat, lng })
      return distanceCalc >= distance.value.min && distanceCalc <= distance.value.max
    }
  },
  age: val => {
    const year = new Date(val.birthdate).getFullYear()
    const now = new Date().getFullYear()
    return year >= now - age.value.max && year <= now - age.value.min
  },
  interest: val => {
    if (!interests.value.length) return true
    for (const interest of interests.value) if (val.tags.split(',').includes(interest)) return true
    return false
  }
}

const filtered = computed(() => {
  return users.value
    .filter(filters.self)
    .filter(filters.blocked)
    .filter(filters.blockedBy)
    .filter(filters.rating)
    .filter(filters.gender)
    .filter(filters.location)
    .filter(filters.age)
    .filter(filters.distance)
    .filter(filters.interest)
})

const sorted = computed(() => {
  if (!sort.value || sort.value === 'distance') {
    return sortDir.value < 0 ? [...filtered.value].reverse() : filtered.value
  }
  let sortFunc
  const ageCalc = (bd) => new Date() - new Date(bd)
  const commonTags = a => {
    if (!a || !a.length) return 0
    const tags = a.split(',')
    return user.tags.split(',').filter(val => tags.indexOf(val) !== -1).length
  }
  switch (sort.value) {
    case 'age':
      sortFunc = (a, b) => sortDir.value * (ageCalc(a.birthdate) - ageCalc(b.birthdate))
      break
    case 'rating':
      sortFunc = (a, b) => sortDir.value * (b.rating - a.rating)
      break
    case 'interests':
      sortFunc = (a, b) => sortDir.value * (commonTags(b.tags) - commonTags(a.tags))
      break
  }
  return [...filtered.value].sort(sortFunc)
})

const calculateMaxDistance = () => {
  if (users.value.length) {
    const { lat, lng } = users.value[users.value.length - 1]
    const to = {
      lat: Number(lat),
      lng: Number(lng)
    }
    maxDis.value = Math.ceil(utility.calculateDistance(userLocation, to))
  } else {
    setTimeout(calculateMaxDistance, 1000)
  }
}

watch(users, () => {
  calculateMaxDistance()
}, { immediate: true })


watch(user, (newUser, oldUser) => {
  if (newUser.looking && newUser.looking === 'both') {
    hasBoth.value = true
  }
})

watch(online, () => {
  whoIsUp()
})

watch(age, () => {
  if (age.value[0] > age.value[1]) {
    const temp = age.value[0]
    age.value[0] = age.value[1]
    age.value[1] = temp
  }
})

watch(rating, () => {
  if (rating.value[0] > rating.value[1]) {
    const temp = rating.value[0]
    rating.value[0] = rating.value[1]
    rating.value[1] = temp
  }
})

watch(distance, () => {
  if (distance.value[0] > distance.value[1]) {
    const temp = distance.value[0]
    distance.value[0] = distance.value[1]
    distance.value[1] = temp
  }
})

const shouldReset = ref(false)

function reset() {
  sortDir.value = 1
  sort.value = null
  gender.value = null
  age.value = {min: 18, max: 85}
  rating.value = {min: 0, max: 5}
  distance.value = {min: 0, max: maxDis.value}
  location.value = null
}

function changeSort() {
  sortDir.value = -sortDir.value
}

function whoIsUp() {
  users.value.forEach((user, i) => {
    users.value[i].lastSeen = users.value[i].status
    users.value[i].status = online.includes(user.user_id)
  })
}

const isComplete = computed(() => {
  return user.gender && user.gender.length && user.looking && user.biography && user.tags && user.images.length && user.city && user.country && user.postal_code
})

async function created() {
  const token = localStorage.getItem('token')
  const url = `${import.meta.env.VITE_APP_API_URL}/api/users/show`
  const headers = { 'x-auth-token': token }
  const res = await axios.post(url, { filter: true }, { headers })
  if (!res.data.msg) {
      users.value = res.data.slice(0, 1000).map(cur => ({
      ...cur,
      rating: Number(cur.rating)
    }))
    
    await calculateMaxDistance()
    distance.value.max = maxDis.value
    whoIsUp()
    loaded.value = true
  } else {
    console.log('res.data.msg ===> ', res.data.msg)
    router.push('/login')
  }
}

onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    const url = `${import.meta.env.VITE_APP_API_URL}/api/auth/isloggedin`
    const headers = { 'x-auth-token': token }
    const res = await axios.get(url, { headers })
    if (!res.data.msg && maxDis.value > 0) {
      const user = res.data
      if (user.birthdate) {
        user.birthdate = new Date(user.birthdate).toISOString().substr(0, 10)
      }
      store.dispatch('login', user)
    }
  } catch (err) {
    console.error('err onMounted in frontend/DiscoverView.vue ===> ', err)
  }
})

onMounted(created)

</script>

<style scoped>
a{
  text-decoration: none;
  color: inherit;
}
.discover {
  margin-left: 80px;
}
.v-slider {
  opacity: .7;
}

.theme--light.v-input:not(.v-input--is-disabled) input,
.v-list.theme--light {
  color: #777 !important;
}

.tags_menu > .v-input__control > .v-input__slot,
.loaction_input > .v-input__control > .v-input__slot,
.sort_select > .v-input__control > .v-input__slot {
 
}

.v-slider.v-slider--is-active,
.tags_menu.v-select--is-menu-active > .v-input__control > .v-input__slot,
.sort_select.v-select--is-menu-active > .v-input__control > .v-input__slot,
.loaction_input.v-input--is-focused > .v-input__control > .v-input__slot {
  opacity: 1;
}

.loaction_input > .v-input__control > .v-input__slot > .v-text-field__slot > input {
  margin: 0;
}

.v-input__icon.v-input__icon--append > .v-icon {
  color: var(--color-primary);
}

.v-select-list.v-card.theme--light > .v-list,
.theme--light.v-btn-toggle,
.v-menu__content.menuable__content__active.v-autocomplete__content > .v-select-list > .v-list {
  /* background-color: #FAFAFA; */
}

.v-btn-toggle {
  display: flex;
}

.toggle_btn {
  flex: 1 1;
  height: 3.33rem;
}

.clear_btn {
  margin: auto !important;
  align-self: flex-end;
}

.v-btn-toggle--selected {
  box-shadow: none;
}

.user {
  overflow: hidden;
}

.sort_icon.flip {
  transform: rotate(180deg);
}

.icon-size {
  width: 42px;
  margin: 7px;
}

.sort_btn {
  margin: auto !important;
  padding: auto !important;
}

.v-slider__thumb-label > span {
  font-size: .8em;
}
.flip {
  transform: rotate(180deg);
}
.user {
  margin: 16px; /* ajustez cette valeur selon vos besoins */
}

.filters-container {
  margin-bottom: 32px; /* ajustez cette valeur selon vos besoins */
}
</style>