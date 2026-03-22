<script setup>
definePageMeta({
    middleware: ["auth"],
})

const config = useRuntimeConfig()
const accessToken = useAccessToken()

const fecha_inicio = ref('')
const fecha_fin = ref('')
const empleado_seleccionado = ref('')
const estado_filtro = ref('')

const incidentes = ref([])
const empleados = ref([])
const rowIncidentData = ref({})
const loading = ref(false)
const formResolution = ref({})  

const estados = [
    { value: '', label: 'Todos' },
    { value: 'abierto', label: 'Abierto' },
    { value: 'declarado', label: 'Declarado' },
    { value: 'aprobado', label: 'Aprobado' },
    { value: 'rechazado', label: 'Rechazado' },
    { value: 'cerrado_auto', label: 'Cerrado automático' },
]

const url_empleados = computed(() => `${config.public.api}/employees/getall`)

async function getEmpleados() {
    try {
        const data = await $fetch(url_empleados.value, {
            headers: {
                'Authorization': 'Bearer ' + accessToken.value,
            },
        })
        empleados.value = data || []
        console.log('Empleados obtenidos:', empleados.value)
    } catch (error) {
        console.error('Error al obtener empleados:', error)
    }
}

const url_incidentes = computed(() => {
    const params = new URLSearchParams()
    if (fecha_inicio.value) params.append('fecha_inicio', fecha_inicio.value)
    if (fecha_fin.value) params.append('fecha_fin', fecha_fin.value)
    if (empleado_seleccionado.value) params.append('id_user', empleado_seleccionado.value)
    if (estado_filtro.value) params.append('estado', estado_filtro.value)
    console.log('URL de incidentes:', `${config.public.api}/employees/incidents?${params.toString()}`)
    return `${config.public.api}/employees/incidents?${params}`

})

async function buscar() {
    loading.value = true
    try {
        const data = await $fetch(url_incidentes.value, {
            headers: {
                'Authorization': 'Bearer ' + accessToken.value,
            },
        })
        incidentes.value = data || []
        console.log('Incidentes obtenidos:', incidentes.value)
        console.log('Longitud:', incidentes.value.length)
    } catch (error) {
        console.error('Error al obtener incidentes:', error)
    } finally {
        loading.value = false
    }
}

async function submitResolution(formData) {
    try {
        await $fetch(`${config.public.api}/employees/incidents/${rowIncidentData.value.id}/resolve`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken.value,
            },
            body: formData
        })
        rowIncidentData.value.estado = 'resuelto'
        closeResolutionDialog()
    } catch (error) {
        console.error('Error al resolver incidente:', error)
    }
}   


async function aceptar(incident) {
    try {
        await $fetch(`${config.public.api}/employees/incidents/${incident.id}/approve`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken.value,
            },
        })
        incident.status = 'aprobado'
    } catch (error) {
        console.error('Error al aceptar incidente:', error)
    }
}

async function rechazar(incident) {
    try {
        await $fetch(`${config.public.api}/employees/incidents/${incident.id}/reject`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken.value,
            },
        })
        incident.status = 'rechazado'
    } catch (error) {
        console.error('Error al rechazar incidente:', error)
    }
}



