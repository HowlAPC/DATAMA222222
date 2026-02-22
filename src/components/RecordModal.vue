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

const emit = defineEmits(['close','refresh'])
const loading = ref(false)
const formData = ref({})

watch(() => props.activeTab, (tab) => {
  if (tab==='customers') formData.value={first_name:'',last_name:'',contact_number:'',special_instructions:''}
  else if (tab==='employees') formData.value={first_name:'',last_name:'',contact_number:'',employee_type:'',salary:0}
  else if (tab==='items') formData.value={customer_id:null,employee_id:null,item_type:'',weight:0,fabric_type:'',price:0}
  else if (tab==='receipts') formData.value={total_amount:0,status:'Pending'}
  else if (tab==='payments') formData.value={receipt_id:null,amount_paid:0,payment_date:new Date().toISOString().split('T')[0]}
  else formData.value={}
},{immediate:true})

async function handleSubmit(){
  loading.value=true
  const tableName=props.activeTab.replace(/s$/,'')
  try{
    if(props.activeTab==='items'){
      if(!formData.value.customer_id||!formData.value.employee_id){ alert('Select Customer and Employee'); loading.value=false; return}
      const { data: itemData, error: itemError } = await supabase.from('item').insert([formData.value]).select().single()
      if(itemError) throw new Error(itemError.message)

      const price=formData.value.price
      const customer_id=formData.value.customer_id
      const employee_id=formData.value.employee_id

      const { data: existingReceipt } = await supabase.from('receipt')
        .select('*').eq('customer_id',customer_id).eq('employee_id',employee_id).eq('status','Pending').single()

      let receipt_id
      if(!existingReceipt){
        const { data: newReceipt, error: receiptError } = await supabase.from('receipt')
          .insert([{customer_id,employee_id,total_amount:price,status:'Pending',date_created:new Date().toISOString()}])
          .select().single()
        if(receiptError) throw new Error(receiptError.message)
        receipt_id=newReceipt.receipt_id
      } else {
        await supabase.from('receipt').update({total_amount: existingReceipt.total_amount+price}).eq('receipt_id',existingReceipt.receipt_id)
        receipt_id=existingReceipt.receipt_id
      }
      await supabase.from('item').update({receipt_id}).eq('item_id',itemData.item_id)

    } else if(props.activeTab==='payments'){
      const { error: payErr } = await supabase.from('payment').insert([formData.value])
      if(payErr) throw new Error(payErr.message)
      const { data: receipt } = await supabase.from('receipt').select('*').eq('receipt_id',formData.value.receipt_id).single()
      const { data: totalPaidData } = await supabase.from('payment').select('amount_paid').eq('receipt_id',formData.value.receipt_id)
      const totalPaid = totalPaidData.reduce((s,p)=>s+p.amount_paid,0)
      const status = totalPaid>=receipt.total_amount?'Paid':'Partial'
      await supabase.from('receipt').update({status}).eq('receipt_id',formData.value.receipt_id)
    } else {
      const { error } = await supabase.from(tableName).insert([formData.value])
      if(error) throw new Error(error.message)
    }

    emit('refresh'); emit('close'); loading.value=false
  } catch(e){ alert(e.message); loading.value=false }
}
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <h3>Add New {{ activeTab.slice(0,-1) }}</h3>
      <hr />
      <!-- RecordModal Form -->
      <form @submit.prevent="handleSubmit">

        <!-- Customers -->
        <div v-if="activeTab === 'customers'" class="form-grid">
          <div class="input-group">
            <input v-model="formData.first_name" placeholder=" " required />
            <label>First Name</label>
          </div>
          <div class="input-group">
            <input v-model="formData.last_name" placeholder=" " required />
            <label>Last Name</label>
          </div>
          <div class="input-group">
            <input v-model="formData.contact_number" placeholder=" " />
            <label>Contact Number</label>
          </div>
          <div class="input-group">
            <input v-model="formData.special_instructions" placeholder=" " />
            <label>Special Instructions</label>
          </div>
        </div>

        <!-- Employees -->
        <div v-if="activeTab === 'employees'" class="form-grid">
          <div class="input-group">
            <input v-model="formData.first_name" placeholder=" " required />
            <label>First Name</label>
          </div>
          <div class="input-group">
            <input v-model="formData.last_name" placeholder=" " required />
            <label>Last Name</label>
          </div>
          <div class="input-group">
            <input v-model="formData.contact_number" placeholder=" " />
            <label>Contact Number</label>
          </div>
          <div class="input-group">
            <input v-model="formData.employee_type" placeholder=" " required />
            <label>Position (e.g. Cashier)</label>
          </div>
          <div class="input-group">
            <input type="number" v-model.number="formData.salary" placeholder=" " />
            <label>Salary</label>
          </div>
        </div>

        <!-- Items -->
        <div v-if="activeTab === 'items'" class="form-grid">
          <div class="input-group">
            <select v-model.number="formData.customer_id" required>
              <option value="" disabled>Select Customer</option>
              <option v-for="c in customers" :key="c.customer_id" :value="c.customer_id">
                {{ c.first_name }} {{ c.last_name }}
              </option>
            </select>
            <label>Customer</label>
          </div>
          <div class="input-group">
            <select v-model.number="formData.employee_id" required>
              <option value="" disabled>Select Employee</option>
              <option v-for="e in employees" :key="e.employee_id" :value="e.employee_id">
                {{ e.first_name }} {{ e.last_name }}
              </option>
            </select>
            <label>Employee</label>
          </div>
          <div class="input-group">
            <input v-model="formData.item_type" placeholder=" " required />
            <label>Item Type</label>
          </div>
          <div class="input-group">
            <input v-model="formData.fabric_type" placeholder=" " />
            <label>Fabric Type</label>
          </div>
          <div class="input-group">
            <input type="number" v-model.number="formData.weight" placeholder=" " step="0.1" />
            <label>Weight (kg)</label>
          </div>
          <div class="input-group">
            <input type="number" v-model.number="formData.price" placeholder=" " step="0.1" required />
            <label>Price</label>
          </div>
        </div>

        <!-- Receipts -->
        <div v-if="activeTab === 'receipts'" class="form-grid">
          <div class="input-group">
            <input v-model.number="formData.total_amount" placeholder=" " required />
            <label>Total Amount</label>
          </div>
          <div class="input-group">
            <select v-model="formData.status">
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Paid">Paid</option>
            </select>
            <label>Status</label>
          </div>
        </div>

        <!-- Payments -->
        <div v-if="activeTab === 'payments'" class="form-grid">
          <div class="input-group">
            <select v-model.number="formData.receipt_id" required>
              <option value="" disabled>Select Receipt</option>
              <option v-for="r in receipts" :key="r.receipt_id" v-if="r.status !== 'Paid'" :value="r.receipt_id">
                Receipt #{{ r.receipt_id }} - Customer ID: {{ r.customer_id }} - Total: ₱{{ r.total_amount }}
              </option>
            </select>
            <label>Receipt</label>
          </div>
          <div class="input-group">
            <input type="number" v-model.number="formData.amount_paid" placeholder=" " required />
            <label>Amount Paid</label>
          </div>
          <div class="input-group">
            <input type="date" v-model="formData.payment_date" required />
            <label>Payment Date</label>
          </div>
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
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  position: relative;
  animation: fadeIn 0.2s ease;
}

