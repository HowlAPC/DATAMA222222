<template>
  <div class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">
        {{ employee ? 'Edit' : 'Add' }} Employee
      </h3>

      <form @submit.prevent="saveEmployee">
        <input v-model="firstName" placeholder="First Name" class="input input-bordered w-full mb-2" />
        <input v-model="lastName" placeholder="Last Name" class="input input-bordered w-full mb-2" />
        <input v-model="position" placeholder="Position" class="input input-bordered w-full mb-2" />
        <input v-model="salary" type="number" placeholder="Salary" class="input input-bordered w-full mb-4" />

        <div class="flex justify-end gap-2">
          <button type="button" @click="$emit('close')" class="btn">Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { supabase } from '../supabase'
import { employees } from '../store'

const props = defineProps({ employee: Object })

const firstName = ref('')
const lastName = ref('')
const position = ref('')
const salary = ref('')

watch(() => props.employee, (val) => {
  if (val) {
    firstName.value = val.first_name
    lastName.value = val.last_name
    position.value = val.position
    salary.value = val.salary
  }
})

const saveEmployee = async () => {
  if (props.employee) {
    await supabase.from('employee').update({
      first_name: firstName.value,
      last_name: lastName.value,
      position,
      salary
    }).eq('employee_id', props.employee.employee_id)

    const index = employees.value.findIndex(e => e.employee_id === props.employee.employee_id)
    employees.value[index] = {
      ...employees.value[index],
      first_name: firstName.value,
      last_name: lastName.value,
      position: position.value,
      salary: salary.value
    }
  } else {
    const { data } = await supabase.from('employee').insert({
      first_name: firstName.value,
      last_name: lastName.value,
      position: position.value,
      salary: salary.value
    }).select()

    employees.value.push(data[0])
  }

  $emit('close')
}
</script>