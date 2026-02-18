<script setup>
import { ref } from 'vue'
const emit = defineEmits(['add-record'])
const title = ref('')

const submitForm = () => {
  if (title.value.trim()) {
    emit('add-record', title.value)
    title.value = '' // Clear input
  }
}
</script>

<template>
  <div class="form-container">
    <input 
      v-model="title" 
      placeholder="Enter new record..." 
      @keyup.enter="submitForm"
    />
    <button @click="submitForm">Add Record</button>
  </div>
</template>