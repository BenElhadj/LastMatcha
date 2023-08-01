<template>
  <q-card to="`/user/${user.user_id}`">
    <div class="column justify-center align-center pt-1">
      <div class="row justify-between top pa-2">
        <q-chip
          outline
          small
          text-color="grey-7"
        >
          {{ distance }}
        </q-chip>
        <q-tooltip>
          <template #activator="{ on }">
            <q-icon
              :color="`${user.status ? 'green' : 'grey'}-2`"
              size="xs"
              v-on="on"
            >
              mdi-circle
            </q-icon>
          </template>
          <span>{{ lastSeen }}</span>
        </q-tooltip>
      </div>
      <q-avatar size="120">
        <img :src="profileImage(user.name)" />
      </q-avatar>
      <h5 class="text-h5 text-capitalize mt-2 mb-4">
        {{ user.first_name }}
      </h5>
      <div class="row align-start justify-center">
        <p class="caption text-capitalize rating_value">
          {{ user.rating.toFixed(1) }}
        </p>
        <!-- Quasar does not have a rating component, you need to use a third party library or build your own -->
      </div>
      <div class="row justify-center align-center bottom mb-0 mt-auto py-2 px-4 grey-2">
        <q-icon
          v-if="user.birthdate"
          color="primary"
          size="xs"
        >
          mdi-cake
        </q-icon>
        <span
          v-if="user.birthdate"
          class="pr-1"
        >{{ age }}</span>
        <q-icon
          color="primary"
          size="xs"
        >
          mdi-map-marker
        </q-icon>
        <span
          v-if="user.city && user.country"
          class="text-truncate"
        >{{ `${user.city}, ${user.country}` }}</span>
        <span
          v-else
          class="text-truncate"
        >Earth</span>
      </div>
    </div>
  </q-card>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import utility from '@/utility.js'

export default {
  name: 'UserCard',
  props: {
    user: {
      type: Object,
      default: () => { return {} }
    }
  },
  computed: {
    ...mapGetters(['location']),
    age () {
      return new Date().getFullYear() - new Date(this.user.birthdate).getFullYear()
    },
    distance () {
      const from = this.location
      const to = {
        lat: this.user.lat,
        lng: this.user.lng
      }
      return `${Math.round(this.calculateDistance(from, to))} kms away`
    },
    lastSeen () {
      if (this.user.status) return 'online'
      if (this.user.lastSeen) return moment(this.user.lastSeen).utc().fromNow()
      return moment(this.user.created_at).utc().fromNow()
    }
  },
  methods: {
    ...utility,
    profileImage (image) {
      return this.getFullPath(image)
    }
  }
}
</script>

<style>
.name {
  color: #828282;
  position: relative;
}

.name:after {
  display: block;
  content: '';
  position: absolute;
  top: 125%;
  left: 50%;
  width: 40%;
  height: 1px;
  background: var(--color-primary);
  transform: translate(-50%, -50%);
}

.q-card {
  box-sizing: border-box;
  height: 100%;
  box-shadow: none;
  border: 1px solid rgba(0, 0, 0, .1) !important;
  transition: all .3s ease-out;
}

.q-card:hover {
  border: 1px solid rgba(25, 25, 25, .3) !important;
}

.q-card__title {
  background: none;
}

.top, .bottom {
  width: 100%;
}

.rating {
  transform: scale(.8) translateY(-1px);
}

.rating_value {
  margin-left: 7px;
  margin-right: -3px;
}

.status_container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.status_icon {
  margin-left: auto !important;
}

.location_icon {
  transform: scale(1.1);
  margin-bottom: 2px;
}

.cake_icon {
  margin-bottom: 3px;
}

.love {
  transform: translate(-5px, -3px);
}

.v-responsive.v-image {
  border: 3px solid rgba(0, 0, 0, .1) !important;
}
</style>
