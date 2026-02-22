<template>
  <div class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">
        {{ item ? 'Edit' : 'Add' }} Item
      </h3>

      <form @submit.prevent="saveItem">
        <input v-model="itemName" placeholder="Item Name" class="input input-bordered w-full mb-2" />
        <input v-model="category" placeholder="Category" class="input input-bordered w-full mb-2" />
        <input v-model="price" type="number" placeholder="Price" class="input input-bordered w-full mb-4" />

        <div class="flex justify-end gap-2">
          <button type="button" @click="$emit('close')" class="btn">Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { supabase } from '../supabase'
import { items } from '../store'

const props = defineProps({ item: Object })

const itemName = ref('')
const category = ref('')
const price = ref('')

watch(() => props.item, (val) => {
  if (val) {
    itemName.value = val.item_name
    category.value = val.category
    price.value = val.price
  }
})

const saveItem = async () => {
  if (props.item) {
    await supabase.from('item').update({
      item_name: itemName.value,
      category: category.value,
      price: price.value
    }).eq('item_id', props.item.item_id)

    const index = items.value.findIndex(i => i.item_id === props.item.item_id)
    items.value[index] = {
      ...items.value[index],
      item_name: itemName.value,
      category: category.value,
      price: price.value
    }
  } else {
    const { data } = await supabase.from('item').insert({
      item_name: itemName.value,
      category: category.value,
      price: price.value
    }).select()

    items.value.push(data[0])
  }

  $emit('close')
}
</script>