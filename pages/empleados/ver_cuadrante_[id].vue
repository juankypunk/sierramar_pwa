<script setup>
    const route= useRoute();
    useHead({
        title: 'Calendar'
    })
    definePageMeta({
        middleware: ["auth"],
    })
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
          <li><a class="active">Cuadrante</a></li>
          <li>
            <NuxtLink :to="{ name: 'empleados-planning_id', params: { id: route.params.id } }">
              Planning
            </NuxtLink>
          </li>
        </ul>
      </div>

      <h1 class="card-title">Cuadrante de <UserName :id="route.params.id" :shortname="true"/></h1>
      <MyCalendar 
        :id="parseInt(route.params.id)"
      />
    </div>
</template>
