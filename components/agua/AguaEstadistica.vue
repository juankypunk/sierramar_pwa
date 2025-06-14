<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
    import { createFetch } from '@vueuse/core';
    import { Bar } from 'vue-chartjs'
    const accessToken = useAccessToken();
    const config = useRuntimeConfig();
    
    const url_water_statistics_current = computed(() => {
        return config.public.api + `/water/statistics/current`   
    })

    const url_readings = computed(() => {
        return config.public.api + `/water/readings`;
    });

    const statistics = ref([]);
    const readings = ref([]);
    const rowStatisticsData=ref({});
    const rowReadingsData=ref({});

    const gridStatisticsColumns = ["lectura","m3","max","min","avg","stddev","importe","domiciliado"];
    const gridReadingsColumns = ["e","id_parcela", "titular","l1","l2","m3","avg","stddev","averiado","inactivo","domicilia_bco","importe","notas"];

    const fechas = ref([]);
    const consumo = ref([]);
    const importe = ref([]);
    const media = ref([]);

    const responded = ref(false);
    const success = ref(false);
    const failed = ref(false);

    const chartData = computed(()=>{
        return {
        labels: fechas.value,
        datasets: [
            {
                label: 'Consumo (m3)',
                backgroundColor: 'lightblue',
                data: consumo.value,
            },
            {
                label: 'Importe (€)',
                backgroundColor: 'lightgray',
                data: importe.value,
            },
        ]
        }
    })

    const chartOptions = computed(()=>{
        return {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'x',
        }
    })

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

    const getReadings = () => {
        // listado de lectura 
        console.log('la fecha listado:',rowStatisticsData.value.lectura);
        //console.log('la fecha select:',fecha_lectura.value);
        const { onFetchResponse, error, data } = useMyFetch('').post({lectura: rowStatisticsData.value.lectura}).json();
        onFetchResponse((response)=>{
            console.log('desde onFetchResponse',data.value);
            readings.value=data.value;
            responded.value = true;
            success.value = true;
            const myTimeout = setTimeout(clearMessage, 3000);
        })
    }


    const {data } = useFetch(url_water_statistics_current,{
        headers: {
            'Authorization': 'Bearer ' + accessToken.value,
        },
        method: 'GET',
        key: 'estadisticas_lecturas',
        onResponse({response}){
            console.log('response status estadisticas:',response.status)
            if(response.status===200){
                statistics.value=response._data;
                rowStatisticsData.value=response._data[0];
                fechas.value = response._data.map(item => item.lectura);
                consumo.value = response._data.map(item => item.m3);
                media.value= response._data.map(item => item.avg)
                importe.value = response._data.map(item => item.importe);
                getReadings();
            }else{
                //navigateTo('/refresh')
                //useRouter().push('/refresh')
            }
        },
        onResponseError({request, response, options}){
            console.log('error onReponseError:',response._data);
            //useRouter().push('/refresh')
        }
    })  

    onMounted(() => {
        console.log(`the component is now mounted.`);
    })
    
    function showReadings(){
        getReadings();
        //lectura_fecha.showModal();
    }

    function clearMessage(){
      responded.value = false
      success.value = false
    }


</script>

<template>
    <div class="container mx-auto">
        <div>
            <details class="collapse collapse-arrow">
                <summary class="collapse-title text-xl font-medium">Lecturas de agua (selecciona una fecha)</summary>
                <div v-if="statistics" class="collapse-content"> 
                    <MyGrid
                        :data="statistics"
                        :columns="gridStatisticsColumns"
                        v-model:rowdata="rowStatisticsData"
                        @update:rowdata="showReadings()"
                        table-size="table-xs"
                    >
                    </MyGrid>     
                </div>
            </details>
        </div>

        <div v-if="rowStatisticsData">
            <div class="stats shadow w-full">
                <div class="stat">
                    <div class="stat-title">Consumo de agua RESIDENTES <span class="badge">{{ rowStatisticsData.lectura }} </span></div>
                    <div class="stat-value flex justify-center gap-6 py-10">
                        <span class="px-3 text-4xl text-blue-600">{{rowStatisticsData.m3}} m3</span>
                        <span class="px-3 text-4xl text-gray-400">{{rowStatisticsData.importe}} €</span>
                    </div>
                    <div class="stat-desc flex justify-center py-5">
                        <span class="badge badge-lg">max: {{ rowStatisticsData.max}}m3</span>
                        <span class="badge badge-lg">min: {{rowStatisticsData.min }}m3</span>
                        <span class="badge badge-lg">avg: {{ rowStatisticsData.avg}}m3</span>
                    </div>
                </div>
            </div>
        </div>
        

        <details class="collapse collapse-arrow">
            <summary class="collapse-title text-xl font-medium">Listado lectura <span class="badge">{{ rowStatisticsData.lectura }} </span> (click para abrir)</summary>
            <div v-if="rowReadingsData" class="py-10">
                <MyGrid
                    :data="readings"
                    :columns="gridReadingsColumns"
                    v-model:rowdata="rowReadingsData"
                    @update:rowdata="console.log('hola')"
                    table-size="table-xs"
                >
                </MyGrid>
            </div>
        </details>
        
        
        <div v-if="consumo.length" class="" style="height: 400px; width:auto">
            <div class="stats shadow flex justify-between">
                <div class="stat">
                    <div class="stat-title">Distribución anual del consumo</div>
                    <div class="stat-value flex justify-center flex-col">
                        <Bar :data="chartData" :options="chartOptions" />        
                    </div>
                    <div class="stat-desc flex flex-col">  
                        (Últimos 5 años)    
                    </div>
                </div>
            </div>
        </div>
        
        <dialog id="lectura_fecha" class="modal">
            <div class="modal-box">
                <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <div class="flex justify-center">
                <h3 class="font-bold text-2xl">Lectura fecha {{ rowStatisticsData.lectura}}</h3>
                </div>
                
            </div>
        </dialog>

        <div v-if="responded" class="toast toast-center toast-middle">
            <div v-if="success" class="alert alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Fecha de lectura: {{ rowStatisticsData.lectura }}</span>
            </div>  
            <div v-else class="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>Lo siento, algo ha ido mal 😕</span>
            </div>
        </div>
        
    </div>
</template>