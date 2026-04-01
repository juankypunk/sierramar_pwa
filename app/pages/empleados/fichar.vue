<script setup>
import { jwtDecode } from "jwt-decode";
import { useTimeAgoEs } from "~/composables/useTimeAgoEs.js";

definePageMeta({
  middleware: ["auth"],
});
const config = useRuntimeConfig();
const accessToken = useAccessToken();
const user_data = jwtDecode(accessToken.value);
const route = useRoute();
console.log("ruta:", route.name);
const { coords, locatedAt, error } = useGeolocation();
const empleado = useLocalStorage("empleado", "hola empleado");
const url_lastsigning = config.public.api + "/employees/" + user_data.id + "/lastsigning";
const url_events = config.public.api + "/employees/" + user_data.id + "/events";
const url_signing = config.public.api + "/employees/sign";
const url_incidents = config.public.api + "/employees/" + user_data.id + "/getincidents";

const estadoFichaje = ref("");
const buttonColor = ref("");
const ultimoFichaje = ref("");
const ultimaAccion = ref("");
const ultimoLugar = ref("");
const myMap = ref("https://www.google.com/maps/place/");
const mylink = ref("");
const fichajeOk = ref(false);
const timeAgo = ref("");
const incidents_count = ref(0);

// datos del último fichaje
const { refresh } = useFetch(url_lastsigning, {
  headers: {
    Authorization: "Bearer " + accessToken.value,
  },
  method: "GET",
  onResponse({ response }) {
    // Process the response data
    console.log("desde response ultimoFichaje:", response._data);
    if (response.status === 200) {
      const ultfichajeResponse = response._data;
      console.log("Ult fichaje marcado:", ultfichajeResponse.momento_formateado);
      ultimoFichaje.value = ultfichajeResponse.momento_formateado;
      timeAgo.value = useTimeAgoEs(ultfichajeResponse.momento);
      ultimaAccion.value = ultfichajeResponse.accion;
      ultimoLugar.value = ultfichajeResponse.lugar.x + "," + ultfichajeResponse.lugar.y;
      mylink.value = myMap.value + ultimoLugar.value;
      buttonColor.value =
        ultimaAccion.value == "E"
          ? "background-color: orange; color: white"
          : "background-color: green; color: white";
      console.log("Lugar Fichaje:", ultimoLugar.value);
      console.log("mylink:", mylink.value);
    } else if (response.status === 204) {
      console.log("primer fichaje, todavía no hay datos");
    } else {
      navigateTo("/");
    }
  },
});

console.log("ultimo estado:", ultimoFichaje.value);

const today = new Date();
const currentDayStart = computed(
  () => new Date(today.getFullYear(), today.getMonth(), today.getDate())
);
const currentDayEnd = computed(
  () => new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
); // Inicio del día siguiente

// Definición de los rangos para el mes actual (usados en EmpleadosCompensationHours)
const currentMonthStart = computed(
  () => new Date(today.getFullYear(), today.getMonth(), 1)
);
const currentMonthEnd = computed(
  () => new Date(today.getFullYear(), today.getMonth() + 1, 0)
);

const getPlanning = async () => {
  const { data } = await useFetch(url_events, {
    headers: {
      Authorization: "Bearer " + accessToken.value,
    },
    method: "POST",
    body: {
      range_start: currentDayStart.value,
      range_end: currentDayEnd.value,
      label: "normal",
    },
  });
  console.log("events:", data.value);
};

const getIncidents = async () => {
  const { data } = await useFetch(url_incidents, {
    headers: {
      Authorization: "Bearer " + accessToken.value,
    },
    method: "GET",
  });
  console.log("incidents:", data.value);
  if (data.value.length > 0) {
    console.log("tienes incidentes abiertos");
    incidents_count.value = data.value.length;
  } else {
    console.log("no tienes incidentes abiertos");
  }
};

// acción de fichar
const fichar = (e) => {
  estadoFichaje.value = ultimaAccion.value == "E" ? "S" : "E";
  if (estadoFichaje.value == "E") {
    e.target.setAttribute("style", "background-color: orange; color: white ");
  } else {
    e.target.setAttribute("style", "background-color: green; color: white ");
  }
  const locatedAtFormated = locatedAt.value.toString().slice(0, 10);
  console.log("id_usuario:", user_data.id);
  console.log("latitud:", coords.value.latitude);
  console.log("longitud:", coords.value.longitude);
  console.log("locatedAt:", locatedAtFormated);
  console.log("estado fichaje:", estadoFichaje.value);

  const { data } = useFetch(url_signing, {
    headers: {
      Authorization: "Bearer " + accessToken.value,
    },
    method: "POST",
    body: {
      id: user_data.id,
      latitud: coords.value.latitude,
      longitud: coords.value.longitude,
      locatedAt: locatedAtFormated,
      accion: estadoFichaje.value,
    },
    key: "empSigned",
    onResponse({ request, response, options }) {
      // Process the response data
      console.log("nuevo fichaje (acción):", response._data.accion);
      console.log("nuevo fichaje (fichaje):", response._data.fichaje);
      console.log("nuevo fichaje (lugar):", response._data.lugar);
      if (response.status === 200) {
        ultimoFichaje.value = response._data.fichaje;
        timeAgo.value = useTimeAgoEs(response._data.momento);
        ultimaAccion.value = response._data.accion;
        ultimoLugar.value = response._data.lugar.x + "," + response._data.lugar.y;
        mylink.value = myMap.value + ultimoLugar.value;
        fichajeOk.value = true;
      } else {
        //alert('Upps...la sesión ha terminado, inténtalo de nuevo')
        navigateTo("/");
      }
    },
    onResponseError({ request, response, options }) {
      console.log("response error de fichar:", response._data);
    },
  });
};

