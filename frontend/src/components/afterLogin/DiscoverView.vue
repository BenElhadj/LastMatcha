<template>
  <q-layout>
    <div v-if="isComplete()" class="discover">
      <q-page-container v-if="loaded" class="pt-5 px-0">
        <div class="row wrap justify-center">
          <div class="col-2">
            <q-page-container class="px-5">
              <div class="column">
                <h4 class="title mb-4">
                  Afficher
                </h4>
                <q-btn-toggle
        v-model="model"
        spread
        no-caps
        toggle-color="purple"
        color="white"
        text-color="black"
        :options="[
          {label: 'Option 1', value: 'one'},
          {label: 'Option 2', value: 'two'}
        ]"
      ></q-btn-toggle>
                <h4 class="title mb-3">
                  Distance
                </h4>
                <q-range v-model="distance" class="mx-3 mb-5 pt-3" :min="0" :max="max" :step="step" :thumb-size="30" thumb-label="always"></q-range>
                <h4 class="title mb-3">
                  Age
                </h4>
                <q-range v-model="age" class="mx-3 mb-5 pt-3" :min="18" :max="85" :step="1" :thumb-size="25" thumb-label="always"></q-range>
                <!-- <q-range v-model="age" class="mx-3 mb-5 pt-3" :min="18" :max="85" :step="1" :thumb-size="25" label-always></q-range> -->

                <h4 class="title mb-3">
                  Note
                </h4>
                <q-range v-model="rating" class="mx-3 mb-5 pt-3" :min="0" :max="5" :step="0.5" :thumb-size="25" thumb-label="always"></q-range>
                <h4 class="title mb-4">
                  Localisation
                </h4>
                <q-input v-model="location" class="location_input mb-5" color="primary" hide-details outlined solo text append-icon="mdi-map-marker"></q-input>
                <h4 class="title mb-4">
                  Interêts
                </h4>
                <q-select v-model="interests" :options="allTags" solo text outlined multiple hide-details class="tags_menu mb-5"></q-select>
                <div class="row justify-between mb-4">
                  <h4 class="title">
                    Sort by
                  </h4>
                  <q-btn text icon class="sort_btn" color="primary" @click="changeSort">
                    <q-icon :class="`sort_icon ${sortDir < 0 ? 'flip' : ''}`">
                      mdi-sort
                    </q-icon>
                  </q-btn>
                </div>
                <q-select v-model="sort" outlined solo :options="sortTypes" class="sort_select mb-5"></q-select>
                <h4 class="title mb-4">
                  Reset all
                </h4>
                <q-btn outlined block large color="primary" class="clear_btn" @click="reset">
                  <q-icon name="mdi-refresh"></q-icon>
                </q-btn>
              </div>
            </q-page-container>
          </div>
          <div class="col-10">
            <div class="row wrap justify-center">
              <div v-for="user in sortedUsers" :key="user.user_id" class="user col-xl2 col-lg3 col-sm3 ma-3 grow">
                <user-card :user="user" />
              </div>
            </div>
          </div>
        </div>
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
  </q-layout>
</template>

<script>
import LoaderView from '@/views/LoaderView.vue'
import { mapGetters, mapActions } from 'vuex'
import UserCard from '@/components/afterLogin/UserCard.vue'
import countries from '@/nats.json'
import utility from '@/utility'
import axios from 'axios'
import { matMenu } from '@quasar/extras/material-icons'
import { mdiAbTesting } from '@quasar/extras/mdi-v5'

export default {
  name: 'DiscoverView',
  components: {
    UserCard,
    LoaderView
  },
  data () {
    return {
      model: ref('one'),
      max: 0,
      step: 0,
      sortDir: 1,
      sort: null,
      users: [],
      interests: [],
      gender: null,
      location: null,
      hasBoth: false,
      loaded: false,
      age: [18, 85],
      rating: [0, 5],
      distance: [0, 5],
      tags: ['sports', 'cinema', 'music'],
      sortTypes: ['age', 'distance', 'rating', 'interests'],
      nats: countries,
      filters: {
        self: val => val.user_id !== this.user.id,
        blocked: val => !this.blocked.includes(val.user_id),
        blockedBy: val => !this.blockedBy.includes(val.user_id),
        rating: val => val.rating >= this.rating[0] && val.rating <= this.rating[1],
        gender: val => !this.gender || val.gender === this.gender,
        location: val => !this.location || [val.country, val.address, val.city].some(cur => typeof cur === 'string' && cur.toLowerCase().indexOf(this.location.toLowerCase()) !== -1),
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
          for (const interest of this.interests) if (val.tags.split(',').includes(interest)) return true
          return false
        }
      }
    }
  },
  computed: {
    ...mapGetters({
      user: 'user',
      allTags: 'tags',
      status: 'status',
      online: 'online',
      blocked: 'blocked',
      userLocation: 'location',
      blockedBy: 'blockedBy'
    }),
    filteredUsers () {
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
    sortedUsers () {
      if (!this.sort || this.sort === 'distance') {
        return this.sortDir < 0 ? [...this.filteredUsers].reverse() : this.filteredUsers
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
      return [...this.filteredUsers].sort(sortFunc)
    },
    maxDis () {
      if (this.sort === null && this.sortDir === 1 && this.users.length) {
        const { lat, lng } = this.users[this.users.length - 1]
        const to = {
          lat: Number(lat),
          lng: Number(lng)
        }
        return Math.ceil(this.calculateDistance(this.userLocation, to))
      }
      return 0
    }
  },
  watch: {
    user: {
      immediate: true,
      handler () {
        if (this.user.looking && this.user.looking === 'both') {
          this.hasBoth = true
        }
      }
    },
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
    const token = localStorage.getItem('token')
    const url = `${import.meta.env.VITE_APP_API_URL}/api/users/show`
    const headers = { 'x-auth-token': token }
    const res = await axios.post(url, { filter: true }, { headers })
    console.log('hello '+res)
    if (!res.data.msg) {
      this.users = res.data.slice(0, 100).map(cur => ({
        ...cur,
        rating: Number(cur.rating)
      }))
      this.whoIsUp()
      this.loaded = true
    } else {
      // th
      is.logout(this.user.id)
      // router.push('/login')
      console.log(res.data.msg)
    }
  },
  methods: {
    ...utility,
    ...mapActions(['logout']),
    reset () {
      this.sortDir = 1
      this.sort = null
      this.gender = null
      this.age = [18, 85]
      this.rating = [0, 5]
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
    },
    isComplete () {
      return this.user.gender && this.user.gender.length && this.user.looking && this.user.biography && this.user.tags && this.user.images.length && this.user.city && this.user.country && this.user.postal_code
    }
  }
}
</script>

<style scoped>
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
  box-shadow: none !important;
  border: 2px solid var(--color-primary) !important;
  opacity: .5;
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

.v-slider__thumb-label > span {
  font-size: .8em;
}
</style>
