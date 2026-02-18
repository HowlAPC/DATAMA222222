<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './supabase'

const customers = ref([])
const employees = ref([])
const activeTab = ref('customers') // Toggle between tables

async function fetchData() {
  // Fetch Customers
  const { data: custData, error: custErr } = await supabase.from('customer').select('*')
  if (!custErr) customers.value = custData

  // Fetch Employees
  const { data: empData, error: empErr } = await supabase.from('employee').select('*')
  if (!empErr) employees.value = empData
}

// Function to delete a customer
async function deleteCustomer(id) {
  const { error } = await supabase.from('customer').delete().eq('customer_id', id)
  if (!error) customers.value = customers.value.filter(c => c.customer_id !== id)
}

onMounted(fetchData)
</script>

<template>
  <main>
    <h1>Business Dashboard</h1>
    
    <div class="tabs">
      <button @click="activeTab = 'customers'">Customers</button>
      <button @click="activeTab = 'employees'">Employees</button>
    </div>

    <section v-if="activeTab === 'customers'">
      <h2>Customer Records</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Contact</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in customers" :key="c.customer_id">
            <td>{{ c.customer_id }}</td>
            <td>{{ c.first_name }} {{ c.last_name }}</td>
            <td>{{ c.contact_number }}</td>
            <td><button @click="deleteCustomer(c.customer_id)">Delete</button></td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-if="activeTab === 'employees'">
      <h2>Employee Records</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in employees" :key="e.employee_id">
            <td>{{ e.employee_id }}</td>
            <td>{{ e.first_name }} {{ e.last_name }}</td>
            <td>{{ e.employee_type }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </main>
</template>

<style scoped>
table { width: 100%; border-collapse: collapse; margin-top: 20px; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background-color: #f4f4f4; }
.tabs { margin-bottom: 20px; }
button { margin-right: 10px; cursor: pointer; }
</style>