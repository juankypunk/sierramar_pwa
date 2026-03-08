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
const selectedIds = ref([])
const loading = ref(false)

const estados = [
    { value: '', label: 'Todos' },
    { value: 'abierto', label: 'Abierto' },
    { value: 'declarado', label: 'Declarado' },
    { value: 'aprobado', label: 'Aprobado' },
    { value: 'rechazado', label: 'Rechazado' },
    { value: 'cerrado_auto', label: 'Cerrado automático' },
]

const url_empleados = computed(() => `${config.public.api}/employees/byname`)

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
    } catch (error) {
        console.error('Error al obtener incidentes:', error)
    } finally {
        loading.value = false
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

async function aceptarMultiple() {
    for (const id of selectedIds.value) {
        try {
            await $fetch(`${config.public.api}/employees/incidents/${id}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + accessToken.value,
                },
            })
            const incident = incidentes.value.find(i => i.id === id)
            if (incident) incident.status = 'aprobado'
        } catch (error) {
            console.error(`Error al aceptar incidente ${id}:`, error)
        }
    }
    selectedIds.value = []
}

async function rechazarMultiple() {
    for (const id of selectedIds.value) {
        try {
            await $fetch(`${config.public.api}/employees/incidents/${id}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + accessToken.value,
                },
            })
            const incident = incidentes.value.find(i => i.id === id)
            if (incident) incident.status = 'rechazado'
        } catch (error) {
            console.error(`Error al rechazar incidente ${id}:`, error)
        }
    }
    selectedIds.value = []
}

function toggleSelectAll(event) {
    if (event.target.checked) {
        selectedIds.value = incidentes.value.map(i => i.id)
    } else {
        selectedIds.value = []
    }
}

const formatDateTime = (ts) => {
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

const getEstadoBadgeClass = (estado) => {
    switch (estado) {
        case 'abierto': return 'badge-warning'
        case 'declarado': return 'badge-info'
        case 'aprobado': return 'badge-success'
        case 'rechazado': return 'badge-error'
        case 'cerrado_auto': return 'badge-neutral'
        default: return ''
    }
}

const getEstadoLabel = (estado) => {
    switch (estado) {
        case 'abierto': return 'Abierto'
        case 'declarado': return 'Declarado'
        case 'aprobado': return 'Aprobado'
        case 'rechazado': return 'Rechazado'
        case 'cerrado_auto': return 'Cerrado auto'
        default: return estado
    }
}

const gridColumns = [
    { key: 'fecha_inc', label: 'Fecha' },
    { key: 'empleado', label: 'Empleado' },
    { key: 'incidencia', label: 'Incidencia' },
    { key: 'entrada_real', label: 'Entrada real' },
    { key: 'salida_real', label: 'Salida real' },
    { key: 'entrada_propuesta', label: 'Entrada propuesta' },
    { key: 'salida_propuesta', label: 'Salida propuesta' },
    { key: 'declaracion', label: 'Declaración' },
    { key: 'estado', label: 'Estado' },
    { key: 'acciones', label: 'Acciones' }
]

onMounted(async () => {
    await getEmpleados()
    await buscar()
})
</script>

<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">Gestión de Incidentes de Fichajes</h1>
        
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

        <!-- Acciones masivas -->
        <div v-if="selectedIds.length > 0" class="flex gap-2 mb-4">
            <button @click="aceptarMultiple" class="btn btn-success btn-sm">
                ✓ Aceptar seleccionados ({{ selectedIds.length }})
            </button>
            <button @click="rechazarMultiple" class="btn btn-error btn-sm">
                ✕ Rechazar seleccionados ({{ selectedIds.length }})
            </button>
        </div>

        <!-- Tabla de incidentes -->
        <div class="overflow-x-auto">
            <table v-if="incidentes.length > 0" class="table table-sm table-zebra w-full">
                <thead>
                    <tr>
                        <th>
                            <input 
                                type="checkbox" 
                                class="checkbox" 
                                :checked="selectedIds.length === incidentes.length && incidentes.length > 0"
                                @change="toggleSelectAll"
                            />
                        </th>
                        <th v-for="col in gridColumns" :key="col.key">
                            {{ col.label }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="entry in incidentes" :key="entry.id">
                        <th>
                            <input 
                                type="checkbox" 
                                class="checkbox" 
                                :value="entry.id" 
                                v-model="selectedIds"
                            />
                        </th>
                        <td>{{ entry.fecha_inc }}</td>
                        <td>{{ entry.empleado }}</td>
                        <td>{{ entry.incidencia }}</td>
                        <td>{{ formatDateTime(entry.entrada_real) }}</td>
                        <td>{{ formatDateTime(entry.salida_real) }}</td>
                        <td>{{ formatDateTime(entry.entrada_propuesta) }}</td>
                        <td>{{ formatDateTime(entry.salida_propuesta) }}</td>
                        <td>
                            <span class="truncate max-w-xs block" :title="entry.declaracion">
                                {{ entry.declaracion || '-' }}
                            </span>
                        </td>
                        <td>
                            <span :class="['badge', getEstadoBadgeClass(entry.estado)]">
                                {{ getEstadoLabel(entry.estado) }}
                            </span>
                        </td>
                        <td>
                            <div class="flex gap-1">
                                <button
                                    v-if="entry.estado === 'declarado'"
                                    @click="aceptar(entry)"
                                    class="btn btn-xs btn-success"
                                    title="Aceptar"
                                >
                                    ✓
                                </button>
                                <button
                                    v-if="entry.estado === 'declarado'"
                                    @click="rechazar(entry)"
                                    class="btn btn-xs btn-error"
                                    title="Rechazar"
                                >
                                    ✕
                                </button>
                                <span v-if="entry.estado !== 'declarado'" class="text-gray-400 text-xs">
                                    -
                                </span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="incidentes.length === 0 && !loading" class="alert alert-soft mt-4">
            No se encontraron incidentes con los filtros seleccionados.
        </div>
    </div>
</template>
