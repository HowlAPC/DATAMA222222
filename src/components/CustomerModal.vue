<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white p-6 rounded w-96">
      <h3 class="text-lg font-bold mb-2">{{ customer ? 'Edit' : 'Add' }} Customer</h3>
      <form @submit.prevent="saveCustomer">
        <input v-model="firstName" placeholder="First Name" class="input mb-2 w-full"/>
        <input v-model="lastName" placeholder="Last Name" class="input mb-2 w-full"/>
        <input v-model="contactNumber" placeholder="Contact" class="input mb-2 w-full"/>
        <textarea v-model="instructions" placeholder="Instructions" class="input mb-2 w-full"></textarea>
        <div class="flex justify-end gap-2 mt-2">
          <button type="button" @click="$emit('close')" class="btn btn-gray">Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { supabase } from '../supabase'
import { customers } from '../store'

const props = defineProps({ customer: Object })
const firstName = ref('')
const lastName = ref('')
const contactNumber = ref('')
const instructions = ref('')

watch(() => props.customer, (val) => {
  if(val){
    firstName.value = val.first_name
    lastName.value = val.last_name
    contactNumber.value = val.contact_number
    instructions.value = val.special_instructions
  }
})

const saveCustomer = async () => {
  if(props.customer){
    await supabase.from('customer').update({
      first_name: firstName.value,
      last_name: lastName.value,
      contact_number: contactNumber.value,
      special_instructions: instructions.value
    }).eq('customer_id', props.customer.customer_id)
    const idx = customers.value.findIndex(c => c.customer_id === props.customer.customer_id)
    customers.value[idx] = {...customers.value[idx], first_name: firstName.value, last_name: lastName.value, contact_number: contactNumber.value, special_instructions: instructions.value }
  } else {
    const { data } = await supabase.from('customer').insert({
      first_name: firstName.value,
      last_name: lastName.value,
      contact_number: contactNumber.value,
      special_instructions: instructions.value
    }).select()
    customers.value.push(data[0])
  }
  $emit('close')
}
</script>