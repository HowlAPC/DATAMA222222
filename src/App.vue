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

    <!-- PAGE COMPONENTS -->
    <Employees v-if="currentPage === 'employees'" ref="employeesRef" />
    <Items v-if="currentPage === 'items'" ref="itemsRef" />
    <Receipts v-if="currentPage === 'receipts'" ref="receiptsRef" />
    <Payments v-if="currentPage === 'payments'" ref="paymentsRef" />

    <!-- DYNAMIC MODAL -->
    <RecordModal
      v-if="showModal"
      :isOpen="showModal"
      :activeTab="currentPage"
      :customers="customers"
      :employees="employees"
      :receipts="receipts"
      @close="showModal = false"
      @refresh="fetchDataForTab(currentPage)"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Employees from './views/Employees.vue'
import Items from './views/Items.vue'
import Receipts from './views/Receipts.vue'
import Payments from './views/Payments.vue'
import RecordModal from './components/RecordModal.vue' // import your new modal

// --- STATE ---
const currentPage = ref('employees')
const showModal = ref(false)

// These arrays will be passed to RecordModal
const customers = ref([])
const employees = ref([])
const receipts = ref([])

// --- FETCH FUNCTIONS (example stubs) ---
async function fetchEmployees() {
  // call supabase to get employees
  // employees.value = ...
}
async function fetchItems() {
  // items.value = ...
}
async function fetchReceipts() {
  // receipts.value = ...
}
async function fetchPayments() {
  // payments.value = ...
}

// --- REFRESH DATA WHEN MODAL SAVES ---
function fetchDataForTab(tab) {
  if(tab === 'employees') fetchEmployees()
  else if(tab === 'items') fetchItems()
  else if(tab === 'receipts') fetchReceipts()
  else if(tab === 'payments') fetchPayments()
}
</script>