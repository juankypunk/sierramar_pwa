<script setup>
import {jwtDecode} from "jwt-decode"
definePageMeta({
        middleware: ["auth"],
})
const accessToken = useAccessToken();
const user_data = jwtDecode(accessToken.value);
const id = ref('');
id.value = user_data.id.toString();
console.log('empleado: ',id.value.toString());
</script>

<template>
<div class="container mx-auto">
    <div>
        <span @click="navigateTo('/empleados/fichar')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
        </span>
    </div>
    <h2 class="text-2xl font-bold mb-4 flex justify-center">Incidencias en registro de jornada</h2>
    <EmpleadosIncidents :id="user_data.id.toString()"/> 
</div>
</template>