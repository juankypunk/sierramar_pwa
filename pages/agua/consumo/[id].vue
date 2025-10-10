<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
    import { Bar } from 'vue-chartjs';
    import { createFetch } from '@vueuse/core';
    import { on } from 'events';
    import {jwtDecode} from "jwt-decode"
    const user_data = ref(jwtDecode(useAccessToken().value))
    const userParcel = ref('');
    const currentRemittance = ref({});
    
    
    definePageMeta({
        middleware: ["auth"],
    });
    useHead({
        title: 'Mi consumo de agua'
    });
    const route= useRoute();
    const config = useRuntimeConfig();
    const accessToken=useAccessToken();
    
    // Comprobar si el usuario tiene acceso a la parcela
    if(user_data.value.agua.includes(route.params.id)){
        console.log('tiene acceso a la parcela:',user_data.value.agua);
        userParcel.value = route.params.id;
    }else{
      console.log('no tiene acceso a la parcela:',user_data.value.agua);
      navigateTo('/');
    }


    const url_currentremittance = computed(() => {
      return `${config.public.api}/water/currentremittances/parcel`;
    })

    const useMyFetch = createFetch({
      baseUrl: url_currentremittance.value,
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

    const getCurrentRemittance = ()=> {
      console.log('el id_parcela es:',userParcel.value);
      const { onFetchResponse, error, data } = useMyFetch('').post({
        "id_parcela": userParcel.value
      }).json();
      onFetchResponse((response)=>{
        console.log('desde onFetchResponse',data.value);
        currentRemittance.value=data.value[0];
    })
  }
    
    onMounted(async () => {
        console.log('desde onMounted');
        getCurrentRemittance();
    })

</script>

<template>
  <div class="container mx-auto">
    <div role="tablist" class="tabs tabs-bordered">
      <input
        type="radio"
        name="my_tabs_1"
        role="tab"
        class="tab"
        :aria-label="'Última lectura: ' + currentRemittance.fecha"
        checked
      />
      <div role="tabpanel" class="tab-content py-5">
        <div class="stats shadow w-full">
          <div v-if="currentRemittance" class="stats stats-vertical shadow-xl">
            <div class="stat w-auto">
              <div class="stat-title flex justify-between">
                <div>
                  Lect. anterior: {{ currentRemittance.l1 }} m3
                </div>
                <div>
                  Lect. actual: {{ currentRemittance.l2 }} m3
                </div>
              </div>
              <div class="stat-value flex justify-center py-5">
                <span class="px-3 text-4xl text-blue-600">
                  {{ currentRemittance.m3 }} m3
                </span>
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
                  <div>
                    T1(0-125m3): {{ currentRemittance.m3_t1 }}m3
                  </div>
                  <div>
                    T2(126-200m3): {{ currentRemittance.m3_t2 }}m3
                  </div>
                  <div>
                    T3(+200): {{ currentRemittance.m3_t3 }}m3
                  </div>
                </div>
              </div>
            </div>

            <div class="stat py-5">
              <div class="stat-title">Importe</div>
              <div class="stat-value flex justify-center">
                <div class="px-3 text-4xl text-gray-600">
                  {{ currentRemittance.importe }} €
                </div>
              </div>
              <div class="stat-desc py-10">
                <div>
                  Desglose del consumo:
                </div>
                <div class="py-5">
                  <table class="table table-sm table-zebra w-full">
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
                        <td>{{ currentRemittance.m3_t1 }} m3</td>
                        <td>
                          {{ (currentRemittance.pvpm3 * currentRemittance.f_a).toFixed(3) }}€
                        </td>
                        <td align="right">
                          {{ parseFloat(currentRemittance.p_m3_a).toFixed(2) }}€
                        </td>
                      </tr>
                      <tr v-if="currentRemittance.m3_t2 > 0">
                        <td>T2 (126-200m3):</td>
                        <td>{{ currentRemittance.m3_t2 }} m3</td>
                        <td>
                          {{ (currentRemittance.pvpm3 * currentRemittance.f_b).toFixed(3) }}€
                        </td>
                        <td align="right">
                          {{ parseFloat(currentRemittance.p_m3_b).toFixed(2) }}€
                        </td>
                      </tr>
                      <tr v-if="currentRemittance.m3_t3 > 0">
                        <td>T3 (&gt;200m3):</td>
                        <td>{{ currentRemittance.m3_t3 }} m3</td>
                        <td>
                          {{ (currentRemittance.pvpm3 * currentRemittance.f_c).toFixed(3) }}€
                        </td>
                        <td align="right">
                          {{ parseFloat(currentRemittance.p_m3_c).toFixed(2) }}€
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="divider"></div>
                  <div class="flex justify-end gap-2 py-2">
                    <div>
                      Subtotal: {{ parseFloat(currentRemittance.subtotal).toFixed(2) }}€
                    </div>
                  </div>
                  <div class="flex justify-end gap-2 py-2">
                    <div>
                      IVA ({{ currentRemittance.iva }}%): {{ parseFloat(currentRemittance.impuesto).toFixed(2) }}€
                    </div>
                  </div>
                  <div class="flex justify-end gap-2">
                    <div>
                      Total: {{ parseFloat(currentRemittance.importe).toFixed(2) }}€
                    </div>
                  </div>
                </div>
                <div>
                  Titular: {{ currentRemittance.titular }}
                </div>
                <div>
                  <div v-if="currentRemittance.iban">
                    Domiciliado en cuenta terminada en:
                    {{ currentRemittance.iban.substr(20).padStart(10, '*') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <input
        type="radio"
        name="my_tabs_1"
        role="tab"
        class="tab"
        aria-label="Historial"
      />
      <div role="tabpanel" class="tab-content py-10">
        <div class="stats shadow w-full">
          <MyGraph v-if="userParcel" :id_parcela="userParcel" />
        </div>
        <div>
          <details class="collapse collapse-arrow">
            <summary class="collapse-title text-xl font-medium">
              Historial de consumo (click para ver)
            </summary>
            <div v-if="userParcel" class="collapse-content">
              <AguaHistorial :id_parcela="userParcel" />
            </div>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>