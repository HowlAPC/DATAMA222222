<template>
  <aside class="w-64 bg-gray-800 text-white h-screen p-4">
    <h1 class="text-xl font-bold mb-6">Laundry Hub</h1>
    <nav class="flex flex-col gap-2">
      <router-link class="p-2 rounded hover:bg-gray-700" to="/">Dashboard</router-link>
      <router-link class="p-2 rounded hover:bg-gray-700" to="/customers">Customers</router-link>
      <router-link class="p-2 rounded hover:bg-gray-700" to="/employees">Employees</router-link>
      <router-link class="p-2 rounded hover:bg-gray-700" to="/items">Items</router-link>
      <router-link class="p-2 rounded hover:bg-gray-700" to="/receipts">Receipts</router-link>
      <router-link class="p-2 rounded hover:bg-gray-700" to="/payments">Payments</router-link>
    </nav>
  </aside>
</template>