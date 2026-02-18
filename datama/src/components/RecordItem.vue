<script setup>
// Define what data this component needs
defineProps(['record'])
// Define what actions this component can trigger
const emit = defineEmits(['delete'])
</script>

<template>
  <div class="record-item">
    <span>{{ record.title }}</span>
    <button @click="emit('delete', record.id)" class="btn-delete">
      Delete
    </button>
  </div>
</template>

<style scoped>
.record-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #eee;
}
.btn-delete {
  background: #ff4d4d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>