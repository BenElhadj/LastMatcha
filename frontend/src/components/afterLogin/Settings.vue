<template>
<v-layout column class="settings" v-if="loaded">
  <div class="parallax" :style="`background-image: url(${coverPhoto});`">
  </div>
  <q-tooltip left>
    <template v-slot:activator="{ on }">
      <div class="cover__btn">
        <v-fab-transition>
          <q-btn fab small outlined color="blue" v-on="on" @click.stop="pickFile"><q-icon>mdi-image</q-icon></q-btn>
        </v-fab-transition>
      </div>
    </template>
    <span>Changer votre photo de couverture</span>
  </q-tooltip>
  <input type="file" style="display: none" ref="image" accept="image/*" @change="onFilePicked">
  <v-layout class="py-0 strap grey lighten-3">
    <q-page-container py-0>
      <v-layout>
        <q-flex xs12 sm8 md4 class="avatar">
          <q-avatar slot="offset" class="mx-auto d-block" size="200">
            <img :src="profileImage" class="avatar__img">
            <div class="avatar__btn">
              <v-fab-transition>
                <q-btn color="grey lighten-5" fab small @click.stop="openEditor"><q-icon>mdi-image</q-icon></q-btn>
              </v-fab-transition>
            </div>
          </q-avatar>
        </q-flex>
        <profile-tabs settings :active="activeTab" @change-tab="changeTab"></profile-tabs>
      </v-layout>
    </q-page-container>
  </v-layout>
  <q-page-container fill-height grid-list-xl class="profile"> 
    <v-layout justify-center wrap>
      <q-flex xs12 sm8 md4>
        <profile-badge :user="user" settings></profile-badge>
      </q-flex>
      <q-flex xs12 sm10 md8 class="main pa-0 grey--text">
        <profile-tabs settings :active="activeTab" @change-tab="changeTab" mobile></profile-tabs>
        <q-tab v-model="activeTab">
          <q-tab value="tab-profile">
            <profile-form ref="form" :user="user" @sync-user="syncUser" @update-user="updateUser"></profile-form>
          </q-tab>
          <q-tab value="tab-photo">
            <profile-gallery :images="filteredImages"></profile-gallery>
          </q-tab>
          <q-tab value="tab-history">
            <profile-history></profile-history>
          </q-tab>
          <q-tab value="tab-setting">
            <profile-settings></profile-settings>
          </q-tab>
        </q-tab>
      </q-flex>
    </v-layout>
  </q-page-container>
  <alert :data="alert"></alert>
  <profile-editor @file_error="error = true" @file_succes="error = false" @update-image="updateImage" ref="profile_editor"></profile-editor>
</v-layout>
<loader v-else/>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'
import AlertView from '@/views/AlertView.vue'
import LoaderView from '@/views/LoaderView.vue'
import utility from '@/utility.js'
import ProfileEditor from '@/components/afterLogin/ProfileEditor.vue'
import ProfileBadge from '@/components/afterLogin/ProfileBadge.vue'
import ProfileTabs from '@/components/afterLogin/ProfileTabs.vue'
import ProfileForm from '@/components/afterLogin/ProfileForm.vue'
import ProfileSettings from '@/components/afterLogin/ProfileSettings.vue'
import ProfileGallery from '@/components/afterLogin/ProfileGallery.vue'
import ProfileHistory from '@/components/afterLogin/ProfileHistory.vue'

