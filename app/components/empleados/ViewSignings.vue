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
});

const id = ref(props.id);
const months = ref([
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]);
const d = new Date();
const current_year = ref(d.getFullYear());
const current_month = ref(d.getMonth());
const scheduledhours = ref(0);
const workedhours = ref(0);
const extraworkedhours = ref(0);

const inicio = computed(() => {
  return new Date(current_year.value, current_month.value);
});
const fin = computed(() => {
  return new Date(current_year.value, current_month.value + 1);
});
const inicio_str = computed(() => {
  return inicio.value.toLocaleDateString("es-ES").replace(/\//g, "-"); // DD-MM-YYYY
});
const fin_str = computed(() => {
  return fin.value.toLocaleDateString("es-ES").replace(/\//g, "-"); // DD-MM-YYYY
});

const inicio_iso = computed(() => {
  const d = inicio.value;
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
});
const fin_iso = computed(() => {
  const d = fin.value;
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
});

const myMap = ref("https://www.google.com/maps/place/");
const link_entrada = ref("");
const link_salida = ref("");
const rowdata = ref({});
console.log("year:", current_year.value);
console.log("month:", current_month.value);

// single ref
watch(current_month, (new_month) => {
  console.log(`month_start is ${new_month}`);
  console.log("inicio es:", inicio.value);
  getSignings();
});

const config = useRuntimeConfig();
const accessToken = useAccessToken();
const fichajes = ref([]);
const url_fichajes = computed(() => {
  return config.public.api + `/employees/${id.value}/getsignings`;
});

const url_scheduledhours = computed(() => {
  return `${config.public.api}/employees/${id.value}/scheduledhours`;
});

const url_workedhours = computed(() => {
  return `${config.public.api}/employees/${id.value}/getworkedhours`;
});
const url_extraworkedhours = computed(() => {
  return `${config.public.api}/employees/${id.value}/getextraworkedhours`;
});

/**
 * Convierte un formato de tiempo "HH:mm" a un número decimal para cálculos.
 * Ejemplo: "174:30" -> 174.5
 */
const timeToDecimal = (timeStr) => {
  if (!timeStr) return 0;
  if (typeof timeStr === "number") return timeStr;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) + (minutes || 0) / 60;
};

const scheduledhours_num = computed(() => timeToDecimal(scheduledhours.value));
const workedhours_num = computed(() => timeToDecimal(workedhours.value));
const extraworkedhours_num = computed(() => timeToDecimal(extraworkedhours.value));

const searchQuery = ref("");
const gridColumns = ["fecha", "entrada", "salida", "duración", "incidencia"];

async function getSignings() {
  console.log("llamado getSignings!");
  // datos de los últimos fichajes
  try {
    const data = await $fetch(url_fichajes.value, {
      headers: {
        Authorization: "Bearer " + accessToken.value,
      },
      method: "POST",
      body: {
        range_start: inicio_iso.value,
        range_end: fin_iso.value,
      },
    });

    if (data) {
      console.log("desde response en getSignings:", data);
      fichajes.value = data;
      getWorkedHours();
      getExtraWorkedHours();
      getScheduledHours();
    } else {
      console.log("no hay datos");
      fichajes.value = "";
      workedhours.value = 0;
    }
  } catch (error) {
    console.error("Error al obtener fichajes:", error);
    fichajes.value = "";
    workedhours.value = 0;
  }
}

async function getWorkedHours() {
  console.log("dentro de getworked:", url_workedhours.value);
  try {
    const data = await $fetch(url_workedhours.value, {
      headers: {
        Authorization: "Bearer " + accessToken.value,
      },
      method: "POST",
      body: {
        range_start: inicio_iso.value,
        range_end: fin_iso.value,
      },
    });

    if (data) {
      console.log("desde workedhours:", data);
      workedhours.value = data[0].horas_trabajadas;
    } else {
      console.log("no hay datos");
      workedhours.value = 0;
    }
  } catch (error) {
    console.error(error);
    workedhours.value = 0;
  }
}

async function getScheduledHours() {
  console.log("dentro de getScheduledHours:", url_scheduledhours.value);
  try {
    const data = await $fetch(url_scheduledhours.value, {
      headers: {
        Authorization: "Bearer " + accessToken.value,
      },
      method: "POST",
      body: {
        range_start: inicio_iso.value,
        range_end: fin_iso.value,
        label: "trabajo",
      },
    });

    if (data) {
      console.log("desde scheduledhours:", data);
      scheduledhours.value = data[0].duration;
    } else {
      console.log("no hay datos");
      scheduledhours.value = 0;
    }
  } catch (error) {
    console.error(error);
    scheduledhours.value = 0;
  }
}

async function getExtraWorkedHours() {
  console.log("dentro de getworked:", url_extraworkedhours.value);
  try {
    const data = await $fetch(url_extraworkedhours.value, {
      headers: {
        Authorization: "Bearer " + accessToken.value,
      },
      method: "POST",
      body: {
        range_start: inicio_iso.value,
        range_end: fin_iso.value,
      },
    });

    if (data) {
      console.log("desde extraworkedhours:", data);
      extraworkedhours.value = data[0].horas_extra_trabajadas;
    } else {
      console.log("no hay datos");
      extraworkedhours.value = 0;
    }
  } catch (error) {
    console.error(error);
    extraworkedhours.value = 0;
  }
}

function increaseMonth() {
  current_month.value++;
  if (current_month.value == 12) {
    current_month.value = 0;
    current_year.value++;
  }
}

function decreaseMonth() {
  current_month.value--;
  if (current_month.value == -1) {
    current_month.value = 11;
    current_year.value--;
  }
}

function showDialog(data) {
  let coords_entrada = data.lugar_entrada.x + "," + data.lugar_entrada.y;
  link_entrada.value = myMap.value + coords_entrada;
  if (data.salida) {
    let coords_salida = data.lugar_salida.x + "," + data.lugar_salida.y;
    link_salida.value = myMap.value + coords_salida;
  }
  //console.log('coords_entrada:',coords_entrada)
  signing_detail.showModal();
}

onMounted(() => {
  console.log(`the component is now mounted.`);
  getSignings();
});
</script>

<template>
  <div class="container mx-auto p-4">
    <!-- Encabezado con Trabajador y Selector de Mes -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-3">
        <h1 class="text-xl font-bold opacity-70">Trabajador:</h1>
        <UserName
          :id="props.id.toString()"
          :shortname="true"
          class="text-xl font-bold text-primary"
        />
      </div>

      <div
        class="flex items-center gap-4 bg-base-200 p-2 rounded-xl border border-base-300"
      >
        <button class="btn btn-circle btn-sm btn-ghost" @click="decreaseMonth()">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <span class="font-bold min-w-32 text-center uppercase tracking-widest text-sm">
          {{ months[current_month] }} {{ current_year }}
        </span>
        <button class="btn btn-circle btn-sm btn-ghost" @click="increaseMonth()">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Resumen de Horas (Stats) -->
    <div
      class="stats stats-vertical lg:stats-horizontal shadow w-full border border-base-300 bg-base-100 mb-8"
    >
      <div class="stat">
        <div class="stat-title text-xs font-bold uppercase opacity-50">
          Cumplimiento de Jornada
        </div>
        <div class="stat-value text-success text-2xl">
          {{ workedhours }}
          <span class="text-lg font-normal opacity-40">/ {{ scheduledhours }}h</span>
        </div>
        <div class="stat-desc flex flex-col gap-1 pt-1">
          <progress
            class="progress progress-success w-full"
            :value="workedhours_num"
            :max="scheduledhours_num || 1"
          ></progress>
          <div
            class="flex justify-between text-[10px] font-bold uppercase tracking-tighter"
          >
            <span v-if="scheduledhours_num">
              {{ Math.round((workedhours_num / (scheduledhours_num || 1)) * 100) }}%
              completado
            </span>
            <span class="opacity-60">{{ scheduledhours }}h</span>
          </div>
        </div>
      </div>
      <!--
      <div class="stat">
        <div class="stat-title text-xs font-bold uppercase opacity-50">Horas Extra</div>
        <div class="stat-value text-primary text-2xl">
          {{ extraworkedhours }}
          <span class="text-lg font-normal opacity-40">/ 80h</span>
        </div>
        <div class="stat-desc flex flex-col gap-1 pt-1">
          <progress
            class="progress progress-primary w-full"
            :value="extraworkedhours_num"
            max="80"
          ></progress>
          <div
            class="flex justify-between text-[10px] font-bold uppercase tracking-tighter"
          >
            <span> {{ Math.round((extraworkedhours_num / 80) * 100) }}% del límite </span>
            <span class="opacity-60">Límite: 80h</span>
          </div>
        </div>
      </div>
      -->
    </div>

    <!-- Rango de fechas detallado -->
    <div class="flex items-center gap-2 mb-4 text-xs opacity-50 px-2 italic">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-4 h-4"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
        />
      </svg>
      <span>{{ inicio_str }}</span>
      <span>al</span>
      <span>{{ fin_str }}</span>
    </div>

    <div v-if="fichajes" class="py-5">
      <MyGrid
        :data="fichajes"
        :columns="gridColumns"
        :filter-key="searchQuery"
        v-model:rowdata="rowdata"
        @update:rowdata="showDialog(rowdata)"
        :show-row-count="false"
      >
      </MyGrid>
    </div>

    <dialog id="signing_detail" class="modal">
      <div class="modal-box">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <div class="tabs tabs-border">
          <label class="tab" aria-label="Contacto">
            <input
              type="radio"
              name="my_tabs_2"
              class="tab"
              aria-label="Contacto"
              checked="checked"
            />
            Fichaje
          </label>
          <div class="tab-content border-base-300 bg-base-100 p-10">
            <table class="table table-xs table-zebra w-full">
              <tbody>
                <tr>
                  <td class="font-bold">Entrada</td>
                  <td>{{ rowdata.entrada }}</td>
                  <td class="font-bold">
                    <NuxtLink
                      :to="`${link_entrada}`"
                      class="link link-primary"
                      target="_blank"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                        />
                      </svg>
                    </NuxtLink>
                  </td>
                </tr>
                <tr>
                  <td class="font-bold">Salida</td>
                  <td>{{ rowdata.salida }}</td>
                  <td class="font-bold">
                    <NuxtLink
                      :to="`${link_salida}`"
                      class="link link-primary"
                      target="_blank"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                        />
                      </svg>
                    </NuxtLink>
                  </td>
                </tr>
                <tr>
                  <td class="font-bold">Duración</td>
                  <td>{{ rowdata.duración }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <label v-if="rowdata.incidencia" class="tab" aria-label="Banco">
            <input type="radio" name="my_tabs_2" class="tab" aria-label="Banco" />
            Incidencia
          </label>
          <div
            v-if="rowdata.incidencia"
            class="tab-content border-base-300 bg-base-100 p-10"
          >
            <table class="table table-sm table-zebra w-full">
              <tbody>
                <tr>
                  <td class="font-bold">Id. incidencia</td>
                  <td>{{ rowdata.incident_id }}</td>
                </tr>
                <tr>
                  <td class="font-bold">Descripción</td>
                  <td>{{ rowdata.incidencia }}</td>
                </tr>
                <tr>
                  <td class="font-bold">Estado</td>
                  <td>{{ rowdata.estado_incidencia }}</td>
                </tr>
                <tr>
                  <td class="font-bold">Resolución</td>
                  <td>{{ rowdata.comentario_resolucion }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </dialog>
  </div>
</template>
