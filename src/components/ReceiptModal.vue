<template>
  <div class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">
        {{ receipt ? 'Edit' : 'Add' }} Receipt
      </h3>

      <form @submit.prevent="saveReceipt">
        <select v-model="customerId" class="select select-bordered w-full mb-2">
          <option disabled value="">Select Customer</option>
          <option v-for="c in customers" :key="c.customer_id" :value="c.customer_id">
            {{ c.first_name }} {{ c.last_name }}
          </option>
        </select>

        <select v-model="employeeId" class="select select-bordered w-full mb-2">
          <option disabled value="">Select Employee</option>
          <option v-for="e in employees" :key="e.employee_id" :value="e.employee_id">
            {{ e.first_name }} {{ e.last_name }}
          </option>
        </select>

        <input v-model="totalAmount" type="number" placeholder="Total Amount" class="input input-bordered w-full mb-4" />

        <div class="flex justify-end gap-2">
          <button type="button" @click="$emit('close')" class="btn">Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'
import { receipts, customers, employees } from '../store'

const props = defineProps({ receipt: Object })

const customerId = ref('')
const employeeId = ref('')
const totalAmount = ref('')

const saveReceipt = async () => {
  const { data } = await supabase.from('receipt').insert({
    customer_id: customerId.value,
    employee_id: employeeId.value,
    total_amount: totalAmount.value,
    status: 'Pending'
  }).select()

  receipts.value.push(data[0])
  $emit('close')
}
</script>