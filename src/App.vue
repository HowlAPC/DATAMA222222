<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from './supabase'
import RecordModal from './components/RecordModal.vue' // Import our component

const customers = ref([])
const employees = ref([])
const items = ref([])
const receipts = ref([])
const payments = ref([])

const loading = ref(false)
const searchQuery = ref('')
const activeTab = ref('customers')
const isModalOpen = ref(false)

// Role-Based Logic
const userRole = ref('Admin') 
const permissions = {
  Admin: ['customers', 'employees', 'items', 'receipts', 'payments'],
  Employee: ['customers'],
  Finance: ['customers', 'items', 'receipts']
}
const allowedTabs = computed(() => permissions[userRole.value])

async function fetchAllData() {
  loading.value = true
  const [cust, emp, itm, rec, pay] = await Promise.all([
    supabase.from('customer').select('*'),
    supabase.from('employee').select('*'),
    supabase.from('item').select('*'),
    supabase.from('receipt').select('*'),
    supabase.from('payment').select('*')
  ])
  customers.value = cust.data || []; employees.value = emp.data || [];
  items.value = itm.data || []; receipts.value = rec.data || [];
  payments.value = pay.data || [];
  loading.value = false
}

const filteredData = computed(() => {
  const query = searchQuery.value.toLowerCase()
  const dataMap = { customers, employees, items, receipts, payments }
  const currentSet = dataMap[activeTab.value].value
  
  return currentSet.filter(item => {
    const searchString = Object.values(item).join(' ').toLowerCase()
    return searchString.includes(query)
  })
})

onMounted(fetchAllData)
</script>

<template>
  <main class="dashboard">
    <header>
      <div class="top-bar">
        <h1>Laundry Business Portal</h1>
        <button v-if="activeTab !== 'receipts' && activeTab !== 'payments'" 
                @click="isModalOpen = true" class="add-btn">
          + New {{ activeTab.slice(0, -1) }}
        </button>
      </div>
      
      <div class="controls">
        <input v-model="searchQuery" class="search" :placeholder="'Search ' + activeTab + '...'" />
        <nav class="tabs">
          <button v-for="tab in allowedTabs" :key="tab" 
                  @click="activeTab = tab" :class="{ active: activeTab === tab }">
            {{ tab.toUpperCase() }}
          </button>
        </nav>
      </div>
    </header>

    <div v-if="loading" class="loader">Loading...</div>

    <div v-else class="content">
      <table>
        <thead>
          <tr v-if="activeTab === 'customers'"><th>ID</th><th>First Name</th><th>Last Name</th><th>Contact</th></tr>
          <tr v-if="activeTab === 'employees'"><th>ID</th><th>First Name</th><th>Role</th><th>Salary</th></tr>
          <tr v-if="activeTab === 'items'"><th>Type</th><th>Fabric</th><th>Weight</th><th>Price</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in filteredData" :key="row.id || row.customer_id || row.item_id">
            <template v-if="activeTab === 'customers'">
              <td>{{ row.customer_id }}</td><td>{{ row.first_name }}</td><td>{{ row.last_name }}</td><td>{{ row.contact_number }}</td>
            </template>
            <template v-if="activeTab === 'employees'">
              <td>{{ row.employee_id }}</td><td>{{ row.first_name }}</td><td>{{ row.employee_type }}</td><td>₱{{ row.salary }}</td>
            </template>
            <template v-if="activeTab === 'items'">
              <td>{{ row.item_type }}</td><td>{{ row.fabric_type }}</td><td>{{ row.weight }}kg</td><td>₱{{ row.price }}</td>
            </template>
          </tr>
        </tbody>
      </table>
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
.dashboard { padding: 2rem; max-width: 1100px; margin: auto; }
.top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.add-btn { background: #3eaf7c; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; }
.search { width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 8px; }
.tabs { display: flex; gap: 10px; }
.tabs button { padding: 8px 16px; border: none; cursor: pointer; background: #f0f0f0; border-radius: 4px; }
.tabs button.active { background: #2c3e50; color: white; }
table { width: 100%; border-collapse: collapse; margin-top: 20px; }
th, td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
th { background: #f9f9f9; }
</style>