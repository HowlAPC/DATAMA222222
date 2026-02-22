<template>
  <div class="container">
    <div class="page-title">Payments</div>

    <div class="card">
      <button class="btn btn-primary" @click="openModal">
        + Add Payment
      </button>
    </div>

    <div class="card">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Receipt ID</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in payments" :key="p.payment_id">
            <td>{{ p.payment_id }}</td>
            <td>{{ p.receipt_id }}</td>
            <td>₱ {{ p.amount_paid }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <RecordModal
      v-if="showModal"
      :isOpen="showModal"
      :activeTab="'payments'"
      :receipts="receipts"
      @close="showModal = false"
      @refresh="fetchPayments"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import RecordModal from '../components/RecordModal.vue'

const payments = ref([])
const receipts = ref([])
const showModal = ref(false)

function openModal() {
  showModal.value = true
}

async function fetchPayments() {
  const { data } = await supabase.from('payment').select('*')
  payments.value = data || []
}

async function fetchReceipts() {
  const { data } = await supabase.from('receipt').select('*')
  receipts.value = data || []
}

onMounted(() => {
  fetchPayments()
  fetchReceipts()
})
</script>