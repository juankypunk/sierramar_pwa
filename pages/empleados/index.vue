<script setup>
    definePageMeta({
        middleware: ["auth"],
    });
    const route = useRoute();
    useHead({
        title: 'Empleados'
    });
</script>
<template>
    <div class="container mx-auto">
        <h1 class="px-5">Empleados</h1>
        <div >
            <EmpleadosSearch />
        </div>
    </div>
    
</template>