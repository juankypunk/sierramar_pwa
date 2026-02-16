<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
const config = useRuntimeConfig();
definePageMeta({
    layout: "plain"
})
const errorsForgetPasswd = ref([]);
const formData = ref({
  email: '',
})
const responded = ref(false)
const success = ref(false);
const failed = ref(false)

async function handleSubmit(formData){
    console.log('frontend:',formData);  
    const url = config.public.api + '/auth/forgot-password'
    const {data}  = await useFetch(url,{
        method: 'POST',
        body: formData,
        key: formData.email,
        onResponse({ request, response, options }) {
        // Process the response data
        const forgetPasswdResponse= response._data;
        console.log('response:', forgetPasswdResponse)
        if(forgetPasswdResponse==='NOT FOUND'){
            //alert('El Email indicado no existe en Sierramar. Contacte con el administrador.')
            responded.value = true
            failed.value = true
        }else{
            //alert('Su contraseña ha sido restablecida con éxito, consulte su correo.')
            responded.value = true
            success.value = true
        }
        //useRouter().push("/")
    },
    onResponseError({request, response, options}){
      console.log('servidor dice:',response._data);
      errorsForgetPasswd.value.push('Upps... algo ha salido mal');
      //console.log('en errorsLogin:',errorsLogin.length)
      console.log('errorsForgetPasswd:',errorsForgetPasswd.value);
    }
  });
}

</script>
<template>
<div class="relative flex flex-col items-center justify-center h-screen overflow-hidden">
        <div class="w-full p-6 bg-white border-t-4 border-gray-600 rounded-md shadow-md border-top lg:max-w-lg">
        <div class="justify-items-center">
            <figure class=""> 
              <img class="mx-auto h-32 w-auto" src="/images/logo_sierramar.png" alt="sierramar logo" />
            </figure>
        </div>
        <h1 class="text-3xl font-semibold text-center text-gray-700">¿No puedes entrar?</h1>
        <div style="padding-top: 20px">
            <FormKit 
            type="form" 
            :value="formData"
            submit-label="Restablece tu contraseña" 
            :submit-attrs="{
              help: '',
              errors: errorsForgetPasswd
              }"
            @submit="handleSubmit"
          >
            <FormKit type="text" validation="required|email" placeholder="Introduce tu email" name="email"/>
            </FormKit>
        </div>
        <div v-if="responded">
            <div v-if="success" class="alert alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Te hemos enviado un correo con instrucciones para restablecer tu contraseña.</span>
            </div>  
            <div v-if="failed" class="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>Lo siento, no conocemos ese mail</span>
            </div>
        </div>
        
        <div class="flex justify-end"> 
              <div class="text-sm">
                <NuxtLink to="/login" class="text-blue-500 hover:text-blue-600">
                  Login
                </NuxtLink>
              </div>
            </div>
        </div>
  </div>

</template>