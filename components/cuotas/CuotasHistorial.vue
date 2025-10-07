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
    
    const url_statistics_current = computed(() => {
        return config.public.api + `/residents/remittances/statistics`   
    })

    const url_dues = computed(() => {
        return config.public.api + `/residents/dues/history`;
    });

    const statistics = ref([]);
    const dues = ref([]);
    const rowStatisticsData=ref({});
    const rowDuesData=ref({});

    const gridStatisticsColumns = ["fecha","cuota","domiciliado","no_domiciliado","recaudado"];
    const gridDuesColumns = ["e","id_parcela", "titular","cuota","dto","domicilia_bco","domiciliado","notas"];

    const fechas = ref([]);
    const cuotas = ref([]);
    const domiciliados = ref([]);
    const no_domiciliados = ref([]);
    const recaudado = ref([]);

    const responded = ref(false);
    const success = ref(false);
    const failed = ref(false);
    const collapseStatistics = ref(null);



    const chartData = computed(()=>{
        return {
        labels: fechas.value,
        datasets: [
            {
                label: 'Cuota ',
                backgroundColor: 'lightblue',
                data: cuotas.value,
            },
            {
                label: 'Domiciliado ',
                backgroundColor: 'green',
                data: domiciliados.value,
            },
            {
                label: 'No domiciliado ',
                backgroundColor: 'red',
                data: no_domiciliados.value,
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
        baseUrl: url_dues.value,
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

   
    const getDues = () => {
        // listado de cuotas por fecha
        console.log('la fecha listado:',rowStatisticsData.value.fecha);
        console.log('la fecha select:');
        console.log('la url:',url_dues.value);
        const { onFetchResponse, onFetchError, data } = useMyFetch('').post({fecha: rowStatisticsData.value.fecha}).json();
        onFetchResponse((response)=>{
            console.log('desde onFetchResponse',data.value);
            dues.value=data.value;
            responded.value = true;
            success.value = true;
            const myTimeout = setTimeout(clearMessage, 3000);
        })
        onFetchError((error)=>{
            console.log('desde onFetchError',error);
            responded.value = true;
            success.value = false;
            const myTimeout = setTimeout(clearMessage, 3000);
        })

    }


    const {data } = useFetch(url_statistics_current,{
        headers: {
            'Authorization': 'Bearer ' + accessToken.value,
        },
        method: 'GET',
        key: 'estadisticas_cuotas',
        onResponse({response}){
            console.log('response status estadisticas:',response.status)
            console.log('response data estadisticas:',response._data);
            if(response.status===200){
                statistics.value=response._data;
                console.log('statistics:',statistics.value);
                rowStatisticsData.value=response._data[0];
                console.log('rowStatisticsData:',rowStatisticsData.value);
                
                fechas.value = response._data.map(item => item.fecha);
                cuotas.value = response._data.map(item => item.cuota);
                domiciliados.value = response._data.map(item => item.domiciliado);
                no_domiciliados.value = response._data.map(item => item.no_domiciliado);
                console.log('fechas:',fechas.value);
                console.log('cuotas:',cuotas.value);
                console.log('domiciliados:',domiciliados.value);
                console.log('no domiciliados:',no_domiciliados.value);
                getDues();
            }else{
                navigateTo('/')
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
    
    function clearMessage(){
      responded.value = false
      success.value = false
    }

    function handleStatisticsRowUpdate() {
        if (collapseStatistics.value) {
            collapseStatistics.value.open = false;
        }
        getDues();
    }


</script>

<template>
    <div class="container mx-auto">
        
        <div v-if="rowStatisticsData">
            <div class="stats shadow w-full">
                <div class="stat">
                    <div class="stat-title">Cuotas de RESIDENTES <span class="badge">{{ rowStatisticsData.fecha }} </span></div>
                    
                    <div class="stat-value flex justify-center gap-4 py-5">
                        <span class="px-3 text-3xl text-gray-400">
                            <span class="badge badge-lg">cuota</span>
                            {{rowStatisticsData.cuota}} €</span>
                        <span class="px-3 text-3xl text-blue-600">
                            <span class="badge">recaudación</span>
                            {{rowStatisticsData.recaudado}} €</span>
                    </div>
                    <div class="stat-desc flex py-5 justify-center">
                        <span class="badge badge-lg">domiciliado: {{ rowStatisticsData.domiciliado }}</span>
                        <span class="badge badge-lg">no domiciliado: {{ rowStatisticsData.no_domiciliado }}</span>
                    </div>
                </div>
            </div>
        </div>
        

        <div class="" style="height: 400px; width:auto">
            <div class="stats shadow flex justify-between">
                <div class="stat">
                    <div class="stat-title">Distribución anual de las cuotas</div>
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
                <summary class="collapse-title text-xl font-medium">Cuotas recaudadas (click para seleccionar)</summary>
                <div v-if="statistics" class="collapse-content"> 
                    (Haz click sobre una fila para seleccionar una cuota)
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
        

        <details class="collapse collapse-arrow">
            <summary class="collapse-title text-xl font-medium">Listado cuotas <span class="badge">{{ rowStatisticsData.fecha }} </span> (click para abrir)</summary>
            <div v-if="rowDuesData" class="py-10">
                <MyGrid
                    :data="dues"
                    :columns="gridDuesColumns"
                    v-model:rowdata="rowDuesData"
                    @update:rowdata="console.log('hola')"
                    table-size="table-xs"
                >
                </MyGrid>
            </div>
        </details>
        
        
        <dialog id="lectura_fecha" class="modal">
            <div class="modal-box">
                <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <div class="flex justify-center">
                <h3 class="font-bold text-2xl">Lectura fecha {{ rowStatisticsData.fecha}}</h3>
                </div>
                
            </div>
        </dialog>

        <div v-if="responded" class="toast toast-center toast-middle">
            <div v-if="success" class="alert alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Fecha cuota: {{ rowStatisticsData.fecha }}</span>
            </div>  
            <div v-else class="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>Lo siento, algo ha ido mal 😕</span>
            </div>
        </div>
        
    </div>

</template>