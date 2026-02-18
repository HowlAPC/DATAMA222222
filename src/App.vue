<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './supabase'

// State for each table
const customers = ref([])
const employees = ref([])
const items = ref([])
const receipts = ref([])
const payments = ref([])

const activeTab = ref('customers')
const loading = ref(false)

async function fetchAllData() {
  loading.value = true
  
  // Fetching all tables in parallel
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

onMounted(fetchAllData)
</script>

<template>
  <main class="dashboard">
    <header>
      <h1>Business Management System</h1>
      <nav class="tabs">
        <button v-for="tab in ['customers', 'employees', 'items', 'receipts', 'payments']" 
                :key="tab" @click="activeTab = tab" :class="{ active: activeTab === tab }">
          {{ tab.toUpperCase() }}
        </button>
      </nav>
    </header>

    <div v-if="loading" class="loader">Fetching data from Supabase...</div>

    <div v-else class="content">
      <section v-if="activeTab === 'customers'">
        <h2>Customer List</h2>
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Contact</th></tr></thead>
          <tbody>
            <tr v-for="c in customers" :key="c.customer_id">
              <td>{{ c.customer_id }}</td>
              <td>{{ c.first_name }} {{ c.last_name }}</td>
              <td>{{ c.contact_number }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section v-if="activeTab === 'employees'">
        <h2>Employee Records</h2>
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Role</th><th>Salary</th></tr></thead>
          <tbody>
            <tr v-for="e in employees" :key="e.employee_id">
              <td>{{ e.employee_id }}</td>
              <td>{{ e.first_name }} {{ e.last_name }}</td>
              <td>{{ e.employee_type }}</td>
              <td>₱{{ e.salary }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section v-if="activeTab === 'items'">
        <h2>Inventory Items</h2>
        <table>
          <thead><tr><th>Type</th><th>Weight</th><th>Fabric</th><th>Price</th></tr></thead>
          <tbody>
            <tr v-for="i in items" :key="i.item_id">
              <td>{{ i.item_type }}</td>
              <td>{{ i.weight }}kg</td>
              <td>{{ i.fabric_type || 'Standard' }}</td>
              <td>₱{{ i.price }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section v-if="activeTab === 'receipts'">
        <h2>Receipt History</h2>
        <table>
          <thead><tr><th>Receipt #</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            <tr v-for="r in receipts" :key="r.receipt_id">
              <td>{{ r.receipt_id }}</td>
              <td>₱{{ r.total_amount }}</td>
              <td><span class="status">{{ r.status }}</span></td>
              <td>{{ new Date(r.date_created).toLocaleDateString() }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section v-if="activeTab === 'payments'">
        <h2>Recent Payments</h2>
        <table>
          <thead><tr><th>Payment ID</th><th>Receipt #</th><th>Amount Paid</th><th>Date</th></tr></thead>
          <tbody>
            <tr v-for="p in payments" :key="p.payment_id">
              <td>{{ p.payment_id }}</td>
              <td>{{ p.receipt_id }}</td>
              <td>₱{{ p.amount_paid }}</td>
              <td>{{ new Date(p.payment_date).toLocaleDateString() }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </main>
</template>

<style scoped>
.dashboard { font-family: sans-serif; padding: 20px; max-width: 1000px; margin: auto; }
.tabs { display: flex; gap: 10px; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
button { padding: 10px 15px; border: none; background: #f0f0f0; cursor: pointer; border-radius: 5px; }
button.active { background: #3eaf7c; color: white; font-weight: bold; }
table { width: 100%; border-collapse: collapse; margin-top: 10px; }
th, td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
th { background: #f8f8f8; color: #666; }
.status { padding: 4px 8px; background: #e3f2fd; color: #1976d2; border-radius: 4px; font-size: 0.8em; }
</style>
