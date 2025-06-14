<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
//import { waitForDebugger } from 'inspector';
import { createFetch } from '@vueuse/core';
    const props = defineProps({
        id: Number
    })
    const config = useRuntimeConfig()
    const accessToken=useAccessToken()
    
    const url = computed(() => {
      return `${config.public.api}/users/${props.id}`
    })

    const userForm = ref({})
    const responded = ref(false)
    const success = ref(false)
    const failed = ref(false)


    const useMyFetch = createFetch({
      baseUrl: url.value,
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

    const { onFetchResponse, error, data } = useMyFetch('/').get().json();
    onFetchResponse((response)=>{
      console.log('desde onFetchResponse',response);
      userForm.value=data.value[0];
    })

    //console.log('userForm despues de cargar:',userForm.value)
    function handleSubmit(myData){
        console.log('Submit:',myData);
        const { onFetchResponse, error, data } = useMyFetch('/update').put(userForm.value);
      
        onFetchResponse((response)=>{
          console.log('desde onFetchResponse',response.status);
          if(response.status===200){
            responded.value = true;
            success.value = true;
            const myTimeout = setTimeout(clearMessage, 2000);
          }
        })
    }

    function clearMessage(){
      responded.value = false
      success.value = false
    }

</script>
<template>
    <div class="container mx-auto px-5">
      <FormKit 
        type="form" 
        @submit="handleSubmit" 
        v-model="userForm"
        submit-label="Actualizar"
        :submit-attrs="{
          help: ''
        }"
        >
        <FormKit 
          type="text" 
          label="Nombre del usuario" 
          name="name" 
          validation="required"
        />
        <FormKit 
          type="text" 
          label="Email" 
          name="email" 
          validation="email"
        />
      </FormKit>
      <div v-if="responded">
                <div v-if="success" class="alert alert-success">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Datos actualizados!</span>
                </div>  
                <div v-else class="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span>Lo siento, algo ha ido mal 😕</span>
                </div>
      </div>
    </div>    
</template>