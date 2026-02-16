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
    <EmpleadosViewSignings :id="user_data.id.toString()"/> 
</div>
</template>