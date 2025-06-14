<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
    definePageMeta({
        middleware: ["auth"],
    });
    const { changePassword, isAuthenticated } = useAuth()
    const config = useRuntimeConfig()

    const accessToken = useAccessToken()

    const url_change_passwd = computed(() => {
            return config.public.api + '/auth/change-password/'  
        })

    const formData = ref({
        newPassword: '',
    })
    const responded = ref(false)
    const success = ref(false)
    const failed = ref(false)

    const handleSubmit = (formData) => {
        console.log('el passwd:',formData)
        const {data}  = useFetch(url_change_passwd,{
            headers: {
                Authorization: 'Bearer ' + accessToken.value,
            },
            method: 'POST',
            body: formData,
            onResponse({ request, response, options }) {
            // Process the response data
            console.log('response:', response._data)
            if(response.status === 200){
                console.log('todo bien')
                responded.value = true
                success.value = true
            }else if(response.status==403){
                // token caducado
                navigateTo('/')
            }else{
                console.log('todo mal')
                responded.value = true
                failed.value = true
            }
            }
        })
        console.log('data:',data)
    }
    const handleIconClick = (node, e) => {
        node.props.suffixIcon = node.props.suffixIcon === 'eye' ? 'eyeClosed' : 'eye'
        node.props.type = node.props.type === 'password' ? 'text' : 'password'
    }    
</script>

<template>
    <div class="container mx-auto">
        <div class="flex flex-col items-center justify-center px-6 py-8">
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
                        name="oldPassword"
                        label="Actual contraseña"
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
                        name="newPassword"
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
                    <span>Tu contraseña ha sido actualizada con éxito</span>
                </div>  
                <div v-else class="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span>Lo siento, algo ha ido mal 😕</span>
                </div>
            </div>
        </div>
    </div>
  </template>