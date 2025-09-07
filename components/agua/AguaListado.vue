<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
import { createFetch } from '@vueuse/core';

const rowdata = ref({});
const config = useRuntimeConfig();
const accessToken = useAccessToken();
const readings = ref([]);
const filtro = ref('sin_filtro');
const estado = ref(['A','R', 'C']);
const estado_lectura = ref('');
const fecha_nueva_lectura = ref('');
const averiado = ref(false);
const inactivo = ref(false);
const domicilia_bco = ref(true);
const resetFilter=ref(false);
const locked = ref(false);
const lectura_completa = ref(false);

const url_readings = computed(() => {
        return config.public.api + `/water`;
});

const url_readings_csv = computed(() => {
        return config.public.api + `/water/currentreading/csv`;
});

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
  //console.log('filtro:',filtro.value);
  averiado.value = (filtro.value=='averiados') ? true : false;
  inactivo.value = (filtro.value=='inactivos') ? true : false;
  domicilia_bco.value = (filtro.value=='sin_domiciliar') ? false : true;
  resetFilter.value = (filtro.value=='sin_filtro') ? true : false;
  // listado de lectura actual
  const { onFetchResponse, error, data } = useMyFetch('/currentreading').post({
          "estado": estado.value,
          "averiado": averiado.value,
          "inactivo": inactivo.value,
          "domicilia_bco": domicilia_bco.value,
          "reset_filter":resetFilter.value
        }).json();
  onFetchResponse((response)=>{
        console.log('desde onFetchResponse',data.value);
        readings.value=data.value;
        const estado_lectura = data.value.map(item => item.l2);
        locked.value = (data.value[0].estado=='C') ? true : false;
        console.log('estados:',estado_lectura);
        if (estado_lectura.includes(null)){
          lectura_completa.value = false;
          console.log('lectura incompleta:');
        }else{
          console.log('lectura completa');
          lectura_completa.value = true;
        }
  })
}

const protectCurrentReadings = () => {
  console.log('cerrado:',locked.value);
  var nuevo_estado = (locked.value) ? 'R' : 'C';
  console.log('nuevo estado:',nuevo_estado);
  const { onFetchResponse, error, data } = useMyFetch('/currentreading/protect').post({estado: nuevo_estado}).json();
  onFetchResponse((response)=>{
    getCurrentReadings();
    locked.value = (readings.value[0].estado=='C') ? true : false;
  })
}

const createNewDateReadings = () => {
  console.log('fecha:',fecha_nueva_lectura.value);
  const { onFetchResponse, error, data } = useMyFetch('/currentreading/newdate').post({fecha: fecha_nueva_lectura.value}).json();
  onFetchResponse((response)=>{
    getCurrentReadings();
    locked.value = (readings.value[0].estado=='C') ? true : false;
  })
}

const updateNewDateReadings = () => {
  console.log('fecha:',fecha_nueva_lectura.value);
  const { onFetchResponse, error, data } = useMyFetch('/currentreading/changedate').post({fecha: fecha_nueva_lectura.value}).json();
  onFetchResponse((response)=>{
    getCurrentReadings();
    locked.value = (readings.value[0].estado=='C') ? true : false;
  })
}

const searchQuery = ref('');
const gridColumns = ["orden","e","id_parcela","titular", "l1","l2","m3","c","media","mediana","importe","notas"];

function showDialog(data){
    lectura_detail.showModal();
}

function manageNewDate(){
  dialog_fecha_lectura.showModal();
}

function updateStatus(id_parcela){
    console.log('received updated from updateStatus!');
    //lectura_detail.close();
    getCurrentReadings();
}

const descargaCSV = async () => {
  try {
    const response = await fetch(url_readings_csv.value, {
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${accessToken.value}`,
      },
      method: 'POST',
      body: JSON.stringify({
        estado: estado.value,
        averiado: averiado.value,
        inactivo: inactivo.value,
        domicilia_bco: domicilia_bco.value,
        reset_filter: resetFilter.value,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lecturas_agua_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    
    // Limpieza
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error al descargar CSV:', error);
    // Aquí podrías mostrar un toast o notificación de error
  }
}



onMounted(() => {
    console.log(`the component is now mounted.`);
    getCurrentReadings();
})
</script>

<template>
  <div class="container mx-auto">
    <div class="flex justify-between">
      <div class="flex gap-4">
        <span v-if="readings.length" class="badge badge-md">{{estado_lectura}} Fecha lectura: {{ readings[0].fecha }}</span>  
        <span v-if="!locked" @click="manageNewDate()" class="tooltip" data-tip="Nueva fecha de lectura">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
          </svg>
        </span>        
      </div>
      <div class="flex gap-8">
        <div @click="descargaCSV()" class="tooltip" data-tip="descargar CSV">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
        </div>
        <div v-if="locked && lectura_completa" class="flex gap-8">
          <span class="tooltip" data-tip="Nueva lectura" @click="manageNewDate()">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </span>
          <span class="tooltip" data-tip="Datos protegidos" @dblclick="protectCurrentReadings()">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
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
    <div class="collapse bg-base-100">
      <input type="checkbox" /> 
      <div class="collapse-title text-xl font-medium">
        Click aquí para filtrar resultados...
      </div>
      <div class="collapse-content"> 
        <div>
            <FormKit 
              type="search"
              placeholder="Busca por nombre o parcela..."
              label="Titular o parcela" 
              v-model="searchQuery"  
              help="Por ejemplo: 'garc' o '001'" 
              suffix-icon="search"
            />
        </div>
        <div class="flex justify-start gap-1">
          <FormKit 
            type="checkbox"
            label="Estado de lectura"
            placeholder="Estado de lectura..."
            v-model="estado"
            :options="[
                {label: '🟢 Sin leer', value:'A'},
                {label: '🟠 Leídas', value:'R'}
              ]"
              @update:model-value="getCurrentReadings()"
          />
          <div class="px-5">
            <FormKit 
            type="radio"
            label="Mostrar"
            v-model="filtro"
            :options="[
                {label: 'Averiados', value:'averiados'},
                {label: 'Inactivos', value:'inactivos'},
                {label: 'Sin domiciliar', value:'sin_domiciliar'},
                {label: 'Ver todos', value:'sin_filtro'},
              ]"
            @update:model-value="getCurrentReadings()"
            />
          </div> 
      </div>
    </div>
  </div>
  <div v-if="readings">   
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
    
    <dialog id="lectura_detail" class="modal">
      <div class="modal-box">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <div v-if="rowdata.id_parcela">
            <AguaLectura
              :id_parcela="rowdata.id_parcela" 
              :m3_input="true"
              :domicilia_bco_input="true"
              :navegable="true"
              @updated:id_parcela="updateStatus()"
            />
        </div>
      </div>
    </dialog>

    <dialog id="dialog_fecha_lectura" class="modal">
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
                      <div v-if="locked">
                        <button @click="createNewDateReadings()" class="btn btn-primary">Crear fecha</button>                      
                      </div>
                      <div v-else>
                        <button @click="updateNewDateReadings()" class="btn btn-primary">Cambiar fecha</button>
                      </div>
                  </form>
              </div>
          </div>
    </dialog>
  </div>
</template>