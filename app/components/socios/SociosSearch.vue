<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
    const query = ref('');
    const socios = ref([]);
    const listado_socios=ref([]);
    const config = useRuntimeConfig();
    const accessToken=useAccessToken();
    const gridColumns = ["id_parcela", "titular"];
    const rowdata = ref({});
    
    const url_search = computed(() => {
      return `${config.public.api}/residents/byname/${query.value}`;
    })

    const url_residents_list = computed(() => {
      return `${config.public.api}/residents/list`;
    })

    const {data} = useFetch(url_search,{
      headers: {
         'Authorization': 'Bearer ' + accessToken.value,
      },
      method: 'GET',
      onResponse({ response }) {
      // Process the response data
      if(response.status===200){
          console.log('desde response:',response._data);
          console.log('id:',response._data[0].id);
          socios.value = response._data;   
          console.log('socios.id:',socios.value[0].id);

        }else if(response.status===404) {
          console.log('no hay datos');
          socios.value='';
        }else{
          //navigateTo('/refresh');
        }
      }
    })  

    
    const {data2} = useFetch(url_residents_list,{
    headers: {
      'Authorization': 'Bearer ' + accessToken.value,
      },
    method: 'GET',
    onResponse({ response }) {
        // Process the response data
        if(response.status===200){
            console.log('desde response en residentslist:',response._data);
            listado_socios.value = response._data   
        }else if(response.status===204) {
          console.log('no hay datos')
          listado_socios.value = ''
        }else{
          //navigateTo('/refresh')
        }
      }
  })

  const showContact = (data) => {
    console.log('los datos son:',data);
    contact_detail.showModal();
  }

</script>

<template>
    <div class="container mx-auto"> 
        <div class="px-5 py-5">
            <FormKit 
                type="search"
                placeholder="Busca por nombre o parcela..."
                label="Titular o parcela" 
                v-model="query"  
                help="Por ejemplo: 'garc' o '001'" 
                suffix-icon="search"
            />
        </div>
        
        <div v-if="socios.length" class="join join-vertical w-full">
            <div v-for="socio in socios" class="collapse collapse-arrow join-item border border-base-300">
                <input type="radio" name="my-accordion-4"  /> 
                <div class="collapse-title text-xl font-medium">
                    {{ socio.name }}
                </div>
                <div class="collapse-content"> 
                    <div class="card-actions justify-start">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819" />
                            </svg>
                        </div>
                        <div v-for="parcela in socio.id_parcela" class="badge badge-success badge-outline">
                            <NuxtLink v-if="parcela" :to="{ name: 'socios-id', params: { id: parcela } }">
                                {{ parcela }}
                            </NuxtLink>
                        </div>
                        <div class="divider divider-horizontal"></div>
                        <div>
                            <span>💧</span>
                        </div>
                        <div v-for="parcela_agua in socio.id_parcela_agua" class="badge badge-info badge-outline">
                            <NuxtLink v-if="parcela_agua" :to="{ name: 'agua-id', params: { id: parcela_agua } }">
                                {{ parcela_agua }}
                            </NuxtLink>
                        </div>
                        
                        <div class="divider divider-horizontal"></div>
                        <div>
                            <NuxtLink :to="{ name: 'usuarios-id', params: { id: socio.id } }">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                            </NuxtLink>
                        </div>
                        <!--
                        <div class="divider divider-horizontal"></div>
                        <div>
                            <NuxtLink :to="{ name: 'socios-id', params: { id: socio.id } }">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                </svg>
                            </NuxtLink>
                        </div>
                        -->
                    </div>
                </div>
            </div>
        </div> 

        <details class="py-10 collapse collapse-arrow">
            <summary class="collapse-title text-xl font-medium">Listado de socios (click para ver)</summary>
            <div v-if="listado_socios" class="collapse-content"> 
                <MyGrid
                    :data="listado_socios"
                    :columns="gridColumns"
                    tableSize="table-sm"
                    v-model:rowdata="rowdata"
                    @update:rowdata="showContact(rowdata)"
                >
                </MyGrid>
            </div>
        </details>

        <dialog id="contact_detail" class="modal">
            <div class="modal-box">
                <form method="dialog">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <div class="tabs tabs-border">
                    <input type="radio" name="my_tabs_2" class="tab" aria-label="Contacto" checked="checked" />
                    <div class="tab-content border-base-300 bg-base-100 p-10">
                        <table class="table table-sm table-zebra w-full">
                            <tbody>
                                <tr><td class="font-bold">Titular</td><td>{{ rowdata.titular }}</td></tr>
                                <tr><td class="font-bold">Email</td><td>{{ rowdata.email }}</td></tr>
                                <tr><td class="font-bold">Teléf1</td><td>{{ rowdata.telef1 }}</td></tr>
                                <tr><td class="font-bold">Teléf2</td><td>{{ rowdata.telef2 }}</td></tr>
                                <tr><td class="font-bold">Teléf3</td><td>{{ rowdata.telef3 }}</td></tr>
                                <tr><td class="font-bold">Domicilio</td><td>{{ rowdata.domicilio }}</td></tr>
                                <tr><td class="font-bold">Localidad</td><td>{{ rowdata.localidad }}</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <input type="radio" name="my_tabs_2" class="tab" aria-label="Banco" />
                    <div class="tab-content border-base-300 bg-base-100 p-10">
                        <table class="table table-sm table-zebra w-full">
                            <tbody>
                                <tr><td class="font-bold">NIF Titular agua</td><td>{{ rowdata.nif_titular_cc_agua }}</td></tr>
                                <tr><td class="font-bold">Titular cc agua</td><td>{{ rowdata.titular_cc_agua }}</td></tr>
                                <tr><td class="font-bold">BIC agua</td><td>{{ rowdata.bic_agua }}</td></tr>
                                <tr><td class="font-bold">IBAN agua</td><td>{{ rowdata.iban_agua }}</td></tr>
                                <tr><td class="font-bold">Titular cc cuota</td><td>{{ rowdata.titular_cc_cuota }}</td></tr>
                                <tr><td class="font-bold">BIC cuota</td><td>{{ rowdata.bic_cuota }}</td></tr>
                                <tr><td class="font-bold">IBAN cuota</td><td>{{ rowdata.iban_cuota }}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>  
            </div>
        </dialog>
    </div>
</template>