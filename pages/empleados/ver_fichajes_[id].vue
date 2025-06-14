<script setup>
  import {jwtDecode} from "jwt-decode"
  definePageMeta({
        middleware: ["auth"],
  })
  const route = useRoute()
  const accessToken = useAccessToken()
  const user_data = jwtDecode(accessToken.value)
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
      <li><a class="active">Ver</a></li>
      <div v-if="user_data.roles.includes('dev')">
        <li>
          <NuxtLink :to="{ name: 'empleados-editar_fichajes_id', params: { id: route.params.id } }">
            Editar
          </NuxtLink>
        </li>
      </div>
      <li>
          <NuxtLink :to="{ name: 'empleados-informe_id', params: { id: route.params.id } }">
            Informe
          </NuxtLink>
      </li>
    </ul>
  </div>
  <div>
    <EmpleadosViewSignings :id="route.params.id"/>
  </div>
  
</div>


</template>