<template>
  <Login v-if="!user" />

  <main v-else class="dashboard">
    <header>
      <div class="top-bar">
        <h1>Laundry Business Management</h1>
        <button @click="logout" class="add-btn logout">Logout</button>
        <button 
          v-if="['customers','employees','items'].includes(activeTab) && userRole !== 'Viewer'"
          @click="openModal(false, null)" 
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
      <div v-for="row in filteredData" :key="getRowId(row)" class="record-card">

        <!-- Customers -->
        <template v-if="activeTab === 'customers'">
          <h4>{{ row.first_name }} {{ row.last_name }}</h4>
          <p><strong>ID:</strong> {{ row.customer_id }}</p>
          <p><strong>Contact:</strong> {{ row.contact_number }}</p>
          <p><strong>Instructions:</strong> {{ row.special_instructions || '-' }}</p>
          <p><strong>Created:</strong> {{ formatDate(row.created_at) }}</p>
          <div class="actions">
            <button v-if="userRole !== 'Viewer'" @click="deleteRecord('customers', row.customer_id)" class="btn-delete">Delete</button>
            <button v-if="userRole !== 'Viewer'" @click="openModal(true, row)" class="btn-edit">Edit</button>
          </div>
        </template>

        <!-- Employees -->
        <template v-if="activeTab === 'employees'">
          <h4>{{ row.first_name }} {{ row.last_name }}</h4>
          <p><strong>ID:</strong> {{ row.employee_id }}</p>
          <p><strong>Contact:</strong> {{ row.contact_number }}</p>
          <p><strong>Salary:</strong> ₱{{ row.salary }}</p>
          <p><strong>Position:</strong> {{ row.employee_type }}</p>
          <p><strong>Created:</strong> {{ formatDate(row.created_at) }}</p>
          <div class="actions">
            <button v-if="userRole !== 'Viewer'" @click="deleteRecord('employees', row.employee_id)" class="btn-delete">Delete</button>
            <button v-if="userRole !== 'Viewer'" @click="openModal(true, row)" class="btn-edit">Edit</button>
          </div>
        </template>

        <!-- Items -->
        <template v-if="activeTab === 'items'">
          <h4>Item #{{ row.item_id }} - {{ row.item_type }}</h4>
          <p><strong>Receipt ID:</strong> {{ row.receipt_id }}</p>
          <p><strong>Fabric:</strong> {{ row.fabric_type }}</p>
          <p><strong>Weight:</strong> {{ row.weight }} kg</p>
          <p><strong>Price:</strong> ₱{{ row.price }}</p>
          <div class="actions">
            <button v-if="userRole !== 'Viewer'" @click="deleteRecord('items', row.item_id)" class="btn-delete">Delete</button>
            <button v-if="userRole !== 'Viewer'" @click="openModal(true, row)" class="btn-edit">Edit</button>
          </div>
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
          <p><strong>Date:</strong> {{ formatDate(row.date_created) }}</p>
          <div class="actions">
            <button v-if="userRole !== 'Viewer'" @click="deleteRecord('receipts', row.receipt_id)" class="btn-delete">Delete</button>
            <button v-if="userRole !== 'Viewer'" @click="openModal(true, row)" class="btn-edit">Edit</button>
          </div>
        </template>

        <!-- Payments -->
        <template v-if="activeTab === 'payments'">
          <h4>Payment #{{ row.payment_id }}</h4>
          <p><strong>Receipt ID:</strong> {{ row.receipt_id }}</p>
          <p><strong>Amount:</strong> ₱{{ row.amount_paid }}</p>
          <p><strong>Date:</strong> {{ formatDate(row.payment_date) }}</p>
          <div class="actions">
            <button v-if="userRole !== 'Viewer'" @click="deleteRecord('payments', row.payment_id)" class="btn-delete">Delete</button>
            <button v-if="userRole !== 'Viewer'" @click="openModal(true, row)" class="btn-edit">Edit</button>
          </div>
        </template>

      </div>

      <div v-if="filteredData.length === 0" class="empty-state">
        No records found matching your search.
      </div>
    </div>

    <!-- Record Modal -->
    <RecordModal 
      :isOpen="isModalOpen"
      :activeTab="activeTab"
      :record="editingRecord"
      :isEditing="isEditing"
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
const isEditing = ref(false)
const editingRecord = ref(null)
const tabs = ['customers','employees','items','receipts','payments']

// Login
const user = ref(null)
const userRole = ref(null)

// Fetch all data
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

// Computed filtered data
const filteredData = computed(() => {
  const query = searchQuery.value.toLowerCase()
  const dataMap = { customers, employees, items, receipts, payments }
  const currentData = dataMap[activeTab.value]?.value || []
  if (!query) return currentData
  return currentData.filter(row => Object.values(row).some(val => String(val).toLowerCase().includes(query)))
})

// Helpers
function getRowId(row) {
  return row.customer_id || row.employee_id || row.item_id || row.receipt_id || row.payment_id
}
function formatDate(date) {
  return new Date(date).toLocaleString()
}

// Open Modal for Add or Edit
function openModal(editing, record) {
  isEditing.value = editing
  editingRecord.value = record
  isModalOpen.value = true
}

// Delete Record
async function deleteRecord(table, id) {
  const primaryKeyMap = {
    customers: 'customer_id',
    employees: 'employee_id',
    items: 'item_id',
    receipts: 'receipt_id',
    payments: 'payment_id'
  }
  if (!confirm('Are you sure you want to delete this record?')) return
  const { error } = await supabase.from(table.slice(0,-1)).delete().eq(primaryKeyMap[table], id)
  if (error) alert(error.message)
  else fetchAllData()
}

// Mark as paid
async function markAsPaid(receipt_id) {
  const { error } = await supabase.rpc('mark_receipt_paid', { p_receipt_id: receipt_id })
  if (error) alert(error.message)
  else fetchAllData()
}

// Auth
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
</script>

<style scoped>
/* Your styles from before plus optional .btn-edit */
.btn-edit {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}
.btn-edit:hover { background: #2563eb; }
</style>