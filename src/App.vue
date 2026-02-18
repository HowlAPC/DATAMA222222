<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from './supabase'
import RecordModal from './components/RecordModal.vue'

// --- STATE MANAGEMENT ---
const customers = ref([])
const employees = ref([])
const items = ref([])
const receipts = ref([])
const payments = ref([])

const loading = ref(false)
const searchQuery = ref('')
const activeTab = ref('customers')
const isModalOpen = ref(false)

// List of all tables to display in the tabs
const tabs = ['customers', 'employees', 'items', 'receipts', 'payments']

// --- DATABASE OPERATIONS ---
async function fetchAllData() {
  loading.value = true
  
  // Parallel fetching for performance
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

// --- SEARCH & FILTER LOGIC ---
const filteredData = computed(() => {
  const query = searchQuery.value.toLowerCase()
  
  // Map activeTab to the corresponding data ref
  const dataMap = {
    customers: customers.value,
    employees: employees.value,
    items: items.value,
    receipts: receipts.value,
    payments: payments.value
  }

  const currentData = dataMap[activeTab.value] || []

  if (!query) return currentData

  return currentData.filter(row => {
    // Searches across all values in a row (ID, Name, Type, etc.)
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(query)
    )
  })
})

onMounted(fetchAllData)
</script>

<template>
  <main class="dashboard">
    <header>
      <div class="top-bar">
        <h1>Laundry Business Management</h1>
        <button 
          v-if="['customers', 'employees', 'items'].includes(activeTab)"
          @click="isModalOpen = true" 
          class="add-btn"
        >
          + Add New {{ activeTab.slice(0, -1) }}
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
            @click="activeTab = tab; searchQuery = ''" 
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
          <tr v-if="activeTab === 'customers'">
            <th>ID</th><th>First Name</th><th>Last Name</th><th>Contact</th>
          </tr>
          <tr v-if="activeTab === 'employees'">
            <th>ID</th><th>Name</th><th>Position</th><th>Salary</th>
          </tr>
          <tr v-if="activeTab === 'items'">
            <th>ID</th><th>Type</th><th>Fabric</th><th>Weight</th><th>Price</th>
          </tr>
          <tr v-if="activeTab === 'receipts'">
            <th>Receipt #</th><th>Status</th><th>Total</th><th>Date</th>
          </tr>
          <tr v-if="activeTab === 'payments'">
            <th>Payment ID</th><th>Receipt #</th><th>Amount</th><th>Date</th>
          </tr>
        </thead>
        
        <tbody>
          <tr v-for="row in filteredData" :key="row.id || row.customer_id || row.employee_id || row.item_id || row.receipt_id || row.payment_id">
            <template v-if="activeTab === 'customers'">
              <td>{{ row.customer_id }}</td><td>{{ row.first_name }}</td><td>{{ row.last_name }}</td><td>{{ row.contact_number }}</td>
            </template>
            
            <template v-if="activeTab === 'employees'">
              <td>{{ row.employee_id }}</td><td>{{ row.first_name }} {{ row.last_name }}</td><td><span class="badge">{{ row.employee_type }}</span></td><td>₱{{ row.salary }}</td>
            </template>
            
            <template v-if="activeTab === 'items'">
              <td>{{ row.item_id }}</td><td>{{ row.item_type }}</td><td>{{ row.fabric_type }}</td><td>{{ row.weight }}kg</td><td>₱{{ row.price }}</td>
            </template>

            <template v-if="activeTab === 'receipts'">
              <td>{{ row.receipt_id }}</td><td><span class="status-pill">{{ row.status }}</span></td><td>₱{{ row.total_amount }}</td><td>{{ new Date(row.date_created).toLocaleDateString() }}</td>
            </template>

            <template v-if="activeTab === 'payments'">
              <td>{{ row.payment_id }}</td><td>{{ row.receipt_id }}</td><td>₱{{ row.amount_paid }}</td><td>{{ new Date(row.payment_date).toLocaleDateString() }}</td>
            </template>
          </tr>
        </tbody>
      </table>
      
      <div v-if="filteredData.length === 0" class="empty-state">
        No records found matching your search.
      </div>
    </div>

    <RecordModal 
      :isOpen="isModalOpen" 
      :activeTab="activeTab" 
      @close="isModalOpen = false" 
      @refresh="fetchAllData" 
    />
  </main>
</template>

<style scoped>
.dashboard { padding: 2rem; max-width: 1200px; margin: auto; font-family: 'Inter', sans-serif; }
.top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.top-bar h1 { color: #2c3e50; font-size: 1.8rem; }

.add-btn { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: background 0.2s; }
.add-btn:hover { background: #059669; }

.search-input { width: 100%; padding: 14px; margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 1rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.search-input:focus { outline: 2px solid #3b82f6; border-color: transparent; }

.tabs { display: flex; gap: 8px; margin-bottom: 25px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; overflow-x: auto; }
.tabs button { padding: 10px 18px; border: none; background: transparent; color: #64748b; cursor: pointer; border-radius: 6px; font-weight: 500; white-space: nowrap; }
.tabs button.active { background: #f1f5f9; color: #1e293b; font-weight: 700; }

table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
th { text-align: left; padding: 14px; background: #f8fafc; color: #475569; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
td { padding: 14px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
tr:last-child td { border-bottom: none; }
tr:hover { background: #f8fafc; }

.badge { background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 99px; font-size: 0.75rem; font-weight: 600; }
.status-pill { background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 99px; font-size: 0.75rem; font-weight: 600; }

.loader { text-align: center; padding: 100px; color: #64748b; }
.empty-state { text-align: center; padding: 50px; color: #94a3b8; font-style: italic; }

@media (max-width: 768px) {
  .dashboard { padding: 1rem; }
  .top-bar { flex-direction: column; align-items: flex-start; gap: 1rem; }
}
</style>