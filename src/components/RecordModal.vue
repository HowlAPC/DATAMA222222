<script setup>
import { ref, watch } from 'vue'
import { supabase } from '../supabase'

const props = defineProps({
  isOpen: Boolean,
  activeTab: String
})

const emit = defineEmits(['close', 'refresh'])

const loading = ref(false)
const formData = ref({})

// Reset form structure whenever the active tab changes
watch(() => props.activeTab, (newTab) => {
  if (newTab === 'customers') {
    formData.value = { first_name: '', last_name: '', contact_number: '' }
  } else if (newTab === 'employees') {
    formData.value = { first_name: '', last_name: '', employee_type: '', salary: 0 }
  } else if (newTab === 'items') {
    formData.value = { item_type: '', weight: 0, fabric_type: '', price: 0 }
  } else if (newTab === 'receipts') {
    // Note: status usually defaults to 'Pending' or 'Unpaid'
    formData.value = { total_amount: 0, status: 'Unpaid' }
  } else if (newTab === 'payments') {
    // Requires a valid receipt_id to link the payment
    formData.value = { receipt_id: null, amount_paid: 0, payment_date: new Date().toISOString().split('T')[0] }
  } else {
    formData.value = {}
  }
}, { immediate: true })

async function handleSubmit() {
  loading.value = true
  // Table names are singular in your DB (customer, employee, item, receipt, payment)
  const tableName = props.activeTab.replace(/s$/, '') 
  
  const { error } = await supabase
    .from(tableName)
    .insert([formData.value])

  if (error) {
    alert('Error saving record: ' + error.message)
  } else {
    emit('refresh')
    emit('close')
  }
  loading.value = false
}
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <h3>Add New {{ activeTab.slice(0, -1) }}</h3>
      <hr />
      
      <form @submit.prevent="handleSubmit">
        <div v-if="activeTab === 'customers'">
          <label>First Name</label>
          <input v-model="formData.first_name" required />
          <label>Last Name</label>
          <input v-model="formData.last_name" required />
          <label>Contact Number</label>
          <input v-model="formData.contact_number" />
        </div>

        <div v-if="activeTab === 'employees'">
          <label>First Name</label>
          <input v-model="formData.first_name" required />
          <label>Last Name</label>
          <input v-model="formData.last_name" required />
          <label>Position</label>
          <input v-model="formData.employee_type" placeholder="e.g. Cashier" required />
          <label>Salary</label>
          <input type="number" v-model.number="formData.salary" />
        </div>

        <div v-if="activeTab === 'items'">
          <label>Item Type</label>
          <input v-model="formData.item_type" placeholder="e.g. Laundry Load" required />
          <label>Price</label>
          <input type="number" v-model.number="formData.price" required />
          <label>Weight (kg)</label>
          <input type="number" step="0.1" v-model.number="formData.weight" />
        </div>

        <div v-if="activeTab === 'receipts'">
          <label>Total Amount</label>
          <input type="number" v-model.number="formData.total_amount" required />
          <label>Status</label>
          <select v-model="formData.status" class="form-select">
            <option value="Unpaid">Unpaid</option>
            <option value="Partial">Partial</option>
            <option value="Paid">Paid</option>
          </select>
        </div>

        <div v-if="activeTab === 'payments'">
          <label>Receipt ID (Reference #)</label>
          <input type="number" v-model.number="formData.receipt_id" required placeholder="Enter Receipt ID" />
          <label>Amount Paid</label>
          <input type="number" v-model.number="formData.amount_paid" required />
          <label>Payment Date</label>
          <input type="date" v-model="formData.payment_date" required />
        </div>

        <div class="actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">Cancel</button>
          <button type="submit" class="btn-save" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save Record' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Added styling for select dropdown */
.form-select {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
}

.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 2000;
}
.modal-card {
  background: white; padding: 2rem; border-radius: 12px; width: 100%; max-width: 450px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
label { display: block; margin-top: 10px; font-weight: bold; font-size: 0.8rem; color: #555; }
input { width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 6px; }
.actions { display: flex; gap: 10px; margin-top: 20px; }
.btn-save { flex: 2; padding: 12px; background: #3eaf7c; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-cancel { flex: 1; padding: 12px; background: #eee; border: none; border-radius: 6px; cursor: pointer; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>