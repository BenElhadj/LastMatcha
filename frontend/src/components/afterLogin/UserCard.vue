<template>
  <q-card :to="`/user/${user.user_id}`">
    <div  class="pt-1 column justify-center align-center">

      <div class="row justify-between q-ma-sm">
        <q-chip outline small text-color="grey-7">{{ distance }}</q-chip>
        <q-item-section side>
          <q-tooltip bottom class="status_container">
            <span>{{ lastSeen }}</span>
          </q-tooltip>
          <q-badge small rounded :color="user.status ? 'green' : 'grey'" />
        </q-item-section>
      </div>




      <q-avatar lass="justify-center" size="120px">
        <img :src="profileImage(user.name)" aspect-ratio="1"/>
      </q-avatar>
      {{props.user.status }}

      <span justify-center class="name headline text-capitalize mt-2 ">{{ user.username }}</span>
      <span justify-center class="name headline text-capitalize mt-2 ">{{ user.last_name }} {{ user.first_name }}</span>
      <div align-start justify-center>
        <p class="caption text-capitalize rating_value">{{ user.rating.toFixed(1) }}</p>
          <!-- <q-rating icon="mdi-heart" color="primary" readonly dense size="2em" :value="user.rating" half-increments class="rating"/> -->
          <q-rating icon="mdi-heart" color="primary" readonly dense size="2em" :modelValue="user.rating" half-increments class="rating"/>

        <!-- Quasar does not have a rating component, you need to use a third party library or build your own -->
      </div>
      <div class="row justify-center align-center bottom mb-0 mt-auto py-2 px-4 grey-2">
        <q-icon v-if="user.birthdate" color="primary" size="xs" name="mdi-cake"></q-icon>

        <span v-if="user.birthdate" class="pr-1">{{ age }}</span>
        <q-icon color="primary" size="xs" name="mdi-map-marker"></q-icon>

        <span v-if="user.city && user.country" class="text-truncate">{{ `${user.city}, ${user.country}` }}</span>
        <span v-else class="text-truncate">Earth</span>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import moment from 'moment'
import utility from '@/utility'

// export default defineComponent({
//   name: 'UserCard',
// })

// Props
const props = defineProps({
  user: {
    type: Object,
    default: () => ({})
  }
})


// Store
const store = useStore()

// Computed
const location = computed(() => store.getters.location)


const age = computed(() => {
  return new Date().getFullYear() - new Date(props.user.birthdate).getFullYear()
})

const distance = computed(() => {
  const to = {
    lat: props.user.lat,
    lng: props.user.lng
  }
  return `${Math.round(utility.calculateDistance(location.value, to))} kms away`
})

const lastSeen = computed(() => {
  if (props.user.status) return 'online'
  if (props.user.lastSeen) return moment(props.user.lastSeen).utc().fromNow()
  return moment(props.user.created_at).utc().fromNow()
})

// Methods
const profileImage = (image) => {
  return utility.getFullPath(image)
}
</script>
<!-- 
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
  },
  // setup () {
  //   const model3 = ref(4.5)

  //   return {
  //     model3,

  //     resetModels () {
  //       model3.value = 4.5
  //     }
  //   }
  // }
}
</script> -->

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
