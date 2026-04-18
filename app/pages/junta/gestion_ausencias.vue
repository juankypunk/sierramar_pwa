<script setup>
import { jwtDecode } from "jwt-decode";

definePageMeta({
  middleware: ["auth"],
});

const config = useRuntimeConfig();
const accessToken = useAccessToken();
const user_data = jwtDecode(accessToken.value);

const fecha_inicio = ref("");
const fecha_fin = ref("");
const empleado_seleccionado = ref("");
const estado_filtro = ref("pendiente");

const ausencias = ref([]);
const empleados = ref([]);
const rowAbsenceData = ref({});
const loading = ref(false);

const estados = [
  { value: "", label: "Todos" },
  { value: "pendiente", label: "Pendiente" },
  { value: "aprobado", label: "Aprobado" },
  { value: "rechazado", label: "Rechazado" },
];

async function getEmpleados() {
  const data = await $fetch(`${config.public.api}/employees/getall`, {
    headers: { Authorization: "Bearer " + accessToken.value },
  });
  empleados.value = data || [];
}

async function buscar() {
  loading.value = true;
  const params = new URLSearchParams();
  if (fecha_inicio.value) params.append("fecha_inicio", fecha_inicio.value);
  if (fecha_fin.value) params.append("fecha_fin", fecha_fin.value);
  if (empleado_seleccionado.value) params.append("id_user", empleado_seleccionado.value);
  if (estado_filtro.value) params.append("status", estado_filtro.value);

  try {
    const data = await $fetch(`${config.public.api}/employees/absences/all?${params}`, {
      headers: { Authorization: "Bearer " + accessToken.value },
    });
    ausencias.value = data || [];
  } finally {
    loading.value = false;
  }
}

function showDetail() {
  const dialog = document.getElementById("absence_detail");
  if (dialog) dialog.showModal();
}

async function resolver(decision) {
  try {
    await $fetch(`${config.public.api}/employees/absences/resolve`, {
      method: "POST",
      headers: { Authorization: "Bearer " + accessToken.value },
      body: {
        absence_id: rowAbsenceData.value.id,
        status: decision,
        resolved_by: user_data.id,
      },
    });
    document.getElementById("absence_detail")?.close();
    buscar();
  } catch (error) {
    console.error("Error al resolver ausencia:", error);
  }
}

const gridColumns = ["inicio", "fin", "empleado", "tipo", "estado"];

onMounted(() => {
  getEmpleados();
  buscar();
});
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Gestión de ausencias y permisos</h1>

    <div class="flex flex-wrap gap-4 bg-base-200 p-4 rounded-xl mb-6 shadow-sm px-5">
      <div class="form-control">
        <label class="label"
          ><span class="label-text text-xs uppercase font-bold opacity-60"
            >Empleado</span
          ></label
        >
        <select
          v-model="empleado_seleccionado"
          class="select select-bordered select-sm w-48"
        >
          <option value="">Todos</option>
          <option v-for="emp in empleados" :key="emp.id" :value="emp.id">
            {{ emp.name }}
          </option>
        </select>
      </div>
      <div class="form-control">
        <label class="label"
          ><span class="label-text text-xs uppercase font-bold opacity-60 px-5"
            >Estado</span
          ></label
        >
        <select v-model="estado_filtro" class="select select-bordered select-sm w-40">
          <option v-for="est in estados" :key="est.value" :value="est.value">
            {{ est.label }}
          </option>
        </select>
      </div>
      <div class="form-control self-end px-5">
        <button @click="buscar" class="btn btn-primary btn-sm px-5" :disabled="loading">
          {{ loading ? "..." : "Filtrar" }}
        </button>
      </div>
    </div>

    <MyGrid
      :columns="gridColumns"
      :data="ausencias"
      table-size="table-xs"
      v-model:rowdata="rowAbsenceData"
      @update:rowdata="showDetail"
      :show-row-count="false"
    />

    <dialog id="absence_detail" class="modal">
      <div v-if="rowAbsenceData.id" class="modal-box">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 class="font-bold text-lg mb-4">
          Detalle de Solicitud #{{ rowAbsenceData.id }}
        </h3>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-2 text-sm">
            <span class="font-bold">Empleado:</span>
            <span>{{ rowAbsenceData.empleado }}</span>
            <span class="font-bold">Tipo:</span>
            <span class="badge badge-outline">{{ rowAbsenceData.tipo }}</span>
            <span class="font-bold">Periodo:</span>
            <span>{{ rowAbsenceData.inicio }} al {{ rowAbsenceData.fin }}</span>
            <span class="font-bold">Estado:</span>
            <span class="capitalize">{{ rowAbsenceData.estado }}</span>
          </div>

          <div v-if="rowAbsenceData.comments" class="bg-base-200 p-3 rounded-lg">
            <p class="text-xs font-bold opacity-50 uppercase mb-1">
              Observaciones del empleado:
            </p>
            <p class="text-sm italic">"{{ rowAbsenceData.comments }}"</p>
          </div>
        </div>

        <div
          v-if="rowAbsenceData.estado === 'pendiente'"
          class="modal-action flex justify-between"
        >
          <FormKit
            type="button"
            label="Denegar"
            @click="resolver('rechazado')"
            :classes="{ input: '$reset btn btn-error btn-outline' }"
          />
          <FormKit
            type="button"
            label="Aprobar Solicitud"
            @click="resolver('aprobado')"
            :classes="{ input: '$reset btn btn-success' }"
          />
        </div>
        <div v-else class="modal-action">
          <form method="dialog">
            <button class="btn w-full">Cerrar</button>
          </form>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>
  </div>
</template>
