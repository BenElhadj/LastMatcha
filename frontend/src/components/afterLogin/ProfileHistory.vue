<template>
  <q-page padding>
    <h1 class="text-h3 py-3 mb-4">
      History
    </h1>
    <div v-for="(entry, i) in history" :key="i" class="q-my-md">
      <div class="row items-center">
        <div class="col-3">
          <strong class="mt-2 d-block">{{ fromNow(getDate(entry)) }}</strong>
        </div>
        <div class="col">
          <q-chip outline class="bubble grey lighten-5 px-2 py-2">
            <router-link :to="`/user/${entry.id}`">
              <q-avatar>
                <img :src="getFullPath(entry.profile_image)" :alt="entry.username">
              </q-avatar>
            </router-link>
            <span v-if="entry.type !== 'follower' && entry.type !== 'visitor'" class="mr-1">{{ getHistoryAction(entry.type) }}</span>
            <span>
              <router-link :to="`/user/${entry.id}`" class="timeline_link">{{ entry.username }}</router-link>
            </span>
            <span v-if="entry.type === 'follower' || entry.type === 'visitor'" class="ml-1">{{ getHistoryAction(entry.type) }}</span>
            <span v-if="entry.type === 'visited'">'s profile</span>
          </q-chip>
        </div>
      </div>
    </div>
    <q-btn v-if="moreToLoad" unelevated rounded color="primary" class="my-4 full-width" @click="increaseLimit">
      Load More
    </q-btn>
  </q-page>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import utility from '@/utility.js'

export default {
  name: 'ProfileHistory',
  setup () {
    const store = useStore()
    const limit = ref(15)
    const { getDate } = utility

    const history = computed(() => {
      if (Array.isArray(store.state.history)) {
        return store.state.history.filter(cur => !store.state.blocked.includes(cur.id)).sort((a, b) => new Date(getDate(b)) - new Date(getDate(a))).slice(0, limit.value)
      } else {
        return []
      }
    })

    const moreToLoad = computed(() => {
      return store.state.history && limit.value < store.state.history.length - 1
    })

    const increaseLimit = () => {
      if (limit.value + 11 < store.state.history.length) {
        limit.value += 10
      } else {
        limit.value = store.state.history.length - 1
      }
    }

    return {
      ...utility,
      history,
      moreToLoad,
      increaseLimit
    }
  }
}
</script>

<style scoped>
.timeline_link {
  text-decoration: none;
}

.bubble {
  border-radius: 5rem;
  border: 1px solid rgba(0, 0, 0, .1) !important;
  transition: all .3s ease-out;
}

.bubble:hover {
  border: 1px solid rgba(0, 0, 0, .25) !important;
}
</style>
