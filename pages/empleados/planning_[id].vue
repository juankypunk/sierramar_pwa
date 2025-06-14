<script setup>
definePageMeta({
        middleware: ["auth"]
})
const route = useRoute()
</script>
<template>
  <div class="container mx-auto">
    <div class="px-5 flex gap-4">
        <span @click="navigateTo('/empleados')">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
        </span>
        <span>Empleados</span>
    </div>
    <div class="flex justify-center">
        <ul class="menu menu-horizontal bg-base-100">
            <li>
            <NuxtLink :to="{ name: 'empleados-ver_cuadrante_id', params: { id: route.params.id } }">
              Cuadrante
            </NuxtLink>
          </li>
          <li><a class="active">Planning</a></li>
        </ul>
    </div>   
  </div>
  <div v-if="route.params.id">
    <EmpleadosViewPlanning :id="route.params.id"/>  
  </div>
</template>