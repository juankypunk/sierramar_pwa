<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
    const props = defineProps({
        id_contador: Number,
        m3_input: Boolean
    });
    import { createFetch } from '@vueuse/core';
    import {jwtDecode} from "jwt-decode";
    const config = useRuntimeConfig();
    const accessToken = useAccessToken();
    const user_data = jwtDecode(accessToken.value);
    console.log('user modif:',user_data.name);
    const currentReadingForm = ref({});
    const current_id_contador = ref(1);
    const responded = ref(false);
    const success = ref(false);
    const failed = ref(false);
    const emit = defineEmits(['updated:id_contador']);
    
    
    const url_current_reading = computed(() => {
        return config.public.api + `/water/supply/currentreading/${props.id_contador}`;
    });
    
    const url_readings = computed(() => {
        return config.public.api + `/water/supply/currentreading/`;
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
 
    const getReadings = () =>{
        const {data} = useFetch(url_current_reading,{
            headers: {
                'Authorization': 'Bearer ' + accessToken.value,
                },
            method: 'GET',
            onResponse({ response }) {
                // Process the response data
                if(response.status===200){
                    console.log('desde response currentReading:',response._data[0])
                    console.log('nº de registros:',response._data.length);
                    currentReadingForm.value = response._data[0]  
                    if(!currentReadingForm.value.l2){
                        currentReadingForm.value.m3 = 0
                    } 
                    current_id_contador.value=currentReadingForm.value.id_contador;
                    responded.value=false;
                }else if(response.status===204) {
                    console.log('no hay datos')
                }else{
                    console.log('error en getReadings')
                }
            }
        })
    }

    
    const getCurrentReadings = () => {
        console.log('current_id_contador.value:',current_id_contador.value);
        const {data} = useFetch(url_readings.value+current_id_contador.value,{
            headers: {
                'Authorization': 'Bearer ' + accessToken.value,
                },
            method: 'GET',
            onResponse({ response }) {
                // Process the response data
                if(response.status===200){
                    console.log('desde response currentReading:',response._data[0])
                    currentReadingForm.value = response._data[0]  
                    if(!currentReadingForm.value.l2){
                        currentReadingForm.value.m3 = 0
                    } 
                    current_id_contador.value=currentReadingForm.value.id_contador;
                    responded.value=false;
                }else if(response.status===204) {
                    console.log('no hay datos')
                }else{
                    navigateTo('/refresh')
                }
            }
        })
        
    }

    const setCurrentReadings = () => {
        //currentReadingForm.value.user_modif= user_data.id+' ('+user_data.name.split(" ")[0]+')';
        //console.log('latitud:',coords.value.latitude);
        //console.log('longitud:',coords.value.longitude);
        //currentReadingForm.value.latitud= coords.value.latitude;
        //currentReadingForm.value.longitud= coords.value.longitude;
        const { onFetchResponse, error, data } = useMyFetch(current_id_contador.value+'/update').post(currentReadingForm.value).json();
        onFetchResponse((response)=>{
        console.log('desde onFetchResponse',data.value);
        responded.value = true;
        success.value = true;
        const myTimeout = setTimeout(clearMessage, 2000);  
        emit("updated:id_contador");
        })
    }


    const goBack = () => {
        console.log('atrás');
        current_id_contador.value--;
        console.log('nuevo contador:',current_id_contador.value);
        getCurrentReadings();
    }

    const goForward = () => {
        console.log('adelante');
        current_id_contador.value++;
        console.log('nuevo contador:',current_id_contador.value);
        getCurrentReadings();
    }    

    const resetMeter = () => {
        //currentReadingForm.value.user_modif= user_data.id+' ('+user_data.name.split(" ")[0]+')';
        const { onFetchResponse, error, data } = useMyFetch(current_id_contador.value+'/setmeter').post(currentReadingForm.value).json();
        onFetchResponse((response)=>{
        console.log('desde onFetchResponse',data.value);
        responded.value = true;
        success.value = true;
        const myTimeout = setTimeout(clearMessage, 2000);  
        emit("updated:id_contador");
        })
    }

    function clearMessage(){
      responded.value = false
      success.value = false
    }

    function isValidL2(node){
      var l2 = node.value;
      if(l2 < currentReadingForm.value.l1){
        console.log('l2 es menor que l1')
        currentReadingForm.value.m3=0;
        return false;
      }else if(l2 == currentReadingForm.value.l1){
        console.log('l2 = l1')
        currentReadingForm.value.m3=0;
        return true;
      }else{ // (l2 > l1)
        console.log('l2 > l1');
        currentReadingForm.value.m3=l2-currentReadingForm.value.l1;
        return true;
      }
    }

onMounted(()=>{
    getReadings();
})

onUnmounted(()=>{
    console.log('onUnmounted called!');
})

onBeforeUpdate(()=>{
    console.log('onBeforeUpdated');
    //getReadings();
})

function showHistory(data){
    historial.showModal();
}


function configMeter(){
    contador_dialog.showModal();
}


</script>

<template>
    <div class="container mx-auto">
        <div class="px-5">
            <div class="stats shadow flex justify-center w-full">
                <div class="stat">
                    <div class="flex justify-between">
                        <div>
                            <span v-if="currentReadingForm.id_contador > 1" class="" @click="goBack()">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                                </svg>
                            </span>
                        </div>
                        <span v-if="currentReadingForm.estado ==='A'" @click="configMeter()">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                        </span>
                        <div class="badge badge-md badge-info badge-outline">
                            {{ currentReadingForm.e }}
                            <span class="stat-title px-1">{{ currentReadingForm.id_contador }}</span>
                            <span class="stat-title px-1">{{ currentReadingForm.lugar }}</span>
                        </div>
                        <span @click="showHistory()">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>

                        </span>
                        <div>
                            <span v-if="currentReadingForm.id_contador <  1"  @click="goForward()">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </span>
                        </div>   
                    </div>                
                    <div class="py-5 stat-value flex justify-center">
                        <div class="grid gap-10 grid-cols-2">
                            <div class="text-4xl text-gray-600">{{currentReadingForm.l1 }}</div>
                            <div class="text-4xl text-blue-600">{{currentReadingForm.l2}}</div>
                        </div>        
                    </div>
                    <div class="stat-desc">
                        <div class="flex justify-center gap-2 py-3">
                            <div class="px-5">Lectura anterior</div>
                            <div class="px-5">Lectura actual</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="py-3"></div>
            
            <div class="stats shadow flex justify-center">
                <div class="stat">
                        <FormKit 
                        type="form" 
                        @submit="setCurrentReadings" 
                        v-model="currentReadingForm"
                        submit-label="Actualizar"
                        :submit-attrs="{
                        help: ''
                        }"
                        >
                        <FormKit 
                        type="number" 
                        label="Lectura actual" 
                        name="l2" 
                        number="integer"
                        validation="required|isValidL2"
                        :validation-rules="{isValidL2}"
                        validation-visibility=""
                        :validation-messages="{
                            isValidL2: 'Lectura actual inferior a la anterior'
                        }"
                        autofocus
                        />
                        <FormKit 
                        type="number" 
                        label="m3" 
                        name="m3" 
                        number="integer"
                        :disabled="!m3_input"
                        />
                        <FormKit
                        type="checkbox"
                        label="Contador averiado"
                        name="averiado"
                        />       
                        <FormKit
                        type="textarea"
                        label="Notas:"
                        name="notas"
                        />
                    </FormKit>
                </div>
            </div>       
        </div>
        <dialog id="historial" class="modal">
          <div class="modal-box">
              <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
              <h3 class="font-bold text-lg">Historial de lecturas contador #{{ currentReadingForm.id_contador }}</h3>
              <AguaHistorialRiego v-if="currentReadingForm.id_contador"
                :id_contador="currentReadingForm.id_contador"
                table-size="table-xs"
              />         
              <div class="modal-action">
                  <form method="dialog">
                      <!-- if there is a button in form, it will close the modal -->
                      <button class="btn btn-primary">Aceptar</button>
                  </form>
              </div>
          </div>
        </dialog>
        <dialog id="contador_dialog" class="modal">
          <div class="modal-box">
              <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
              <h3 class="font-bold text-lg">Restablecer contador {{ currentReadingForm.id_contador }}</h3>
              <FormKit 
                        type="number" 
                        label="Nuevo valor" 
                        v-model="currentReadingForm.l1" 
                        number
                        :delay="300"
                        validation-visibility="live"
                        validation="required"
                        autofocus
                        />
               
              <div class="modal-action">
                  <form method="dialog">
                      <!-- if there is a button in form, it will close the modal -->
                      <button @click="resetMeter()" class="btn btn-primary">Aceptar</button>
                  </form>
              </div>
          </div>
        </dialog>
        <div v-if="responded"  class="toast toast-center toast-middle">
        <div v-if="success" class="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Datos actualizados!</span>
        </div>  
        <div v-else class="alert alert-warning">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span>Lo siento, algo ha ido mal 😕</span>
        </div>
    </div>
    </div>

 
</template>