<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
    import { Bar } from 'vue-chartjs';
    import { createFetch } from '@vueuse/core';
    import { on } from 'events';
    import {jwtDecode} from "jwt-decode"

    definePageMeta({
        middleware: ["auth"],
    });
    useHead({
        title: 'Mis cuotas'
    });

    const route= useRoute();
    const config = useRuntimeConfig();
    const user_data = ref(jwtDecode(useAccessToken().value))
    const userParcel = ref('');
    const accessToken = useAccessToken();

    if(user_data.value.parcela.includes(route.params.id)){
        console.log('tiene acceso a la parcela:',user_data.value.parcela);
        userParcel.value = route.params.id;
    }else{
      console.log('no tiene acceso a la parcela:',user_data.value.parcela);
      navigateTo('/');
    }

    const rowdata = ref({});
    const dues = ref([]);
    const currentDueForm = ref({});
    const responded = ref(false);
    const success = ref(false);
    const failed = ref(false);

    const url_dues = computed(() => {
            return config.public.api + `/residents/${userParcel.value}/dues`;
    });
    
    const url_receipt = computed(() => {
        return config.public.api + `/residents/${userParcel.value}/receipt/`;
        //return config.public.api + `/pdf`    
        
    });


    const searchQuery = ref('');
    const gridColumns = ["fecha", "cuota", "dto", "domiciliado"];

    function showdues() {
      // historial de cuotas
      const {data} = useFetch(url_dues,{
        headers: {
          'Authorization': 'Bearer ' + accessToken.value,
          },
        method: 'GET',
        onResponse({ response }) {
            // Process the response data
            if(response.status===200){
                console.log('desde response en showdues:',response._data)
                dues.value = response._data   
            }else if(response.status===204) {
              console.log('no hay datos')
              dues.value = ''
            }else{
              navigateTo('/')
            }
          }
      })
    }
    function showDialog(data){
      due_detail.showModal();
    }

function getReceipt() {
  fetch(url_receipt.value, {
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${accessToken.value}`,
    },
    method: 'POST',
    body: JSON.stringify(rowdata.value),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.blob();
  })
  .then(blob => {
    // Crear un objeto URL para el blob
    const url = window.URL.createObjectURL(blob);
    // Crear un elemento <a> temporal
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibo-cuota-${userParcel.value}.pdf`; // Nombre del archivo
    document.body.appendChild(a);
    a.click();
    // Limpieza
    window.URL.revokeObjectURL(url);
    a.remove();
  })
  .catch(error => {
    console.error('Error al descargar el PDF:', error);
  });
  
}


    onMounted(async () => {
        console.log('desde onMounted');
        showdues();
    })

</script>

<template>
<div class="container mx-auto">
    <h1 class="text-2xl font-bold mb-4">Mis cuotas</h1>
    
  <div>
    Parcela: {{ userParcel }}
  </div>

  <div v-if="dues"> 
      <MyGrid
        :data="dues"
        :columns="gridColumns"
        :filter-key="searchQuery"
        v-model:rowdata="rowdata"
        @update:rowdata="showDialog(rowdata)"
      >
      </MyGrid>
  </div>

  <dialog id="due_detail" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg">Detalles de la cuota</h3>
      <div class="flex justify-start py-4">
        <div class="px-4">Fecha: {{ rowdata.fecha }}</div>
        <div class="px-4">Cuota:  {{ rowdata.cuota }}</div>
      </div> 
      <form method="dialog">
      <div class="flex justify-end">
        <button class="btn" @click="getReceipt">Ver recibo (PDF)</button>
      </div>   
    </form>

    </div>
  </dialog>
</div>
</template>
