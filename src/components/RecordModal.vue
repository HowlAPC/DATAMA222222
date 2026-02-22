<script setup>
import { ref, watch } from 'vue'
import { supabase } from '../supabase'

// Props from parent
const props = defineProps({
  isOpen: Boolean,
  activeTab: String,
  customers: Array,
  employees: Array,
  receipts: Array
})

// Emits refresh/close events
const emit = defineEmits(['close', 'refresh'])

const loading = ref(false)
const formData = ref({})

// Reset formData structure based on active tab
watch(() => props.activeTab, (tab) => {
  switch(tab) {
    case 'customers':
      formData.value = { first_name: '', last_name: '', contact_number: '', special_instructions: '' }
      break
    case 'employees':
      formData.value = { first_name: '', last_name: '', contact_number: '', employee_type: '', salary: 0 }
      break
    case 'items':
      formData.value = { customer_id: null, employee_id: null, item_type: '', fabric_type: '', weight: 0, price: 0 }
      break
    case 'receipts':
      formData.value = { customer_id: null, total_amount: 0, status: 'Pending' }
      break
    case 'payments':
      formData.value = { receipt_id: null, amount_paid: 0, payment_date: new Date().toISOString().split('T')[0] }
      break
    default:
      formData.value = {}
  }
}, { immediate: true })

// Handle form submission
async function handleSubmit() {
  loading.value = true

  try {
    if (props.activeTab === 'items') {
      // Validate customer and employee selection
      if (!formData.value.customer_id || !formData.value.employee_id) {
        alert('Select a Customer and Employee')
        loading.value = false
        return
      }

      // Insert item
      const { data: itemData, error: itemError } = await supabase
        .from('item')
        .insert([formData.value])
        .select()
        .single()

      if (itemError) throw itemError

      // Check for existing pending receipt
      const { data: existingReceipt } = await supabase
        .from('receipt')
        .select('*')
        .eq('customer_id', formData.value.customer_id)
        .eq('status', 'Pending')
        .single()

      let receipt_id
      if (!existingReceipt) {
        // Create new receipt
        const { data: newReceipt, error: receiptError } = await supabase
          .from('receipt')
          .insert([{ customer_id: formData.value.customer_id, total_amount: formData.value.price, status: 'Pending', date_created: new Date().toISOString() }])
          .select()
          .single()

        if (receiptError) throw receiptError
        receipt_id = newReceipt.receipt_id
      } else {
        // Update existing receipt total
        const { error: updateError } = await supabase
          .from('receipt')
          .update({ total_amount: existingReceipt.total_amount + formData.value.price })
          .eq('receipt_id', existingReceipt.receipt_id)

        if (updateError) throw updateError
        receipt_id = existingReceipt.receipt_id
      }

      // Link item to receipt
      const { error: itemUpdateError } = await supabase
        .from('item')
        .update({ receipt_id })
        .eq('item_id', itemData.item_id)

      if (itemUpdateError) throw itemUpdateError

    } else if (props.activeTab === 'payments') {
      // Insert payment
      const { error: paymentError } = await supabase.from('payment').insert([formData.value])
      if (paymentError) throw paymentError

      // Update receipt status based on total paid
      const { data: receipt } = await supabase.from('receipt').select('*').eq('receipt_id', formData.value.receipt_id).single()
      const { data: paymentsData } = await supabase.from('payment').select('amount_paid').eq('receipt_id', formData.value.receipt_id)
      const totalPaid = paymentsData.reduce((sum, p) => sum + p.amount_paid, 0)
      const status = totalPaid >= receipt.total_amount ? 'Paid' : 'Partial'
      await supabase.from('receipt').update({ status }).eq('receipt_id', formData.value.receipt_id)

    } else {
      // Normal insert for other tables
      const tableName = props.activeTab.replace(/s$/, '')
      const { error } = await supabase.from(tableName).insert([formData.value])
      if (error) throw error
    }

    // Success: emit refresh + close
    emit('refresh')
    emit('close')

  } catch(err) {
    alert(err.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <h3>Add New {{ activeTab.slice(0,-1) }}</h3>
      <hr />

      <form @submit.prevent="handleSubmit">

        <!-- Customers -->
        <div v-if="activeTab === 'customers'">
          <label>First Name</label>
          <input v-model="formData.first_name" required />
          <label>Last Name</label>
          <input v-model="formData.last_name" required />
          <label>Contact Number</label>
          <input v-model="formData.contact_number" />
          <label>Special Instructions</label>
          <input v-model="formData.special_instructions" />
        </div>

        <!-- Employees -->
        <div v-if="activeTab === 'employees'">
          <label>First Name</label>
          <input v-model="formData.first_name" required />
          <label>Last Name</label>
          <input v-model="formData.last_name" required />
          <label>Contact Number</label>
          <input v-model="formData.contact_number" />
          <label>Position</label>
          <input v-model="formData.employee_type" required placeholder="e.g. Cashier" />
          <label>Salary</label>
          <input type="number" v-model.number="formData.salary" />
        </div>

        <!-- Items -->
        <div v-if="activeTab === 'items'">
          <label>Customer</label>
          <select v-model.number="formData.customer_id" required>
            <option value="" disabled>Select Customer</option>
            <option v-for="c in props.customers" :key="c.customer_id" :value="c.customer_id">
              {{ c.first_name }} {{ c.last_name }} (ID: {{ c.customer_id }})
            </option>
          </select>

          <label>Employee</label>
          <select v-model.number="formData.employee_id" required>
            <option value="" disabled>Select Employee</option>
            <option v-for="e in props.employees" :key="e.employee_id" :value="e.employee_id">
              {{ e.first_name }} {{ e.last_name }} (ID: {{ e.employee_id }})
            </option>
          </select>

          <label>Item Type</label>
          <input v-model="formData.item_type" placeholder="e.g. Laundry Load" required />
          <label>Fabric</label>
          <input v-model="formData.fabric_type" placeholder="e.g. Cotton" />
          <label>Weight (kg)</label>
          <input type="number" step="0.1" v-model.number="formData.weight" />
          <label>Price</label>
          <input type="number" step="0.1" v-model.number="formData.price" required />
        </div>

        <!-- Receipts -->
        <div v-if="activeTab === 'receipts'">
          <label>Customer</label>
          <select v-model.number="formData.customer_id" required>
            <option value="" disabled>Select Customer</option>
            <option v-for="c in props.customers" :key="c.customer_id" :value="c.customer_id">
              {{ c.first_name }} {{ c.last_name }}
            </option>
          </select>
          <label>Total Amount</label>
          <input type="number" v-model.number="formData.total_amount" required />
        </div>

        <!-- Payments -->
        <div v-if="activeTab === 'payments'">
          <label>Receipt (Pending / Partial)</label>
          <select v-model.number="formData.receipt_id" required>
            <option value="" disabled>Select Receipt</option>
            <option v-for="r in props.receipts" :key="r.receipt_id" v-if="r.status !== 'Paid'" :value="r.receipt_id">
              Receipt #{{ r.receipt_id }} - Customer ID: {{ r.customer_id }} - Total: ₱{{ r.total_amount }}
            </option>
          </select>

          <label>Amount Paid</label>
          <input type="number" step="0.1" v-model.number="formData.amount_paid" required />
          <label>Payment Date</label>
          <input type="date" v-model="formData.payment_date" required />
        </div>

        <div class="actions" style="margin-top:15px; display:flex; justify-content:flex-end; gap:10px;">
          <button type="button" class="btn-cancel" @click="$emit('close')">Cancel</button>
          <button type="submit" class="btn-save" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save Record' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>