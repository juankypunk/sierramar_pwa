<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>

const props = defineProps({
        id_parcela: String,
});
const id_parcela = ref(props.id_parcela);
const config = useRuntimeConfig();
const accessToken = useAccessToken();
const currentRemittance = ref({});
const url_currentremittance = computed(() => {
      return `${config.public.api}/water/currentremittances/parcel`;
    })
     
    
 
  const {data} = useFetch(url_currentremittance.value, {
        headers: {
          Authorization: 'Bearer ' + accessToken.value,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: {
          "id_parcela": id_parcela.value
        },
        onResponse({response}){
          if(response.status===200){
            console.log('response:',response.status);
            console.log('response._data:',response._data[0].id_parcela);
            //console.log('response._data[0].id_parcela:',response._data[0].id_parcela);
            currentRemittance.value = response._data[0];
            console.log('currentRemittance:',currentRemittance.value);
          } 
        },
        onResponseError({request, response, options}){
        }
    })

  onMounted(() => {
    //getCurrentRemittance();
  })

</script>

<template>
  <div>
  {{ currentRemittance.id_parcela }}
    <div role="tabpanel" class="tab-content py-5">
        <div class="stats shadow w-full">
          <div class="stats stats-vertical shadow-xl">
            <div  class="stat w-auto">
              <div class="flex justify-center"><span class="badge">Fecha lectura: {{ currentRemittance.fecha }}</span></div>
              <div class="stat-title flex justify-between">
                <div>
                  Anterior: {{ currentRemittance.l1 }} m3
                </div>
                <div>
                  Actual: {{ currentRemittance.l2 }} m3
                </div>
              </div>
              <div class="stat-value flex justify-center py-5">
                <span class="px-3 text-4xl text-blue-600">{{currentRemittance.m3}} m3</span>
              </div>
              <div v-if="currentRemittance.m3" class="flex justify-center">
                <AguaIndicador  
                  :m3="parseInt(currentRemittance.m3)"
                  :t1="parseInt(currentRemittance.t1)"
                  :t2="parseInt(currentRemittance.t2)"
                />
              </div>
              <div class="stat-desc py-5">
                <div class="flex justify-center gap-5">
                  <div>T1(0-125m3): {{ currentRemittance.m3_t1 }}m3 </div>
                  <div>T2(126-200m3): {{ currentRemittance.m3_t2 }}m3</div>
                  <div>T3(+200): {{ currentRemittance.m3_t3 }}m3</div>
                </div>
              </div>
            </div>
            
            <div class="stat py-5">
              <div class="stat-title">Importe</div>
              <div class="stat-value flex justify-center">
                <div class="px-3 text-4xl text-gray-600">{{currentRemittance.importe}} €</div>
              </div>
              <div class="stat-desc py-10">
                <div>
                    Precio del agua por tramos (IVA 10% incl.):
                </div>
                <div class="flex justify-center gap-2 px-5">
                  <div>T1: {{ currentRemittance.pvpm3 }}€ </div>
                  <div>T2: {{ (currentRemittance.pvpm3 * currentRemittance.f_b).toFixed(3) }}€</div>
                  <div>T3: {{ (currentRemittance.pvpm3 * currentRemittance.f_c).toFixed(3) }}€</div>
                </div>
                <div class="py-5">
                  <div>
                    Importe de los tramos:                
                  </div>
                  <div class="flex justify-center gap-4 px-5">
                    <div>T1: {{ parseFloat(currentRemittance.p_m3_a).toFixed(2) }}€ </div>
                    <div>T2: {{ parseFloat(currentRemittance.p_m3_b).toFixed(2) }}€</div>
                    <div>T3: {{ parseFloat(currentRemittance.p_m3_c).toFixed(2) }}€</div>
                    <div class="px-8">Total: {{ parseFloat(currentRemittance.importe).toFixed(2) }}€</div>
                  </div>
                  
                </div>
                <div>Titular: {{currentRemittance.titular}}</div>
                <div>
                  <div v-if="currentRemittance.iban">
                    Domiciliado en su cuenta terminada en: {{currentRemittance.iban.substr(20).padStart(10,'*')}}                
                  </div>
                </div>      
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

