<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
const props = defineProps({
        id_parcela: String
});

const id_parcela = ref(props.id_parcela);
const rowdata = ref({});
const config = useRuntimeConfig();
const accessToken = useAccessToken();
const dues = ref([]);
const currentDueForm = ref({});
const responded = ref(false);
const success = ref(false);
const failed = ref(false);

const url_dues = computed(() => {
        return config.public.api + `/residents/${id_parcela.value}/dues`;
});
const url_current_due = computed(() => {
        return config.public.api + `/residents/${id_parcela.value}/currentdue`;
});
const url_receipt = computed(() => {
    return config.public.api + `/residents/${id_parcela.value}/receipt/`;
    //return config.public.api + `/pdf`    
    
});


const searchQuery = ref('');
const gridColumns = ["fecha", "cuota", "dto", "domiciliado"];

function getCurrentDue(){
  // cuota actual 
  const {data} = useFetch(url_current_due,{
    headers: {
      'Authorization': 'Bearer ' + accessToken.value,
      },
    method: 'GET',
    onResponse({ response }) {
        // Process the response data
        if(response.status===200){
            console.log('desde response current_due:',response._data)
            currentDueForm.value = response._data   
        }else if(response.status===204) {
          console.log('no hay datos')
        }else{
          //navigateTo('/refresh')
        }
      }
  })
}

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
          navigateTo('/refresh')
        }
      }
  })
}

function handleSubmit(myData){
        console.log('Submit:',myData)
        const {data}  = useFetch(url_current_due,{
        headers: {
            Authorization: 'Bearer ' + accessToken.value,
        },
        method: 'POST',
        body: currentDueForm,
        onResponse({ request, response, options }) {
        // Process the response data
        console.log('response:', response._data)
        if(response.status === 200){
            console.log('todo bien')
            responded.value = true
            success.value = true
        }else if(response.status==403){
            // token caducado
            navigateTo('/refresh')
        }else{
            console.log('todo mal')
            responded.value = true
            failed.value = true
        }
        }
    })
    }


function getReceipt() {
  fetch(url_receipt.value,{
    headers: {
      "Content-Type": "application/json",
      'Authorization': 'Bearer ' + accessToken.value,
      },
    method: 'POST',
    body: JSON.stringify(rowdata.value),
  })
  .then( res => res.blob() )
  .then( blob => {
   var file = window.URL.createObjectURL(blob);
    window.location.assign(file);
    return res.blob();
  });  
}

function showDialog(data){
    due_detail.showModal();
}

onMounted(() => {
    console.log(`the component is now mounted.`);
    getCurrentDue();
    showdues();
})
</script>

<template>
<div class="container mx-auto">
  
  <div class="px-5 py-5" >
    <p>Fecha cuota: {{ currentDueForm.fecha }}</p>
  </div>
  <div class="px-5">
    <FormKit 
        type="form" 
        @submit="handleSubmit" 
        v-model="currentDueForm"
        submit-label="Actualizar"
        :submit-attrs="{
          help: ''
        }"
        >
        <FormKit 
          type="number" 
          label="Importe de la cuota" 
          name="cuota" 
          number
          step="0.01"
          validation=""
        />
        <FormKit 
          type="number" 
          label="Dto.(%)" 
          name="dto" 
          number
          step="0.01"
          validation=""
        />
        <FormKit
          type="checkbox"
          label="Domicilia cuota"
          name="domicilia_bco"
        />
    </FormKit>
  </div>

  <div v-if="responded">
    <div v-if="success" class="alert alert-success">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>Datos actualizados!</span>
    </div>  
    <div v-else class="alert alert-warning">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <span>Lo siento, algo ha ido mal 😕</span>
    </div>
  </div>
  
  <details class="collapse collapse-arrow">
    <summary class="collapse-title text-xl font-medium">Historial de cuotas (click para ver)</summary>
    <div v-if="dues" class="collapse-content"> 
      <MyGrid
        :data="dues"
        :columns="gridColumns"
        :filter-key="searchQuery"
        v-model:rowdata="rowdata"
        @update:rowdata="showDialog(rowdata)"
    >
    </MyGrid>
    </div>
  </details>
  
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