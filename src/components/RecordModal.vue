<script setup>
import { ref, watch } from 'vue'
import { supabase } from '../supabase'

const props = defineProps({
  isOpen: Boolean,
  activeTab: String,
  editRecord: Object // New prop for editing
})

const emit = defineEmits(['close', 'refresh'])
const loading = ref(false)
const formData = ref({})

// Initialize or Reset form
watch(() => [props.isOpen, props.editRecord], () => {
  if (props.editRecord) {
    formData.value = { ...props.editRecord }
  } else {
    resetForm()
  }
})

function resetForm() {
  if (props.activeTab === 'customers') formData.value = { first_name: '', last_name: '', contact_number: '' }
  else if (props.activeTab === 'employees') formData.value = { first_name: '', last_name: '', employee_type: '', salary: 0 }
  else if (props.activeTab === 'items') formData.value = { item_type: '', weight: 0, fabric_type: '', price: 0 }
}

async function handleSubmit() {
  loading.value = true
  const tableName = props.activeTab.replace(/s$/, '')
  const idColumn = `${tableName}_id`

  let result;
  if (props.editRecord) {
    // UPDATE
    result = await supabase.from(tableName).update(formData.value).eq(idColumn, props.editRecord[idColumn])
  } else {
    // INSERT
    result = await supabase.from(tableName).insert([formData.value])
  }

  if (result.error) alert('Database Error: ' + result.error.message)
  else {
    emit('refresh')
    emit('close')
  }
  loading.value = false
}
</script>

<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-card">
      <h3>{{ editRecord ? 'Edit' : 'Add New' }} {{ activeTab.slice(0, -1) }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="actions">
          <button type="button" @click="$emit('close')">Cancel</button>
          <button type="submit" :disabled="loading">{{ loading ? 'Saving...' : 'Confirm' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>