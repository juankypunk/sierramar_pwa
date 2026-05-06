<script setup>
const props = defineProps({
  id: [String, Number],
});

const config = useRuntimeConfig();
const accessToken = useAccessToken();

const compensationData = ref(null);
const absences = ref([]);
const loading = ref(true);

// Cálculo de días de vacaciones consumidos y pendientes
const vacationDaysUsed = computed(() => {
  return absences.value
    .filter((a) => a.title?.toLowerCase() === "vacaciones" && a.status === "aprobado")
    .reduce((total, absence) => {
      // Parseamos el formato DD-MM-YYYY que devuelve la API
      const partsStart = absence.start.split("-");
      const partsEnd = absence.end.split("-");
      const start = new Date(partsStart[2], partsStart[1] - 1, partsStart[0]);
      const end = new Date(partsEnd[2], partsEnd[1] - 1, partsEnd[0]);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) return total;

      // Calculamos la diferencia en días incluyendo ambos extremos
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return total + diffDays;
    }, 0);
});

const vacationDaysPending = computed(() => 30 - vacationDaysUsed.value);

// Cálculo de días de asuntos particulares consumidos y pendientes
const aappDaysUsed = computed(() => {
  return absences.value
    .filter(
      (a) =>
        (a.title?.toLowerCase() === "asuntos propios" ||
          a.title?.toLowerCase() === "asuntos_propios") &&
        a.status === "aprobado"
    )
    .reduce((total, absence) => {
      const partsStart = absence.start.split("-");
      const partsEnd = absence.end.split("-");
      const start = new Date(partsStart[2], partsStart[1] - 1, partsStart[0]);
      const end = new Date(partsEnd[2], partsEnd[1] - 1, partsEnd[0]);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) return total;

      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return total + diffDays;
    }, 0);
});

const aappDaysPending = computed(() => 1 - aappDaysUsed.value);

// Obtenemos los datos iniciales
async function loadData() {
  loading.value = true;
  try {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31);

    const data = await $fetch(
      `${config.public.api}/employees/${props.id}/getholidaycompensationhours`,
      {
        method: "POST",
        headers: { Authorization: "Bearer " + accessToken.value },
        body: {
          range_start: startOfYear,
          range_end: endOfYear,
          label: "normal",
        },
      }
    );
    compensationData.value = data;

    // Cargar historial de ausencias/permisos
    absences.value = await $fetch(
      `${config.public.api}/employees/${props.id}/absences_requested`,
      {
        method: "POST",
        headers: { Authorization: "Bearer " + accessToken.value },
        body: {
          range_start: startOfYear,
          range_end: endOfYear,
        },
      }
    );
  } catch (error) {
    console.error("Error al cargar resumen de créditos:", error);
  } finally {
    loading.value = false;
  }
}

async function handleRequest(formData, node) {
  try {
    await $fetch(`${config.public.api}/employees/${props.id}/absences/request`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken.value,
      },
      body: {
        title: formData.type,
        fecha_inicio: formData.start_date,
        fecha_fin: formData.end_date,
        comments: formData.comments,
        class: formData.type, // Puedes mapear esto a clases CSS específicas si lo deseas
      },
    });

    alert(
      "Solicitud enviada correctamente. Pendiente de validación por la administración."
    );
    node.reset();
    loadData(); // Recargar lista tras enviar
  } catch (error) {
    console.error("Error al enviar solicitud:", error);
    alert("Hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.");
  }
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="space-y-6">
    <div v-if="loading" class="flex justify-center py-10">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <template v-else>
      <!-- Panel de Saldos Actuales -->
      <div class="stats shadow w-full border border-base-300 bg-base-200/50">
        <div class="stat place-items-center">
          <div class="stat-title text-xs uppercase font-bold opacity-60">
            Compensación
          </div>
          <div class="stat-value text-primary text-2xl" v-if="compensationData">
            {{ compensationData.compensationHours }}h
          </div>
          <div class="stat-desc">
            {{ compensationData?.compensableDaysCount || 0 }} festivos en descanso
          </div>
        </div>

        <div class="stat place-items-center">
          <div class="stat-title text-xs uppercase font-bold opacity-60">Vacaciones</div>
          <div class="stat-value text-secondary text-2xl">{{ vacationDaysPending }}</div>
          <div class="stat-desc">Días pendientes</div>
        </div>

        <div class="stat place-items-center">
          <div class="stat-title text-xs uppercase font-bold opacity-60">
            Asuntos Part.
          </div>
          <div class="stat-value text-accent text-2xl">{{ aappDaysPending }}</div>
          <div class="stat-desc">Días pendientes</div>
        </div>
      </div>

      <div class="divider text-xs uppercase opacity-50 tracking-widest">
        Mis Solicitudes
      </div>

      <!-- Lista de solicitudes existentes -->
      <div v-if="absences.length > 0" class="overflow-x-auto">
        <table
          class="table table-xs w-full bg-base-100 rounded-lg overflow-hidden shadow"
        >
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Desde/Hasta</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in absences" :key="item.id">
              <td>
                <div :class="['badge badge-sm text-[12px]', item.class]">
                  {{ item.title }}
                </div>
              </td>
              <td class="text-[12px]">{{ item.start }} / {{ item.end }}</td>
              <td class="text-[12px]">{{ item.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-center text-xs opacity-50 italic">
        No tienes solicitudes este año.
      </p>

      <div class="divider text-xs uppercase opacity-50 tracking-widest">
        Solicitar días / horas
      </div>

      <!-- Formulario de Solicitud de Ausencia -->
      <FormKit
        type="form"
        @submit="handleRequest"
        submit-label="Enviar Solicitud"
        :submit-attrs="{ classes: { input: 'btn btn-primary w-full mt-4' } }"
      >
        <FormKit
          type="select"
          name="type"
          label="Tipo de ausencia"
          validation="required"
          placeholder="Selecciona una opción"
          :options="[
            { label: 'Vacaciones', value: 'vacaciones' },
            { label: 'Asuntos Propios', value: 'asuntos_propios' },
            { label: 'Compensación de Festivo', value: 'compensacion_festivo' },
            { label: 'Devolución de Horas', value: 'devolucion_horas' },
            { label: 'Permiso Retribuido (Médico, etc)', value: 'permiso' },
          ]"
        />

        <div class="flex gap-4">
          <FormKit
            type="date"
            name="start_date"
            label="Desde"
            validation="required"
            outer-class="flex-1"
          />
          <FormKit
            type="date"
            name="end_date"
            label="Hasta"
            validation="required"
            outer-class="flex-1"
          />
        </div>

        <FormKit
          type="textarea"
          name="comments"
          label="Motivo / Observaciones"
          placeholder="Escribe aquí los detalles de tu solicitud..."
          rows="3"
        />
      </FormKit>
    </template>
  </div>
</template>
