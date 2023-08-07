<template>
  <div class="q-pa-md" style="max-width: 350px">
    <q-list style="background-color: WhiteSmoke">

      <q-item>
        <q-item-section>Discussions récentes</q-item-section>
      </q-item>
      <q-item v-if="convos.length == 0" style="align-items: center, justify-content: center, display: flex">
        <q-item-section >Pas de conversations</q-item-section>
      </q-item>

      <q-item clickable v-ripple v-for="convo in convos" :key="convo.id_conversation" @click="syncConvo(convo)">
        <q-item-section :value="!!unRead(convo)" overlap color="primary" class="mx-2" left>
            <template v-slot:badge>
              <span>{{ unRead(convo) }}</span>
            </template>
            <q-avatar>
              <img :src="getFullPath(convo.profile_image)">
            </q-avatar>
        </q-item-section>
        <q-item-section class="hidden-sm-and-down">
          <q-item-label>{{ convo.username }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-badge v-if="notTyping(convo)" small rounded :color="convo.status ? 'green' : 'grey'" />
          <div v-else class="typing">
            <div class="typing_point"></div>
            <div class="typing_point"></div>
            <div class="typing_point"></div>
          </div>
        </q-item-section>
      </q-item>

    </q-list>
  </div>
</template>

<script>
import utility from '@/utility.js'
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { matMenu } from '@quasar/extras/material-icons'
import { mdiAbTesting } from '@quasar/extras/mdi-v5'

export default {
  name: 'MessengerList',
  setup () {
    const store = useStore()
    const convosStatus = ref([])

    const convos = computed(() => store.state.convos)
    const online = computed(() => store.state.online)
    const notif = computed(() => store.state.notif)
    const typingSec = computed(() => store.state.typingSec)

    const syncConvo = (convo) => {
      store.dispatch('syncConvo', convo)
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

    const syncOnline = () => {
      convos.value.forEach((cur, i) => {
        convosStatus.value[i] = online.value.includes(cur.user_id)
      })
    }

    watch([online, convos], syncOnline, { immediate: true })

    return {
      ...utility,
      convos,
      unRead,
      notTyping,
      syncConvo
    }
  }
}
</script>

<style scoped>
.typing_point {
  /* background: var(--color-primary); */
}
</style>
