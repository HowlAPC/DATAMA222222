<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>Add Payment</h2>

      <div class="form-group">
        <label>Receipt ID</label>
        <input type="number" v-model="receipt_id" />
      </div>

      <div class="form-group">
        <label>Amount</label>
        <input type="number" v-model="amount" />
      </div>

      <div style="display:flex; justify-content:space-between;">
        <button class="btn btn-primary" @click="savePayment">
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

const receipt_id = ref(null)
const amount = ref(0)

async function savePayment() {
  const { error } = await supabase.from('payment').insert([
    {
      receipt_id: receipt_id.value,
      amount: amount.value
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