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

const url_workedhours = computed(() => {
  return `${config.public.api}/employees/${id.value}/getworkedhours`;
});
const url_extraworkedhours = computed(() => {
  return `${config.public.api}/employees/${id.value}/getextraworkedhours`;
});
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
        range_start: inicio.value,
        range_end: fin.value,
      },
    });

    if (data) {
      console.log("desde response en getSignings:", data);
      fichajes.value = data;
      getWorkedHours();
      getExtraWorkedHours();
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
        range_start: inicio.value,
        range_end: fin.value,
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

async function getExtraWorkedHours() {
  console.log("dentro de getworked:", url_extraworkedhours.value);
  try {
    const data = await $fetch(url_extraworkedhours.value, {
      headers: {
        Authorization: "Bearer " + accessToken.value,
      },
      method: "POST",
      body: {
        range_start: inicio.value,
        range_end: fin.value,
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
  <div class="container mx-auto">
    <div class="flex justify-start">
      <h1 class="px-5">Trabajador:</h1>
      <UserName :id="props.id.toString()" :shortname="true" @click="" />
      <div class="px-2">{{ months[current_month] }} {{ current_year }}</div>
      <div v-if="extraworkedhours" class="tooltip px-2" data-tip="extras/mes">
        <div class="badge badge-primary badge-outline">
          {{ extraworkedhours }}
        </div>
      </div>
      <div class="tooltip" data-tip="horas/mes">
        <div class="badge badge-outline">{{ workedhours }}</div>
      </div>
    </div>

    <div class="flex justify-start py-1">
      <h1 class="px-5">Periodo:</h1>
      <div @click="decreaseMonth()">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </div>
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
    <div class="flex justify-center">
      <div class="px-5">Horas extra: {{ extraworkedhours }}</div>
      <div class="px-5">Total horas: {{ workedhours }}</div>
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
            <table class="table table-sm table-zebra w-full">
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
