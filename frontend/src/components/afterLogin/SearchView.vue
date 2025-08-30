<template>
<q-page-container class="pt-5 px-0 discover" v-if="loaded">
  <q-layout wrap justify-center>
    <q-flex :xl2="search" :xl4="!search" :md3="search" :md8="!search" sm10>
      <q-container px-md-5>
        <q-layout column>
          <h4 class="title mb-4">Afficher</h4>
          <q-btn-toggle class="mb-5" v-model="gender">
            <q-btn class="toggle_btn" text outlined color="primary" value="male"><q-icon>mdi-gender-male</q-icon>
              <span class="px-1">Hommes</span>
            </q-btn>
            <q-btn class="toggle_btn" text outlined color="primary" value="female"><q-icon>mdi-gender-female</q-icon>
              <span class="px-1">Femmes</span>
            </q-btn>
          </q-btn-toggle>
          <h4 class="title mb-3">Distance</h4>
          <q-range class="mx-3 mb-5 pt-3" v-model="distance" hide-details :max="max" min="0" :step="step" thumb-label="always" thumb-size="30"></q-range>
          <h4 class="title mb-3">Age</h4>
          <q-range class="mx-3 mb-4 pt-3" v-model="age" max="85" min="18" step="1" thumb-label="always" thumb-size="25"></q-range>
          <h4 class="title mb-3">Note</h4>
          <q-range class="mx-3 mb-4 pt-3" v-model="rating" max="5" min="0" step=".5" thumb-label="always" thumb-size="25"></q-range>
          <h4 class="title mb-4">Location</h4>
          <q-input class="loaction_input mb-4" color="primary" outlined solo text append-icon="mdi-map-marker" v-model="location"></q-input>
          <h4 class="title mb-4">Interêts</h4>
          <q-select v-model="interests" :items="allTags" solo text outlined multiple deletable-chips hide-details class="tags_menu mb-5" chips></q-select>
          <q-layout align-center justify-between class="mb-4">
            <h4 class="title">Trier par</h4>
            <q-btn text icon class="sort_btn" color="primary" @click="changeSort">
              <q-icon :class="`sort_icon ${sortDir < 0 ? 'flip' : ''}`">mdi-sort</q-icon>
            </q-btn>
          </q-layout>
          <q-select outlined solo v-model="sort" :items="sortTypes" class="sort_select mb-5"></q-select>
          <q-layout :column="search" align-center justify-center>
            <q-btn outlined block large color="primary" :class="`${search ? '' : 'mr-3'} clear_btn`" @click="reset">
              <q-icon>Actualiser</q-icon>
            </q-btn>
            <q-btn outlined block large color="primary" :class="`${search ? '' : 'm-3'} clear_btn`" @click="search = true">
              <q-icon>Chercher</q-icon>
            </q-btn>
          </q-layout>
        </q-layout>
      </q-container>
    </q-flex>
    <q-flex xl10 md9 sm12 v-if="search">
      <q-layout row wrap justify-center>
        <q-flex class="user" v-for="user in sorted" :key="user.user_id" xl2 lg3 sm3 ma-3 grow>
          <user-card :user="user"/>
        </q-flex>
      </q-layout>
    </q-flex>
  </q-layout>
</q-page-container>
<LoaderView v-else/>
</template>

<script>
import { ref, watch, computed } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import countries from '@/nats.json'
import LoaderView from '@/views/LoaderView.vue'
import UserCard from '@/components/afterLogin/UserCard.vue'
import { matMenu } from '@quasar/extras/material-icons'
import { mdiAbTesting } from '@quasar/extras/mdi-v5'

