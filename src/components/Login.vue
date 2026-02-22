<template>
  <div class="login-wrapper">
    <div class="login-box">
      <h2>Laundry System Login</h2>
      
      <input v-model="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      
      <button @click="login">Login</button>
      
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const login = async () => {
  errorMessage.value = ''
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if (error) {
    errorMessage.value = error.message
  } else {
    location.reload()
  }
}
</script>

<style scoped>
.login-wrapper { display:flex; justify-content:center; align-items:center; height:100vh; background:#f1f5f9; }
.login-box { background:white; padding:2rem; border-radius:12px; width:320px; box-shadow:0 4px 10px rgba(0,0,0,0.1); }
input { width:100%; padding:10px; margin-bottom:10px; border-radius:6px; border:1px solid #ddd; }
button { width:100%; padding:10px; background:#3b82f6; color:white; border:none; border-radius:6px; cursor:pointer; }
.error { color:red; margin-top:10px; }
</style>