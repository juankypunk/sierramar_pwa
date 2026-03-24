<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
const props = defineProps({
        id: String,
})

const id = ref(props.id)
const months = ref(['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'])
const d = new Date()
const current_year = ref(d.getFullYear())
const current_month = ref(d.getMonth())

const inicio = computed(() => {
  return new Date(current_year.value,current_month.value)
})
const fin = computed(() => {
  return new Date(current_year.value,current_month.value + 1)
})
const inicio_str = computed(() => {
  return inicio.value.toLocaleDateString('es-ES').replace(/\//g, '-')  // DD-MM-YYYY
})
const fin_str = computed(() => {
  return fin.value.toLocaleDateString('es-ES').replace(/\//g, '-')  // DD-MM-YYYY
})

const formStatement = ref({
  incident_id: '',
  id_user: '',
  proposed_entry: '',
  proposed_exit: '',
  statement_text: '',
})
const rowdata = ref({})
console.log('year:',current_year.value)
console.log('month:',current_month.value)

// single ref
watch(current_month, (new_month) => {
  console.log(`month_start is ${new_month}`)  
  console.log('inicio es:',inicio.value)
  getIncidents()
})

  
const config = useRuntimeConfig()
const accessToken = useAccessToken()
const incidentes   = ref([])
const url_incidents = computed(() => {
  return config.public.api + `/employees/${id.value}/getincidents`    
})
const url_statement = computed(() => {
  return config.public.api + `/employees/incidents/createstatement`    
})  

const getIncidents = async () => {
  try {
    const data = await $fetch(url_incidents.value, {
        headers: {
            'Authorization': 'Bearer ' + accessToken.value,
        },
        method: 'POST',
        body: {
            "range_start": inicio.value,
            "range_end": fin.value,
        },
    });
    incidentes.value = data || [];
  } catch (error) {
    console.error('Error al obtener los incidentes:', error);
    incidentes.value = [];
  }
}

const searchQuery = ref('')
const gridColumns = ["fecha","incidencia", "estado"]



function increaseMonth(){
  current_month.value++
  if(current_month.value == 12){
      current_month.value = 0
      current_year.value++
  }
}

function decreaseMonth (){
current_month.value--
if(current_month.value == -1){
    current_month.value = 11
    current_year.value--
  }
}
    
function showDialog(rowdata){
  const dialog = document.getElementById('incident_detail')
  dialog.showModal()
} 

function closeIncidentDialog() {
  document.getElementById('incident_detail').close()
}

function openStatementDialog() {
  closeIncidentDialog()
  document.getElementById('statement_dialog').showModal()
}

function closeStatementDialog() {
  document.getElementById('statement_dialog').close()
}

async function submitStatement(data) {
  data.ip_address = '127.0.0.1'  // Aquí podrías implementar una función para obtener la IP real del cliente si es necesario
  data.user_agent = navigator.userAgent
  
  const config = useRuntimeConfig()
  const accessToken = useAccessToken()
  
  await $fetch(url_statement.value, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + accessToken.value,
    },
    body: {
      incident_id: rowdata.value.id,
      id_user: id.value,
      proposed_entry: data.proposed_entry,
      proposed_exit: data.proposed_exit,
      statement_text: data.statement_text,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
    }
  })
  closeStatementDialog()
  getIncidents()  // Refresca la lista de incidentes para mostrar el nuevo estado
} 

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return isNaN(d.getTime()) ? date : d.toLocaleString('es-ES')
}

const formatDuration = (duration) => {
  if (!duration) return ''
  const num = Number(duration)
  return isNaN(num) ? duration : num.toLocaleString('es-ES')
}

onMounted(() => {
    console.log(`the component is now mounted.`)
    getIncidents()
})
</script>

