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

// Modal Controls
const isModalOpen = ref(false)
const editingRecord = ref(null)

const tabs = ['customers', 'employees', 'items', 'receipts', 'payments']

// --- DATABASE OPERATIONS (READ) ---
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

// --- DATABASE OPERATIONS (DELETE) ---
async function deleteRecord(id) {
  const tableName = activeTab.value.replace(/s$/, '') // customers -> customer
  const idColumn = `${tableName}_id`

  if (!confirm(`Are you sure you want to delete this ${tableName}?`)) return

  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq(idColumn, id)

  if (error) {
    alert(`Constraint Error: This ${tableName} is linked to other records and cannot be deleted.`)
  } else {
    fetchAllData()
  }
}

// --- MODAL CONTROLS ---
function openAddModal() {
  editingRecord.value = null
  isModalOpen.value = true
}

function openEditModal(record) {
  editingRecord.value = record
  isModalOpen.value = true
}

// --- SEARCH LOGIC ---
const filteredData = computed(() => {
  const query = searchQuery.value.toLowerCase()
  const dataMap = {
    customers: customers.value,
    employees: employees.value,
    items: items.value,
    receipts: receipts.value,
    payments: payments.value
  }

  const currentData = dataMap[activeTab.value] || []
  if (!query) return currentData

  return currentData.filter(row => 
    Object.values(row).some(val => String(val).toLowerCase().includes(query))
  )
})

onMounted(fetchAllData)
</script>

<template>
  <main class="dashboard">
    <header>
      <div class="top-bar">
        <h1>Laundry Business CRUD</h1>
        <button 
          v-if="['customers', 'employees', 'items'].includes(activeTab)"
          @click="openAddModal" 
          class="btn-add"
        >
          + New {{ activeTab.slice(0, -1) }}
        </button>
      </div>
      
      <div class="filter-controls">
        <input v-model="searchQuery" class="search-bar" :placeholder="'Search ' + activeTab + '...'" />
        <nav class="tab-nav">
          <button v-for="t in tabs" :key="t" @click="activeTab = t; searchQuery = ''" :class="{ active: activeTab === t }">
            {{ t.toUpperCase() }}
          </button>
        </nav>
      </div>
    </header>

    <div v-if="loading" class="loading-state">Syncing with Supabase...</div>

    <div v-else class="table-container">
      <table>
        <thead>
          <tr v-if="activeTab === 'customers'">
            <th>ID</th><th>First Name</th><th>Last Name</th><th>Contact</th><th>Actions</th>
          </tr>
          <tr v-if="activeTab === 'employees'">
            <th>ID</th><th>Name</th><th>Role</th><th>Salary</th><th>Actions</th>
          </tr>
          <tr v-if="activeTab === 'items'">
            <th>ID</th><th>Type</th><th>Fabric</th><th>Weight</th><th>Price</th><th>Actions</th>
          </tr>
          <tr v-if="activeTab === 'receipts'">
            <th>Receipt #</th><th>Status</th><th>Total</th><th>Date</th><th>Actions</th>
          </tr>
          <tr v-if="activeTab === 'payments'">
            <th>Payment ID</th><th>Receipt #</th><th>Amount</th><th>Date</th><th>Actions</th>
          </tr>
        </thead>
        
        <tbody>
          <tr v-for="row in filteredData" :key="row.customer_id || row.employee_id || row.item_id || row.receipt_id || row.payment_id">
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
              <td>{{ row.receipt_id }}</td><td><span class="pill">{{ row.status }}</span></td><td>₱{{ row.total_amount }}</td><td>{{ new Date(row.date_created).toLocaleDateString() }}</td>
            </template>

            <template v-if="activeTab === 'payments'">
              <td>{{ row.payment_id }}</td><td>{{ row.receipt_id }}</td><td>₱{{ row.amount_paid }}</td><td>{{ new Date(row.payment_date).toLocaleDateString() }}</td>
            </template>

            <td class="actions-td">
              <button @click="openEditModal(row)" class="edit-btn">Edit</button>
              <button @click="deleteRecord(row.customer_id || row.employee_id || row.item_id || row.receipt_id || row.payment_id)" class="del-btn">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <RecordModal 
      :isOpen="isModalOpen" 
      :activeTab="activeTab" 
      :editRecord="editingRecord"
      @close="isModalOpen = false" 
      @refresh="fetchAllData" 
    />
  </main>
</template>

<style scoped>
.dashboard { padding: 2rem; max-width: 1200px; margin: auto; font-family: system-ui, sans-serif; }
.top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-add { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; }
.search-bar { width: 100%; padding: 12px; margin-bottom: 20px; border: 1px solid #ddd; border-radius: 8px; }

.tab-nav { display: flex; gap: 10px; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
.tab-nav button { padding: 8px 16px; border: none; background: none; cursor: pointer; font-weight: 500; color: #666; }
.tab-nav button.active { color: #3b82f6; border-bottom: 2px solid #3b82f6; margin-bottom: -12px; }

table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
th { background: #f8fafc; text-align: left; padding: 12px; font-size: 0.8rem; color: #64748b; }
td { padding: 12px; border-bottom: 1px solid #f1f5f9; }

.actions-td { display: flex; gap: 8px; }
.edit-btn { background: #f1f5f9; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
.del-btn { background: #fee2e2; color: #b91c1c; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }

.badge { background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; }
.pill { background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; }
.loading-state { text-align: center; padding: 50px; color: #64748b; }
</style>