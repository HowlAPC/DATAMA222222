<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>Add Item / Service</h2>

      <div class="form-group">
        <label>Name</label>
        <input v-model="name" />
      </div>

      <div class="form-group">
        <label>Price</label>
        <input type="number" v-model="price" />
      </div>

      <div class="form-group">
        <label>Unit (kg / piece)</label>
        <input v-model="unit" />
      </div>

      <div style="display:flex; justify-content:space-between;">
        <button class="btn btn-primary" @click="saveItem">
          Save
        </button>
        <button class="btn btn-danger" @click="$emit('close')">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'

const emit = defineEmits(['close'])

const name = ref('')
const price = ref(0)
const unit = ref('')

async function saveItem() {
  const { error } = await supabase.from('item').insert([
    {
      name: name.value,
      price: price.value,
      unit: unit.value
    }
  ])

  if (!error) {
    emit('close')
    location.reload()
  } else {
    alert(error.message)
  }
}
</script>