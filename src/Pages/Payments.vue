<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">Payments</h2>
      <button @click="openModal" class="btn btn-primary">Add Payment</button>
    </div>

    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Receipt ID</th>
            <th>Amount Paid</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="p in payments"
              :key="p.payment_id">
            <td>{{ p.payment_id }}</td>
            <td>{{ p.receipt_id }}</td>
            <td>₱ {{ p.amount_paid }}</td>
            <td>{{ p.created_at }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaymentModal v-if="modalOpen"
                  @close="modalOpen=false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { payments } from '../store'
import PaymentModal from '../components/PaymentModal.vue'

const modalOpen = ref(false)

const openModal = () => {
  modalOpen.value = true
}
</script>