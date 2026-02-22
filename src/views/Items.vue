<template>
  <div class="container">
    <div class="page-title">Items / Services</div>

    <div class="card">
      <button class="btn btn-primary" @click="showModal = true">
        + Add Item
      </button>
    </div>

    <div class="card">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Unit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.item_id">
            <td>{{ item.item_id }}</td>
            <td>{{ item.name }}</td>
            <td>₱ {{ item.price }}</td>
            <td>{{ item.unit }}</td>
            <td>
              <button class="btn btn-danger" @click="deleteItem(item.item_id)">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ItemModal v-if="showModal" @close="showModal = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import ItemModal from '../components/ItemModal.vue'

const items = ref([])
const showModal = ref(false)

async function fetchItems() {
  const { data } = await supabase.from('item').select('*')
  items.value = data
}

async function deleteItem(id) {
  await supabase.from('item').delete().eq('item_id', id)
  fetchItems()
}

onMounted(fetchItems)
</script>