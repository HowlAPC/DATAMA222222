<template>
  <div class="container">
    <div class="page-title">Receipts</div>

    <div class="card">
      <button class="btn btn-primary" @click="showModal = true">
        + Create Receipt
      </button>
    </div>

    <div class="card">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="receipt in receipts" :key="receipt.receipt_id">
            <td>{{ receipt.receipt_id }}</td>
            <td>{{ receipt.customer_id }}</td>
            <td>₱ {{ receipt.total_amount }}</td>
            <td>{{ receipt.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <ReceiptModal v-if="showModal" @close="showModal = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import ReceiptModal from '../components/ReceiptModal.vue'

const receipts = ref([])
const showModal = ref(false)

async function fetchReceipts() {
  const { data } = await supabase.from('receipt').select('*')
  receipts.value = data
}

onMounted(fetchReceipts)
</script>