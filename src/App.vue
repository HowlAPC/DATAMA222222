<template>
  <Login v-if="!user" />

  <main v-else class="dashboard">
    <header>
      <div class="top-bar">
        <h1>Laundry Business Management</h1>
        <button @click="logout" class="add-btn logout">Logout</button>
        <button 
          v-if="['customers','employees','items'].includes(activeTab) && userRole !== 'Viewer'"
          @click="isModalOpen = true" 
          class="add-btn"
        >
          + Add New {{ activeTab.slice(0,-1) }}
        </button>
      </div>

      <div class="controls">
        <input 
          v-model="searchQuery" 
          class="search-input" 
          :placeholder="'Search ' + activeTab + '...'" 
        />
        <nav class="tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab" 
            @click="activeTab = tab; searchQuery=''" 
            :class="{ active: activeTab === tab }"
          >
            {{ tab.toUpperCase() }}
          </button>
        </nav>
      </div>
    </header>

    <div v-if="loading" class="loader">
      <div class="spinner"></div>
      <p>Updating records...</p>
    </div>

    <div v-else class="content">
      <table>
        <thead>
          <tr v-if="activeTab==='customers'">
            <th>ID</th><th>First Name</th><th>Last Name</th><th>Contact</th><th>Special Instructions</th><th>Created At</th>
          </tr>
          <tr v-if="activeTab==='employees'">
            <th>ID</th><th>First Name</th><th>Last Name</th><th>Contact</th><th>Salary</th><th>Position</th><th>Created At</th>
          </tr>
          <tr v-if="activeTab==='items'">
            <th>ID</th><th>Receipt ID</th><th>Type</th><th>Fabric</th><th>Weight</th><th>Price</th>
          </tr>
          <tr v-if="activeTab==='receipts'">
            <th>ID</th><th>Customer ID</th><th>Employee ID</th><th>Total</th><th>Status</th><th>Date</th>
          </tr>
          <tr v-if="activeTab==='payments'">
            <th>ID</th><th>Receipt ID</th><th>Amount</th><th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filteredData" :key="row.customer_id || row.employee_id || row.item_id || row.receipt_id || row.payment_id">
            <template v-if="activeTab==='customers'">
              <td>{{ row.customer_id }}</td>
              <td>{{ row.first_name }}</td>
              <td>{{ row.last_name }}</td>
              <td>{{ row.contact_number }}</td>
              <td>{{ row.special_instructions || '-' }}</td>
              <td>{{ new Date(row.created_at).toLocaleString() }}</td>
            </template>
            <template v-if="activeTab==='employees'">
              <td>{{ row.employee_id }}</td>
              <td>{{ row.first_name }}</td>
              <td>{{ row.last_name }}</td>
              <td>{{ row.contact_number }}</td>
              <td>₱{{ row.salary }}</td>
              <td>{{ row.employee_type }}</td>
              <td>{{ new Date(row.created_at).toLocaleString() }}</td>
            </template>
            <template v-if="activeTab==='items'">
              <td>{{ row.item_id }}</td>
              <td>{{ row.receipt_id }}</td>
              <td>{{ row.item_type }}</td>
              <td>{{ row.fabric_type }}</td>
              <td>{{ row.weight }} kg</td>
              <td>₱{{ row.price }}</td>
            </template>
            <template v-if="activeTab==='receipts'">
              <td>{{ row.receipt_id }}</td>
              <td>{{ row.customer_id }}</td>
              <td>{{ row.employee_id }}</td>
              <td>₱{{ row.total_amount }}</td>
              <td>
                {{ row.status }}
                <button v-if="row.status !== 'Paid'" @click="markAsPaid(row.receipt_id)" class="btn-pay">
                  Mark as Paid
                </button>
              </td>
              <td>{{ new Date(row.date_created).toLocaleString() }}</td>
            </template>
            <template v-if="activeTab==='payments'">
              <td>{{ row.payment_id }}</td>
              <td>{{ row.receipt_id }}</td>
              <td>₱{{ row.amount_paid }}</td>
              <td>{{ new Date(row.payment_date).toLocaleString() }}</td>
            </template>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredData.length===0" class="empty-state">
        No records found matching your search.
      </div>
    </div>

    <!-- Unified Modal for all tabs -->
    <RecordModal 
      :isOpen="isModalOpen"
      :activeTab="activeTab"
      :customers="customers"
      :employees="employees"
      :receipts="receipts"
      @close="isModalOpen=false"
      @refresh="fetchAllData"
    />
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from './supabase'
import RecordModal from './components/RecordModal.vue'
import Login from './components/Login.vue'

const customers = ref([])
const employees = ref([])
const items = ref([])
const receipts = ref([])
const payments = ref([])
const loading = ref(false)
const searchQuery = ref('')
const activeTab = ref('customers')
const isModalOpen = ref(false)
const tabs = ['customers','employees','items','receipts','payments']

// Login
const user = ref(null)
const userRole = ref(null)

async function fetchAllData() {
  loading.value = true
  const [cust, emp, itm, rec, pay] = await Promise.all([
    supabase.from('customer').select('*'),
    supabase.from('employee').select('*'),
    supabase.from('item').select('*'),
    supabase.from('receipt').select('*'),
    supabase.from('payment').select('*')
  ])
  customers.value = cust.data || []
  employees.value = emp.data || []
  items.value = itm.data || []
  receipts.value = rec.data || []
  payments.value = pay.data || []
  loading.value = false
}

const filteredData = computed(() => {
  const query = searchQuery.value.toLowerCase()
  const dataMap = { customers, employees, items, receipts, payments }
  const currentData = dataMap[activeTab.value]?.value || []
  if (!query) return currentData
  return currentData.filter(row => Object.values(row).some(val => String(val).toLowerCase().includes(query)))
})

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  user.value = data.user
  if (user.value) {
    const { data: empData } = await supabase.from('employee')
      .select('employee_type')
      .eq('contact_number', user.value.email)
      .single()
    userRole.value = empData?.employee_type
    fetchAllData()
  }
})

async function logout() {
  await supabase.auth.signOut()
  location.reload()
}

async function markAsPaid(receipt_id) {
  const { error } = await supabase.rpc('mark_receipt_paid',{ p_receipt_id: receipt_id })
  if (error) alert(error.message)
  else fetchAllData()
}
</script>

<style scoped>
/* Use your previous CSS, just keep .dashboard, table, buttons, etc. */
</style>