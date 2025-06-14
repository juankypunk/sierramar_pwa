<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
    import { createFetch } from '@vueuse/core';
    const props = defineProps({
        id: String,
    })
    const accessToken = useAccessToken();
    const config = useRuntimeConfig();
    const id = ref(props.id);
    const months = ref(['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']);
    const d = new Date();
    const current_year = ref(d.getFullYear());
    const current_month = ref(d.getMonth());
    const scheduledhours = ref(0);
    const planning = ref([]);
    const calendarios = ref([]);
    const calendarSelected = ref('normal');
    const rowdata = ref({});
    const newEvent=ref({});


    const url_planning = computed(() => {
        return config.public.api + `/employees/${id.value}`; 
    })
    const url_planning_csv = computed(() => {
        return config.public.api + `/employees/${id.value}/getplanningcsv`;  
    })
    const inicio = computed(() => {
        return new Date(current_year.value,current_month.value);
    })
    const fin = computed(() => {
        return new Date(current_year.value,current_month.value + 1);
    })
    
    watch(current_month, (new_month) => {
        console.log(`month_start is ${new_month}`);
        console.log('inicio es:',inicio.value);
        current_month.value=new_month;
        getPlanning();
    })

    function increaseMonth(){
        current_month.value++
        if(current_month.value == 12){
            current_month.value = 0
            current_year.value++
        }
    }

    function decreaseMonth (){
        current_month.value--
        if(current_month.value == -1){
            current_month.value = 11
            current_year.value--
        }
    }

    const searchQuery = ref('')
    const gridColumns = ["fecha", "dia", "inicia", "termina", "duracion","label"]

    const useMyFetch = createFetch({
      baseUrl: url_planning.value,
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
  
    const getEventsLabel = () => {
        // etiquetas de calendarios
        const { onFetchResponse, error, data } = useMyFetch('/geteventslabel').get().json();
        onFetchResponse((response)=>{
            console.log('etiquetas:',data.value);
            calendarios.value=data.value;
        })
    }

    const getPlanning = () => {
        // listado de eventos
        const { onFetchResponse, error, data } = useMyFetch('/planning').post({range_start: inicio.value,range_end: fin.value, label: calendarSelected.value}).json();
        onFetchResponse((response)=>{
            if(response.status===200){
                console.log('desde onFetchResponse',data.value);
                planning.value=data.value;
                getScheduledHours();
            }else{
                console.log('no hay datos');
                workedhours.value = 0;
            }
        })
    }  

    const getScheduledHours = () => {
        // total horas trabajadas
        const { onFetchResponse, error, data } = useMyFetch('/scheduledhours').post({range_start: inicio.value,range_end: fin.value, label: calendarSelected.value}).json();
        onFetchResponse((response)=>{
            console.log('duration',data.value[0].duration);
            scheduledhours.value=data.value[0].duration;
        })
    }  
    
    const updatePlanning = () => {
        const { onFetchResponse, error, data } = useMyFetch(`/updateplanning`).post(rowdata.value);   
        onFetchResponse((response)=>{
            console.log('desde onFetchResponse',response.status);
            if(response.status===200){
                getPlanning();
                currentevent_form.close();
                //responded.value = true;
                //success.value = true;
                //const myTimeout = setTimeout(clearMessage, 2000);
                //getRemittances();
            }
        })
    }
    
    const createEvent = () => {
        console.log('event:',newEvent.value);
        const { onFetchResponse, error, data } = useMyFetch('newevent').post(newEvent.value);   
        onFetchResponse((response)=>{
        console.log('desde onFetchResponse',response.status);
        if(response.status===200){
          //responded.value = true;
          //success.value = true;
          //const myTimeout = setTimeout(clearMessage, 2000);
          newevent_form.close()
          //newEvent.value='';
          getPlanning();
        }
      })
    }   

    const deleteEvent = () => {
        const { onFetchResponse, error, data } = useMyFetch('deleteevent').post(rowdata.value);   
        onFetchResponse((response)=>{
        console.log('desde onFetchResponse',response.status);
        if(response.status===200){
          //responded.value = true;
          //success.value = true;
          //const myTimeout = setTimeout(clearMessage, 2000);
          newevent_form.close()
          //newEvent.value='';
          getPlanning();
        }
      })
    }   


    const getPlanningCSV = () => {
        fetch(url_planning_csv.value,{
            headers: {
            //"Content-Type": "application/json",
            'Authorization': 'Bearer ' + accessToken.value,
            },
            method: 'GET',
            //body: JSON.stringify(rowdata.value),
        })
        .then( res => res.blob() )
        .then( blob => {
            var file = window.URL.createObjectURL(blob);
            window.location.assign(file);
        });
    }  

    function showDialogCurrentEvent(){
        console.log('data current event:',rowdata.value);
        currentevent_form.showModal();
    }

    function showDialogNewEvent(){
        console.log('data current event:',rowdata.value);
        newevent_form.showModal();
    }


    onMounted(() => {
        console.log(`the component is now mounted, id: ${id.value}`);
        getEventsLabel();
        getPlanning();
    })
</script>


<template>
    <div class="container mx-auto">        
        <div class="flex justify-between" >
            <div class="flex justify-start gap-2">
                <h1 class="">Trabajador:</h1>
                <UserName :id="id" :shortname="true" @click=""/>
            </div>
            <div class="flex gap-4">
                <div class="">{{ months[current_month] }} {{ current_year }}</div>
                <div class="tooltip" data-tip="horas previstas">
                    <span class="badge badge-outline">{{ scheduledhours }} horas</span>
                </div>
            </div>
            <div class="flex">
                <span @click="getPlanningCSV()" class="tooltip" data-tip="descargar CSV">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                </span>
            </div>
        </div>
        <div class="flex justify-center py-2 gap-2">
            <div @click="decreaseMonth()" >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                     <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            </div>
            <span class="">
                {{ inicio.format('DD-MM-YYYY') }}
             </span>
            <span>-</span>
            <span class=""> 
                 {{ fin.format('DD-MM-YYYY') }}        
            </span>
            <div @click="increaseMonth()" >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            </div>
            
            
        </div>
        <div class="flex justify-between py-5" >
            <div>
                <FormKit 
                    type="select"
                    label="Calendarios disponibles"
                    placeholder=""
                    v-model="calendarSelected"
                    :options="calendarios"
                    @update:model-value="getPlanning()"
                />
            </div>
            <div class="">
                <button class="btn tooltip" data-tip="Nuevo evento" @click="showDialogNewEvent()">+</button>
            </div>
        </div>
    </div>
    
    <div v-if="planning" class="py-5">
    <MyGrid
        :data="planning"
        :columns="gridColumns"
        :filter-key="searchQuery"
        v-model:rowdata="rowdata"
        table-size="table-sm"
        @update:rowdata="showDialogCurrentEvent()"
    >
    </MyGrid>

    <dialog id="newevent_form" class="modal">
        <div class="modal-box">
        <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 class="font-bold text-lg">Nuevo evento</h3>
        <div class="py-4">
            <FormKit 
            type="form" 
            @submit="createEvent" 
            v-model="newEvent"
            submit-label="Aceptar"
            :actions="true"
            :submit-attrs="{
            help: ''
            }"
            >
            <FormKit
                type="text"
                name="empleado"
                label="Título"
                help=""
            />
            <FormKit
                type="datetime-local"
                name="inicia_formated"
                label="Inicia"
                help=""
            />
            <FormKit
                type="datetime-local"
                name="termina_formated"
                label="Termina"
                help=""
            />
            <FormKit
                type="select"
                name="recurrence"
                label="Repetición"
                :options="[
                {label:'No se repite',value:'none'},
                {label:'Diariamente',value:'daily'},
                {label:'Semanalmente',value:'weekly'},
                {label:'Cada dos semanas',value:'2weeks'},
                {label:'De lunes a viernes',value:'weekdays'},
                {label:'Mensualmente',value:'monthly'},
                ]"
            />
            <FormKit
                type="text"
                name="label"
                label="Etiqueta"
            />
        </FormKit>    
        </div> 
        <form method="dialog">
            <!-- if there is a button in form, it will close the modal -->
        </form>
        </div>
    </dialog>

    <dialog id="currentevent_form" class="modal">
    <div class="modal-box">
      <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg">Detalles del evento <span class="badge badge-md"> # {{rowdata.id}}</span>
      </h3>
      <div>
      </div>
      <div class="py-4">
        <FormKit 
        type="form" 
        @submit="updatePlanning()" 
        v-model="rowdata"
        submit-label="Actualizar"
        :actions="false"
        ignore="true"
        :submit-attrs="{
          help: ''
        }"
        >
            <FormKit
                type="text"
                name="empleado"
                label="Título"
                help=""
            />
            <FormKit
                type="datetime-local"
                name="inicia_formated"
                label="Inicia"
                help=""
            />
            <FormKit
                type="datetime-local"
                name="termina_formated"
                label="Termina"
                help=""
            />
            <FormKit
                type="select"
                name="recurrence"
                label="Repetición"
                :options="[
                {label:'No se repite',value:'none'},
                {label:'Diariamente',value:'daily'},
                {label:'Semanalmente',value:'weekly'},
                {label:'Cada dos semanas',value:'2weeks'},
                {label:'De lunes a viernes',value:'weekdays'},
                {label:'Mensualmente',value:'monthly'},
                ]"
            />
            <FormKit
                type="text"
                name="label"
                label="Etiqueta"
            />
        </FormKit>    
      </div>
      <form method="dialog">    
        <!-- if there is a button in form, it will close the modal -->
        <div class="flex justify-between">
            <button @click="updatePlanning()" class="btn btn-outline btn-info">Aceptar</button>
            <button class="btn">Cancelar</button>
            <button @click="deleteEvent()" class="btn btn-outline btn-error">Eliminar</button>
        </div>
      </form>
    </div>
  </dialog>
  </div>
</template>