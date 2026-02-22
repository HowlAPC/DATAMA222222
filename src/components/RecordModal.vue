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

// Reset form structure when tab changes
watch(() => props.activeTab, (tab) => {
  if(tab==='customers') formData.value = { first_name:'', last_name:'', contact_number:'', special_instructions:'' }
  else if(tab==='employees') formData.value = { first_name:'', last_name:'', contact_number:'', employee_type:'', salary:0 }
  else if(tab==='items') formData.value = { customer_id:null, employee_id:null, item_type:'', fabric_type:'', weight:0, price:0 }
  else if(tab==='receipts') formData.value = { total_amount:0, status:'Pending' }
  else if(tab==='payments') formData.value = { receipt_id:null, amount_paid:0, payment_date:new Date().toISOString().split('T')[0] }
  else formData.value = {}
}, { immediate:true })

// --- Handle Submit ---
async function handleSubmit() {
  loading.value = true
  const table = props.activeTab.replace(/s$/,'') // singular

  try {
    if(props.activeTab==='items') {
      if(!formData.value.customer_id || !formData.value.employee_id) {
        alert('Select Customer & Employee'); loading.value=false; return
      }

      // Insert Item
      const { data:itemData, error:itemErr } = await supabase.from('item').insert([formData.value]).select().single()
      if(itemErr) throw itemErr

      const { price, customer_id, employee_id } = formData.value

      // Check pending receipt
      const { data: existing } = await supabase.from('receipt').select('*')
        .eq('customer_id', customer_id)
        .eq('employee_id', employee_id)
        .eq('status','Pending')
        .single()
      
      let receipt_id
      if(!existing) {
        const { data:newRec, error:newErr } = await supabase.from('receipt')
          .insert([{ customer_id, employee_id, total_amount:price, status:'Pending', date_created:new Date().toISOString() }])
          .select().single()
        if(newErr) throw newErr
        receipt_id = newRec.receipt_id
      } else {
        receipt_id = existing.receipt_id
        await supabase.from('receipt').update({ total_amount: existing.total_amount+price })
          .eq('receipt_id', existing.receipt_id)
      }

      // Update item with receipt_id
      await supabase.from('item').update({ receipt_id }).eq('item_id', itemData.item_id)

    } else if(props.activeTab==='payments') {
      const { data: paymentData, error: paymentErr } = await supabase.from('payment').insert([formData.value]).select().single()
      if(paymentErr) throw paymentErr

      const { data: receipt } = await supabase.from('receipt').select('*')
        .eq('receipt_id', formData.value.receipt_id).single()
      
      const { data: totalPaidData } = await supabase.from('payment').select('amount_paid')
        .eq('receipt_id', formData.value.receipt_id)

      const totalPaid = totalPaidData.reduce((s,p)=>s+p.amount_paid,0)
      const status = totalPaid>=receipt.total_amount ? 'Paid':'Partial'

      await supabase.from('receipt').update({status}).eq('receipt_id', formData.value.receipt_id)

    } else {
      const { error } = await supabase.from(table).insert([formData.value])
      if(error) throw error
    }

    emit('refresh'); emit('close')
  } catch(e) {
    alert('Error: '+e.message)
  } finally {
    loading.value=false
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
        <div v-if="activeTab==='customers'">
          <label>First Name</label>
          <input v-model="formData.first_name" required/>
          <label>Last Name</label>
          <input v-model="formData.last_name" required/>
          <label>Contact Number</label>
          <input v-model="formData.contact_number" />
          <label>Special Instructions</label>
          <input v-model="formData.special_instructions" />
        </div>

        <!-- Employees -->
        <div v-if="activeTab==='employees'">
          <label>First Name</label><input v-model="formData.first_name" required/>
          <label>Last Name</label><input v-model="formData.last_name" required/>
          <label>Contact Number</label><input v-model="formData.contact_number" />
          <label>Position</label><input v-model="formData.employee_type" required placeholder="Admin/Cashier/Viewer"/>
          <label>Salary</label><input type="number" v-model.number="formData.salary" />
        </div>

        <!-- Items -->
        <div v-if="activeTab==='items'">
          <label>Customer</label>
          <select v-model.number="formData.customer_id" required>
            <option value="" disabled>Select Customer</option>
            <option v-for="c in props.customers" :key="c.customer_id" :value="c.customer_id">{{c.first_name}} {{c.last_name}}</option>
          </select>
          <label>Employee</label>
          <select v-model.number="formData.employee_id" required>
            <option value="" disabled>Select Employee</option>
            <option v-for="e in props.employees" :key="e.employee_id" :value="e.employee_id">{{e.first_name}} {{e.last_name}}</option>
          </select>
          <label>Item Type</label><input v-model="formData.item_type" required/>
          <label>Fabric</label><input v-model="formData.fabric_type" />
          <label>Weight</label><input type="number" step="0.1" v-model.number="formData.weight"/>
          <label>Price</label><input type="number" step="0.1" v-model.number="formData.price" required/>
        </div>

        <!-- Payments -->
        <div v-if="activeTab==='payments'">
          <label>Receipt (Pending/Partial)</label>
          <select v-model.number="formData.receipt_id" required>
            <option value="" disabled>Select Receipt</option>
            <option v-for="r in props.receipts" :key="r.receipt_id" v-if="r.status!=='Paid'" :value="r.receipt_id">
              Receipt #{{r.receipt_id}} - Total ₱{{r.total_amount}}
            </option>
          </select>
          <label>Amount Paid</label><input type="number" step="0.1" v-model.number="formData.amount_paid" required/>
          <label>Payment Date</label><input type="date" v-model="formData.payment_date" required/>
        </div>

        <div class="actions">
          <button type="button" @click="$emit('close')" class="btn-cancel">Cancel</button>
          <button type="submit" class="btn-save" :disabled="loading">{{loading?'Saving...':'Save'}}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; }
.modal-card { background:white; padding:1.5rem; border-radius:12px; width:400px; max-height:90vh; overflow:auto; }
label { display:block; margin:8px 0 4px; font-weight:500; }
input, select { width:100%; padding:6px 10px; margin-bottom:8px; border:1px solid #ccc; border-radius:6px; }
.actions { display:flex; justify-content:flex-end; gap:8px; margin-top:10px; }
.btn-cancel { background:#ef4444; color:white; border:none; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer; }
.btn-save { background:#10b981; color:white; border:none; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer; }
</style>