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
    <h3 class="text-lg font-bold mb-4">Notificación Push al Usuario {{ user_id }}</h3>
    <FormKit type="form" @submit="sendPushNotification" submit-label="Enviar Notificación">
      <FormKit type="text" name="title" label="Título" placeholder="Título de la notificación" validation="required" />
      <FormKit type="textarea" name="body" label="Mensaje" placeholder="Contenido del mensaje" validation="required" />
      <FormKit type="url" name="url" label="URL (Opcional)" placeholder="https://ejemplo.com/pagina" validation="url" />
    </FormKit>
  </div>
</template>