function showInfoDialog() {
  const dialog = document.getElementById("info_modal");
  if (dialog) dialog.showModal();
}

function showCreditsDialog() {
  const dialog = document.getElementById("credits_modal");
  if (dialog) dialog.showModal();
}

function showManualIncidentDialog() {
  const dialog = document.getElementById("manual_incident_modal");
  if (dialog) dialog.showModal();
}

async function submitManualIncident(formData, node) {
  try {
    await $fetch(`${config.public.api}/employees/newincident`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken.value,
      },
      body: {
        id_user: user_data.id,
        ...formData,
      },
    });
    document.getElementById("manual_incident_modal").close();
    node.reset();
    getIncidents();
  } catch (error) {
    console.error("Error al crear incidente manual:", error);
  }
}

onMounted(() => {
  console.log(`the component is now mounted.`);
  console.log("ultimo fichaje:", ultimoFichaje.value);
  //getPlanning();
  getIncidents();
});
</script>

<template>
  <div class="container mx-auto">
    <div class="card">
      <figure><NuxtImg src="/images/fichar.png" alt="fichar" /></figure>
      <div class="card-body">
        <div class="card-title flex justify-center py-5 gap-8">
          <span @click="showInfoDialog" class="cursor-pointer">
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
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
          </span>
          <span @click="showCreditsDialog" class="cursor-pointer">
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
                d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
              /></svg
          ></span>

          <span @click="navigateTo('/empleados/micalendar')">
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
                d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z"
              />
            </svg>
          </span>
          <span @click="navigateTo('/empleados/misfichajes')">
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
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </span>

          <div class="indicator">
            <span
              v-if="incidents_count > 0"
              class="indicator-item status status-error animate-bounce"
              @click="navigateTo('/empleados/misincidentes')"
            ></span>
            <div @click="navigateTo('/empleados/misincidentes')">
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
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15h.008v.008H12v-.008zM12 18h.008v.008H12v-.008z"
                />
              </svg>
            </div>
          </div>
          <span @click="showManualIncidentDialog" class="cursor-pointer">
            <div class="tooltip" data-tip="Informar incidencia">
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
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
          </span>
        </div>

        <div class="flex gap-8 py-2">
          Estado: {{ ultimaAccion == "E" ? "TRABAJANDO 💪" : "LIBRE 🌈" }}
        </div>
        <div class="flex gap-4 py-2">Momento: {{ ultimoFichaje }} ({{ timeAgo }})</div>
        <div class="flex gap-4 py-2">
          Lugar:
          <NuxtLink :to="`${mylink}`" class="link link-primary" target="_blank">
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
        </div>

        <div class="card-actions justify-center">
          <div class="py-10">
            <FormKit
              v-if="locatedAt"
              type="button"
              id="myButton"
              :style="buttonColor"
              :ignore="false"
              @click="fichar"
            >
              {{ ultimaAccion == "E" ? "Salir" : "Entrar" }}
            </FormKit>
          </div>
        </div>
      </div>
    </div>

    <div class="toast toast-center toast-bottom">
      <div v-if="fichajeOk" class="alert alert-success" @click="navigateTo('/')">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>¡Has fichado!</span>
      </div>
    </div>
  </div>

  <dialog id="info_modal" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg text-primary">Guía de Uso</h3>
      <div class="py-4 space-y-4 text-sm">
        <p>
          Bienvenido al portal del empleado de Sierramar. Aquí tienes un resumen de lo que
          puedes hacer:
        </p>
        <ul class="list-disc pl-5 space-y-2">
          <li>
            <strong>Fichar:</strong> Pulsa el botón principal para registrar tu entrada o
            salida. Recuerda que el sistema registra tu ubicación.
          </li>
          <li>
            <strong>Calendario:</strong> Accede al icono de calendario para ver tu
            planificación mensual y días festivos.
          </li>
          <li>
            <strong>Historial:</strong> Consulta tus registros pasados y horas totales
            pulsando el icono del reloj.
          </li>
          <li>
            <strong>Incidencias:</strong> Si ves una bolita roja sobre el icono del
            triángulo, tienes una incidencia de fichaje que requiere tu atención (una
            declaración responsable). En caso necesario, puedes crear una pulsando sobre
            el icono de '+'.
          </li>
          <li>
            <strong>Permisos:</strong> En el icono del sol verás permisos disfrutados,
            vacaciones y también las horas acreditables por festivos que han coincidido
            con tus descansos.
          </li>
        </ul>
      </div>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn btn-primary">Entendido</button>
        </form>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>

  <dialog id="credits_modal" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg mb-4 text-secondary flex items-center gap-2">
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
            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
          />
        </svg>
        Créditos y Días Libres
      </h3>
      <EmpleadosTimeCredits :id="user_data.id" />
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>

  <dialog id="manual_incident_modal" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg mb-4">Informar Incidencia</h3>
      <p class="text-sm mb-6">
        Utiliza este formulario si has tenido algún problema para fichar (olvido, falta de
        cobertura, etc.)
      </p>

      <FormKit
        type="form"
        @submit="submitManualIncident"
        submit-label="Enviar"
        :submit-attrs="{ classes: { input: 'btn btn-primary w-full' } }"
      >
        <FormKit
          type="datetime-local"
          name="proposed_entry"
          label="Entrada que propones"
          validation="required"
        />
        <FormKit
          type="datetime-local"
          name="proposed_exit"
          label="Salida que propones"
          validation="required"
        />
        <FormKit
          type="textarea"
          name="statement_text"
          label="Explicación de lo ocurrido"
          placeholder="Ej: Olvidé fichar al entrar..."
          validation="required|length:10"
        />
      </FormKit>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<style scoped></style>
