<template>
  <q-flex md="8" :class="mobile ? 'hidden-md-and-up pb-0 mt-5' : 'hidden-sm-and-down'">
    <q-tabs v-model="activeTab" :color="`grey lighten-${mobile ? 5 : 3}`" slider-color="primary">
      <q-tab v-for="link in links" :key="link.route">
        <q-icon v-if="!mobile" left>{{ link.icon }}</q-icon>
        <span :class="mobile ? 'pl-3 hidden-xs-only' : ''">{{ link.text }}</span>
      </q-tab>
    </q-tabs>
  </q-flex>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'ProfileTabs',
  props: {
    settings: { type: Boolean, default: false },
    mobile: { type: Boolean, default: false },
    active: { type: String, default: '' }
  },
  emits: ['change-tab'], // Declare the event here
  setup (props, { emit }) {
    const store = useStore()
    const activeTab = ref(props.active)
    const links = ref([
      { icon: 'mdi-account', text: 'Infos', route: 'profile' },
      { icon: 'mdi-camera', text: 'Gallerie', route: 'photo' }
    ])
    if (props.settings) {
      links.value[0].text = 'Profile'
      links.value.push({ icon: 'mdi-history', text: 'Historique', route: 'history' })
      links.value.push({ icon: 'mdi-account-cog', text: 'Paramèters', route: 'setting' })
    }

    watch(activeTab, (newTab) => {
      emit('change-tab', newTab)
    })

    watch(() => props.active, (newActive) => {
      activeTab.value = newActive
    }, { immediate: true })

    const isDesktop = computed(() => !store.state.mobile)

    return {
      links,
      activeTab,
      isDesktop
    }
  }
}
</script>

<style>
.q-tabs__container {
  height: 4rem;
}

.q-tabs__item--active,
.q-tabs__item--active > .v-icon {
  color: var(--color-primary) !important;
}
</style>
