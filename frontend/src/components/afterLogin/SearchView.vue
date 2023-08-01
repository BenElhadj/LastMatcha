<template>
  <q-layout>
    <v-container v-if="loaded" class="pt-5 px-0 discover">
      <v-layout wrap justify-center>
        <v-flex :xl2="search" :xl4="!search" :md3="search" :md8="!search" sm10>
          <v-container px-md-5>
            <v-layout column>
              <h4 class="title mb-4">
                Afficher
              </h4>
              <v-btn-toggle v-model="gender" class="mb-5">
                <v-btn class="toggle_btn" text outlined color="primary" value="male">
                  <v-icon>mdi-gender-male</v-icon>
                  <span class="px-1">Hommes</span>
                </v-btn>
                <v-btn class="toggle_btn" text outlined color="primary" value="female">
                  <v-icon>mdi-gender-female</v-icon>
                  <span class="px-1">Femmes</span>
                </v-btn>
              </v-btn-toggle>
              <h4 class="title mb-3">
                Distance
              </h4>
              <v-range-slider v-model="distance" class="mx-3 mb-5 pt-3" hide-details :min="0" :max="max" :step="step" :thumb-size="30" thumb-label="always"></v-range-slider>
              <h4 class="title mb-3">
                Age
              </h4>
              <v-range-slider v-model="age" class="mx-3 mb-4 pt-3" :min="18" :max="85" :step="1" :thumb-size="25" thumb-label="always"></v-range-slider>
              <h4 class="title mb-3">
                Note
              </h4>
              <v-range-slider v-model="rating" class="mx-3 mb-4 pt-3" :min="0" :max="5" :step="0.5" :thumb-size="25" thumb-label="always"></v-range-slider>
              <h4 class="title mb-4">
                Location
              </h4>
              <v-text-field v-model="location" class="loaction_input mb-4" color="primary" outlined solo text append-icon="mdi-map-marker"></v-text-field>
              <h4 class="title mb-4">
                Interêts
              </h4>
              <v-autocomplete v-model="interests" :items="allTags" solo text outlined multiple deletable-chips hide-details class="tags_menu mb-5" chips></v-autocomplete>
              <v-layout align-center justify-between class="mb-4">
                <h4 class="title">
                  Trier par
                </h4>
                <v-btn text icon class="sort_btn" color="primary" @click="changeSort">
                  <v-icon :class="`sort_icon ${sortDir < 0 ? 'flip' : ''}`">
                    mdi-sort
                  </v-icon>
                </v-btn>
              </v-layout>
              <v-select v-model="sort" outlined solo :items="sortTypes" class="sort_select mb-5"></v-select>
              <v-layout :column="search" align-center justify-center>
                <v-btn outlined block large color="primary" :class="`${search ? '' : 'mr-3'} clear_btn`" @click="reset">
                  <v-icon>Actualiser</v-icon>
                </v-btn>
                <v-btn outlined block large color="primary" :class="`${search ? '' : 'm-3'} clear_btn`" @click="search = true">
                  <v-icon>Chercher</v-icon>
                </v-btn>
              </v-layout>
            </v-layout>
          </v-container>
        </v-flex>
        <v-flex v-if="search" xl10 md9 sm12>
          <v-layout row wrap justify-center>
            <v-flex v-for="user in sorted" :key="user.user_id" class="user" xl2 lg3 sm3 ma-3 grow>
              <user-card :user="user" />
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-container>
    <Loader v-else />
  </q-layout>
</template>

<script>
import loader from '@/views/LoaderView.vue'
import { mapGetters, mapActions } from 'vuex'
import UserCard from '@/components/afterLogin/UserCard.vue'
import countries from '@/nats.json'
import utility from '@/utility'
import axios from 'axios'

