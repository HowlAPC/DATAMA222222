<script setup>
import { ref, watch } from 'vue'
import { supabase } from '../supabase'

const props = defineProps({
  table: String,
  show: Boolean
})

const emit = defineEmits(['close', 'refresh'])

const form = ref({})

// 🧠 Generate Random ID with Format
function generateId(prefix) {
  const random = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${random}`
}

// 🎯 Assign ID format depending on table
function assignId(data) {
  switch (props.table) {
    case 'customers':
      data.customer_id = generateId('CUST')
      break
    case 'employees':
      data.employee_id = generateId('EMP')
      break
    case 'items':
      data.item_id = generateId('ITEM')
      break
    case 'receipts':
      data.receipt_id = generateId('REC')
      break
    case 'payments':
      data.payment_id = generateId('PAY')
      break
  }
}

// 💾 Insert Record
async function saveRecord() {
  const data = { ...form.value }

  assignId(data)

  const { error } = await supabase
    .from(props.table)
    .insert([data])

  if (error) {
    alert('Error inserting: ' + error.message)
    return
  }

  alert('Record added successfully!')

  form.value = {}
  emit('refresh')
  emit('close')
}
</script>

<template>
  <div v-if="show" class="modal">
    <div class="modal-content">
      <h2>Add {{ table }}</h2>

      <div v-for="(value, key) in form" :key="key">
        <label>{{ key }}</label>
        <input v-model="form[key]" />
      </div>

      <button @click="saveRecord">Save</button>
      <button @click="$emit('close')">Cancel</button>
    </div>
  </div>
</template>