<script setup>
definePageMeta({
        middleware: ["auth"],
})
const config = useRuntimeConfig()
const accessToken = useAccessToken()
const fichajes = ref([])
const route = useRoute()
const url_fichajes = computed(() => {
        return config.public.api + `/employees/${route.params.id}/getrawsignings`    
    })
const url_delete_signing = computed(() => {
        return config.public.api + `/employees/${route.params.id}/deletesigning`    
})
const url_update_signing = computed(() => {
        return config.public.api + `/employees/${route.params.id}/updatesigning`    
})
console.log('ruta:',route.name)
const searchQuery = ref('')
const gridColumns = ["fecha", "hora", "accion"]
const rowdata = ref({})
// datos de los últimos fichajes
const {refresh} = useFetch(url_fichajes,{
    headers: {
      'Authorization': 'Bearer ' + accessToken.value,
      },
    method: 'GET',
    onResponse({ response }) {
        // Process the response data
        if(response.status===200){
            console.log('desde response:',response._data)
            fichajes.value = response._data          
        }else if(response.status===204) {
          console.log('no hay datos')
        }else{
          console.log('error al cargar los fichajes:',response)
          //navigateTo('/refresh')
        }
      }
  });

  function showDialog(momento){
    console.log('momento:',momento)
    my_modal_1.showModal()
  }

  function deleteSigning(){
    console.log('datos para el borrado:',rowdata._rawValue.momento)
    const {data} = useFetch(url_delete_signing,{
      headers: {
      'Authorization': 'Bearer ' + accessToken.value,
      },
      method: 'POST',
      body: {
        "momento": rowdata._rawValue.momento
      },
      onResponse({ request, response, options }) {
        // Process the response data
        if(response.status===200){
            console.log('fichaje eliminado')
            refresh()
        }else{
          //alert('Upps...la sesión ha terminado, inténtalo de nuevo')
          navigateTo('/refresh')
        }
      },
      onResponseError({request, response, options}){
        console.log('response error al eliminar fichaje:',response);
    }
  });  
  }

  function updateSigning(){
    const {data} = useFetch(url_update_signing,{
      headers: {
      'Authorization': 'Bearer ' + accessToken.value,
      },
      method: 'POST',
      body: {
        "momento": rowdata._rawValue.momento,
        "momento_updated": rowdata._rawValue.momento_formated
      },
      onResponse({ request, response, options }) {
        // Process the response data
        if(response.status===200){
            console.log('fichaje actualizado')
            refresh()
        }else{
          //alert('Upps...la sesión ha terminado, inténtalo de nuevo')
          navigateTo('/refresh')
        }
      },
      onResponseError({request, response, options}){
        console.log('response error al eliminar fichaje:',response);
        }
    });
    }

</script>

<template>
<div class="container mx-auto">
  <div class="px-5 flex gap-4">
        <span @click="navigateTo('/empleados')">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
        </span>
        <span>Empleados</span>
  </div>
  <div class="flex justify-center">
    <ul class="menu menu-horizontal bg-base-100">
      <li>
          <NuxtLink :to="{ name: 'empleados-ver_fichajes_id', params: { id: route.params.id } }">
                Ver
          </NuxtLink>
      </li>
      <li><a class="active">Editar</a></li>
    </ul>
  </div>

  <div class="flex justify-start">
      <h1 class="px-5">Fichajes:</h1>
      <p><UserName :id="route.params.id" :shortname="true"/></p>
  </div>
  <div class="flex justify-end px-5">
      <form id="search" @submit.prevent="">
          <input type="text" placeholder="busca una fecha" class="input input-bordered input-sm max-w-xs" name="query" v-model="searchQuery">
      </form>
      <dialog id="my_modal_1" class="modal">
        <div class="modal-box">
            <h3 class="font-bold text-lg">¿Quieres editar este fichaje?</h3>
            <p class="py-4"></p>
            <FormKit
              type="datetime-local"
              v-model="rowdata.momento_formated"
              label="Momento del fichaje"
              help=""
            />     
            <div class="modal-action">
                <form method="dialog">
                    <!-- if there is a button in form, it will close the modal -->
                    <button @click="deleteSigning" class="btn btn-secondary">Eliminar</button>
                    <button class="btn">Cancelar</button>
                    <button @click="updateSigning" class="btn btn-primary">Actualizar</button>
                </form>
            </div>
        </div>
      </dialog>
  </div>
  <div class="py-5">
    <MyGrid
      :data="fichajes"
      :columns="gridColumns"
      :filter-key="searchQuery"
      v-model:rowdata="rowdata"
      @update:rowdata="showDialog(rowdata)"
    >
    </MyGrid>
  </div>
</div>

</template>