<script setup>
    const route= useRoute();
    const message = computed(()=> `ID en script setup: ${route.params.id}`);
    useHead({
        title: 'Empleados'
    });
</script>

<template>
    <h1>ID en template: {{$route.params.id}}</h1>
    <p>
    
    </p>
<pre>
    
</pre>

</template>