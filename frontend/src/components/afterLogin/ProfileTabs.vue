<template>
  <div md="8" :class="mobile ? 'hidden-md-and-up pb-0 mt-5' : 'hidden-sm-and-down'">
    <q-tabs v-model="activeTab" :color="`grey lighten`" slider-color="primary">
      <q-tab v-for="link in links" :key="link.route">
        <img :src="link.icon" class="icon-size">
        <span :class="mobile ? 'pl-3 hidden-xs-only' : ''">{{ link.text }}</span>
      </q-tab>
    </q-tabs>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import userImage from '@/assets/Settings/user.png'
import galerieImage from '@/assets/Settings/galerie.png'
import historyImage from '@/assets/Settings/history.png'
import settingImage from '@/assets/Settings/setting.png'

const store = useStore()
const props = defineProps({
  settings: { type: Boolean, default: false },
  mobile: { type: Boolean, default: false },
  active: { type: String, default: '' }
})


const emit = defineEmits(['change-tab'])
const activeTab = ref(props.active)
const links = ref([
  { 
    text: 'Infos', 
    route: 'profile',
    // width: '7px important!',
    icon: userImage
    },
  { 
    route: 'photo',
    text: 'Gallerie', 
    icon: galerieImage 
    }
])

if (props.settings) {
  links.value[0].text = 'Profile'
  links.value.push({ 
    text: 'Historique',
    route: 'history',
    icon: historyImage
    })
  links.value.push({
    text: 'Paramèters',
    route: 'setting',
    icon: settingImage
    })
}

watch(activeTab, (newTab) => {
  emit('change-tab', newTab)
})

watch(() => props.active, (newActive) => {
  activeTab.value = newActive
}, { immediate: true })

const isDesktop = computed(() => !store.state.mobile)

</script>


<style>
.q-tabs__container {
  height: 4rem;
}

.icon-size {
  width: 27px;
  margin: 5px;
}

.q-tabs__item--active,
.q-tabs__item--active > .q-icon {
  color: grey !important;
}
</style>
