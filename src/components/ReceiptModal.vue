<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>Create Receipt</h2>

      <div class="form-group">
        <label>Customer ID</label>
        <input type="number" v-model="customer_id" />
      </div>

      <div class="form-group">
        <label>Total Amount</label>
        <input type="number" v-model="total_amount" />
      </div>

      <div style="display:flex; justify-content:space-between;">
        <button class="btn btn-primary" @click="saveReceipt">
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

const customer_id = ref(null)
const total_amount = ref(0)

async function saveReceipt() {
  const { error } = await supabase.from('receipt').insert([
    {
      customer_id: customer_id.value,
      total_amount: total_amount.value,
      status: 'Pending'
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