export default {
  name: 'SearchView',
  components: {
    UserCard,
    LoaderView
  },
  setup() {
    const store = useStore()

    const online = ref(false)
    const max = ref(0)
    const step = ref(0)
    const search = ref(false)
    const sortDir = ref(1)
    const sort = ref(null)
    const users = ref([])
    const interests = ref([])
    const gender = ref(null)
    const location = ref(null)
    const loaded = ref(false)
    const age = ref([18, 85])
    const rating = ref([0, 5])
    const distance = ref([0, 0])
    const tags = ref(['sports', 'cinema', 'music'])
    const sortTypes = ref(['age', 'distance', 'rating', 'interests'])
    const nats = ref(countries)
    const isMounted = ref(false)
    const filters = reactive({
      self: val => val.user_id !== store.getters.user.id,
      blocked: val => !store.getters.blocked.includes(val.user_id),
      blockedBy: val => !store.getters.blockedBy.includes(val.user_id),
      rating: val => val.rating >= rating.value[0] && val.rating <= rating.value[1],
      gender: val => !gender.value || val.gender === gender.value,
      location: val => !location.value || [val.country, val.address, val.city].some(cur => cur && cur.includes(location.value)),
      distance: val => {
        if (distance.value[0] === distance.value[1]) return true
        if (val.lat && val.lng) {
          const { lat, lng } = val
          const distance = calculateDistance(store.getters.userLocation, { lat, lng })
          return distance >= distance.value[0] && distance <= distance.value[1]
        }
      },
      age: val => {
        const year = new Date(val.birthdate).getFullYear()
        const now = new Date().getFullYear()
        return year >= now - age.value[1] && year <= now - age.value[0]
      },
      interest: val => {
        if (!interests.value.length) return true
        for (const interest of interests.value) {
          if (val.tags.split(',').includes(interest)) return true
        }
        return false
      }
    })

    const filtered = computed(() => {
      console.log('-------- filters => ', filters)
      if (!search.value) return []
      return store.getters.users
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
      if (!search.value) return []
      if (!sort.value || sort.value === 'distance') {
        return sortDir.value < 0 ? [...filtered.value].reverse() : filtered.value
      }
      let sortFunc
      const age = (bd) => new Date() - new Date(bd)
      const commonTags = a => {
        if (!a || !a.length) return 0
        const tags = a.split(',')
        return store.getters.user.tags.split(',').filter(val => tags.indexOf(val) !== -1).length
      }
      switch (sort.value) {
        case 'age':
          sortFunc = (a, b) => sortDir.value * (age(a.birthdate) - age(b.birthdate))
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

    watch(isMounted, (newVal) => {
    console.log('.....................................................')
      if (newVal) {
        const maxDis = computed(() => {
          console.log('-------- users.value => ', users.value)
          console.log('-------- store.getters => ', store.getters)
          console.log('-------- store.state => ', store.state)
          if (!loaded.value && sort.value === null && sortDir.value === 1 && store.getters.users.length) {
            console.log('-----------------------------------------------------')
            const { lat, lng } = store.getters.users[store.getters.users.length - 1]
            const to = { lat: Number(lat), lng: Number(lng) }
            const raw = (calculateDistance(store.getters.userLocation, to) / 4).toFixed(0)
            const r = Math.ceil(Number(raw) / Math.pow(10, raw.length - 1))
            return Number(r + raw.split('').splice(1).map(cur => '0').join(''))
          }
          console.log('.....................................................')
        })
      }
    })

    onMounted(async () => {
      console.log('-----------------------------------------------------')
      const token = localStorage.getItem('token');
      const url = `${import.meta.env.VITE_APP_API_URL}/api/users/show`;
      const headers = { 'x-auth-token': token };
      const res = await axios.post(url, { filter: true }, { headers });

      if (!res.data.msg) {
        users.value = res.data.slice(0, 1000).map(cur => ({
          ...cur,
          rating: Number(cur.rating)
        }));

        if (props.data.gender || props.data.location) {
          if (props.data.gender !== 'null') gender.value = props.data.gender
          if (props.data.location !== 'null') location.value = props.data.location
          if (props.data.min && props.data.max && !isNaN(props.data.max) && !isNaN(props.data.min) && Number(props.data.max) >= Number(props.data.min)) {
            age.value = [Number(props.data.min), Number(props.data.max)]
          }
          search.value = true
        }
        isMounted.value = true
        loaded.value = true
      } else {
        // store.dispatch('logout')(store.getters.user.id)
        console.log('res.data.msg => ', res.data.msg)
        this.$router.push('/login')
      }
    })


    const reset = () => {
      search.value = false
      rating.value = [0, 5]
      age.value = [18, 85]
      gender.value = null
      distance.value = [0, maxDis]
      location.value = null
    }

    const changeSort = () => {
      sortDir.value = -sortDir.value
    }

    const whoIsUp = () => {
      if (store.getters.users) {
        store.getters.users.forEach((user, i) => {
          store.getters.users[i].lastSeen = store.getters.users[i].status
          store.getters.users[i].status = store.getters.online.includes(user.user_id)
        })
      }
    }

    watch(online, () => {
      whoIsUp()
    }, { immediate: true })

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

    watch(maxDis, () => {
      const distance = maxDis
      if (distance) {
        distance.value[1] = distance
        max.value = distance
        step.value = Math.ceil(distance / 30)
      }
    }, { immediate: true })

    return {
      max,
      step,
      search,
      sortDir,
      sort,
      users,
      interests,
      gender,
      location,
      loaded,
      age,
      rating,
      distance,
      tags,
      sortTypes,
      nats,
      filters,
      filtered,
      sorted,
      maxDis,
      reset,
      changeSort,
      whoIsUp
    }
  }
}
</script>

<style>
.v-slider {
  opacity: .7;
}

.tags_menu
> .v-input__control> .v-input__slot,
.loaction_input
> .v-input__control> .v-input__slot {
  box-shadow: none !important;
  border: 2px solid var(--color-primary) !important;
  opacity: .5;
}

.v-slider.v-slider--is-active,
.tags_menu.q-select--is-menu-active
> .v-input__control > .v-input__slot,
.loaction_input.v-input--is-focused
> .v-input__control > .v-input__slot {
  opacity: 1;
}

.loaction_input > .v-input__control
> .v-input__slot > .q-input__slot > input {
  margin: 0;
}

.v-input__icon.v-input__icon--append > .q-icon {
  color: var(--color-primary);
}

.v-menu__content.menuable__content__active.q-select__content {
  border: 2px solid var(--color-primary);
  border-top: none;
  box-shadow: none;
  transform: translateY(-3px);
}
.theme--light.q-btn-toggle,
.v-menu__content.menuable__content__active.q-select__content
> .q-select-list > .v-list {
  background-color: #FAFAFA !important;
}

.q-btn-toggle {
  display: flex;
}

.toggle_btn {
  flex: 1 1 !important;
  height: 3.33rem;
}

.clear_btn {
  align-self: flex-end;
}

.q-btn-toggle--selected {
  box-shadow: none;
}

.user {
  overflow: hidden;
}

.sort_icon.flip {
  transform: rotate(180deg);
}

.sort_btn {
  margin: 0 0 0 auto !important;
  padding: 0 !important;
}

.sort_select
> .v-input__control> .v-input__slot {
  box-shadow: none !important;
  border: 2px solid var(--color-primary) !important;
  opacity: .5;
}

.sort_select.q-select--is-menu-active
> .v-input__control > .v-input__slot {
  opacity: 1;
}
</style>