export default {
  name: 'Settings',
  components: {
    Alert,
    loader,
    ProfileTabs,
    ProfileForm,
    ProfileBadge,
    ProfileHistory,
    ProfileEditor,
    ProfileGallery,
    ProfileSettings
  },
  data: () => ({
    error: null,
    loaded: false,
    activeTab: 'tab-profile',
    alert: {
      state: false,
      color: '',
      text: ''
    }
  }),
  created () {
    if (this.user.id) {
      this.syncHistory(this.loggedIn.id)
      this.syncMatches(this.loggedIn.id)
    }
  },
  computed: {
    ...mapGetters({
      loggedIn: 'user',
      status: 'status',
      coverPhoto: 'coverPhoto',
      profileImage: 'profileImage'
    }),
    user: {
      get () {
        return { ...this.loggedIn }
      },
      set (user) {}
    },
    filteredImages () {
      if (!this.user.images) return []
      return this.user.images.filter(cur => !cur.cover)
    }
  },
  watch: {
    loggedIn: {
      immediate: true,
      async handler () {
        const token = this.user.token || localStorage.getItem('token')
        if (token) {
          try {
            const url = `${process.env.URL}/api/auth/isloggedin`
            const headers = { 'x-auth-token': token }
            const res = await this.$http.get(url, { headers })
            if (!res.body.msg) {
              this.loaded = true
              return
            }
          } catch (err) {
            console.log('Got error here --> ', err)
          }
        }
        this.logout(this.user.id)
        this.$router.push('/login')
      }
    }
  },
  methods: {
    ...utility,
    ...mapActions({
      logout: 'logout',
      update: 'updateUser',
      syncMatches: 'syncMatches',
      syncHistory: 'syncHistory'
    }),
    async updateUser () {
      try {
        let msg
        const url = `${process.env.URL}/api/users/updateprofile`
        const headers = { 'x-auth-token': this.user.token }
        const res = await this.$http.post(url, this.user, { headers })
        if (res && res.body && !res.body.msg) {
          msg = 'Your account has been updated successfuly'
          this.showAlert('green', msg, this)
          this.update(this.user)
          this.$refs.form.toggleEdit()
        } else {
          msg = res.body.msg ? res.body.msg : 'Ouups something went wrong!'
          this.showAlert('red', msg, this)
        }
      } catch (err) {
        console.log('got error here --> ', err)
      }
    },
    async updateImage (data) {
      if (!this.error) {
        try {
          let msg
          const fd = new FormData()
          fd.append('image', data)
          const url = `${process.env.URL}/api/users/image`
          const headers = { 'x-auth-token': this.user.token }
          const res = await this.$http.post(url, fd, { headers })
          if (res && res.body && !res.body.msg) {
            msg = 'You profile image has been updated successfuly'
            this.showAlert('success', msg, this)
            this.$store.commit('updateProfileImage', res.body)
          } else {
            msg = 'Something went wrong!'
            this.showAlert('red', msg, this)
          }
        } catch (err) {
          console.log('got error here --> ', err)
        }
      }
    },
    syncUser (user) {
      this.user = user
    },
    changeTab (tab) {
      this.activeTab = tab
    },
    openEditor () {
      this.$refs.profile_editor.pickFile()
    },
    pickFile () {
      this.$refs.image.click()
    },
    async onFilePicked (e) {
      const files = e.target.files
      if (files[0]) {
        const imageFile = files[0]
        const imageName = imageFile.name
        if (imageName.lastIndexOf('.') <= 0) return
        if (imageFile.size > 1024 * 1024) {
          this.showAlert('red', 'Image is too large..', this)
        } else {
          try {
            let msg
            const fd = new FormData()
            fd.append('image', imageFile)
            const url = `${process.env.URL}/api/users/image/cover`
            const headers = { 'x-auth-token': this.user.token }
            const res = await this.$http.post(url, fd, { headers })
            if (res && res.body && !res.body.msg) {
              msg = 'You cover image has been updated successfuly'
              this.showAlert('success', msg, this)
              this.$store.commit('updateCoverImage', res.body)
            } else {
              msg = res.body.msg ? res.body.msg : 'Ouups something went wrong!'
              this.showAlert('red', msg, this)
            }
          } catch (err) {
            console.log('Got error here --> ', err)
          }
        }
      }
    }
  }
}
</script>
<style scoped>
.container {
    width: 100%;
    padding: 4em;
}
</style>
