<template>
  <div class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">
        Add Payment
      </h3>

      <form @submit.prevent="savePayment">
        <select v-model="receiptId" class="select select-bordered w-full mb-2">
          <option disabled value="">Select Receipt</option>
          <option v-for="r in receipts" :key="r.receipt_id" :value="r.receipt_id">
            Receipt #{{ r.receipt_id }}
          </option>
        </select>

        <input v-model="amountPaid" type="number" placeholder="Amount Paid" class="input input-bordered w-full mb-4" />

        <div class="flex justify-end gap-2">
          <button type="button" @click="$emit('close')" class="btn">Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'
import { payments } from '../store'

const receiptId = ref('')
const amountPaid = ref('')

const savePayment = async () => {
  const { data } = await supabase.from('payment').insert({
    receipt_id: receiptId.value,
    amount_paid: amountPaid.value
  }).select()

  payments.value.push(data[0])
  $emit('close')
}
</script>