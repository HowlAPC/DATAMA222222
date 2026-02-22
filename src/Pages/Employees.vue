<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">Employees</h2>
      <button @click="openModal" class="btn btn-primary">Add Employee</button>
    </div>

    <input v-model="searchQuery"
           placeholder="Search employees..."
           class="input input-bordered w-full mb-4" />

    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Position</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="e in filteredEmployees"
              :key="e.employee_id">
            <td>{{ e.employee_id }}</td>
            <td>{{ e.first_name }} {{ e.last_name }}</td>
            <td>{{ e.position }}</td>
            <td>₱ {{ e.salary }}</td>
            <td class="space-x-2">
              <button @click="editEmployee(e)" class="btn btn-warning btn-sm">Edit</button>
              <button @click="deleteEmployee(e.employee_id)" class="btn btn-error btn-sm">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <EmployeeModal v-if="modalOpen"
                   :employee="selectedEmployee"
                   @close="modalOpen=false" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { employees } from '../store'
import { supabase } from '../supabase'
import EmployeeModal from '../components/EmployeeModal.vue'

const searchQuery = ref('')
const modalOpen = ref(false)
const selectedEmployee = ref(null)

const openModal = () => {
  selectedEmployee.value = null
  modalOpen.value = true
}

const editEmployee = (emp) => {
  selectedEmployee.value = emp
  modalOpen.value = true
}

const deleteEmployee = async (id) => {
  if(confirm('Delete this employee?')){
    await supabase.from('employee').delete().eq('employee_id', id)
    employees.value = employees.value.filter(e => e.employee_id !== id)
  }
}

const filteredEmployees = computed(() =>
  employees.value.filter(e =>
    `${e.first_name} ${e.last_name}`
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase())
  )
)
</script>