export default {
  name: 'SearchView',
  components: {
    UserCard,
    loader
  },
  props: {
    data: {
      type: Object,
      default: () => ({ })
    }
  },
  data () {
    return {
      max: 0,
      step: 0,
      search: false,
      sortDir: 1,
      sort: null,
      users: [],
      interests: [],
      gender: null,
      location: null,
      loaded: false,
      age: [18, 85],
      rating: [0, 5],
      distance: [0, 0],
      tags: ['sports', 'cinema', 'music'],
      sortTypes: ['age', 'distance', 'rating', 'interests'],
      nats: countries,
      filters: {
        self: val => val.user_id !== this.user.id,
        blocked: val => !this.blocked.includes(val.user_id),
        blockedBy: val => !this.blockedBy.includes(val.user_id),
        rating: val => val.rating >= this.rating[0] && val.rating <= this.rating[1],
        gender: val => !this.gender || val.gender === this.gender,
        location: val => !this.location || [val.country, val.address, val.city].some(cur => cur && cur.includes(this.location)),
        distance: val => {
          if (this.distance[0] === this.distance[1]) return true
          if (val.lat && val.lng) {
            const { lat, lng } = val
            const distance = this.calculateDistance(this.userLocation, { lat, lng })
            return distance >= this.distance[0] && distance <= this.distance[1]
          }
        },
        age: val => {
          const year = new Date(val.birthdate).getFullYear()
          const now = new Date().getFullYear()
          return year >= now - this.age[1] && year <= now - this.age[0]
        },
        interest: val => {
          if (!this.interests.length) return true
          for (const interest of this.interests) {
            if (val.tags.split(',').includes(interest)) return true
          }
          return false
        }
      }
    }
  },
  computed: {
    ...mapGetters({
      user: 'user',
      allTags: 'tags',
      online: 'online',
      status: 'status',
      blocked: 'blocked',
      blockedBy: 'blockedBy',
      userLocation: 'location'
    }),
    filtered () {
      if (!this.search) return []
      return this.users
        .filter(this.filters.self)
        .filter(this.filters.blocked)
        .filter(this.filters.blockedBy)
        .filter(this.filters.rating)
        .filter(this.filters.gender)
        .filter(this.filters.location)
        .filter(this.filters.age)
        .filter(this.filters.distance)
        .filter(this.filters.interest)
    },
    sorted () {
      if (!this.search) return []
      if (!this.sort || this.sort === 'distance') {
        return this.sortDir < 0 ? [...this.filtered].reverse() : this.filtered
      }
      let sortFunc
      const age = (bd) => new Date() - new Date(bd)
      const commonTags = a => {
        if (!a || !a.length) return 0
        const tags = a.split(',')
        return this.user.tags.split(',').filter(val => tags.indexOf(val) !== -1).length
      }
      switch (this.sort) {
        case 'age':
          sortFunc = (a, b) => this.sortDir * (age(a.birthdate) - age(b.birthdate))
          break
        case 'rating':
          sortFunc = (a, b) => this.sortDir * (b.rating - a.rating)
          break
        case 'interests':
          sortFunc = (a, b) => this.sortDir * (commonTags(b.tags) - commonTags(a.tags))
          break
      }
      return [...this.filtered].sort(sortFunc)
    },
    maxDis () {
      if (this.sort === null && this.sortDir === 1 && this.users.length) {
        const { lat, lng } = this.users[this.users.length - 1]
        const to = { lat: Number(lat), lng: Number(lng) }
        const raw = (this.calculateDistance(this.userLocation, to) / 4).toFixed(0)
        const last = Number(raw[raw.length - 1])
        if (last < 5) return Number(raw.slice(0, -1) + '5')
        if (last > 5) return Number(raw.slice(0, -1) + '10')
        return Number(raw)
      }
      return 0
    }
  },
  watch: {
    online: {
      immediate: true,
      handler () {
        this.whoIsUp()
      }
    },
    age () {
      if (this.age[0] > this.age[1]) {
        const temp = this.age[0]
        this.age[0] = this.age[1]
        this.age[1] = temp
      }
    },
    rating () {
      if (this.rating[0] > this.rating[1]) {
        const temp = this.rating[0]
        this.rating[0] = this.rating[1]
        this.rating[1] = temp
      }
    },
    distance () {
      if (this.distance[0] > this.distance[1]) {
        const temp = this.distance[0]
        this.distance[0] = this.distance[1]
        this.distance[1] = temp
      }
    },
    maxDis: {
      immediate: true,
      handler () {
        const distance = this.maxDis
        if (distance) {
          this.distance[1] = distance
          this.max = distance
          this.step = Math.ceil(distance / 30)
        }
      }
    }
  },
  async created () {
    try {
      const token = localStorage.getItem('token')
      const url = `${import.meta.env.VITE_APP_API_URL}/api/users/show`
      const headers = { 'x-auth-token': token }
      // const res = await axios.post(url, {filter: false}, { headers })
      const res = await axios.post(url, { filter: false }, { headers })
      console.log(res)
      if (!res.data) {
        this.users = res.data.map(cur => ({
          ...cur,
          rating: Number(cur.rating)
        }))
        if (this.data.gender || this.data.location) {
          if (this.data.gender !== 'null') this.gender = this.data.gender
          if (this.data.location !== 'null') this.location = this.data.location
      {
            this.age = [Number(this.data.min), Number(this.data.max)]
          }
          this.search = true
        }
        this.whoIsUp()
        this.loaded = true
      } else {
        // this.logout(this.user.id)
        this.$router.push('/login')
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs :", error);
    } 
  },
  methods: {
    ...utility,
    ...mapActions(['logout']),
    reset () {
      this.search = false
      this.rating = [0, 5]
      this.age = [18, 85]
      this.gender = null
      this.distance = [0, this.maxDis]
      this.location = null
    },
    changeSort () {
      this.sortDir = -this.sortDir
    },
    whoIsUp () {
      this.users.forEach((user, i) => {
        this.users[i].lastSeen = this.users[i].status
        this.users[i].status = this.online.includes(user.user_id)
      })
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
.tags_menu.v-select--is-menu-active
> .v-input__control > .v-input__slot,
.loaction_input.v-input--is-focused
> .v-input__control > .v-input__slot {
  opacity: 1;
}

.loaction_input > .v-input__control
> .v-input__slot > .v-text-field__slot > input {
  margin: 0;
}

.v-input__icon.v-input__icon--append > .v-icon {
  color: var(--color-primary);
}

.v-menu__content.menuable__content__active.v-autocomplete__content {
  border: 2px solid var(--color-primary);
  border-top: none;
  box-shadow: none;
  transform: translateY(-3px);
}
.theme--light.v-btn-toggle,
.v-menu__content.menuable__content__active.v-autocomplete__content
> .v-select-list > .v-list {
  background-color: #FAFAFA !important;
}

.v-btn-toggle {
  display: flex;
}

.toggle_btn {
  flex: 1 1 !important;
  height: 3.33rem;
}

.clear_btn {
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

.sort_select.v-select--is-menu-active
> .v-input__control > .v-input__slot {
  opacity: 1;
}
</style>
