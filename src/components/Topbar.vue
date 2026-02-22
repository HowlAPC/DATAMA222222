<template>
  <header class="bg-white shadow p-4 flex justify-between items-center">
    <h2 class="text-lg font-bold">Fresh & Clean Laundry Hub</h2>
    <div>
      <span class="mr-2">{{ user?.email }}</span>
      <button @click="logout" class="btn btn-danger">Logout</button>
    </div>
  </header>
</template>

<script setup>
import { supabase } from '../supabase'
import { ref } from 'vue'

const user = ref(supabase.auth.user())

const logout = async () => {
  await supabase.auth.signOut()
  window.location.reload()
}
</script>

<style scoped>
.btn-danger { @apply bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded; }
</style>