<template>
  <div class="container">
    <div class="page-title">Receipts</div>

    <div class="card">
      <button class="btn btn-primary" @click="openModal">
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
          <tr v-for="r in receipts" :key="r.receipt_id">
            <td>{{ r.receipt_id }}</td>
            <td>{{ r.customer_id }}</td>
            <td>₱ {{ r.total_amount }}</td>
            <td>{{ r.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <RecordModal
      v-if="showModal"
      :isOpen="showModal"
      :activeTab="'receipts'"
      :customers="customers"
      @close="showModal = false"
      @refresh="fetchReceipts"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import RecordModal from '../components/RecordModal.vue'

const receipts = ref([])
const customers = ref([])
const showModal = ref(false)

function openModal() {
  showModal.value = true
}

async function fetchReceipts() {
  const { data } = await supabase.from('receipt').select('*')
  receipts.value = data || []
}

async function fetchCustomers() {
  const { data } = await supabase.from('customer').select('*')
  customers.value = data || []
}

onMounted(() => {
  fetchReceipts()
  fetchCustomers()
})
</script>