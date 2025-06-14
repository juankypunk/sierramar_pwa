<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
const props = defineProps({
        id_contador: Number
});

const rowdata = ref({});
const config = useRuntimeConfig();
const accessToken = useAccessToken();
const readings = ref([]);
const currentDueForm = ref({});
const responded = ref(false);
const success = ref(false);
const failed = ref(false);

const url_readings = computed(() => {
        return config.public.api + `/water/irrigation/readings/${props.id_contador}`;
});


const searchQuery = ref('');
const gridColumns = ["lectura","l1","l2","m3","notas"];
// historial de cuotas
  const {data} = useFetch(url_readings,{
    headers: {
      'Authorization': 'Bearer ' + accessToken.value,
      },
    method: 'GET',
    onResponse({ response }) {
        // Process the response data
        if(response.status===200){
            readings.value = response._data   
        }else if(response.status===204) {
          console.log('no hay datos')
          readings.value = ''
        }else{
          navigateTo('/refresh')
        }
      }
  })


function showDialog(data){
    reading_detail.showModal();
}

onMounted(() => {
    console.log(`the component is now mounted.`);
})
</script>

<template>
<div class="container mx-auto">  
    <div v-if="readings"> 
      <MyGrid
        :data="readings"
        :columns="gridColumns"
        :filter-key="searchQuery"
        v-model:rowdata="rowdata"
        @update:rowdata="showDialog(rowdata)"
    >
    </MyGrid>
    </div>
  
  <dialog id="reading_detail" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg">Detalles de la lectura</h3>
      <div class="flex justify-start py-4">
        <div class="px-4">Fecha: {{ rowdata.lectura }}</div>
        <div class="px-4">m3:  {{ rowdata.m3 }}</div>
        <div class="px-4">notas:  {{ rowdata.notas }}</div>
      </div> 
      <form method="dialog">
      <div class="flex justify-end">
        <button class="btn">Aceptar</button>
      </div>   
    </form>

    </div>
  </dialog>
</div>
</template>