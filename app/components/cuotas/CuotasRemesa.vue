<script setup>
import { kMaxLength } from 'buffer';

const rowdata = ref({});
const config = useRuntimeConfig();
const accessToken = useAccessToken();
const remittances = ref([]);
const fecha_cobro = ref('');
const remittance_result = ref({});
const domicilia_bco = ref(true);
const resetFilter = ref(true);
const statistics_result = ref({});

const url_remittances = computed(() => {
        return config.public.api + `/residents/currentremittances`;
});

const url_remittances_csv = computed(() => {
        return config.public.api + `/residents/currentremittances/csv`;
});

const url_statistics_current_remittances = computed(() => {
        return config.public.api + `/residents/currentremittances/statistics`   
})
    
const url_remesa = computed(() => {
        return config.public.api + `/residents/currentremittances/bankremittance`;
});


const searchQuery = ref('');
const gridColumns = ["id_parcela","titular","cuota","dto","domiciliado"];

function getremittances(){
  const {data,refresh} = useFetch(url_remittances,{
    headers: {
      "Content-Type": "application/json",
      'Authorization': 'Bearer ' + accessToken.value,
      },
    method: 'POST',
    body: {
          "domicilia_bco": domicilia_bco,
          "reset_filter": resetFilter,
    },
    onResponse({ response }) {
        // Process the response data
        if(response.status===200){
            remittances.value = response._data;
        }else if(response.status===204) {
          console.log('no hay datos')
          remittances.value = ''
        }else{  
          //navigateTo('/')
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
                statistics_result.value=response._data;
                console.log('estadisticas de la remesa:',statistics_result.value.fecha);
            }else{
                //navigateTo('/')
                //useRouter().push('/refresh')
            }
        },
        onResponseError({request, response, options}){
            console.log('error onReponseError:',response._data);
            //useRouter().push('/refresh')
        }
    })  
  
  
  const descargaCSV = async () => {
  try {
    const response = await fetch(url_remittances_csv.value, {
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${accessToken.value}`,
      },
      method: 'POST',
      body: JSON.stringify({
        domicilia_bco: domicilia_bco.value,
        reset_filter: resetFilter.value,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `remesa_cuotas_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    
    // Limpieza
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error al descargar CSV:', error);
    // Aquí podrías mostrar un toast o notificación de error
  }
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
            console.log('desde response (remesa cuotas):',response._data);
            remittance_result.value = response._data[0];
            dialog_resultado_remesa_cuotas.showModal();
            descargaRemesa();
        }else if(response.status===204) {
            console.log('no hay datos');
        }else{
            navigateTo('/');
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
})
</script>

<template>
  <div class="container mx-auto">
    <div class="flex justify-between">
      <div>
        <span v-if="statistics_result" class="badge badge-md">Fecha cuota:  {{ statistics_result.fecha }} </span>          
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
        placeholder="Busca por nombre o parcela..."
        label="Titular o parcela" 
        v-model="searchQuery"  
        help="Por ejemplo: 'garc' o '001'" 
        suffix-icon="search"
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
          v-model:rowdata="rowdata"
          table-size="table-xs"
          @update:rowdata="console.log('sin acción')"
          >
        </MyGrid>
      </div>
      <div class="py-2 flex justify-between">
                <div><span class="badge badge-md">Cuotas: {{ new Intl.NumberFormat('es-ES', {
                  minimumFractionDigits: 2, 
                   maximumFractionDigits: 2 
                  }).format(statistics_result.cuota)}} € </span></div>
                
                <div><span class="badge badge-md">Domiciliado: {{ new Intl.NumberFormat('es-ES', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                  }).format(statistics_result.domiciliado)}} € </span></div>
                
                <div><span class="badge badge-md">Pendiente de cobro: {{ new Intl.NumberFormat('es-ES', {
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                  }).format(statistics_result.no_domiciliado)}} € </span></div>

                <div><span class="badge badge-md">Recaudado: {{new Intl.NumberFormat('es-ES', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                  }).format(statistics_result.recaudado)}} € </span></div>
      </div>
      <div class="py-5 flex justify-center">
        <button class="btn" @click="manageRemittances">GENERAR REMESA SEPA</button>
      </div>
    </div>
    <dialog id="dialog_fecha_cobro" class="modal">
          <div class="modal-box">
              <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
              <h3 class="font-bold text-lg">Remesa de cuotas SEPA</h3>
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
              <h3 class="font-bold text-lg">Remesa de cuotas</h3>
              <div v-if="statistics_result.cuota" class="py-4">
                <div>Cuotas: {{ new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format( statistics_result.cuota) }} €</div>
                <div>Domiciliado: {{ new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(statistics_result.domiciliado) }} €</div>
                <div>Pendiente de cobro: {{ new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(statistics_result.no_domiciliado) }} €</div>
                <div>Recaudado: {{ new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(statistics_result.recaudado) }} €</div>
              </div>
              <div class="modal-action">
                  <form method="dialog">
                      <!-- if there is a button in form, it will close the modal -->
                      <button class="btn btn-primary">Aceptar</button>
                  </form>
              </div>
          </div>
    </dialog>
    <dialog id="dialog_resultado_remesa_cuotas" class="modal">
          <div class="modal-box">
              <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
              <h3 class="font-bold text-lg">Remesa de cuotas (SEPA)</h3>
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
                  Importe total: {{ new Intl.NumberFormat('es-ES', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2 
                      }).format(remittance_result.total_importe) }}
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
        <h3 class="font-bold text-lg">Detalles cuota</h3>
        <div v-if="rowdata.id_parcela">
        Detalles cuota
        </div>
      </div>
    </dialog>
  </div>
</template>