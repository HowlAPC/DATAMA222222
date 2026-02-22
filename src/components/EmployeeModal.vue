<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>Add Employee</h2>

      <div class="form-group">
        <label>Name</label>
        <input v-model="name" />
      </div>

      <div class="form-group">
        <label>Position</label>
        <input v-model="position" />
      </div>

      <div class="form-group">
        <label>Contact Number</label>
        <input v-model="contact_number" />
      </div>

      <div style="display:flex; justify-content:space-between;">
        <button class="btn btn-primary" @click="saveEmployee">
          Save
        </button>
        <button class="btn btn-danger" @click="$emit('close')">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'

const emit = defineEmits(['close'])

const name = ref('')
const position = ref('')
const contact_number = ref('')

async function saveEmployee() {
  const { error } = await supabase.from('employee').insert([
    {
      name: name.value,
      position: position.value,
      contact_number: contact_number.value
    }
  ])

  if (!error) {
    emit('close')
    location.reload()
  } else {
    alert(error.message)
  }
}
</script>