<template>
  <div class="container">
    <div class="page-title">Employees</div>

    <div class="card">
      <button class="btn btn-primary" @click="openModal">
        + Add Employee
      </button>
    </div>

    <div class="card">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Position</th>
            <th>Contact</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emp in employees" :key="emp.employee_id">
            <td>{{ emp.employee_id }}</td>
            <td>{{ emp.first_name }} {{ emp.last_name }}</td>
            <td>{{ emp.employee_type }}</td>
            <td>{{ emp.contact_number }}</td>
            <td>
              <button class="btn btn-danger" @click="deleteEmployee(emp.employee_id)">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- RECORD MODAL -->
    <RecordModal
      v-if="showModal"
      :isOpen="showModal"
      :activeTab="'employees'"
      :employees="employees"
      @close="showModal = false"
      @refresh="fetchEmployees"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import RecordModal from '../components/RecordModal.vue'

const employees = ref([])
const showModal = ref(false)

function openModal() {
  showModal.value = true
}

async function fetchEmployees() {
  const { data, error } = await supabase.from('employee').select('*')
  if (!error) employees.value = data
}

async function deleteEmployee(id) {
  await supabase.from('employee').delete().eq('employee_id', id)
  fetchEmployees()
}

onMounted(fetchEmployees)
</script>