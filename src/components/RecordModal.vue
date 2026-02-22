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

const form = ref({})

// Convert plural tab → singular table name
function getTableName(tab) {
  const map = {
    customers: 'customer',
    employees: 'employee',
    items: 'item',
    receipts: 'receipt',
    payments: 'payment'
  }
  return map[tab]
}

// Setup form fields when tab changes
watch(
  () => props.activeTab,
  (tab) => {
    if (!tab) return

    if (tab === 'customers') {
      form.value = {
        full_name: '',
        contact_number: '',
        email: ''
      }
    }

    if (tab === 'employees') {
      form.value = {
        full_name: '',
        role: '',
        salary: 0,
        contact_number: '',
        email: ''
      }
    }

    if (tab === 'items') {
      form.value = {
        item_name: '',
        price: 0
      }
    }

    if (tab === 'receipts') {
      form.value = {
        customer_id: '',
        employee_id: '',
        status: 'UNPAID'
      }
    }

    if (tab === 'payments') {
      form.value = {
        receipt_id: '',
        amount_paid: 0
      }
    }
  },
  { immediate: true }
)

// Insert record
async function saveRecord() {
  const table = getTableName(props.activeTab)

  const { error } = await supabase
    .from(table)
    .insert([form.value])

  if (error) {
    alert('Error: ' + error.message)
    return
  }

  alert('Record added successfully!')

  emit('refresh')
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="modal">
    <div class="modal-content">
      <h2>Add {{ activeTab?.slice(0, -1) }}</h2>

      <!-- CUSTOMERS -->
      <template v-if="activeTab === 'customers'">
        <input v-model="form.full_name" placeholder="Full Name" />
        <input v-model="form.contact_number" placeholder="Contact Number (09XX-XXX-XXXX)" />
        <input v-model="form.email" placeholder="Email" />
      </template>

      <!-- EMPLOYEES -->
      <template v-if="activeTab === 'employees'">
        <input v-model="form.full_name" placeholder="Full Name" />
        
        <select v-model="form.role">
          <option disabled value="">Select Role</option>
          <option>Admin</option>
          <option>Cashier</option>
          <option>Washer</option>
          <option>Staff</option>
        </select>

        <input v-model.number="form.salary" type="number" placeholder="Salary" />
        <input v-model="form.contact_number" placeholder="Contact Number (09XX-XXX-XXXX)" />
        <input v-model="form.email" placeholder="Email" />
      </template>

      <!-- ITEMS -->
      <template v-if="activeTab === 'items'">
        <input v-model="form.item_name" placeholder="Item Name" />
        <input v-model.number="form.price" type="number" placeholder="Price" />
      </template>

      <!-- RECEIPTS -->
      <template v-if="activeTab === 'receipts'">
        <select v-model="form.customer_id">
          <option disabled value="">Select Customer</option>
          <option v-for="c in customers" :key="c.customer_id" :value="c.customer_id">
            {{ c.customer_id }} - {{ c.full_name }}
          </option>
        </select>

        <select v-model="form.employee_id">
          <option disabled value="">Select Employee</option>
          <option v-for="e in employees" :key="e.employee_id" :value="e.employee_id">
            {{ e.employee_id }} - {{ e.full_name }}
          </option>
        </select>
      </template>

      <!-- PAYMENTS -->
      <template v-if="activeTab === 'payments'">
        <select v-model="form.receipt_id">
          <option disabled value="">Select Receipt</option>
          <option v-for="r in receipts" :key="r.receipt_id" :value="r.receipt_id">
            Receipt #{{ r.receipt_id }}
          </option>
        </select>

        <input v-model.number="form.amount_paid" type="number" placeholder="Amount Paid" />
      </template>

      <div class="buttons">
        <button @click="saveRecord">Save</button>
        <button @click="$emit('close')">Cancel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input, select {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

button {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:first-child {
  background: #10b981;
  color: white;
}

button:last-child {
  background: #ef4444;
  color: white;
}
</style>