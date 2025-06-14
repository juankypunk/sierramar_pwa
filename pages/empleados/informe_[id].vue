<script setup>
definePageMeta({
        middleware: ["auth"],
        layout: "report"
})
const route = useRoute()
const hoy = new Date();
const fechaFormateada = hoy.format('DD-MM-YYYY');


</script>
<template>
  <div class="container mx-auto">
    <div class="flex justify-start">
      <h1 class="px-5">Empresa:</h1>
      <CompanyName />
    </div>    
  </div>
  <EmpleadosViewSignings :id="route.params.id"/>
  <div class="flex justify-center">
    <p class="px-5 py-5">En Sierramar, a {{ fechaFormateada }}</p>
  </div>
  <div class="flex justify-center">
    <div class="px-24">
      <p class="py-24">Firma de la Empresa</p>
    </div>
    <div class="px-24 ">
      <p class="py-24">Firma del Trabajador: <UserName :id="route.params.id" :shortname="false"/></p>
    </div>
  </div>
  

</template>