.modal-card h3 {
  margin: 0 0 1rem;
  font-size: 1.25rem;
  color: #1e293b;
}

form { display: flex; flex-direction: column; gap: 1.25rem; }

label {
  position: absolute;
  left: 15px;
  top: 12px;
  font-size: 0.9rem;
  color: #64748b;
  pointer-events: none;
  transition: 0.2s ease all;
  background: white;
  padding: 0 4px;
}

input, select {
  width: 100%;
  padding: 14px 12px;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  outline: none;
  position: relative;
}

input:focus, select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59,130,246,0.2);
}

input:focus + label,
input:not(:placeholder-shown) + label,
select:focus + label,
select:not([value=""]) + label {
  top: -8px;
  left: 10px;
  font-size: 0.75rem;
  color: #3b82f6;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-cancel {
  background: #ef4444;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}
.btn-cancel:hover { background: #dc2626; }

.btn-save {
  background: #10b981;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}
.btn-save:hover { background: #059669; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.input-group {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 15px;
}

.input-group input,
.input-group select {
  padding: 12px 12px 12px 12px;
  font-size: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: white;
  outline: none;
  transition: 0.2s;
  width: 100%;
}

.input-group input:focus,
.input-group select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.input-group label {
  position: absolute;
  left: 16px;
  top: 12px;
  color: #64748b;
  pointer-events: none;
  transition: 0.2s;
  background: white;
  padding: 0 4px;
  font-size: 0.85rem;
}

.input-group input:focus + label,
.input-group input:not(:placeholder-shown) + label,
.select-wrapper select:focus + label,
.select-wrapper select:not([value=""]) + label {
  top: -8px;
  left: 12px;
  font-size: 0.75rem;
  color: #3b82f6;
}

.select-wrapper {
  position: relative;
}

.select-wrapper select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background: white url("data:image/svg+xml,%3Csvg fill='none' stroke='%2364748b' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E") no-repeat right 12px center;
  background-size: 1em;
  padding-right: 2.5em;
  cursor: pointer;
}
</style>