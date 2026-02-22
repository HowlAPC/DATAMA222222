<template>
  <div class="container">
    <div class="page-title">Employees</div>

    <div class="card">
      <button class="btn btn-primary" @click="showModal = true">
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
            <td>{{ emp.name }}</td>
            <td>{{ emp.position }}</td>
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

    <EmployeeModal v-if="showModal" @close="showModal = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import EmployeeModal from '../components/EmployeeModal.vue'

const employees = ref([])
const showModal = ref(false)

async function fetchEmployees() {
  const { data, error } = await supabase
    .from('employee')
    .select('*')

  if (!error) employees.value = data
}

async function deleteEmployee(id) {
  await supabase.from('employee').delete().eq('employee_id', id)
  fetchEmployees()
}

onMounted(fetchEmployees)
</script>