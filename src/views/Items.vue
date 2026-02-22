<template>
  <div class="container">
    <div class="page-title">Items / Services</div>

    <div class="card">
      <button class="btn btn-primary" @click="openModal">
        + Add Item
      </button>
    </div>

    <div class="card">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Unit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.item_id">
            <td>{{ item.item_id }}</td>
            <td>{{ item.name }}</td>
            <td>₱ {{ item.price }}</td>
            <td>{{ item.unit }}</td>
            <td>
              <button class="btn btn-danger" @click="deleteItem(item.item_id)">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <RecordModal
      v-if="showModal"
      :isOpen="showModal"
      :activeTab="'items'"
      :customers="customers"
      :employees="employees"
      @close="showModal = false"
      @refresh="fetchItems"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import RecordModal from '../components/RecordModal.vue'

const items = ref([])
const customers = ref([])
const employees = ref([])
const showModal = ref(false)

function openModal() {
  showModal.value = true
}

async function fetchItems() {
  const { data, error } = await supabase.from('item').select('*')
  if (!error) items.value = data
}

async function fetchCustomers() {
  const { data } = await supabase.from('customer').select('*')
  customers.value = data || []
}

async function fetchEmployees() {
  const { data } = await supabase.from('employee').select('*')
  employees.value = data || []
}

async function deleteItem(id) {
  await supabase.from('item').delete().eq('item_id', id)
  fetchItems()
}

onMounted(() => {
  fetchItems()
  fetchCustomers()
  fetchEmployees()
})
</script>