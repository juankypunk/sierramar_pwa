<script setup>
import {jwtDecode} from "jwt-decode"
definePageMeta({
        middleware: ["auth"],
})
const accessToken = useAccessToken();
const user_data = jwtDecode(accessToken.value);
console.log('empleado: ',user_data.id);
</script>

<template>
<div class="container mx-auto">
    <EmpleadosViewSignings :id="user_data.id.toString()"/> 
</div>
</template>