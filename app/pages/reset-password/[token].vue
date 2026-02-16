<script setup>

definePageMeta({
  layout: "plain",
  title: 'Restablecer Contraseña',
  middleware: 'reset-password'
})

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const token = route.params.token
const error = ref(null)
const success = ref(false)
const isValidToken = ref(false)
const responded = ref(false)
//const failed = ref(false)


const formData = ref({
  newPassword: '',
  confirmPassword: ''
})

const handleIconClick = (node, e) => {
        node.props.suffixIcon = node.props.suffixIcon === 'eye' ? 'eyeClosed' : 'eye'
        node.props.type = node.props.type === 'password' ? 'text' : 'password'
}


async function handleSubmit() {
  error.value = null

  if (!isValidToken.value) {
    error.value = 'Token inválido'
    return
  }  
  
  console.log('formData:', formData.value)
  try {
    const response = await $fetch(`${config.public.api}/auth/reset-password/${token}`, {
      method: 'POST',
      body: {
        newPassword: formData.value.newPassword
      }
    })
    responded.value = true
    success.value = true
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (e) {
    error.value = e.data?.error || 'Error al restablecer la contraseña'
  }
}

onMounted(async () => {
  try {
    const response = await $fetch(`${config.public.api}/auth/verify-reset-token/${token}`, {
      method: 'GET'
    })
    isValidToken.value = true
  } catch (e) {
    error.value = 'Token inválido o expirado'
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }
})

</script>
<template>
    <div class="container mx-auto">
        <div class="flex flex-col items-center justify-center px-6 py-8">
        <div class="justify-items-center">
            <figure class=""> 
              <img class="mx-auto h-32 w-auto" src="/images/logo_sierramar.png" alt="sierramar logo" />
            </figure>
        </div>
            <div class="w-full p-6 rounded-lg shadow">
                <h2 class="mb-1 text-xl font-bold leading-tight tracking-tight">
                    Cambiar contraseña
                </h2>
                <FormKit type="form" 
                    :value="formData"
                    submit-label="Cambiar contraseña" 
                    @submit="handleSubmit"
                >
                    <FormKit
                        type="password"
                        name="newPassword"
                        v-model="formData.newPassword"
                        label="Nueva contraseña"
                        prefix-icon="password"
                        suffix-icon="eyeClosed"
                        @suffix-icon-click="handleIconClick"
                        validation="required|?length:8"
                        :validation-messages="{
                            length: 'mínimo 8 caracteres...',
                        }"
                    />
                    <FormKit
                        type="password"
                        label="Confirma la nueva contraseña"
                        name="newPassword_confirm"
                        validation="required|confirm"
                        prefix-icon="password"
                        suffix-icon="eyeClosed"
                        @suffix-icon-click="handleIconClick"
                    />  
                </FormKit>      
            </div>
            <div v-if="responded">
                <div v-if="success" class="alert alert-success">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Tu contraseña ha sido actualizada con éxito. Redirigiendo a login...</span>
                </div>  
                <div v-else class="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span>Lo siento, algo ha ido mal 😕</span>
                </div>
            </div>
        </div>
    </div>
  </template>


