<script setup>

</script>

<template>
    <div>
        <h1>¡Hola Junta!</h1>
        <p>Por el momento, estas son las aplicaciones disponibles:</p>
        <ul>
            <li>
                <NuxtLink to="/empleados/calendar" class="link">Calendario de conserjes</NuxtLink> 
            </li>
            <li>
                <input type="text"/>
                <NuxtLink to="https://www.google.com/maps/place/Urbanizacion+Sierramar,+55" target="_blank" class="link">Localizar parcela</NuxtLink>                 
            </li>
        </ul>
    </div>
</template>