<template>
  <q-card :to="`/user/${user.user_id}`">
    <div  class="pt-1 column justify-center align-center">

      <div class="row justify-between q-ma-sm">
        <q-chip outline small text-color="grey-7">{{ distance }}</q-chip>
        <q-item-section side>
          <q-tooltip bottom class="status_container">
            <span>{{ lastSeen }}</span>
          </q-tooltip>
          <q-badge small rounded :color="`${user.isConnected ? 'green' : 'grey'}`"/>
        </q-item-section>
      </div>

      <q-avatar class="justify-center" size="150px">
        <img class="icon-avatar " square :src="likeIcon">
        <img :src="profileImage(user.name)"/>
      </q-avatar>
      <span justify-center class="name headline text-capitalize mt-2 ">{{ user.username }}</span>
      <span justify-center class="name headline text-capitalize mt-2 ">{{ user.last_name }} {{ user.first_name }}</span>
      <span justify-center class="name headline text-capitalize mt-2 ">
      <q-icon class="mr-2" size="25px" :name="user.gender === 'male' ? 'icon-male' : (user.gender === 'female' ? 'icon-femel' : 'icon-other')"/>
      <span v-if="user.birthdate">
        <q-icon size="30px" name="icon-age"/>
        {{ age }}
      </span>
      </span>

      <div class="note">
        <p class="caption text-capitalize rating_value">{{ user.rating ? user.rating.toFixed(1) : '0.0' }}</p>
        <q-rating
          :color="user.gender === 'male' ? 'blue-3' : user.gender === 'female' ? 'pink-2' : 'blue-5'"
          :color-selected="user.gender === 'male' ? 'blue-9' : user.gender === 'female' ? 'pink-8' : 'pink-4'"
          :modelValue="user.rating && !isNaN(user.rating) ? user.rating : 0"
          icon="mdi-heart-outline"
          icon-selected="mdi-heart"
          icon-half="mdi-heart-half-full"
          max="7"
          readonly
          dense
          size="1.7em"
          half-increments
          class="rating"/>
      </div>

      <div class="row justify-center align-center bottom mb-0 mt-auto py-2 px-4 grey-2">
        <q-icon color="primary" size="40px" name="icon-map"></q-icon>
        <span v-if="user.city && user.country" class="text-truncate">{{ `${user.city},  ${user.country}` }}</span>
        <span v-else class="text-truncate">Earth</span>
      </div>

    </div>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import moment from 'moment'
import utility from '@/utility'
import axios from 'axios'
// import io from 'socket.io-client'
// const socket = io(`${import.meta.env.VITE_APP_API_URL}`)

const getLikeIcon = utility.getLikeIcon

const location = computed(() => store.getters.location)
const connectedUsers = computed(() => store.state.connectedUsers)
const updateTimer = ref(null)
const store = useStore()
let likeIcon = ref('')

const props = defineProps({
  user: {
    type: Object,
    default: () => ({})
  }
})

const age = computed(() => {
  return new Date().getFullYear() - new Date(props.user.birthdate).getFullYear()
})

const distance = computed(() => {
  const from = {
    lat: store.getters.location.lat,
    lng: store.getters.location.lng
  }
  const to = {
    lat: props.user.lat,
    lng: props.user.lng
  }
  return `${Math.round(utility.calculateDistance(from, to))} kms away`
})

const lastSeen = computed(() => {
  if (props.user.lastSeen == 'online')
  {
    return 'online'
  } else {
    return props.user.lastSeen = moment(props.user.status).utc().fromNow()
  }
})

const profileImage = (image) => {
  return utility.getFullPath(image)
}

const getHistory = async () => {
  try {
    const selectedUserId = props.user.user_id;
    const token = store.getters.user.token || localStorage.getItem('token');
    const url = `${import.meta.env.VITE_APP_API_URL}/api/browse/allhistory`;
    const headers = { 'x-auth-token': token };
    const typesToFilter = ['he_like', 'you_like', 'he_like_back', 'you_like_back', 'he_unlike', 'you_unlike'];
    const result = await axios.get(url, { headers });

    const latestInteraction = result.data
      .filter((item) => typesToFilter.includes(item.type))
      .filter((item) => item.his_id === selectedUserId)
      .sort((a, b) => new Date(b.match_date) - new Date(a.match_date))[0];

    likeIcon.value = latestInteraction ? getLikeIcon(latestInteraction.type) : getLikeIcon('default');
  } catch (err) {
    console.error('Error in frontend/ProfileHistory.vue:', err);
  }
}

// function updateConnectedUsers() {
//   utility.getConnectedUsers()
//     .then(data => {
//       const connectedUserIds = data
//       const userId = props.user.user_id.toString()

//       if (connectedUserIds.includes(userId)) {
//         props.user.lastSeen = 'online'
//         props.user.isConnected = true
//       } else {
//         props.user.lastSeen = moment(props.user.status, 'YYYY-MM-DD HH:mm:ss').fromNow()
//         props.user.isConnected = false
//       }
//     })
//     .catch(error => {
//       console.error('Error retrieving data :', error)
//     });
// }

onMounted(() => {
  // updateConnectedUsers()
  getHistory()
})

// function refreshMethods() {
//   updateConnectedUsers()
//   // getHistory()
// }

// const refreshInterval = setInterval(refreshMethods, 2000)

// onBeforeUnmount(() => {
//   clearInterval(refreshInterval)
// })
</script>

<style>
.icon-avatar {
  width: 35px !important;
  height: 35px !important;
  position: absolute;
  size: 100%; 
  top: 5px; 
  left: 80%; 
  transform: translateX(-50%);
}
.icon-male {
  background-image: url('@/assets/userCard/male.png');
  background-size: 90%;
  background-repeat: no-repeat;
}
.icon-femel {
  background-image: url('@/assets/userCard/femel.png');
  background-size: 90%;
  background-repeat: no-repeat;
}
.icon-other {
  background-image: url('@/assets/userCard/other.png');
  background-size: 90%;
  background-repeat: no-repeat;
}
.icon-age {
  background-image: url('@/assets/userCard/age.png');
  background-size: 90%;
  background-repeat: no-repeat;
}
.icon-map {
  background-image: url('@/assets/userCard/map.png');
  background-size: 100%;
  background-repeat: no-repeat;
}
.note {
  display: flex;
  align-items: flex-start;
  flex-direction: row;
  justify-content: center;
}
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
  padding-bottom: 23px;
}
.q-avatar {
  margin: 0 auto;
  border: 1px solid rgba(0, 0, 0, .1);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, .1);
  transition: all .3s ease-out;
}
.align-center {
  text-align: center;
  gap: 10px;
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
