<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
//import { kMaxLength } from 'buffer';
import { createFetch } from '@vueuse/core';
import AguaSuministroLectura from './AguaSuministroLectura.vue';

const rowdata = ref({});
const config = useRuntimeConfig();
const accessToken = useAccessToken();
const readings = ref([]);
const estado = ref(['A','R']);
const fecha_nueva_lectura = ref('');
const averiado = ref(false);
const resetFilter=ref(true);
const locked = ref(false);


const url_readings = computed(() => {
        return config.public.api + `/water/supply/currentreading`;
});

const url_readings_csv = computed(() => {
        return config.public.api + `/water/supply/currentreading/csv`;
});

const searchQuery = ref('');
const gridColumns = ["e","id_contador","lugar", "l1","l2","m3","notas"];

const useMyFetch = createFetch({
      baseUrl: url_readings.value,
      options: {
      async beforeFetch({ options }) {
        options.headers.Authorization = `Bearer ${accessToken.value}`
        return { options }
        },
      },
      fetchOptions: {
        mode: 'cors',
      },
})

const getCurrentReadings = () => {
  // listado de lectura actual
  const { onFetchResponse, error, data } = useMyFetch('').post({
          "estado": estado.value,
          "averiado": averiado.value,
          "reset_filter":resetFilter.value
        }).json();
  onFetchResponse((response)=>{
        console.log('desde onFetchResponse',data.value);
        readings.value=data.value;
        locked.value = (data.value[0].estado=='C') ? true : false;
  })
}

  function showDialog(data){
    watersupply_detail.showModal();
  }

  function updateStatus(){
    console.log('updated desde updateStatus');
    //irrigation_detail.close();
    //getReadings();
    getCurrentReadings();
  }

  const descargaCSV = () => {
    fetch(url_readings_csv.value,{
        headers: {
        "Content-Type": "application/json",
        'Authorization': 'Bearer ' + accessToken.value,
        },
        method: 'GET',
        //body: JSON.stringify(rowdata.value),
    })
    .then( res => res.blob() )
    .then( blob => {
      var file = window.URL.createObjectURL(blob);
        window.location.assign(file);
        return //res.blob();
      });
}

const protectCurrentReadings = () => {
  console.log('cerrado:',locked.value);
  var nuevo_estado = (locked.value) ? 'R' : 'C';
  console.log('nuevo estado:',nuevo_estado);
  const { onFetchResponse, error, data } = useMyFetch('protect').post({estado: nuevo_estado}).json();
  onFetchResponse((response)=>{
    getCurrentReadings();
    locked.value = (readings.value[0].estado=='C') ? true : false;
  })
}

function manageNewDate(){
  dialog_water_supply_newdate.showModal()
}

const createNewDateReadings = () => {
  console.log('fecha:',fecha_nueva_lectura.value);
  const { onFetchResponse, error, data } = useMyFetch('newdate').post({fecha: fecha_nueva_lectura.value}).json();
  onFetchResponse((response)=>{
    getCurrentReadings();
    locked.value = (readings.value[0].estado=='C') ? true : false;
  })
}


onMounted(() => {
    console.log(`the component is now mounted.`);
    getCurrentReadings();
})
</script>

<template>
  <div class="container mx-auto">  
    <div v-if="readings"> 
        <div class="flex justify-between">
          <div>
            <span v-if="readings.length" class="badge badge-md">Fecha lectura: {{ readings[0].fecha }}</span>          
          </div>
          <div class="flex gap-8">
            <div @click="descargaCSV()" class="tooltip" data-tip="descargar CSV">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <div v-if="locked" class="flex gap-8">
              <span class="tooltip" data-tip="Datos protegidos" @dblclick="protectCurrentReadings()">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </span>
              <span class="tooltip" data-tip="Nueva lectura" @click="manageNewDate()">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </span>
            </div>
            <div v-else class="tooltip" data-tip="Proteger datos" @dblclick="protectCurrentReadings()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
        </div>
      </div>
      <div class="py-5">
        <MyGrid
          :data="readings"
          :columns="gridColumns"
          :filter-key="searchQuery"
          v-model:rowdata="rowdata"
          table-size="table-xs"
          @update:rowdata="showDialog()"
          >
        </MyGrid>
      </div>
      
    </div>
    
    <dialog id="watersupply_detail" class="modal">
      <div class="modal-box">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        
        <h3 class="font-bold text-lg">Lectura de suministro</h3>
        <div v-if="rowdata.id_contador">
            <AguaSuministroLectura
              :id_contador=rowdata.id_contador
              :m3_input="true"
              @updated:id_contador="updateStatus()"
            />
        </div>
      </div>
    </dialog>

    <dialog id="dialog_water_supply_newdate" class="modal">
          <div class="modal-box">
              <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
              <h3 class="font-bold text-lg">Nueva fecha de lectura</h3>
              <p class="py-4"></p>
              <FormKit
                type="date"
                v-model="fecha_nueva_lectura"
                label="Fecha"
                help=""
                validation="required"
              />     
              <div class="modal-action">
                  <form method="dialog">
                      <!-- if there is a button in form, it will close the modal -->
                      <button @click="createNewDateReadings()" class="btn btn-primary">Aceptar</button>
                  </form>
              </div>
          </div>
    </dialog>
  </div>
</template>