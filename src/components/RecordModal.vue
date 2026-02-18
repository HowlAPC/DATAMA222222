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
    formData.value = { first_name: '', last_name: '', contact_number: '', salary: 0, employee_type: '' }
  } else if (newTab === 'items') {
    formData.value = { receipt_id: null, item_type: '', fabric_type: '', weight: 0, price: 0 }
  } else if (newTab === 'receipts') {
    formData.value = { customer_id: null, employee_id: null, total_amount: 0, status: 'Pending' }
  } else if (newTab === 'payments') {
    formData.value = { receipt_id: null, amount_paid: 0, payment_date: new Date().toISOString().split('T')[0] }
  } else {
    formData.value = {}
  }
}, { immediate: true })

async function handleSubmit() {
  loading.value = true
  const tableName = props.activeTab.replace(/s$/, '')

  const { error } = await supabase.from(tableName).insert([formData.value])
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
  <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card">
      <h3>Add New {{ activeTab.slice(0, -1) }}</h3>
      <hr />

      <form @submit.prevent="handleSubmit">
        <!-- CUSTOMERS -->
        <template v-if="activeTab==='customers'">
          <label>First Name</label>
          <input v-model="formData.first_name" required />
          <label>Last Name</label>
          <input v-model="formData.last_name" required />
          <label>Contact Number</label>
          <input v-model="formData.contact_number" />
          <label>Special Instructions</label>
          <textarea v-model="formData.special_instructions"></textarea>
        </template>

        <!-- EMPLOYEES -->
        <template v-if="activeTab==='employees'">
          <label>First Name</label>
          <input v-model="formData.first_name" required />
          <label>Last Name</label>
          <input v-model="formData.last_name" required />
          <label>Contact Number</label>
          <input v-model="formData.contact_number" />
          <label>Salary</label>
          <input type="number" v-model.number="formData.salary" min="0" required />
          <label>Position</label>
          <select v-model="formData.employee_type" required>
            <option value="">Select Position</option>
            <option>Staff</option>
            <option>Manager</option>
            <option>Admin</option>
          </select>
        </template>

        <!-- ITEMS -->
        <template v-if="activeTab==='items'">
          <label>Receipt</label>
          <select v-model.number="formData.receipt_id" required>
            <option value="">Select Receipt</option>
            <option v-for="r in receipts" :key="r.receipt_id" :value="r.receipt_id">
              {{ r.receipt_id }} - Customer {{ r.customer_id }}
            </option>
          </select>
          <label>Item Type</label>
          <input v-model="formData.item_type" required />
          <label>Fabric Type</label>
          <input v-model="formData.fabric_type" required />
          <label>Weight (kg)</label>
          <input type="number" step="0.1" v-model.number="formData.weight" min="0.1" required />
          <label>Price</label>
          <input type="number" v-model.number="formData.price" min="1" required />
        </template>

        <!-- RECEIPTS -->
        <template v-if="activeTab==='receipts'">
          <label>Customer</label>
          <select v-model.number="formData.customer_id" required>
            <option value="">Select Customer</option>
            <option v-for="c in customers" :key="c.customer_id" :value="c.customer_id">
              {{ c.customer_id }} - {{ c.first_name }} {{ c.last_name }}
            </option>
          </select>
          <label>Employee</label>
          <select v-model.number="formData.employee_id" required>
            <option value="">Select Employee</option>
            <option v-for="e in employees" :key="e.employee_id" :value="e.employee_id">
              {{ e.employee_id }} - {{ e.first_name }} {{ e.last_name }}
            </option>
          </select>
          <label>Status</label>
          <select v-model="formData.status" required>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Claimed">Claimed</option>
          </select>
        </template>

        <!-- PAYMENTS -->
        <template v-if="activeTab==='payments'">
          <label>Receipt</label>
          <select v-model.number="formData.receipt_id" required>
            <option value="">Select Receipt</option>
            <option v-for="r in receipts" :key="r.receipt_id" :value="r.receipt_id">
              {{ r.receipt_id }} - Customer {{ r.customer_id }}
            </option>
          </select>
          <label>Amount Paid</label>
          <input type="number" v-model.number="formData.amount_paid" min="1" required />
          <label>Payment Date</label>
          <input type="date" v-model="formData.payment_date" required />
        </template>

        <div class="actions">
          <button type="button" class="btn-cancel" @click="emit('close')">Cancel</button>
          <button type="submit" class="btn-save" :disabled="loading">{{ loading ? 'Saving...' : 'Save Record' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed; top:0; left:0; width:100%; height:100%;
  background: rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:2000;
}
.modal-card {
  background:white; padding:2rem; border-radius:12px; width:90%; max-width:500px;
}
label { display:block; margin-top:10px; font-weight:bold; font-size:0.9rem; }
input, select, textarea { width:100%; padding:8px; margin-top:4px; border-radius:6px; border:1px solid #ccc; }
textarea { resize: vertical; min-height:50px; }
.actions { display:flex; justify-content:flex-end; gap:10px; margin-top:20px; }
.btn-save { background:#10b981; color:white; padding:10px 16px; border:none; border-radius:6px; cursor:pointer; }
.btn-cancel { background:#ef4444; color:white; padding:10px 16px; border:none; border-radius:6px; cursor:pointer; }
button:disabled { opacity:0.5; cursor:not-allowed; }
</style>
