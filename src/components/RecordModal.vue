<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal">
      <h2>{{ isEditing ? 'Edit' : 'Add New' }} {{ activeTab.slice(0,-1) }}</h2>
      <form @submit.prevent="submitForm">
        <div v-for="(value,key) in formData" :key="key" class="form-group">
          <label :for="key">{{ key }}</label>
          <input v-model="formData[key]" :id="key" type="text"/>
        </div>
        <button type="submit">{{ isEditing ? 'Update' : 'Add' }}</button>
        <button type="button" @click="$emit('close')">Cancel</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { supabase } from '../supabase'

const props = defineProps({
  isOpen: Boolean,
  activeTab: String,
  record: Object,
  isEditing: Boolean
})
const emit = defineEmits(['close','refresh'])

const formData = ref({})

// Initialize form data when modal opens
watch(
  () => props.record,
  (val) => { formData.value = val ? { ...val } : {} },
  { immediate: true }
)

async function submitForm() {
  let primaryKey = ''
  switch(props.activeTab) {
    case 'customers': primaryKey = 'customer_id'; break
    case 'employees': primaryKey = 'employee_id'; break
    case 'items': primaryKey = 'item_id'; break
    case 'receipts': primaryKey = 'receipt_id'; break
    case 'payments': primaryKey = 'payment_id'; break
  }

  try {
    if (props.isEditing) {
      await supabase
        .from(props.activeTab.slice(0,-1))
        .update(formData.value)
        .eq(primaryKey, formData.value[primaryKey])
    } else {
      await supabase
        .from(props.activeTab.slice(0,-1))
        .insert([formData.value])
    }
    emit('refresh')
    emit('close')
  } catch (error) {
    alert(error.message)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; top:0; left:0; right:0; bottom:0;
  background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center;
}
.modal { background:white; padding:2rem; border-radius:12px; max-width:500px; width:100%; }
.form-group { margin-bottom:1rem; }
</style>