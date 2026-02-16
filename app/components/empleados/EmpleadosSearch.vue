<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
    //import {useFetch} from '@vueuse/core';
    const query = ref('')
     
    const employees = ref([]);
    const config = useRuntimeConfig()
    const accessToken=useAccessToken()
    const url = computed(() => {
      return `${config.public.api}/employees/byname/${query.value}`;
    })

    const {data} = useFetch(url,{
      headers: {
         'Authorization': 'Bearer ' + accessToken.value,
      },
      method: 'GET',
      onResponse({ response }) {
      // Process the response data
      if(response.status===200){
          console.log('desde response:',response._data)
          employees.value = response._data          
        }else if(response.status===404) {
          console.log('no hay datos')
          employees.value=''
        }else{
          navigateTo('/refresh')
        }
      }
    })  
</script>

<template>
  <div class="container mx-auto">
    <div class="px-5 py-5">
            <FormKit 
                type="search"
                placeholder="Busca por nombre..."
                label="Nombre del empleado" 
                v-model="query"  
                suffix-icon="search"
            />
    </div>
    <div v-if="employees.length" class="join join-vertical w-full">
      <div v-for="emp in employees" class="collapse collapse-arrow join-item border border-base-300">
        <input type="radio" name="my-accordion-4"  /> 
        <div class="collapse-title text-xl font-medium">
          {{ emp.name.split(" ")[0] }}
        </div>
        <div class="collapse-content"> 
          <div class="card-actions justify-start px-5">
              <NuxtLink :to="{ name: 'empleados-ver_cuadrante_id', params: { id: emp.id } }">
              <span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z" />
              </svg>
              </span>
              </NuxtLink>
              <div class="divider divider-horizontal"></div>

              <NuxtLink :to="{ name: 'empleados-ver_fichajes_id', params: { id: emp.id } }">
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </span>
              </NuxtLink>
             <!-- 

              <div class="divider divider-horizontal"></div>

              <NuxtLink :to="{ name: 'usuarios-id', params: { id: emp.id } }">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />                      </svg>
              </NuxtLink>
              -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>