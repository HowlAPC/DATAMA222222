<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">Receipts</h2>
      <button @click="openModal" class="btn btn-primary">Add Receipt</button>
    </div>

    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer ID</th>
            <th>Employee ID</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="r in receipts"
              :key="r.receipt_id">
            <td>{{ r.receipt_id }}</td>
            <td>{{ r.customer_id }}</td>
            <td>{{ r.employee_id }}</td>
            <td>₱ {{ r.total_amount }}</td>
            <td>
              <span class="badge"
                    :class="r.status === 'Paid'
                      ? 'badge-success'
                      : 'badge-warning'">
                {{ r.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ReceiptModal v-if="modalOpen"
                  @close="modalOpen=false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { receipts } from '../store'
import ReceiptModal from '../components/ReceiptModal.vue'

const modalOpen = ref(false)

const openModal = () => {
  modalOpen.value = true
}
</script>