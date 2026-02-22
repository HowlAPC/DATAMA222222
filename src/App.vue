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

<div class="content">
  <div v-for="row in filteredData" :key="row.customer_id || row.employee_id || row.item_id || row.receipt_id || row.payment_id" class="record-card">

    <!-- Customers -->
    <template v-if="activeTab === 'customers'">
      <h4>{{ row.first_name }} {{ row.last_name }}</h4>
      <p><strong>ID:</strong> {{ row.customer_id }}</p>
      <p><strong>Contact:</strong> {{ row.contact_number }}</p>
      <p><strong>Instructions:</strong> {{ row.special_instructions || '-' }}</p>
      <p><strong>Created:</strong> {{ new Date(row.created_at).toLocaleString() }}</p>
    </template>

    <!-- Employees -->
    <template v-if="activeTab === 'employees'">
      <h4>{{ row.first_name }} {{ row.last_name }}</h4>
      <p><strong>ID:</strong> {{ row.employee_id }}</p>
      <p><strong>Contact:</strong> {{ row.contact_number }}</p>
      <p><strong>Salary:</strong> ₱{{ row.salary }}</p>
      <p><strong>Position:</strong> {{ row.employee_type }}</p>
      <p><strong>Created:</strong> {{ new Date(row.created_at).toLocaleString() }}</p>
    </template>

    <!-- Items -->
    <template v-if="activeTab === 'items'">
      <h4>Item #{{ row.item_id }} - {{ row.item_type }}</h4>
      <p><strong>Receipt ID:</strong> {{ row.receipt_id }}</p>
      <p><strong>Fabric:</strong> {{ row.fabric_type }}</p>
      <p><strong>Weight:</strong> {{ row.weight }} kg</p>
      <p><strong>Price:</strong> ₱{{ row.price }}</p>
    </template>

    <!-- Receipts -->
    <template v-if="activeTab === 'receipts'">
      <h4>Receipt #{{ row.receipt_id }}</h4>
      <p><strong>Customer ID:</strong> {{ row.customer_id }}</p>
      <p><strong>Employee ID:</strong> {{ row.employee_id }}</p>
      <p><strong>Total:</strong> ₱{{ row.total_amount }}</p>
      <p><strong>Status:</strong> {{ row.status }}
        <button v-if="row.status !== 'Paid'" @click="markAsPaid(row.receipt_id)" class="btn-pay">Mark as Paid</button>
      </p>
      <p><strong>Date:</strong> {{ new Date(row.date_created).toLocaleString() }}</p>
    </template>

    <!-- Payments -->
    <template v-if="activeTab === 'payments'">
      <h4>Payment #{{ row.payment_id }}</h4>
      <p><strong>Receipt ID:</strong> {{ row.receipt_id }}</p>
      <p><strong>Amount:</strong> ₱{{ row.amount_paid }}</p>
      <p><strong>Date:</strong> {{ new Date(row.payment_date).toLocaleString() }}</p>
    </template>

  </div>

  <div v-if="filteredData.length === 0" class="empty-state">
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
.dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: auto;
  font-family: 'Inter', sans-serif;
}

/* Top Bar */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.top-bar h1 {
  font-size: 1.8rem;
  color: #2c3e50;
}
.add-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}
.add-btn:hover { background: #059669; }

/* Search & Tabs */
.controls { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
.search-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.search-input:focus { outline: 2px solid #3b82f6; border-color: transparent; }

.tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}
.tabs button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #f1f5f9;
  color: #1e293b;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: 0.2s;
}
.tabs button.active {
  background: #3b82f6;
  color: white;
  font-weight: 700;
}

/* Card Layout for Records */
.content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}
.record-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  padding: 1rem;
  transition: 0.2s;
}
.record-card:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(0,0,0,0.08); }

.record-card h4 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: #1e293b;
  font-weight: 600;
}
.record-card p {
  margin: 0.2rem 0;
  font-size: 0.875rem;
  color: #475569;
}
.btn-pay {
  background: #f59e0b;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}
.btn-pay:hover { background: #d97706; }

.loader, .empty-state {
  text-align: center;
  padding: 80px;
  color: #64748b;
  font-style: italic;
}

@media (max-width:768px) {
  .top-bar { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .content { grid-template-columns: 1fr; }
}
</style>