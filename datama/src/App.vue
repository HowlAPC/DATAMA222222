<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './supabase' // Your Step 3 setup
import RecordForm from './components/RecordForm.vue'
import RecordItem from './components/RecordItem.vue'

const records = ref([])

// FETCH ALL
const fetchRecords = async () => {
  const { data } = await supabase.from('tasks').select('*').order('id', { ascending: false })
  records.value = data
}

// CREATE
const handleAdd = async (title) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ title }])
    .select()
  
  if (!error) records.value.unshift(data[0])
}

// DELETE
const handleDelete = async (id) => {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (!error) {
    records.value = records.value.filter(r => r.id !== id)
  }
}

onMounted(fetchRecords)
</script>

<template>
  <div class="container">
    <h1>Supabase Dashboard</h1>
    
    <RecordForm @add-record="handleAdd" />

    <div class="list-container">
      <RecordItem 
        v-for="item in records" 
        :key="item.id" 
        :record="item" 
        @delete="handleDelete"
      />
    </div>
  </div>
</template>