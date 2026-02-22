import { ref } from 'vue'
import { supabase } from './supabase'

export const user = ref(supabase.auth.user())
export const customers = ref([])
export const employees = ref([])
export const items = ref([])
export const receipts = ref([])
export const payments = ref([])

// Fetch initial data
export const fetchAll = async () => {
  const { data: c } = await supabase.from('customer').select('*')
  customers.value = c

  const { data: e } = await supabase.from('employee').select('*')
  employees.value = e

  const { data: i } = await supabase.from('item').select('*')
  items.value = i

  const { data: r } = await supabase.from('receipt').select('*')
  receipts.value = r

  const { data: p } = await supabase.from('payment').select('*')
  payments.value = p
}