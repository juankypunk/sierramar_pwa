<script setup>
import { createFetch } from '@vueuse/core'

const props = defineProps({
  user_id: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['success', 'error'])

const config = useRuntimeConfig()
const accessToken = useAccessToken()
const url = `${config.public.api}/webpush/user`

const userName = ref('') // Opcional: para mostrar el nombre del usuario en el título o mensaje de éxito
const userFetchError = ref(null)
const { data: userData, error: fetchError } = await useFetch(`${config.public.api}/users/${props.user_id}`, {
  headers: {
    'Authorization': `Bearer ${accessToken.value}`
  },
  // Usamos una key para asegurar que se vuelva a ejecutar si cambia el user_id
  key: `user-name-${props.user_id}`
})

if (fetchError.value) {
  userFetchError.value = 'No se pudo cargar el nombre del usuario.'
  } else if (Array.isArray(userData.value) && userData.value.length > 0) {
    // El endpoint devuelve un array, por lo que accedemos al primer elemento.
    userName.value = userData.value[0].name || '' // Asumiendo que el nombre también viene en la respuesta
} else {
    userFetchError.value = 'No se encontró el nombre para este usuario o la respuesta no es válida.';
}

const useMyFetch = createFetch({
  baseUrl: url,
  options: {
    async beforeFetch({ options }) {
      options.headers.Authorization = `Bearer ${accessToken.value}`
      return { options }
    },
  },
  fetchOptions: {
    mode: 'cors',
  },
})

async function sendPushNotification(formData, node) {
  const payload = {
    user_id: props.user_id,
    ...formData
  }

  try {
    // Esperamos a que la petición termine
    const { data, error, response } = await useMyFetch('').post(payload).json()
    console.log('Respuesta del servidor:', { data, error, response }) 
    
    if (response.value && response.value.ok) {
      const successMessage = data.value?.message || 'Notificación enviada correctamente.'
      emit('success', successMessage)
      node.reset() // Resetea el formulario, limpiando valores y errores
    } else {
      const errorMessage = data.value?.error || error.value?.message || 'Error al enviar la notificación.'
      emit('error', errorMessage)
    }
  } catch (e) {
    emit('error', 'Error de conexión. No se pudo contactar con el servidor.')
  }
}
</script>

<template>
  <div class="container mx-auto p-5">
    <h3 class="text-lg font-bold mb-4">Notificación Push a {{ userName }}</h3>
    <FormKit type="form" @submit="sendPushNotification" submit-label="Enviar Notificación">
      <FormKit type="text" name="title" label="Título" placeholder="Título de la notificación" validation="required" />
      <FormKit type="textarea" name="body" label="Mensaje" placeholder="Contenido del mensaje" validation="required" />
      <FormKit type="url" name="url" label="URL (Opcional)" placeholder="https://ejemplo.com/pagina" validation="url" />
    </FormKit>
  </div>
</template>
