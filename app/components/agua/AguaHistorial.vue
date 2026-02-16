<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
const props = defineProps({
        id_parcela: String,
        show_notes: Boolean
});

const id_parcela = ref(props.id_parcela);
const rowdata = ref({});
const config = useRuntimeConfig();
const accessToken = useAccessToken();
const readings = ref([]);
const currentDueForm = ref({});
const responded = ref(false);
const success = ref(false);
const failed = ref(false);

const url_readings = computed(() => {
        return config.public.api + `/water/history/${props.id_parcela}/`;
});

const url_receipt = computed(() => {
    return config.public.api + `/water/receipt/${props.id_parcela}/`;
    //return config.public.api + `/pdf`    
    
});

const gridColumns = computed(()=>{
  if (props.show_notes){
    return ["lectura","l1","l2","m3","domiciliado","notas"];
  }else{
    return ["lectura","l1","l2","m3","domiciliado"];
  }
})

const searchQuery = ref('');

// historial de lecturas
  const {data, error} = useFetch(url_readings,{
    headers: {
      'Authorization': `Bearer ${accessToken.value}`,
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
          console.log('error:',response.status);
        }    
      },
   onResponseError({request, response, options}){
        console.log('Uups:',response._data);
        //errorsLogin.value.push('Identificación incorrecta');
        //console.log('en errorsLogin:',errorsLogin.length)
        //console.log('errorsLogin:',errorsLogin.value);
      }  
  })

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
    a.download = `recibo-agua-${rowdata.value.id_parcela}.pdf`; // Nombre del archivo
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
        table-size="table-xs"
        @update:rowdata="showDialog(rowdata)"
    >
    </MyGrid>
    </div>
  
  <dialog id="reading_detail" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
        <AguaDetalleRemesa :rowdata="rowdata" /> 
      <form method="dialog">
      <div class="flex justify-end">
        <button class="btn" @click="getReceipt">Ver recibo (PDF)</button>
      </div>   
    </form>

    </div>
  </dialog>
</div>
</template>