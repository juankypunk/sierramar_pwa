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

// --- Obtener el email del usuario al iniciar el componente ---
const userEmail = ref('')
const userName = ref('') // Opcional: para mostrar el nombre del usuario en el título o mensaje de éxito
const userFetchError = ref(null)
const { data: userData, error: fetchError } = await useFetch(`${config.public.api}/users/${props.user_id}`, {
  headers: {
    'Authorization': `Bearer ${accessToken.value}`
  },
  // Usamos una key para asegurar que se vuelva a ejecutar si cambia el user_id
  key: `user-email-${props.user_id}`
})

if (fetchError.value) {
  userFetchError.value = 'No se pudo cargar el email del usuario.'
  } else if (Array.isArray(userData.value) && userData.value.length > 0) {
    // El endpoint devuelve un array, por lo que accedemos al primer elemento.
    userEmail.value = userData.value[0].email;
    userName.value = userData.value[0].name || '' // Asumiendo que el nombre también viene en la respuesta
} else {
    userFetchError.value = 'No se encontró el email para este usuario o la respuesta no es válida.';
}

const useMyFetch = createFetch({
  baseUrl: `${config.public.api}/users/email/send`,
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

async function sendEmail(formData, node) {
  const payload = {
    to: userEmail.value,
    subject: formData.subject,
    html: formData.html // Usamos HTML para permitir formato en el correo
  }

  try {
    const { data, error, response } = await useMyFetch('').post(payload).json()
    
    if (response.value && response.value.ok) {
      const successMessage = data.value?.message || 'Correo enviado correctamente.'
      emit('success', successMessage)
      node.reset()
    } else {
      const errorMessage = data.value?.error || error.value?.message || 'Error al enviar el correo.'
      emit('error', errorMessage)
    }
  } catch (e) {
    emit('error', 'Error de conexión. No se pudo contactar con el servidor.')
  }
}
</script>

<template>
  <div class="container mx-auto p-5">
    <h3 class="text-lg font-bold mb-4">Enviar correo a {{userName }}</h3>
    
    <div v-if="userFetchError" class="alert alert-error"><span>{{ userFetchError }}</span></div>

    <FormKit v-else type="form" @submit="sendEmail" submit-label="Enviar Correo">
      <FormKit type="email" name="to" label="Email" :value="userEmail" readonly validation="required|email" />
      <FormKit type="text" name="subject" label="Asunto" placeholder="Asunto del correo" validation="required" />
      <FormKit type="textarea" name="html" label="Mensaje (HTML permitido)" placeholder="Escribe aquí tu mensaje..." validation="required" :rows="10" />
    </FormKit>
  </div>
</template>
