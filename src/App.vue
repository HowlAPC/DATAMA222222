<template>
  <div>
    <nav class="navbar">
      <div class="logo">Fresh & Clean Laundry Hub</div>
      <div class="nav-links">
        <button @click="currentPage = 'employees'">Employees</button>
        <button @click="currentPage = 'items'">Items</button>
        <button @click="currentPage = 'receipts'">Receipts</button>
        <button @click="currentPage = 'payments'">Payments</button>
      </div>
    </nav>

    <Employees v-if="currentPage === 'employees'" />
    <Items v-if="currentPage === 'items'" />
    <Receipts v-if="currentPage === 'receipts'" />
    <Payments v-if="currentPage === 'payments'" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Employees from './views/Employees.vue'
import Items from './views/Items.vue'
import Receipts from './views/Receipts.vue'
import Payments from './views/Payments.vue'

const currentPage = ref('employees')
</script>