const formatDate = (ts) => {
    if (!ts) return '-'
    const d = new Date(ts)
    if (isNaN(d.getTime())) return ts
    return d.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const showIncidentDetail = () => {
    //console.log('Fila seleccionada:', rowIncidentData.value)
    incident_detail.showModal()
}

function closeIncidentDialog() {
  document.getElementById('incident_detail').close()
}

function openResolutionDialog() {
  closeIncidentDialog()
  document.getElementById('resolution_dialog').showModal()
}

function closeResolutionDialog() {
  document.getElementById('resolution_dialog').close()
}


const gridColumns = [
    'fecha',
    'empleado',
    'incidencia',
    'estado',
]

onMounted(async () => {
    await getEmpleados()
    await buscar()
})
</script>

<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">Incidentes de Fichajes</h1>
        
        <!-- Filtros -->
        <div class="flex flex-wrap gap-4 py-4 bg-base-200 p-4 rounded-lg mb-4">
            <div class="form-control">
                <label class="label px-5">
                    <span class="label-text ">Fecha inicio</span>
                </label>
                <input type="date" v-model="fecha_inicio" class="input input-bordered w-40" />
            </div>
            <div class="form-control">
                <label class="label px-5">
                    <span class="label-text">Fecha fin</span>
                </label>
                <input type="date" v-model="fecha_fin" class="input input-bordered w-40" />
            </div>
            <div class="form-control">
                <label class="label px-5">
                    <span class="label-text">Empleado</span>
                </label>
                <select v-model="empleado_seleccionado" class="select select-bordered w-48">
                    <option value="">Todos los empleados</option>
                    <option v-for="emp in empleados" :key="emp.id" :value="emp.id">
                        {{ emp.name.split(" ")[0]  }} 
                    </option>
                </select>
            </div>
            <div class="form-control">
                <label class="label px-5">
                    <span class="label-text">Estado</span>
                </label>
                <select v-model="estado_filtro" class="select select-bordered w-40">
                    <option v-for="est in estados" :key="est.value" :value="est.value">
                        {{ est.label }}
                    </option>
                </select>
            </div>
            <div class="form-control self-end">
                <button @click="buscar" class="btn btn-primary" :disabled="loading">
                    {{ loading ? 'Buscando...' : 'Buscar' }}
                </button>
            </div>
        </div>

        
        <!-- Tabla de incidentes -->
        <MyGrid :columns="gridColumns" 
            :data="incidentes" 
            :table-size="'table-xs'" 
            :show-row-count="false"
            v-model:rowdata="rowIncidentData"  
            @update:rowdata="showIncidentDetail()"  
        />
    </div>

    <dialog id="incident_detail" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg">Incidente #{{ rowIncidentData.id }}</h3>
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
                <td>{{ rowIncidentData.fecha }}</td>
              </tr>
              <tr>
                <th>Incidencia</th>
                <td>{{ rowIncidentData.incidencia }}</td>
              </tr>
              <tr>
                <th>Entrada</th>
                <td v-if="rowIncidentData.entrada_real">{{ formatDate(rowIncidentData.entrada_real) }}</td>
              </tr>
              <tr>
                <th>Salida</th>
                <td v-if="rowIncidentData.salida_real">{{ formatDate(rowIncidentData.salida_real) }}</td>
              </tr>
              <tr>
                <th>Duración</th>
                <td>{{ rowIncidentData.duracion }}</td>
              </tr>
              <tr>
                <th>Estado</th>
                <td>{{ rowIncidentData.estado }}</td>
              </tr>
              <tr>
                <th>Detectado</th>
                <td v-if="rowIncidentData.detectado">{{ rowIncidentData.detectado }}</td>
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
                    <td v-if="rowIncidentData.entrada_propuesta">{{ formatDate(rowIncidentData.entrada_propuesta) }}</td>
                  </tr>
                  <tr>
                    <th>Salida propuesta</th>
                    <td v-if="rowIncidentData.salida_propuesta">{{ formatDate(rowIncidentData.salida_propuesta) }}</td>
                  </tr>
                  <tr>
                    <th>Declaración</th>
                    <td v-if="rowIncidentData.declaracion">{{ rowIncidentData.declaracion }}</td>
                  </tr>
                  <tr>
                    <th>Fecha</th>
                    <td v-if="rowIncidentData.declarado">{{ rowIncidentData.declarado }}</td>
                  </tr>
                </tbody>
              </table>
          </div>
        </div>
    </div>
      
      <form method="dialog" class="modal-action"> 
        <div v-if="rowIncidentData.estado === 'declarado'" class="flex justify-end gap-4 ">
          <FormKit
            type="button"
            label="Resolver"
            @click="openResolutionDialog()"
          />
        </div> 
        <div v-else class="flex justify-end">
          <button class="btn">Cerrar</button>
        </div>
      </form>
    </div>
  </dialog>

  <dialog id="resolution_dialog" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg">Resolución</h3>
      
      <p>Fecha del incidente: {{ rowIncidentData.fecha }} ({{ rowIncidentData.incidencia }})</p>
      <p>Empleado: {{ rowIncidentData.empleado }}</p>
      <div class="py-4">
        <FormKit type="form" 
            v-model="formResolution"
            @submit="submitResolution" 
            submit-label="Enviar"
            :submit-attrs="{
            help: ''
            }"
        >
            <FormKit
                v-model="value"
                name="decision"
                type="radio"
                label="Corrección propuesta"
                :options="['aceptada', 'rechazada']"
                help="¿aceptas la corrección propuesta por el empleado?"
                /> 
            <FormKit type="textarea" name="statement_text" label="Motivación" validation="required" :rows="4" />
        </FormKit>
      </div>
      
      <form method="dialog" class="modal-action">
        <button class="btn">Cancelar</button>
      </form>
    </div>
  </dialog>

</template>
