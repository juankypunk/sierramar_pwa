<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
import { jwtDecode } from "jwt-decode";

const { login, isAuthenticated, validateRefreshToken } = useAuth()
const remember_me = useCookie('remember_me', { 
  maxAge: 365 * 24 * 60 * 60,  // 1 año
  path: '/',
  sameSite: 'lax',  // Cambia a 'strict' en producción
  secure: false, // Cambia a true en producción: process.env.NODE_ENV === 'production'
})
const refreshToken = useCookie('refreshToken')
const errorsLogin = ref([])
const accessToken = useAccessToken()

definePageMeta({
    title: 'Login',
    layout: 'login',
    middleware: 'login',
})


const formData = ref({
  email: '',
  passwd: '',
  remember_me: remember_me.value === 'true'
})

async function handleSubmit(formData) {
  remember_me.value = formData.remember_me
  
  const success = await login(formData)
  if (success) {
    navigateTo('/')
  } else {
    errorsLogin.value.push('Identificación incorrecta')
  }
}

console.log('autenticado:', isAuthenticated.value)


const handleIconClick = (node, e) => {
  node.props.suffixIcon = node.props.suffixIcon === 'eye' ? 'eyeClosed' : 'eye'
  node.props.type = node.props.type === 'password' ? 'text' : 'password'
}

onMounted(async () => {
  console.log('mounted on login')
  console.log('isAuthenticated at login:',isAuthenticated.value)
  console.log('remember_me:',remember_me.value)
  if (isAuthenticated.value) {
    navigateTo('/')
  }
})

</script>

<template>
  <div class="container mx-auto">
    <div class="relative flex flex-col items-center justify-center h-screen overflow-hidden">
      <div class="w-full p-6 bg-white border-t-4 border-gray-600 rounded-md shadow-md border-top lg:max-w-lg">
        <div class="justify-items-center">
            <figure class=""> 
              <img class="mx-auto h-32 w-auto" src="/images/logo_sierramar.png" alt="sierramar logo" />
            </figure>
        </div>
        <h1 class="text-3xl font-semibold text-center text-gray-700">Sierramar</h1>
        <FormKit 
            type="form" 
            :value="formData"
            submit-label="Login" 
            :submit-attrs="{
              help: '',
              errors: errorsLogin,
              }"
            @submit="handleSubmit"
          >
            <FormKit type="text" 
              validation="required|email" 
              label="Email" 
              name="email"
              prefix-icon="email"
              autocomplete="email"
              />
            <FormKit type="password" 
              label="Password" 
              name="passwd" 
              prefix-icon="password"
              suffix-icon="eyeClosed"
              @suffix-icon-click="handleIconClick"
            />
            <div class="flex justify-start py-5">
                <FormKit
                  type="checkbox"
                  label="Recuérdame"
                  help=""
                  name="remember_me"
                  :value=remember_me
                />
            </div>
          </FormKit>
          
          <div class="flex justify-end">
            <div class="text-sm">
              <NuxtLink to="/forgetpasswd" class="text-blue-500 hover:text-blue-600">
                ¿Has olvidado la contraseña?
              </NuxtLink>
            </div>
          </div>
      </div>
    </div>
  </div>  
</template>