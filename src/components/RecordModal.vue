<script setup>
import { ref, watch } from 'vue'
import { supabase } from '../supabase'

const props = defineProps({
  isOpen: Boolean,
  activeTab: String,
  customers: Array,
  employees: Array,
  receipts: Array
})

const emit = defineEmits(['close', 'refresh'])

const loading = ref(false)
const formData = ref({})

// Reset form structure whenever the active tab changes
watch(() => props.activeTab, (newTab) => {
  if (newTab === 'customers') {
    formData.value = { first_name: '', last_name: '', contact_number: '', special_instructions: '' }
  } else if (newTab === 'employees') {
    formData.value = { first_name: '', last_name: '', contact_number: '', employee_type: '', salary: 0 }
  } else if (newTab === 'items') {
    formData.value = { receipt_id: null, item_type: '', weight: 0, fabric_type: '', price: 0 }
  } else if (newTab === 'receipts') {
    formData.value = { customer_id: null, employee_id: null, total_amount: 0, status: 'Unpaid' }
  } else if (newTab === 'payments') {
    formData.value = { receipt_id: null, amount_paid: 0, payment_date: new Date().toISOString().split('T')[0] }
  } else {
    formData.value = {}
  }
}, { immediate: true })

async function handleSubmit() {
  loading.value = true
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
          <input v-model="formData.employee_type" placeholder="e.g. Cashier" required />
          <label>Salary</label>
          <input type="number" v-model.number="formData.salary" />
        </div>

        <!-- Items -->
        <div v-if="activeTab === 'items'">
          <label>Receipt</label>
          <select v-model.number="formData.receipt_id" required>
            <option value="" disabled>Select receipt</option>
            <option v-for="rec in receipts" :key="rec.receipt_id" :value="rec.receipt_id">
              ID: {{ rec.receipt_id }} | Customer ID: {{ rec.customer_id }} | Total: ₱{{ rec.total_amount }}
            </option>
          </select>

          <label>Item Type</label>
          <input v-model="formData.item_type" placeholder="e.g. Laundry Load" required />
          <label>Fabric Type</label>
          <input v-model="formData.fabric_type" placeholder="e.g. Cotton" />
          <label>Weight (kg)</label>
          <input type="number" step="0.1" v-model.number="formData.weight" />
          <label>Price</label>
          <input type="number" v-model.number="formData.price" required />
        </div>

        <!-- Receipts -->
        <div v-if="activeTab === 'receipts'">
          <label>Customer</label>
          <select v-model.number="formData.customer_id" required>
            <option value="" disabled>Select customer</option>
            <option v-for="cust in customers" :key="cust.customer_id" :value="cust.customer_id">
              {{ cust.first_name }} {{ cust.last_name }} (ID: {{ cust.customer_id }})
            </option>
          </select>

          <label>Employee</label>
          <select v-model.number="formData.employee_id" required>
            <option value="" disabled>Select employee</option>
            <option v-for="emp in employees" :key="emp.employee_id" :value="emp.employee_id">
              {{ emp.first_name }} {{ emp.last_name }} (ID: {{ emp.employee_id }})
            </option>
          </select>

          <label>Total Amount</label>
          <input type="number" v-model.number="formData.total_amount" required />
          <label>Status</label>
          <select v-model="formData.status" required>
            <option value="Unpaid">Unpaid</option>
            <option value="Partial">Partial</option>
            <option value="Paid">Paid</option>
          </select>
        </div>

        <!-- Payments -->
        <div v-if="activeTab === 'payments'">
          <label>Receipt</label>
          <select v-model.number="formData.receipt_id" required>
            <option value="" disabled>Select receipt</option>
            <option v-for="rec in receipts" :key="rec.receipt_id" :value="rec.receipt_id">
              ID: {{ rec.receipt_id }} | Customer ID: {{ rec.customer_id }} | Total: ₱{{ rec.total_amount }}
            </option>
          </select>

          <label>Amount Paid</label>
          <input type="number" v-model.number="formData.amount_paid" required />
          <label>Payment Date</label>
          <input type="date" v-model="formData.payment_date" required />
        </div>

        <!-- Actions -->
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
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 2000;
}
.modal-card {
  background: white; padding: 2rem; border-radius: 12px; width: 100%; max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
label { display: block; margin-top: 10px; font-weight: bold; font-size: 0.8rem; color: #555; }
input, select { width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 6px; }
.actions { display: flex; gap: 10px; margin-top: 20px; }
.btn-save { flex: 2; padding: 12px; background: #3eaf7c; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-cancel { flex: 1; padding: 12px; background: #eee; border: none; border-radius: 6px; cursor: pointer; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
