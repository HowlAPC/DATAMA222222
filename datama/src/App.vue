<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './lib/supabase'
import RecordForm from './components/RecordForm.vue'
import RecordItem from './components/RecordItem.vue'

const records = ref([])

// GET RECORDS
async function getRecords() {
  const { data } = await supabase.from('tasks').select('*').order('id', { ascending: false })
  records.value = data
}

// INSERT RECORD
async function addRecord(title) {
  const { data } = await supabase.from('tasks').insert([{ title }]).select()
  if (data) records.value.unshift(data[0])
}

// DELETE RECORD
async function deleteRecord(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (!error) records.value = records.value.filter(r => r.id !== id)
}

onMounted(getRecords)
</script>

<template>
  <main>
    <h1>Supabase + Vue CRUD</h1>
    <RecordForm @add="addRecord" />
    <RecordItem 
      v-for="record in records" 
      :key="record.id" 
      :item="record" 
      @remove="deleteRecord" 
    />
  </main>
</template>