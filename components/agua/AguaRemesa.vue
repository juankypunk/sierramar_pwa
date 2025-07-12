<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
const rowdata = ref({});
const config = useRuntimeConfig();
const accessToken = useAccessToken();
const remittances = ref([]);
const fecha_cobro = ref('');
const ordena_columna = ref('r_id_parcela');
const remittance_result = ref({});
const domicilia_bco = ref(true);
const resetFilter=ref(true);
const statistics_result = ref({});
const pendiente_cobro = ref(0);
const estado_lectura = ref('');
const checkedIds = ref([]);


const url_remittances = computed(() => {
    return config.public.api + `/water/currentremittances`;
});

const url_statistics_current_remittances = computed(() => {
    return config.public.api + `/water/currentremittances/statistics`;   
})

const url_remesa = computed(() => {
    return config.public.api + `/water/bankremittance`;
});

const url_remittances_csv = computed(() => {
    return config.public.api + `/water/currentremittances/csv`;
});

const url_remittances_vat = computed(() => {
    return config.public.api + `/water/currentremittances/vat`;
});

const url_sif = "https://residenciales-sierramar-scp.invo.cash";
const sif_token = ref('');


const searchQuery = ref('');
const gridColumns = ["id_parcela","titular","l1","l2","m3","m3_t1","m3_t2","m3_t3","importe","domiciliado"];


  function sif_login() {
    fetch(`${url_sif}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: config.public.sifEmail, // Use the email from the environment variable
        password: config.public.sifPassword, // Use the password from the environment variable
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.access_token) {
          sif_token.value = data.access_token;
          console.log('SIF login successful:', data);
        } else {
          console.error('SIF login failed:', data);
        }
      })
      .catch((error) => {
        console.error('Error during SIF login:', error);
      });
  }

  function send_data2sif(){
    if(checkedIds.value.length > 0){
      console.log('checkids:',checkedIds.value);
        const {data,refresh} = useFetch(url_remittances_vat, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': 'Bearer ' + accessToken.value,
          },
        method: 'POST',
        body: {
          "selected_ids": checkedIds.value,
          "sif_token": sif_token.value,
        },
        onResponse({ response }) {
            // Process the response data
            if(response.status===200){
                console.log('datos_iva:',response._data.sifResponse);
                if(response._data.sifResponse.success){
                  console.log('Datos enviados correctamente al SIF:', response._data.sifResponse.data.count);
                  // Puedes mostrar un mensaje de éxito o realizar alguna acción adicional
                  alert(`Datos enviados correctamente al SIF: ${response._data.sifResponse.data.count} registros procesados.`);
                }else{
                  console.error('Error al enviar datos al SIF:', response._data.sifResponse);
                  // Puedes mostrar un mensaje de error o realizar alguna acción adicional
                }
            }else if(response.status===204) {
              console.log('no hay datos')
            }else{
              console.log('error al obtener remesas:',response.status);  
              //navigateTo('/refresh')
            }
          }
      })
    }else{
      console.log('no hay ids seleccionados para enviar al SIF');
      alert('No hay ids seleccionados para enviar al SIF');
    }
}

function getremittances(){
  const {data,refresh} = useFetch(url_remittances,{
    headers: {
      "Content-Type": "application/json",
      'Authorization': 'Bearer ' + accessToken.value,
      },
    method: 'POST',
    body: {
          "ordena_columna": ordena_columna,
          "domicilia_bco": domicilia_bco,
          "reset_filter": resetFilter,
    },
    onResponse({ response }) {
        // Process the response data
        if(response.status===200){
            console.log('estado:',response._data[0].estado);
            estado_lectura.value = response._data[0].estado;
            remittances.value = response._data;
        }else if(response.status===204) {
          console.log('no hay datos')
          remittances.value = ''
        }else{
          console.log('error al obtener remesas:',response.status);  
          //navigateTo('/refresh')
        }
      }
  })
}

const {statistics} = useFetch(url_statistics_current_remittances,{
        headers: {
            'Authorization': 'Bearer ' + accessToken.value,
        },
        method: 'GET',
        key: 'estadisticas_lecturas',
        onResponse({response}){
            console.log('response status estadisticas:',response.status)
            if(response.status===200){
                //const fechas = response._data.map(item => item.fecha)
                statistics_result.value=response._data[0];
                pendiente_cobro.value=response._data[0].importe - response._data[0].domiciliado;
                console.log('estadisticas de la remesa:',statistics_result.value.lectura);
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



const descargaCSV = () => {
    fetch(url_remittances_csv.value,{
        headers: {
        "Content-Type": "application/json",
        'Authorization': 'Bearer ' + accessToken.value,
        },
        method: 'POST',
        body: JSON.stringify({
          "ordena_columna": ordena_columna.value,
          "domicilia_bco": domicilia_bco.value,
          "reset_filter": resetFilter.value,
    }),
        //body: JSON.stringify(rowdata.value),
    })
    .then( res => res.blob() )
    .then( blob => {
      var file = window.URL.createObjectURL(blob);
        window.location.assign(file);
        return //res.blob();
      });
}

function showDialog(data){
    remittance_detail.showModal();
}

function muestra_estadisticas(){
  dialog_statistics.showModal();
}

const manageRemittances = () => {
    dialog_fecha_cobro.showModal();
}

const creaRemesa = () => {
  if(fecha_cobro.value){
    const {data} = useFetch(url_remesa,{
    headers: {
        'Authorization': 'Bearer ' + accessToken.value,
        },
    method: 'POST',
    body: {
        "fecha_cobro": fecha_cobro.value,
    },
    onResponse({ response }) {
        // Process the response data
        if(response.status===200){
            console.log('desde response (remesa agua):',response._data);
            remittance_result.value = response._data[0];
            dialog_resultado_remesa_agua.showModal();
            descargaRemesa();
        }else if(response.status===204) {
            console.log('no hay datos');
        }else{
            //navigateTo('/refresh');
        }
        }
    })
  }else{
    console.log('no hay fecha de cobro');
  }
}

const descargaRemesa = () => {
    fetch(url_remesa.value,{
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
    //return res.blob();
}

onMounted(() => {
    console.log(`the component is now mounted.`);
    getremittances();
    sif_login();
})
</script>

<template>
  <div class="container mx-auto">
    <div class="flex justify-between">
      <div>
        <span v-if="statistics_result" class="badge badge-md">Fecha lectura:  {{ statistics_result.lectura }} </span>          
      </div>
      <div class="flex gap-8">
        <span @click="descargaCSV()" class="tooltip" data-tip="descargar CSV">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
        </span> 
        <span @click="muestra_estadisticas()">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.25 7.756a4.5 4.5 0 1 0 0 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </span>
      </div>
    </div>

    <div class="flex justify-start gap-4 place-items-center py-5">
      <FormKit 
        type="search"
        placeholder="Busca por nombre..."
        label="Titular" 
        v-model="searchQuery"  
        help="Por ejemplo: 'garc'" 
        suffix-icon="search"
      />
      <FormKit 
        type="select"
        label="Ordenar por" 
        help="ordena el listado" 
        v-model="ordena_columna"
        @onchange="getremittances"
        :options="{
          'r_id_parcela': 'Parcela',
          'r_m3': 'M3',
        }"
      />
      <div class="px-2">
            <FormKit
            type="checkbox"
            label="Domiciliados"
            help=""
            name="domicilia_bco"
            v-model="domicilia_bco"
            />
        </div>
        <div class="px-2">
            <FormKit
            type="checkbox"
            label="Ver todo"
            help=""
            v-model="resetFilter"
            />
        </div> 
    </div>
    <div v-if="remittances" class="py-5"> 
      <div>    
        <MyGrid
          :data="remittances"
          :columns="gridColumns"
          :filter-key="searchQuery"
          :multiSelect="true"
          v-model:rowdata="rowdata"
          v-model:checkedIds="checkedIds"
          table-size="table-xs"
          @update:rowdata="showDialog()"
          @selected:checkedIds="$event => (checkedIds = $event)"
          >
        </MyGrid>
      </div>
      <div v-if="statistics_result" class="py-2 flex justify-between">
                <div><span class="badge badge-md">Domiciliado: {{ new Intl.NumberFormat('es-ES', { 
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2 
                                  }).format(statistics_result.domiciliado)}} €</span></div>
                <div><span class="badge badge-md">Pendiente de cobro: {{ new Intl.NumberFormat('es-ES', { 
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2 
                                  }).format(pendiente_cobro)}} €</span></div>
                <div><span class="badge badge-md">Total Gral.: {{ new Intl.NumberFormat('es-ES', { 
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2 
                                  }).format(statistics_result.importe)}} €</span></div>
      </div>
      <div v-if="estado_lectura==='R'" class="py-5 flex justify-center gap-4">
        <button class="btn" @click="manageRemittances">GENERAR REMESA SEPA</button>
        <button class="btn" @click="send_data2sif">ENVIAR DATOS</button>
      </div>
    </div>
    <dialog id="dialog_fecha_cobro" class="modal">
          <div class="modal-box">
              <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
              <h3 class="font-bold text-lg">Remesa de agua SEPA</h3>
              <p class="py-4"></p>
              <FormKit
                type="date"
                v-model="fecha_cobro"
                label="Fecha de cobro"
                help=""
                validation="required"
              />     
              <div class="modal-action">
                  <form method="dialog">
                      <!-- if there is a button in form, it will close the modal -->
                      <button @click="creaRemesa" class="btn btn-primary">Aceptar</button>
                  </form>
              </div>
          </div>
    </dialog>
    <dialog id="dialog_statistics" class="modal">
          <div class="modal-box">
              <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
              <h3 class="font-bold text-lg">Remesa de agua</h3>
              <div v-if="statistics_result" class="py-4">
                <div>Domiciliado: {{ new Intl.NumberFormat('es-ES', { 
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2 
                                  }).format(statistics_result.domiciliado)}} €
                </div>
                                  
                <div>Pendiente de cobro: {{ new Intl.NumberFormat('es-ES', { 
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2 
                                  }).format(pendiente_cobro) }} €
                </div>
                <div>Total Gral.: {{ new Intl.NumberFormat('es-ES', { 
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2 
                                  }).format(statistics_result.importe) }} €
                </div>
              </div>
              <div class="modal-action">
                  <form method="dialog">
                      <!-- if there is a button in form, it will close the modal -->
                      <button class="btn btn-primary">Aceptar</button>
                  </form>
              </div>
          </div>
    </dialog>
    <dialog id="dialog_resultado_remesa_agua" class="modal">
          <div class="modal-box">
              <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
              <h3 class="font-bold text-lg">Remesa de agua SEPA</h3>
              <div class="py-4">
                <div>
                  Fecha de cobro: {{ useDateFormat(remittance_result.fecha,'DD-MM-YYYY') }}
                </div>
                <div>
                  Número de recibos: {{ remittance_result.recibos }}
                </div>
                <div>
                  Número de líneas: {{ remittance_result.lineas }}
                </div>
                <div>
                  Importe total:  {{ new Intl.NumberFormat('es-ES', { 
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2 
                                  }).format(remittance_result.total_importe)}} € 
                </div>
              </div>     
              <div class="modal-action">
                  <form method="dialog">
                      <!-- if there is a button in form, it will close the modal -->
                      <button class="btn btn-primary">Aceptar</button>
                  </form>
              </div>
          </div>
    </dialog>
    
    
    <dialog id="remittance_detail" class="modal">
      <div class="modal-box">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 class="font-bold text-lg">Detalles remesa agua</h3>
        <div v-if="rowdata.id_parcela">
          <div class="flex justify-start gap-4">
            <div>Parcela: {{ rowdata.id_parcela }} </div> 
            <div>Titular: {{ rowdata.titular }}</div>
          </div>          
          <div class="flex justify-start gap-4">
            <div>Fecha: {{ rowdata.fecha }} </div> 
            <div>Lect. ant.: {{ rowdata.l1 }}</div>
            <div>Lect. act.: {{ rowdata.l2 }}</div>
          </div>
          <div class="py-2 flex flex-col">
            <div>
              Consumo de agua: {{ rowdata.m3 }}m3
            </div>
            <div class="flex justify-center">
              <AguaIndicador
              :m3="parseInt(rowdata.m3)"
              :t1="parseInt(rowdata.t1)"
              :t2="parseInt(rowdata.t2)"
            />
            </div>
          </div>
          <div class="flex justify-between py-2">
            <div>T1(0-125m3): {{ rowdata.m3_t1 }}m3 </div>
            <div>T2(126-200m3): {{ rowdata.m3_t2 }}m3</div>
            <div>T3(+200): {{ rowdata.m3_t3 }}m3</div>
          </div>
          <div class="py-2">
            Precio del m3 por tramos (IVA 10% incl.):
          </div>
          <div class="flex justify-start gap-6">
            <div>T1: {{ rowdata.pvpm3 }}€ </div>
            <div>T2: {{ parseFloat((rowdata.pvpm3 * rowdata.f_b).toFixed(3)) }}€</div>
            <div>T3: {{ parseFloat((rowdata.pvpm3 * rowdata.f_c).toFixed(3)) }}€</div>
          </div>
          <div class="py-2">
            Importe de los tramos:
          </div>
          <div class="flex justify-start gap-4">
            <div>T1: {{ parseFloat(rowdata.p_m3_a).toFixed(2) }}€ </div>
            <div>T2: {{ parseFloat(rowdata.p_m3_b).toFixed(2) }}€</div>
            <div>T3: {{ parseFloat(rowdata.p_m3_c).toFixed(2) }}€</div>
            <div class="px-12">Total: {{ parseFloat(rowdata.importe).toFixed(2) }}€</div>
          </div>
          <div class="py-2">
            Domiciliado en cuenta:
          </div>
          <div class="flex justify-start gap-4">
            <div>BIC: {{rowdata.bic}}</div>
            <div>IBAN: {{rowdata.iban}}</div>
          </div>
                    
          <div class="py-5">
            <p>Editado por: {{ rowdata.user_modif }}</p>
            <p>Último cambio: {{ rowdata.ult_modif }}</p>
          </div>
        </div>
      </div>
    </dialog>
  </div>
</template>