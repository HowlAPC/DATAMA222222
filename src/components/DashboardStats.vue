<template>
  <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
    <div class="card bg-blue-100 p-4 rounded shadow">
      <h3>Total Customers</h3>
      <p class="text-2xl font-bold">{{ customers.length }}</p>
    </div>
    <div class="card bg-yellow-100 p-4 rounded shadow">
      <h3>Total Employees</h3>
      <p class="text-2xl font-bold">{{ employees.length }}</p>
    </div>
    <div class="card bg-green-100 p-4 rounded shadow">
      <h3>Total Receipts</h3>
      <p class="text-2xl font-bold">{{ receipts.length }}</p>
    </div>
    <div class="card bg-red-100 p-4 rounded shadow">
      <h3>Pending Receipts</h3>
      <p class="text-2xl font-bold">{{ pendingReceipts }}</p>
    </div>
    <div class="card bg-purple-100 p-4 rounded shadow">
      <h3>Total Payments</h3>
      <p class="text-2xl font-bold">{{ totalPayments }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { customers, employees, receipts, payments } from '../store'

const pendingReceipts = computed(() => receipts.value.filter(r => r.status === 'Pending').length)
const totalPayments = computed(() => payments.value.reduce((sum, p) => sum + p.amount_paid, 0))
</script>