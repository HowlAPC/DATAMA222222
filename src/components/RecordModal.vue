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
      <form @submit.prevent="handleSubmit">
        <div v-if="activeTab==='customers'">
          <label>First Name</label><input v-model="formData.first_name" required/>
          <label>Last Name</label><input v-model="formData.last_name" required/>
          <label>Contact Number</label><input v-model="formData.contact_number"/>
          <label>Special Instructions</label><input v-model="formData.special_instructions"/>
        </div>
        <div v-if="activeTab==='employees'">
          <label>First Name</label><input v-model="formData.first_name" required/>
          <label>Last Name</label><input v-model="formData.last_name" required/>
          <label>Contact</label><input v-model="formData.contact_number"/>
          <label>Position</label><input v-model="formData.employee_type" placeholder="e.g. Cashier" required/>
          <label>Salary</label><input type="number" v-model.number="formData.salary"/>
        </div>
        <div v-if="activeTab==='items'">
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
          <label>Item Type</label><input v-model="formData.item_type" placeholder="e.g. Laundry Load" required/>
          <label>Fabric</label><input v-model="formData.fabric_type" placeholder="e.g. Cotton"/>
          <label>Weight (kg)</label><input type="number" step="0.1" v-model.number="formData.weight"/>
          <label>Price</label><input type="number" step="0.1" v-model.number="formData.price" required/>
        </div>
        <div v-if="activeTab==='payments'">
          <label>Receipt (Pending/Partial)</label>
          <select v-model.number="formData.receipt_id" required>
            <option value="" disabled>Select Receipt</option>
            <option v-for="r in props.receipts" :key="r.receipt_id" v-if="r.status!=='Paid'" :value="r.receipt_id">
              Receipt #{{ r.receipt_id }} - Customer {{ r.customer_id }} - ₱{{ r.total_amount }}
            </option>
          </select>
          <label>Amount Paid</label><input type="number" step="0.1" v-model.number="formData.amount_paid" required/>
          <label>Payment Date</label><input type="date" v-model="formData.payment_date" required/>
        </div>
        <div class="actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">Cancel</button>
          <button type="submit" class="btn-save" :disabled="loading">{{loading?'Saving...':'Save Record'}}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* RecordModal.vue styles */
.modal-overlay {
  position: fixed; top:0; left:0; width:100%; height:100%;
  background: rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:50;
  opacity:0; animation: fadeIn 0.2s forwards;
}
@keyframes fadeIn { to { opacity:1; } }

.modal-card {
  background:white; padding:1.5rem; border-radius:12px;
  min-width:320px; max-width:480px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}
.modal-card h3 { margin-bottom:0.5rem; font-size:1.3rem; color:#1e293b; }
.modal-card hr { margin-bottom:1rem; border-color:#e2e8f0; }

label { display:block; margin-top:10px; font-weight:500; color:#334155; }
input, select { width:100%; padding:10px; margin-top:4px; border-radius:6px; border:1px solid #cbd5e1; }
input:focus, select:focus { outline:2px solid #3b82f6; border-color:transparent; }

.actions {
  display:flex; justify-content:flex-end; margin-top:1rem; gap:10px;
}
.btn-cancel{ background:#ef4444; color:white; padding:8px 14px; border:none; border-radius:6px; cursor:pointer; }
.btn-cancel:hover{ background:#dc2626; }
.btn-save{ background:#10b981; color:white; padding:8px 14px; border:none; border-radius:6px; cursor:pointer; }
.btn-save:hover{ background:#059669; }
.btn-save:disabled{ background:#a7f3d0; cursor:not-allowed; }
</style>