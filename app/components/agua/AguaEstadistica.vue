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
    const remittances = ref([]);
    const rowStatisticsData=ref({});
    const rowReadingData=ref({});
    const rowRemittanceData=ref({});
    const collapseStatistics = ref(null);

    const gridStatisticsColumns = ["lectura","m3","max","min","avg","stddev","importe","domiciliado"];
    const gridReadingsColumns = ["e","id_parcela", "titular","l1","l2","m3","avg","averiado","inactivo","domicilia_bco","importe","notas"];
    const gridRemittancesColumns = ["id_parcela","titular","l1","l2","m3","m3_t1","m3_t2","m3_t3","importe","domiciliado"];

    const fechas = ref([]);
    const consumo = ref([]);
    const importe = ref([]);
    const mediana = ref([]);

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

<<<<<<< HEAD:components/agua/AguaEstadistica.vue
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
            readings.value=data.value.readings;
            remittances.value=data.value.remittances;
=======
    const getReadings = async () => {
        // listado de lectura
        console.log('la fecha listado:', rowStatisticsData.value);
        const { data, error } = await useFetch(url_readings.value, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken.value,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lectura: rowStatisticsData.value.lectura }),
            key: 'lectura_' + rowStatisticsData.value.lectura,
        });
        if (error.value) {
            responded.value = true;
            success.value = false;
            failed.value = true;
            console.log('Error getReadings:', error.value);
        } else if (data.value) {
            readings.value = data.value.readings;
            remittances.value = data.value.remittances;
>>>>>>> development:app/components/agua/AguaEstadistica.vue
            responded.value = true;
            success.value = true;
            failed.value = false;
            const myTimeout = setTimeout(clearMessage, 3000);
            return () => {
                clearTimeout(myTimeout);
<<<<<<< HEAD:components/agua/AguaEstadistica.vue
            }
        })
=======
            };
        }
>>>>>>> development:app/components/agua/AguaEstadistica.vue
    }


    const {data} = useFetch(url_water_statistics_current,{
        headers: {
            'Authorization': 'Bearer ' + accessToken.value,
        },
        method: 'GET',
        onResponse({response}){
            console.log('response status estadisticas:',response._data)
            if(response.status===200){
                statistics.value=response._data;
                console.log('data estadisticas:',response._data);
                rowStatisticsData.value=response._data[0];
                fechas.value = response._data.map(item => item.lectura);
                consumo.value = response._data.map(item => item.m3);
                mediana.value= response._data.map(item => item.mediana)
                importe.value = response._data.map(item => item.importe);
                //getReadings();
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
        console.log('url_water_statistics_current:', url_water_statistics_current.value);
        console.log('accessToken:', accessToken.value);
        //getReadings();
    })
    
    function showReading(){
        detalles_lectura.showModal();
    }
    function showRemittance(){
        detalles_remesa.showModal();
    }


    function clearMessage(){
      responded.value = false
      success.value = false
    }

    function handleStatisticsRowUpdate() {
        if (collapseStatistics.value) {
            collapseStatistics.value.open = false;
        }
        getReadings();
    }


</script>

<template>
    <div class="container mx-auto">
        <div class="p-4" style="height: 400px; width:auto">
            <h2 class="text-3xl font-bold">Historial de consumo</h2>
            <div v-if="consumo.length" class="" >
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


        <div>
            <details ref="collapseStatistics" class="collapse collapse-arrow">
                <summary class="collapse-title text-xl font-medium">Estadísticas de consumo (selecciona aquí una lectura)</summary>
                <div v-if="statistics" class="collapse-content"> 
                    <MyGrid
                        :data="statistics"
                        :columns="gridStatisticsColumns"
                        v-model:rowdata="rowStatisticsData"
                        @update:rowdata="handleStatisticsRowUpdate"
                        table-size="table-xs"
                    >
                    </MyGrid>     
                </div>
            </details>
        </div>

        <div v-if="rowStatisticsData">
            <div class="stats shadow w-full">
                <div class="stat">
                    <div class="stat-title">Consumo de agua RESIDENTES <span class="badge badge-success">{{ rowStatisticsData.lectura }} </span></div>
                    <div class="stat-value flex justify-center gap-6 py-10">
                        <span class="px-3 text-4xl text-blue-600">{{new Intl.NumberFormat('es-ES', { 
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0 
                                  }).format(rowStatisticsData.m3)}} m3</span>
                        <span class="px-3 text-4xl text-gray-400">{{new Intl.NumberFormat('es-ES', { 
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2 
                                  }).format(rowStatisticsData.importe)}} €</span>
                    </div>
                    <div class="stat-desc flex justify-center py-5">
                        <span class="badge badge-lg">max: {{ rowStatisticsData.max}} m3</span>
                        <span class="badge badge-lg">min: {{rowStatisticsData.min }} m3</span>
                        <span class="badge badge-lg">media: {{ rowStatisticsData.avg}} m3</span>
                        <span class="badge badge-lg">mediana: {{ rowStatisticsData.mediana}} m3</span>
                    </div>
                </div>
            </div>
        </div>
        

        <details class="collapse collapse-arrow">
            <summary class="collapse-title text-xl font-medium">Listado lectura <span class="badge">{{ rowStatisticsData.lectura }} </span> (click para abrir)</summary>
           <div class="tabs tabs-border">
                    <input type="radio" name="my_tabs_2" class="tab" aria-label="Lectura" checked="checked" />
                    <div class="tab-content border-base-300 bg-base-100 p-10">
           
            <div v-if="readings.length" class="">
                <MyGrid
                    :data="readings"
                    :columns="gridReadingsColumns"
                    v-model:rowdata="rowReadingData"
                    @update:rowdata="showReading"
                    table-size="table-xs"
                >
                </MyGrid>
            </div>
             </div>
                    <input type="radio" name="my_tabs_2" class="tab" aria-label="Remesa" />
                    <div class="tab-content border-base-300 bg-base-100 p-10">
                    <div v-if="remittances.length" class="">
                        <MyGrid
                            :data="remittances"
                            :columns="gridRemittancesColumns"
                            v-model:rowdata="rowRemittanceData"
                            @update:rowdata="showRemittance"
                            table-size="table-xs"
                        >
                        </MyGrid>
                    </div>
                    </div>
           </div>
        </details>
        
        <dialog id="detalles_lectura" class="modal">
            <div class="modal-box">
                <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <div class="flex justify-center">
                <AguaDetalleLectura :rowdata="rowReadingData"></AguaDetalleLectura>
                </div>
                
            </div>
        </dialog>

        <dialog id="detalles_remesa" class="modal">
            <div class="modal-box">
                <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <div class="flex justify-center">
                    <AguaDetalleRemesa :rowdata="rowRemittanceData"></AguaDetalleRemesa>
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
</div>
</template>