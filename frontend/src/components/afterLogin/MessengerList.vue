<template>
  <div class="q-pa-md" style="max-width: 350px">
    <q-list style="background-color: WhiteSmoke">

      <q-item>
        <q-item-section>Discussions récentes</q-item-section>
      </q-item>
      <q-item v-if="sortedConvos.length == 0" style="align-items: center, justify-content: center, display: flex">
        <q-item-section >Pas de conversations</q-item-section>
      </q-item>

      <q-item clickable v-ripple v-for="(convo) in sortedConvos.sort(sortByLastSeen)"
        :key="convo.id_conversation" @click="syncConvo(convo)"
        :class="{ 'selected-convo': convo === selectedConvo }">

        <q-item-section :value="!!unRead(convo)" overlap color="primary" class="mx-2" left>
            <template v-slot:badge>
              <span>{{ unRead(convo) }}</span>
            </template>
            <q-avatar>
              <img :src="utility.getFullPath(convo.profile_image)">
            </q-avatar>
        </q-item-section>
        
        <q-item-section class="hidden-sm-and-down">
          <q-item-label class="truncate-text">{{ convo.username }}</q-item-label>
        </q-item-section>

        <q-item-section side>

          <q-tooltip bottom class="status_container">
            <span>{{ lastSeen[convo.user_id] }}</span>
          </q-tooltip>

          <q-badge v-if="notTyping(convo)" small rounded :color="lastSeen[convo.user_id] == 'online' ? 'green' : 'grey'" />
          <div v-else class="typing">
            <q-spinner-dots size="2rem" />
          </div>

        </q-item-section>

      </q-item>

    </q-list>
  </div>
</template>

<script setup>
import utility from '@/utility.js'
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useStore, mapActions  } from 'vuex'
import moment from 'moment'

const store = useStore()
const convos = computed(() => store.state.convos)
const online = computed(() => store.state.online)
const notif = computed(() => store.state.notif)
const typingSec = computed(() => store.state.typingSec)
const convosStatus = ref([])
const lastSeen = ref([])
const updateTimer = ref(null)
const connectedUsers = computed(() => store.state.connectedUsers)
const selectedConvo = ref(null)

const syncConvo = (convo) => {
  store.dispatch('syncConvo', convo)
  selectedConvo.value = convo
}

const unRead = (convo) => {
  if (notif.value.length) {
    let sum = 0
    notif.value.forEach(cur => {
      if (cur.type === 'chat' && cur.id_conversation === convo.id_conversation) {
        sum++
      }
    })
    return sum
  }
}

const notTyping = (convo) => {
  if (typingSec.value.status) {
    const conv = typingSec.value.convos.find(cur => cur.id_conversation === convo.id_conversation)
    return !conv
  }
  return true
}

function updateConnectedUsers() {
  utility.getConnectedUsers()
    .then(data => {
      const connectedUserIds = data
      convos.value.forEach((cur) => {
        if (connectedUserIds.includes(cur.user_id.toString())) {
          lastSeen.value[cur.user_id] = 'online'
          convosStatus.value[cur.user_id] = true
        } else {
          lastSeen.value[cur.user_id] = moment(cur.status).utc().fromNow()
          convosStatus.value[cur.user_id] = false
        }
      })
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des données :', error)
    })
}

onMounted(async () => {
  updateConnectedUsers()
  updateTimer.value = setInterval(updateConnectedUsers, 2000)
})

onBeforeUnmount(() => {
  clearInterval(updateTimer.value)
})

watch([online, convos], updateConnectedUsers,{ immediate: true })

const sortByLastSeen = (a, b) => {
  if (lastSeen.value[a.user_id] === 'online' && lastSeen.value[b.user_id] !== 'online') {
    return -1
  } else if (lastSeen.value[a.user_id] !== 'online' && lastSeen.value[b.user_id] === 'online') {
    return 1
  } else {
    return 0
  }
}

const sortedConvos = computed(() => {
  const uniqueConvos = Array.from(new Set(convos.value.map(convo => convo.user_id)))
    .map(user_id => convos.value.find(convo => convo.user_id === user_id))

  return uniqueConvos.sort(sortByLastSeen)
})

</script>

<style scoped>
.typing_point {
  background: var(--color-primary);
}
.selected-convo {
  background-color: silver;
}
.truncate-text {
  min-width: 40px; /* Ajustez cette valeur en fonction de votre préférence */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
