<template>
  <q-page class="row justify-center items-center">
    <div class="text-h6 text-center q-ma-md">
      <div class="text-grey-8">
        404
      </div>
      <div>Page not found</div>
      <q-btn
        class="full-width"
        color="primary"
        label="Go to Home"
        @click="goHome"
      ></q-btn>
    </div>
  </q-page>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'NotFound',
  setup () {
    const router = useRouter()

    const goHome = () => {
      router.push('/')
    }

    return {
      goHome
    }
  }
}
</script>

<style scoped>
.q-page {
  height: 100vh;
}
</style>
