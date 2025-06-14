<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
    import { Bar } from 'vue-chartjs'

    definePageMeta({
        middleware: ["auth"],
    });
    useHead({
        title: 'Agua'
    });
    const route= useRoute()
    const config = useRuntimeConfig()
    const accessToken=useAccessToken()
    const fecha_lectura = ref('5-9-2023')
    const anyo_lectura = ref(2023)
    const fechas_quarter = ref([])
    const m3_quarter = ref([])
    const avg_quarter = ref([])
    const resultado_simulacion = ref([])
    const t1 = ref(125)
    const t2 = ref(75)
    const pvp_m3 = ref(0.666)
    const f_a = ref(1)
    const f_b = ref(1.25)
    const f_c = ref(1.50)
    const m3_a = ref(0)
    const m3_b = ref(0)
    const m3_c = ref(0) 
    const pvp_a = ref(0)
    const pvp_b = ref(0)
    const pvp_c = ref(0)
    const m3 = ref(0)
    const v_resultado = ref(0.1)
    const rowdata = ref({})
    const total_simulacion_tramos = ref(0)
    const total_simulacion_lineal = ref(0)
    const avg_m3_simulacion_residentes = ref(0)
    const sum_m3_simulacion_residentes = ref(0)
    const max_m3_simulacion_residentes = ref(0)
    const min_m3_simulacion_residentes = ref(0)
    const count_simulacion_residentes = ref(0)
    const total_simulacion_tramos_anual = ref(0)
    const total_simulacion_lineal_anual = ref(0)
    const avg_m3_simulacion_residentes_anual = ref(0)
    const sum_m3_simulacion_residentes_anual = ref(0)
    const max_m3_simulacion_residentes_anual = ref(0)
    const min_m3_simulacion_residentes_anual = ref(0)
    const count_simulacion_residentes_anual = ref(0)

    const url_statistics = computed(() => {
        return config.public.api + `/water/${fecha_lectura.value}/statistics`  
    })
    const url_statistics_quarter = computed(() => {
        return config.public.api + `/water/statistics/${anyo_lectura.value}/quarter`   
    })
    const url_statistics_anual = computed(() => {
        return config.public.api + `/water/statistics/${anyo_lectura.value}`   
    })
    const url_simulation = computed(() => {
        return config.public.api + `/water/${fecha_lectura.value}/simulation`
    })

    function calcular() {
        m3_a.value = 0
        m3_b.value = 0
        m3_c.value = 0
        if (m3.value <= t1.value) {
            console.log('m3 <= t1:')
            m3_a.value = m3.value
            m3_b.value = 0
            m3_c.value = 0
        }else if (m3.value > t1.value && m3.value <= (t1.value + t2.value)){
            console.log('m3 > t2 && m3 <= (t1 + t2)')
            m3_a.value = t1.value
            m3_b.value = m3.value - t1.value     
        }else{
            console.log('m3 > (t1 + t2)')
            m3_a.value = t1.value
            m3_b.value = t2.value
            m3_c.value = m3.value - (t1.value + t2.value)
        }
        pvp_a.value = pvp_m3.value * f_a.value
        pvp_b.value = pvp_m3.value * f_b.value
        pvp_c.value = pvp_m3.value * f_c.value
        v_resultado.value = (m3_a.value * pvp_a.value) + (m3_b.value * pvp_b.value) + (m3_c.value * pvp_c.value)
        getWaterSimulation()
    }


    const getWaterSimulation = () => {
        const {data } =  useFetch(url_simulation,{
            headers: {
                'Authorization': 'Bearer ' + accessToken.value,
            },
            method: 'POST',
            body: {
                "t1": t1.value,
                "t2": t2.value,
                "pvp_m3": pvp_m3.value,
                "f_a": f_a.value,
                "f_b": f_b.value,
                "f_c": f_c.value
            },
            onResponse({response}){
                console.log('response status simulacion:',response.status)
                if(response.status===201){
                    resultado_simulacion.value = response._data
                }else{
                navigateTo('/refresh')
                }
            },
            onResponseError({request, response, options}){
                console.log('error onReponseError:',response._data);
                //useRouter().push('/refresh')
            }
        })
        getWaterStatistics()
    }

    const getWaterStatistics = () => {
        const {data } = useFetch(url_statistics,{
            headers: {
                'Authorization': 'Bearer ' + accessToken.value,
            },
            method: 'POST',
            body: {
                "t1": t1.value,
                "t2": t2.value,
                "pvp_m3": pvp_m3.value,
                "f_a": f_a.value,
                "f_b": f_b.value,
                "f_c": f_c.value
            },
            key: 'estadisticas_lectura',
            onResponse({response}){
                console.log('response status estadisticas:',response.status)
                if(response.status===200){
                    //const fechas = response._data.map(item => item.fecha)
                    total_simulacion_lineal.value = response._data[0].total_lineal
                    total_simulacion_tramos.value = response._data[0].total_tramos
                    avg_m3_simulacion_residentes.value = response._data[0].avg
                    sum_m3_simulacion_residentes.value = response._data[0].sum
                    max_m3_simulacion_residentes.value = response._data[0].max
                    min_m3_simulacion_residentes.value = response._data[0].min
                    count_simulacion_residentes.value = response._data[0].num_lecturas
                }else{
                    navigateTo('/refresh')
                    //useRouter().push('/refresh')
                }
            },
            onResponseError({request, response, options}){
                console.log('error onReponseError:',response._data);
                //useRouter().push('/refresh')
            }
        })  
        getWaterStatisticsYear()
    }
    
    const getWaterStatisticsYear = () => {
        const {data } = useFetch(url_statistics_anual,{
            headers: {
                'Authorization': 'Bearer ' + accessToken.value,
            },
            method: 'POST',
            body: {
                "t1": t1.value,
                "t2": t2.value,
                "pvp_m3": pvp_m3.value,
                "f_a": f_a.value,
                "f_b": f_b.value,
                "f_c": f_c.value
            },
            key: 'estadisticas_lectura_anyo',
            onResponse({response}){
                console.log('response status estadisticas:',response.status)
                if(response.status===200){
                    //const fechas = response._data.map(item => item.fecha)
                    total_simulacion_lineal_anual.value = response._data[0].total_lineal
                    total_simulacion_tramos_anual.value = response._data[0].total_tramos
                    avg_m3_simulacion_residentes_anual.value = response._data[0].avg
                    sum_m3_simulacion_residentes_anual.value = response._data[0].sum
                    max_m3_simulacion_residentes_anual.value = response._data[0].max
                    min_m3_simulacion_residentes_anual.value = response._data[0].min
                    count_simulacion_residentes_anual.value = response._data[0].num_lecturas
                    getWaterStatisticsQuarter()
                }else{
                    navigateTo('/refresh')
                    //useRouter().push('/refresh')
                }
            },
            onResponseError({request, response, options}){
                console.log('error onReponseError:',response._data);
                //useRouter().push('/refresh')
            }
        })  
    }
    
    const getWaterStatisticsQuarter = () => {
        const {data } = useFetch(url_statistics_quarter,{
            headers: {
                'Authorization': 'Bearer ' + accessToken.value,
            },
            method: 'POST',
            key: 'estadisticas_trimestrales',
            onResponse({response}){
                console.log('response status estadisticas:',response.status)
                if(response.status===200){
                    const fechas = response._data.map(item => item.fecha)
                    const consumption = response._data.map(item => item.m3)
                    const neighbors = response._data.map(item => item.avg)
                    console.log('fechas:',fechas)
                    console.log('m3:',consumption)
                    console.log('avg:',neighbors)
                    fechas_quarter.value = fechas
                    m3_quarter.value = consumption
                    avg_quarter.value = neighbors
                }else{
                    navigateTo('/refresh')
                    //useRouter().push('/refresh')
                }
            },
            onResponseError({request, response, options}){
                console.log('error onReponseError:',response._data);
                //useRouter().push('/refresh')
            }
        })  
    }
        
    onMounted(()=>{
        calcular()
    })

    function showDialog(data){
        detalles_calculo.showModal()
    }
    
    function showResidentSimulation(data){
        console.log(data.m3)
        m3.value= data.m3
        showDialog()
    }
    
    function update_fecha_lectura(){
        console.log('nueva fecha:',fecha_lectura.value)
        //getWaterSimulation()
    }

    const gridColumns = ["parcela", "m3", "lineal", "tramos"]
    const chartData = computed(()=>{
    return {
      labels: fechas_quarter.value,
      datasets: [
        {
            label: 'Consumo (m3)',
            backgroundColor: 'lightblue',
            data: m3_quarter.value,
        },
        {
            label: 'Media (m3)',
            backgroundColor: '#9b9c9d',
            data: avg_quarter.value,
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


</script>

<template>
    <div class="carousel">
        <div id="panel" class="carousel-item w-full flex justify-center"> 
            <div class="px-5"> 
                <div class="stats shadow flex justify-center">
                    <div class="stat">
                        <div class="stat-value">
                            <div class="flex justify-center w-full gap-2">
                                <span class="text-3xl text-blue-600">{{ v_resultado.toFixed(2) }}€</span>
                                <span class="text-3xl text-gray-500">{{ (m3 * pvp_m3).toFixed(2) }}€</span>
                            </div>        
                        </div>
                        <div class="stat-desc">
                            <div class="flex justify-center py-3">
                                <div class="px-5">Tramo 1: <span class="px-1">{{ t1 }} m3</span> </div>
                                <div class="px-5">Tramo 2: <span class="px-1">{{ t1 + t2 }} m3</span> </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="py-5">
                    <p class="">Precio (€/m3): <span class="px-3 text-gray-500">{{ pvp_m3 }}</span> </p>
                    <FormKit
                        v-model="pvp_m3"
                        type="range"
                        label=""
                        min="0"
                        max="1"
                        step="0.001"
                        help="Indica el precio del m3"
                        @update:model-value="calcular()"
                    />
                    <p>Factor zona A: <span class="px-3 text-gray-500"> {{ f_a }} </span></p>
                    <FormKit
                        v-model="f_a"
                        type="range"
                        label=""
                        min="1"
                        max="2"
                        step="0.05"
                        help="Indica el factor para la primera zona de consumo"
                        @update:model-value="calcular()"
                    />
                    <p>Factor zona B: <span class="px-3 text-gray-500"> {{ f_b }} </span></p>
                    <FormKit
                        v-model="f_b"
                        type="range"
                        label=""
                        min="1"
                        max="2"
                        step="0.05"
                        help="Indica el factor para la segunda zona de consumo"
                        @update:model-value="calcular()"
                    />
                    <p>Factor zona C: <span class="px-3 text-gray-500"> {{ f_c }} </span></p>
                    <FormKit
                        v-model="f_c"
                        type="range"
                        label=""
                        min="1"
                        max="2"
                        step="0.05"
                        help="Indica el factor para la tercera zona de consumo"
                        @update:model-value="calcular()"
                    />
                    <p >Consumo: <span class="px-3 text-gray-500"> {{ m3 }} m3 </span></p>
                    <FormKit
                        v-model="m3"
                        type="number"
                        number="integer"
                        label=""
                        help="Indica el consumo"
                        @update:model-value="calcular()"
                    />
                </div>
                <div class="py-0">
                    <progress class="progress progress-success w-24" :value="m3_a" :max="t1"></progress>
                    <progress class="progress progress-warning w-24" :value="m3_b" :max="t2"></progress>
                    <progress class="progress progress-error w-24" :value="m3_c" max="100"></progress>
                </div>
                <div class="px-4 py-0">
                    <span class="px-5">Zona A</span>
                    <span class="px-5">Zona B</span>
                    <span class="px-5">Zona C</span>
                </div>
                <div class="flex justify-center py-2">
                    <button  @click="showDialog()" class="btn btn-wide">Detalles</button> 
                </div>
            </div>
            <dialog id="detalles_calculo" class="modal">
                <div class="modal-box">
                    <form method="dialog">
                        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 class="font-bold text-lg">Detalles</h3>
                    <div class="flex justify-start py-4">
                        <ul>
                            <li>
                                Consumo: {{ m3 }} m3  
                            </li>
                            <li>
                                Tramo 1: {{ t1 }} m3  
                            </li>
                            <li>
                                Tramo 2: {{ t2 }} m3  
                            </li>
                            
                            <li>
                                Precio del m3: {{ pvp_m3 }} €
                            </li>   
                            <li>
                                Consumo en zona A: {{ m3_a }} m3  ({{ pvp_a.toFixed(2) }}€/m3)
                            </li>
                            <li>
                                Consumo en zona B: {{ m3_b }} m3  ({{ pvp_b.toFixed(2) }}€/m3)
                            </li>
                            <li>
                                Consumo en zona C: {{ m3_c }} m3  ({{ pvp_c.toFixed(2) }}€/m3)
                            </li>
                            <li>
                                Importe zona A: {{ (m3_a * pvp_a).toFixed(2) }} €
                            </li>
                            <li>
                                Importe zona B: {{ (m3_b * pvp_b).toFixed(2) }} €
                            </li>
                            <li>
                                Importe zona C: {{ (m3_c * pvp_c).toFixed(2) }} €
                            </li>
                            <li>
                                <progress class="progress progress-success w-24" :value="m3_a" :max="t1"></progress>
                                <progress class="progress progress-warning w-24" :value="m3_b" :max="t2"></progress>
                                <progress class="progress progress-error w-24" :value="m3_c" max="100"></progress>
                            </li>
                            <li class="py-5">
                                
                            </li>
                        </ul>
                    </div>
                </div>
            </dialog>               
        </div>    
        <div id="simulacion" class="carousel-item w-full"> 
            <div class="px-4 py-5">
                <FormKit
                    type="select"
                    label="Lectura para la simulación:"
                    placeholder="Trimestre a simular"
                    name="trimestre"
                    v-model="fecha_lectura"
                    @update:model-value="update_fecha_lectura()"
                    :options="{
                        '2-3-2023': '2023(T1)',
                        '6-6-2023': '2023(T2)',
                        '5-9-2023': '2023(T3)',
                        '7-12-2023': '2023(T4)'
                    }"
                />
                <div class="stats shadow">
                    <div class="stat">
                        <div class="stat-title">Fecha lectura: {{ fecha_lectura }}</div>
                        <div class="stat-value flex flex-col">
                            <span class="px-3 text-6xl text-blue-600">{{ total_simulacion_tramos }}€</span>
                            <span class="px-3 text-6xl text-gray-600">{{ total_simulacion_lineal }}€</span>
                        </div>
                        <div class="stat-desc flex flex-col">
                            <span class="badge badge-lg">avg: {{ avg_m3_simulacion_residentes }}m3</span>
                            <span class="badge badge-lg">sum: {{ sum_m3_simulacion_residentes }}m3</span>
                            <span class="badge badge-lg">max: {{ max_m3_simulacion_residentes }}m3</span>
                            <span class="badge badge-lg">min: {{ min_m3_simulacion_residentes }}m3</span>
                            <span class="badge badge-lg">n: {{ count_simulacion_residentes }}</span>      
                        </div>
                    </div>
                </div>
                <div class="collapse">
                    <input type="checkbox" /> 
                    <div class="collapse-title text-lg font-medium">
                        (Haz click aquí para mostrar/ocultar la lectura)
                    </div>
                    <div class="collapse-content"> 
                        <MyGrid
                        v-if="resultado_simulacion"
                        class=""
                        :data="resultado_simulacion"
                        :columns="gridColumns"
                        v-model:rowdata="rowdata"
                        @update:rowdata="showResidentSimulation(rowdata)"
                    >
                    </MyGrid>
                    </div>
                </div>
            </div>
        </div>
        <div id="anual" class="carousel-item w-full"> 
            <div v-if="resultado_simulacion" class="px-4 py-5">
                <div class="stats shadow flex justify-between">
                    <div class="stat">
                        <div class="stat-title">Año: {{ anyo_lectura }}</div>
                        <div class="stat-value flex justify-center flex-col">
                            <div class="text-6xl text-blue-600">{{ total_simulacion_tramos_anual }}€</div>
                            <div class="text-6xl text-gray-600">{{ total_simulacion_lineal_anual }}€</div>
                        </div>
                        <div class="stat-desc flex flex-col">
                            <span class="badge badge-lg">avg: {{ avg_m3_simulacion_residentes_anual }}m3</span>
                            <span class="badge badge-lg">sum: {{ sum_m3_simulacion_residentes_anual }}m3</span>
                            <span class="badge badge-lg">max: {{ max_m3_simulacion_residentes_anual }}m3</span>
                            <span class="badge badge-lg">min: {{ min_m3_simulacion_residentes_anual }}m3</span>
                            <span class="badge badge-lg">n: {{ count_simulacion_residentes_anual }}</span>      
                        </div>
                    </div>
                </div>
                <div v-if="m3_quarter.length" class="py-5" style="height: 600px; width:auto">
                    <div class="stats shadow flex justify-between">
                        <div class="stat">
                            <div class="stat-title">Distribución anual del consumo ({{ anyo_lectura }})</div>
                            <div class="stat-value flex justify-center flex-col">
                                <Bar :data="chartData" :options="chartOptions" />        
                            </div>
                            <div class="stat-desc flex flex-col">  
                                (haz click en las etiquetas para ocultarlas/mostrarlas)    
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
</template>