<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from './supabase'
import RecordModal from './components/RecordModal.vue'
import Login from './components/Login.vue'

// --- STATE ---
const customers = ref([])
const employees = ref([])
const items = ref([])
const receipts = ref([])
const payments = ref([])

const loading = ref(false)
const searchQuery = ref('')
const activeTab = ref('customers')
const isModalOpen = ref(false)

const user = ref(null)
const userRole = ref(null)

const tabs = ['customers', 'employees', 'items', 'receipts', 'payments']

// --- FETCH DATA ---
async function fetchAllData() {
  loading.value = true
  try {
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
  } catch (err) {
    console.error('Fetch error:', err)
  } finally {
    loading.value = false
  }
}

// --- SEARCH ---
const filteredData = computed(() => {
  const query = searchQuery.value.toLowerCase()
  const dataMap = { customers, employees, items, receipts, payments }
  const currentData = dataMap[activeTab.value]?.value || []

  if (!query) return currentData

  // Adjust search fields per table
  return currentData.filter(row => {
    if (activeTab.value === 'customers')
      return row.full_name?.toLowerCase().includes(query) || row.contact_number?.includes(query) || row.email?.toLowerCase().includes(query)
    if (activeTab.value === 'employees')
      return row.full_name?.toLowerCase().includes(query) || row.role?.toLowerCase().includes(query) || row.email?.toLowerCase().includes(query)
    if (activeTab.value === 'items')
      return row.item_name?.toLowerCase().includes(query)
    if (activeTab.value === 'receipts')
      return String(row.receipt_id).includes(query) || String(row.customer_id).includes(query) || String(row.employee_id).includes(query)
    if (activeTab.value === 'payments')
      return String(row.payment_id).includes(query) || String(row.receipt_id).includes(query)
    return false
  })
})

// --- AUTH & ROLE ---
onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  user.value = data.user

  if (user.value) {
    // Match email to employee table
    const { data: empData } = await supabase
      .from('employee')
      .select('role, email')
      .eq('email', user.value.email)
      .single()

    if (empData) userRole.value = empData.role
    await fetchAllData()
  }
})

// --- LOGOUT ---
async function logout() {
  await supabase.auth.signOut()
  location.reload()
}

// --- MARK RECEIPT AS PAID ---
async function markAsPaid(receipt_id) {
  const { error } = await supabase.rpc('mark_receipt_paid', { p_receipt_id: receipt_id, p_user_email: user.value.email })
  if (error) alert('Error marking as paid: ' + error.message)
  else fetchAllData()
}

// --- DELETE RECORD ---
async function deleteRecord(table, id) {
  if (!confirm(`Are you sure you want to delete this ${table}?`)) return
  const { error } = await supabase.from(table).delete().eq(`${table}_id`, id)
  if (error) alert(error.message)
  else fetchAllData()
}
</script>

<template>
  <Login v-if="!user" />

  <main v-else class="dashboard">
    <header>
      <div class="top-bar">
        <h1>Laundry Management</h1>
        <div>
          <button @click="logout" class="btn-logout">Logout</button>
          <button
            v-if="['customers','employees','items','receipts','payments'].includes(activeTab) && userRole!=='Viewer'"
            @click="isModalOpen = true"
            class="btn-add"
          >
            + Add New {{ activeTab.slice(0,-1) }}
          </button>
        </div>
      </div>

      <div class="controls">
        <input v-model="searchQuery" placeholder="Search..." class="search-input" />
        <nav class="tabs">
          <button v-for="tab in tabs" :key="tab" @click="activeTab=tab; searchQuery=''"
                  :class="{active: activeTab===tab}">{{ tab.toUpperCase() }}</button>
        </nav>
      </div>
    </header>

    <div v-if="loading" class="loader">Updating records...</div>

    <div v-else class="content">
      <table>
        <thead>
          <tr v-if="activeTab==='customers'">
            <th>ID</th><th>Full Name</th><th>Contact</th><th>Email</th><th>Created</th>
            <th v-if="userRole==='Admin'">Actions</th>
          </tr>
          <tr v-if="activeTab==='employees'">
            <th>ID</th><th>Full Name</th><th>Contact</th><th>Email</th><th>Role</th><th>Salary</th>
            <th v-if="userRole==='Admin'">Actions</th>
          </tr>
          <tr v-if="activeTab==='items'">
            <th>ID</th><th>Name</th><th>Price</th>
            <th v-if="userRole==='Admin'">Actions</th>
          </tr>
          <tr v-if="activeTab==='receipts'">
            <th>ID</th><th>Customer ID</th><th>Employee ID</th><th>Total</th><th>Status</th><th>Created</th>
            <th v-if="userRole==='Admin'">Actions</th>
          </tr>
          <tr v-if="activeTab==='payments'">
            <th>ID</th><th>Receipt ID</th><th>Amount</th><th>Date</th>
            <th v-if="userRole==='Admin'">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in filteredData" :key="row.customer_id || row.employee_id || row.item_id || row.receipt_id || row.payment_id">
            <!-- Customers -->
            <template v-if="activeTab==='customers'">
              <td>{{row.customer_id}}</td>
              <td>{{row.full_name}}</td>
              <td>{{row.contact_number}}</td>
              <td>{{row.email}}</td>
              <td>{{new Date(row.created_at).toLocaleString()}}</td>
              <td v-if="userRole==='Admin'">
                <button @click="deleteRecord('customer', row.customer_id)" class="btn-delete">Delete</button>
              </td>
            </template>

            <!-- Employees -->
            <template v-if="activeTab==='employees'">
              <td>{{row.employee_id}}</td>
              <td>{{row.full_name}}</td>
              <td>{{row.contact_number}}</td>
              <td>{{row.email}}</td>
              <td>{{row.role}}</td>
              <td>₱{{row.salary}}</td>
              <td v-if="userRole==='Admin'">
                <button @click="deleteRecord('employee', row.employee_id)" class="btn-delete">Delete</button>
              </td>
            </template>

            <!-- Items -->
            <template v-if="activeTab==='items'">
              <td>{{row.item_id}}</td>
              <td>{{row.item_name}}</td>
              <td>₱{{row.price}}</td>
              <td v-if="userRole==='Admin'">
                <button @click="deleteRecord('item', row.item_id)" class="btn-delete">Delete</button>
              </td>
            </template>

            <!-- Receipts -->
            <template v-if="activeTab==='receipts'">
              <td>{{row.receipt_id}}</td>
              <td>{{row.customer_id}}</td>
              <td>{{row.employee_id}}</td>
              <td>₱{{row.total_amount}}</td>
              <td>
                {{row.status}}
                <button v-if="row.status!=='PAID' && userRole!=='Viewer'" @click="markAsPaid(row.receipt_id)" class="btn-pay">Mark Paid</button>
              </td>
              <td>{{new Date(row.created_at).toLocaleString()}}</td>
              <td v-if="userRole==='Admin'">
                <button @click="deleteRecord('receipt', row.receipt_id)" class="btn-delete">Delete</button>
              </td>
            </template>

            <!-- Payments -->
            <template v-if="activeTab==='payments'">
              <td>{{row.payment_id}}</td>
              <td>{{row.receipt_id}}</td>
              <td>₱{{row.amount_paid}}</td>
              <td>{{new Date(row.payment_date).toLocaleString()}}</td>
              <td v-if="userRole==='Admin'">
                <button @click="deleteRecord('payment', row.payment_id)" class="btn-delete">Delete</button>
              </td>
            </template>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredData.length===0" class="empty-state">No records found.</div>
    </div>

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