<template>
<div class="container mx-auto">    
  <div class="flex justify-start py-5">
      <h1 class="px-5">Trabajador:</h1>
      <UserName :id="id" />
  </div>
  <div class="flex justify-start">
    <h1 class="px-5">Periodo:</h1>
    <div @click="decreaseMonth()">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
       <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    </div>
    <span v-if="inicio" class="px-2">
      {{ inicio_str }}
    </span>
    <span>-</span>
    <span v-if="fin" class="px-2"> 
      {{ fin_str }}       
    </span>
    <div @click="increaseMonth()">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    </div>
  </div> 
        
  <div v-if="incidentes.length > 0" class="py-5">
    <div role="alert" class="alert alert-info alert-outline mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info h-6 w-6 shrink-0">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>Haz clic sobre un incidente para ver sus detalles y gestionarlo</span>
    </div>
    <MyGrid
        :data="incidentes"
        :columns="gridColumns"
        :filter-key="searchQuery"
        v-model:rowdata="rowdata"
        :show-row-count="false"
        @update:rowdata="showDialog(rowdata)"
    >
    </MyGrid>
  </div>
  <div v-else class="py-5">
    No hay incidentes registrados en este periodo.
  </div>

  <dialog id="incident_detail" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg">Incidente #{{ rowdata.id }}</h3>
      <div class="tabs tabs-border">
        <label class="tab" aria-label="Detalles">
          <input type="radio" name="incident_tabs" class="tab" aria-label="Detalles" checked="checked" />
          Detalles
        </label>
        <div class="tab-content border-base-300 bg-base-100 p-10">
          <div class="overflow-x-auto py-4">
            <table class="table table-zebra w-full">
            <tbody>
              <tr>
                <th>Fecha</th>
                <td>{{ rowdata.fecha }}</td>
              </tr>
              <tr>
                <th>Incidencia</th>
                <td>{{ rowdata.incidencia }}</td>
              </tr>
              <tr>
                <th>Entrada</th>
                <td>{{ formatDate(rowdata.entrada_real) }}</td>
              </tr>
              <tr>
                <th>Salida</th>
                <td>{{ formatDate(rowdata.salida_real) }}</td>
              </tr>
              <tr>
                <th>Duración</th>
                <td>{{ rowdata.duracion }}</td>
              </tr>
              <tr>
                <th>Estado</th>
                <td>{{ rowdata.estado }}</td>
              </tr>
              <tr>
                <th>Detectado</th>
                <td>{{ formatDate(rowdata.detectado) }}</td>
              </tr>
            </tbody>
          </table>
        </div>    
      </div>
      <label class="tab">
          <input type="radio" name="incident_tabs" class="tab" />
          Declaración
        </label>
        <div class="tab-content border-base-300 bg-base-100 p-10">
          <div class="overflow-x-auto py-4">
             <table class="table table-zebra w-full">
                <tbody>
                  <tr>
                    <th>Entrada propuesta</th>
                    <td>{{ formatDate(rowdata.entrada_propuesta) }}</td>
                  </tr>
                  <tr>
                    <th>Salida propuesta</th>
                    <td>{{ formatDate(rowdata.salida_propuesta ) }}</td>
                  </tr>
                  <tr>
                    <th>Declaración</th>
                    <td>{{ rowdata.declaracion }}</td>
                  </tr>
                  <tr>
                    <th>Fecha</th>
                    <td>{{ formatDate(rowdata.declarado) }}</td>
                  </tr>
                </tbody>
              </table>
          </div>
        </div>
    </div>
      
      <form method="dialog" class="modal-action"> 
        <div v-if="rowdata.estado === 'abierto'" class="flex justify-end gap-4 ">
          <FormKit
            type="button"
            label="Hacer declaración"
            @click="openStatementDialog()"
          />
        </div> 
        <div v-else class="flex justify-end">
          <button class="btn">Cerrar</button>
        </div>
      </form>
    </div>
  </dialog>

  <dialog id="statement_dialog" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg">Declaración responsable</h3>
      
      <p>Fecha del incidente: {{ rowdata.fecha }} ({{ rowdata.incidencia }})</p>
      <p class="text-sm py-5">Indica las horas de entrada y salida que propones para corregirlo, así como una breve explicación de lo ocurrido.</p>
      <div>
      <FormKit type="form" 
        v-model="formStatement"
        @submit="submitStatement" 
        submit-label="Enviar"
        :submit-attrs="{
          help: ''
        }"
      >
        <FormKit type="datetime-local" name="proposed_entry" label="Entrada propuesta" validation="required" />
        <FormKit type="datetime-local" name="proposed_exit" label="Salida propuesta" validation="required" />
        <FormKit type="textarea" name="statement_text" label="Texto de la declaración" validation="required" :rows="4" />
        
      </FormKit>
      </div>
      <div role="alert" class="alert alert-warning my-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <span>Declaro que los datos proporcionados son verdaderos.</span>
      </div>
      <form method="dialog" class="modal-action">
        <button class="btn">Cancelar</button>
      </form>
    </div>
  </dialog>
</div>
</template>