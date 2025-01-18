<template>
  <main class="flex-1 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-satoshi-bold text-text">
        Medication Management
      </h1>
      <button class="bg-blue1 text-white px-4 py-2 rounded-full">
        Add Medication
      </button>
    </div>

    <div class="grid grid-cols-4 gap-4">
      <div class="bg-blue3/30 rounded-2xl p-6 shadow-sm">
        <h3 class="text-md text-text/60 mb-2">Low Stock Alert</h3>
        <p class="text-2xl font-satoshi-bold text-text">5 Items</p>
      </div>
      <div class="bg-blue3/30 rounded-2xl p-6 shadow-sm">
        <h3 class="text-md text-text/60 mb-2">Expiring Soon</h3>
        <p class="text-2xl font-satoshi-bold text-text">3 Items</p>
      </div>
      <div class="bg-blue3/30 rounded-2xl p-6 shadow-sm">
        <h3 class="text-md text-text/60 mb-2">Total Stock Value</h3>
        <p class="text-2xl font-satoshi-bold text-text">$2,340</p>
      </div>
      <div class="bg-blue3/30 rounded-2xl p-6 shadow-sm">
        <h3 class="text-md text-text/60 mb-2">Categories</h3>
        <p class="text-2xl font-satoshi-bold text-text">8</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-8 shadow-sm">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-md font-satoshi-medium text-text">Inventory</h2>
        <div class="flex gap-4">
          <input
            type="search"
            placeholder="Search medications..."
            class="px-4 py-2 rounded-full bg-graytint"
          />
          <select class="px-4 py-2 rounded-full bg-graytint">
            <option>All Categories</option>
            <option>Pain Relief</option>
            <option>Antibiotics</option>
            <option>First Aid</option>
          </select>
        </div>
      </div>

      <table class="w-full">
        <thead>
          <tr class="text-left text-text/60">
            <th class="pb-4">Name</th>
            <th class="pb-4">Category</th>
            <th class="pb-4">Stock</th>
            <th class="pb-4">Unit Price</th>
            <th class="pb-4">Expiry Date</th>
            <th class="pb-4">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="med in medications"
            :key="med.id"
            class="border-t border-graytint"
          >
            <td class="py-4">{{ med.name }}</td>
            <td>{{ med.category }}</td>
            <td>{{ med.stock }}</td>
            <td>${{ med.price }}</td>
            <td>{{ med.expiry }}</td>
            <td>
              <span
                :class="[
                  'px-2 py-1 rounded-full text-sm',
                  med.status === 'In Stock'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800',
                ]"
              >
                {{ med.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<script>
export default {
  name: "Medications",
  data() {
    return {
      medications: [
        {
          id: 1,
          name: "Paracetamol",
          category: "Pain Relief",
          stock: 150,
          price: 5.99,
          expiry: "2024-12-31",
          status: "In Stock",
        },
        {
          id: 2,
          name: "Amoxicillin",
          category: "Antibiotics",
          stock: 50,
          price: 12.99,
          expiry: "2024-06-30",
          status: "Low Stock",
        },
      ],
    };
  },
};
</script>
