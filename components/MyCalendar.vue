<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
    import {jwtDecode} from "jwt-decode";
    import VueCal from 'vue-cal';
    import 'vue-cal/dist/vuecal.css';
    import { createFetch } from '@vueuse/core';
    import { useFetch } from '@vueuse/core';
    const props = defineProps({
        id: Number,
    });
    const accessToken=useAccessToken();
    const user_data = jwtDecode(accessToken.value);
    const id = ref(props.id);
    const config = useRuntimeConfig();

    const url_planning = computed(() => {
        if(props.id){
            console.log('hay un id!');
            return config.public.api + `/employees/${props.id}/`; 
        }else{
            return config.public.api + `/employees/`; 
        }
    });

    const url_public_holidays = computed(() => {
        return config.public.api + '/employees/public-holidays'    
    });

    const calendarios = ref([]);
    const calendarSelected = ref('normal');
    const currentEvents = ref([])
    const events = ref([])
    const public_holidays = ref([])
    const holidays = ref([])
    const extra_hours = ref([])
    const scheduled_hours = ref(0)
    const range_start = new Date().subtractDays(60)
    const range_end = range_start.addDays(105)
    const months = ref(['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'])
    const d = new Date()
    const current_year = ref(d.getFullYear())
    const current_month = ref(d.getMonth())
    console.log('range_start:',range_start)
    console.log('range_end:',range_end)
    
    const inicio = computed(() => {
      return new Date(current_year.value,current_month.value)
    })
    const fin = computed(() => {
      return new Date(current_year.value,current_month.value + 1)
    })
      
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

    const getPublicHolidays = () => {   
        const { onFetchResponse, data } = useFetch(url_public_holidays.value,{headers: {'Authorization': 'Bearer ' + accessToken.value,}})
            .post({range_start: range_start,range_end: range_end}).json();
        onFetchResponse((response)=>{
            console.log('festivos:',data.value);
            public_holidays.value = data.value;
            events.value = [...public_holidays.value];
        })
    }
       
    const getEventsLabel = () => {
        // etiquetas de calendarios
        const { onFetchResponse, error, data } = useMyFetch('geteventslabel').get().json();
        onFetchResponse((response)=>{
            console.log('etiquetas:',data.value);
            calendarios.value=data.value;
        })
    }

    const getPlanning = () => {
        // listado de eventos
        const { onFetchResponse, error, data } = useMyFetch('events').post({range_start: range_start,range_end: range_end, label: calendarSelected.value}).json();
        onFetchResponse((response)=>{
            if(response.status===200){
                console.log('desde onFetchResponse',data.value);
                //planning.value=data.value;
                currentEvents.value = data.value;
                events.value = [...public_holidays.value, ...currentEvents.value,];
                if(id.value){
                    getHolidays();
                }
            }else{
                console.log('no hay datos');
            }
        })
    }  
    const getHolidays = () => {
        // listado de eventos
        const { onFetchResponse, error, data } = useMyFetch('holidays').post({range_start: range_start,range_end: range_end}).json();
        onFetchResponse((response)=>{
            if(response.status===201){
                console.log('desde onFetchResponse',data.value);
                //planning.value=data.value;
                holidays.value = data.value;
                events.value = [...public_holidays.value, ...currentEvents.value, ...holidays.value,];
                getExtraHours();
            }else{
                console.log('no hay datos de vacaciones');
            }
        })
    }  

    const getExtraHours = () => {
        // listado de eventos
        const { onFetchResponse, error, data } = useMyFetch('extrahours').post({range_start: range_start,range_end: range_end}).json();
        onFetchResponse((response)=>{
            if(response.status===201){
                console.log('desde onFetchResponse',data.value);
                //planning.value=data.value;
                extra_hours.value = data.value;
                events.value = [...public_holidays.value, ...currentEvents.value, ...holidays.value, ...extra_hours.value];
                //fetchPublicHolidays();
            }else{
                console.log('no hay datos');
                alert('no hay eventos');
            }
        })
    }  

    onMounted(() => {
        console.log(`the component is now mounted`);
        getPublicHolidays();
        getEventsLabel();
        //getPlanning();
    })    
</script>

<template>
    <div class="container mx-auto">
      <FormKit v-if="calendarios"
            type="select"
            label="Calendarios disponibles"
            placeholder=""
            v-model="calendarSelected"
            :options="calendarios"
            @update:model-value="getPlanning"
          />
        <vue-cal 
            hide-view-selector
            locale="es"
            class="vuecal--blue-theme"
            active-view="week"
            showAllDayEvents="false"
            :disable-views="['years', 'year']"
            events-on-month-view="short"
            :events = events
            @ready="getPlanning"
            style="height: 600px"
            >
        </vue-cal>    
    </div>
</template>

<style>
/* Different color for different event types. */
.vuecal__event.vig_577 {background-color: rgba(132, 200, 245, 0.966);border: 1px solid rgb(139, 155, 187);color: #fff;}
.vuecal__event.vig_571 {background-color: rgba(226, 191, 241, 0.9);border: 1px solid rgba(166, 148, 184, 0.808);color: #fff;}
.vuecal__event.vig_573 {background-color: rgb(155, 216, 143);border: 1px solid rgb(190, 230, 186);color: #fff;}
.vuecal__event.extraHours {background-color: rgb(231, 199, 92);border: 1px solid rgb(223, 230, 186);color: #fff;}
.vuecal__event.holidays {background-color: rgb(231, 199, 92);border: 1px solid rgb(223, 230, 186);color: #fff;}

.vuecal--month-view .vuecal__cell {height: 80px;}
.vuecal--month-view .vuecal__cell-content {
  justify-content: flex-start;
  height: 100%;
  align-items: flex-end;
}
.vuecal--month-view .vuecal__cell-date {padding: 4px;}
.vuecal--month-view .vuecal__no-event {display: none;}

.vuecal--week-view .vuecal__bg .vuecal__event--all-day.publicholiday,
.vuecal--day-view .vuecal__bg .vuecal__event--all-day.publicholiday {right: 50%;}

.vuecal__event.publicholiday {background-color: rgb(216, 145, 143);border: 1px solid rgb(245, 178, 176);color: #fff;}
.vuecal__event.holidays {background-color: rgb(164, 204, 241);border: 1px solid rgb(159, 203, 233);color: #fff;}
</style>