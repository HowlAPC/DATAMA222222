<template>
  <div class="p-4">
    <div class="flex justify-between mb-2">
      <h2 class="text-2xl font-bold">Customers</h2>
      <button @click="openModal" class="btn btn-primary">Add Customer</button>
    </div>

    <input v-model="searchQuery" placeholder="Search..." class="input mb-2 w-full"/>

    <table class="table-auto w-full border">
      <thead class="bg-gray-200">
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Contact</th>
          <th>Instructions</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in filteredCustomers" :key="c.customer_id" class="hover:bg-gray-100">
          <td>{{ c.customer_id }}</td>
          <td>{{ c.first_name }} {{ c.last_name }}</td>
          <td>{{ c.contact_number }}</td>
          <td>{{ c.special_instructions }}</td>
          <td>
            <button @click="editCustomer(c)" class="btn btn-warning btn-sm">Edit</button>
            <button @click="deleteCustomer(c.customer_id)" class="btn btn-danger btn-sm">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <CustomerModal v-if="modalOpen" :customer="selectedCustomer" @close="modalOpen=false"/>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CustomerModal from '../components/CustomerModal.vue'
import { customers } from '../store'
import { supabase } from '../supabase'

const searchQuery = ref('')
const modalOpen = ref(false)
const selectedCustomer = ref(null)

const openModal = () => {
  selectedCustomer.value = null
  modalOpen.value = true
}

const editCustomer = (c) => {
  selectedCustomer.value = c
  modalOpen.value = true
}

const deleteCustomer = async (id) => {
  if(confirm("Delete this customer?")) {
    await supabase.from('customer').delete().eq('customer_id', id)
    customers.value = customers.value.filter(c => c.customer_id !== id)
  }
}

const filteredCustomers = computed(() => 
  customers.value.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)
</script>