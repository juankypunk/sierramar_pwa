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
    const t1 = ref(125)
    const t2 = ref(75)
    const iva = ref(10)
    const pvp_m3 = ref(0.605)
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
    const base_iva = ref(0)
    const impuesto = ref(0)
    const v_resultado = ref(0.1)

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
        base_iva.value = (m3_a.value * pvp_a.value) + (m3_b.value * pvp_b.value) + (m3_c.value * pvp_c.value)
        impuesto.value = base_iva.value * (iva.value / 100)
        v_resultado.value = base_iva.value + impuesto.value
    }


        
    onMounted(()=>{
        calcular()
    })

    function showDetails(data){
        detalles_calculo.showModal()
    }
    
    function showSetup(data){
        ajustes.showModal()
    } 
    

</script>

<template>
    <div class="container mx-auto px-5">
    <div class="flex justify-center gap-3 px-5 py-5">
        <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold py-5">Calculadora de agua</h1>
            <svg @click="showSetup()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
        </div>
    </div>
        <div class="w-full flex justify-center"> 
            <div class="px-5"> 
                <div class="stats shadow flex justify-center">
                    <div class="stat">
                        <div class="stat-value">
                            <div class="flex justify-center w-full gap-2">
                                <span class="text-4xl text-blue-600">{{ (m3 > 0) ? v_resultado.toFixed(2) : 0 }}€</span>
                            </div>        
                        </div>
                    </div>
                </div>
                <div class="py-10">
                    <p >Consumo de agua: <span class="px-3 text-gray-500"> {{ m3 }} m3 </span></p>
                    <FormKit
                        v-model="m3"
                        type="number"
                        number="integer"
                        label=""
                        help="Indica el consumo"
                        @update:model-value="calcular()"
                    />
                </div>
                <div v-if="m3 > 0" class="flex justify-center">
                    <AguaIndicador
                        :m3="parseInt(m3)"
                        :t1="parseInt(t1)"
                        :t2="parseInt(t2)"
                    />
                </div>
                <div v-if="m3 > 0" class="px-4 py-0">
                    <span class="px-5">{{ m3_a }} m3</span>
                    <span class="px-5">{{ m3_b }} m3</span>
                    <span class="px-5">{{ m3_c }} m3</span>
                </div>
                <div class="flex justify-center py-2">
                    <button  @click="showDetails()" class="btn btn-wide">Detalles</button> 
                </div>
            </div>

                           
        </div>    
    </div>
    <dialog id="ajustes" class="modal">
        <div class="modal-box">
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 class="font-bold text-lg">Ajustes</h3>
            <div class="py-5">
                    <p>IVA (%): <span class="px-3 text-gray-500">{{ iva }}</span> </p>
                    <FormKit
                        v-model="iva"
                        type="number"
                        label=""
                        help="Indica el IVA"
                        @update:model-value="calcular()"
                    />
                    <p>Precio del agua (€/m3): <span class="px-3 text-gray-500">{{ pvp_m3 }}</span> </p>
                    <FormKit
                        v-model="pvp_m3"
                        type="number"
                        label=""
                        help="Indica el precio del m3"
                        @update:model-value="calcular()"
                    />
                    <p>Tramo 1: <span class="px-3 text-gray-500"> {{ t1 }} </span></p>
                    <FormKit
                        v-model="t1"
                        type="number"
                        number="integer"
                        label=""
                        help="Indica el tramo 1 en m3"
                        @update:model-value="calcular()"
                    />
                    <p>Tramo 2: <span class="px-3 text-gray-500"> {{ t2 }} </span></p>
                    <FormKit
                        v-model="t2"
                        type="number"
                        number="integer"
                        label=""
                        help="Indica el tramo 2 en m3"
                        @update:model-value="calcular()"
                    />

                    <p>Factor Tramo 1: <span class="px-3 text-gray-500"> {{ f_a }} </span></p>
                    <FormKit
                        v-model="f_a"
                        type="number"
                        label=""
                        help="Indica el factor para la primera zona de consumo"
                        @update:model-value="calcular()"
                    />
                    <p>Factor Tramo 2: <span class="px-3 text-gray-500"> {{ f_b }} </span></p>
                    <FormKit
                        v-model="f_b"
                        type="number"
                        label=""
                        help="Indica el factor para la segunda zona de consumo"
                        @update:model-value="calcular()"
                    />
                    <p>Factor Tramo 3: <span class="px-3 text-gray-500"> {{ f_c }} </span></p>
                    <FormKit
                        v-model="f_c"
                        type="number"
                        label=""
                        help="Indica el factor para la tercera zona de consumo"
                        @update:model-value="calcular()"
                    />                    
                </div>
        </div>
    </dialog>

    <dialog id="detalles_calculo" class="modal">
        <div class="modal-box">
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 class="font-bold text-lg">Desglose del consumo</h3>
            <div v-if="m3 > 0" class="flex justify-center">
              <AguaIndicador
              :m3="parseInt(m3)"
              :t1="parseInt(t1)"
              :t2="parseInt(t2)"
            />
            </div>
            <div v-if="m3 > 0" class="flex justify-center px-4 py-0">
                    <span class="px-5">{{ m3_a }} m3</span>
                    <span class="px-5">{{ m3_b }} m3</span>
                    <span class="px-5">{{ m3_c }} m3</span>
            </div>
            <table class="table table-md table-zebra w-full">
            <thead>
                <tr>
                <th>Tramo</th>
                <th>m3</th>
                <th>Precio</th>
                <th>Importe</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td>T1 (0-125m3):</td>
                <td>{{ m3_a }} m3</td>
                <td>{{ parseFloat((pvp_m3 * f_a)).toFixed(3) }}€</td>
                <td align="right">{{ parseFloat((m3_a * pvp_a)).toFixed(2) }}€</td>
                </tr>
                <tr v-if="m3_b > 0">
                <td>T2 (126-200m3):</td>
                <td>{{ m3_b }} m3</td>
                <td>{{ parseFloat((pvp_m3 * f_b)).toFixed(3) }}€</td>
                <td align="right">{{ parseFloat((m3_b * pvp_b)).toFixed(2) }}€</td>
                </tr>
                <tr v-if="m3_c > 0">
                <td>T3 (>200m3):</td>
                <td>{{ m3_c }} m3</td>
                <td>{{ parseFloat((pvp_m3 * f_c)).toFixed(3) }}€</td>
                <td align="right">{{ parseFloat((m3_c * pvp_c)).toFixed(2) }}€</td>
                </tr>
            </tbody>
            </table>
            <div class="divider"></div>
            <div class="flex justify-end gap-2 py-2">
                <div>Subtotal: {{base_iva.toFixed(2) }}€</div>
            </div>
            <div class="flex justify-end gap-2 py-2">
                <div>IVA ({{ iva }}%): {{impuesto.toFixed(2) }}€</div>
            </div>
            <div class="flex justify-end gap-2">
                <div>Total: {{ v_resultado.toFixed(2) }}€</div>
            </div>
        </div>
    </dialog>
</template>