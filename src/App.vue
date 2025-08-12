<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useWebSocket } from '@/composables/useWebSocket'

useUserStore()
useWebSocket()

</script>

<template>
  <RouterView></RouterView>
</template>
