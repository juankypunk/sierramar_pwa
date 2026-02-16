<script setup>
  import {jwtDecode} from 'jwt-decode'
  import { useTimeAgoEs } from '~/composables/useTimeAgoEs.js'

  definePageMeta({
        middleware: ["auth"],
  })
  const config = useRuntimeConfig()
  const accessToken=useAccessToken()
  const user_data = jwtDecode(accessToken.value)
  const route = useRoute()
  console.log('ruta:',route.name)
  const { coords, locatedAt, error } = useGeolocation()
  const empleado = useLocalStorage('empleado','hola empleado')
  const url1 = config.public.api + '/employees/' + user_data.id + '/lastsigning'
  const estadoFichaje = ref('')
  const buttonColor = ref('')
  const ultimoFichaje = ref('')
  const ultimaAccion = ref('')
  const ultimoLugar = ref('')
  const myMap = ref('https://www.google.com/maps/place/')
  const mylink = ref('')
  const fichajeOk = ref (false)
  const timeAgo = ref('')

  // datos del último fichaje
    const {refresh} = useFetch(url1,{
    headers: {
      'Authorization': 'Bearer ' + accessToken.value,
      },
    method: 'GET',
    onResponse({ response }) {
        // Process the response data
        console.log('desde response ultimoFichaje:',response._data);
        if(response.status===200){
          const ultfichajeResponse= response._data
          console.log('Ult fichaje marcado:',ultfichajeResponse.momento_formateado)
          ultimoFichaje.value = ultfichajeResponse.momento_formateado
          timeAgo.value = useTimeAgoEs(ultfichajeResponse.momento)
          ultimaAccion.value = ultfichajeResponse.accion
          ultimoLugar.value = ultfichajeResponse.lugar.x +','+ ultfichajeResponse.lugar.y
          mylink.value = myMap.value + ultimoLugar.value
          buttonColor.value = ultimaAccion.value == 'E' ? 'background-color: orange; color: white' : 'background-color: green; color: white'
          console.log('Lugar Fichaje:',ultimoLugar.value)
          console.log('myurl:',myurl.value)
          console.log('mylink:',mylink.value)
        }else if(response.status===204) {
          console.log('primer fichaje, todavía no hay datos')
        }else{
          navigateTo('/')
        }
      }
  });

  console.log('ultimo estado:',ultimoFichaje.value.accion)

  // acción de fichar
  const fichar = (e) => {
    estadoFichaje.value = ultimaAccion.value == 'E' ? 'S': 'E';
    if(estadoFichaje.value=='E'){
      e.target.setAttribute(
      'style',
      'background-color: orange; color: white ' 
      )
    }else{
      e.target.setAttribute(
      'style',
      'background-color: green; color: white '
      )
    }
    const locatedAtFormated = locatedAt.value.toString().slice(0,10);
    console.log('id_usuario:',user_data.id);
    console.log('latitud:',coords.value.latitude);
    console.log('longitud:',coords.value.longitude);
    console.log('locatedAt:',locatedAtFormated)
    console.log('estado fichaje:',estadoFichaje.value);
    
    const url2 = config.public.api + '/employees/sign';
    const {data} = useFetch(url2,{
      headers: {
      'Authorization': 'Bearer ' + accessToken.value,
      },
      method: 'POST',
      body: {
        "id": user_data.id,
        "latitud": coords.value.latitude,
        "longitud": coords.value.longitude,
        "locatedAt": locatedAtFormated,
        "accion": estadoFichaje.value,
      },
      key: 'empSigned',
      onResponse({ request, response, options }) {
        // Process the response data
        console.log('nuevo fichaje (acción):',response._data.accion);
        console.log('nuevo fichaje (fichaje):',response._data.fichaje);
        console.log('nuevo fichaje (lugar):',response._data.lugar);
        if(response.status===200){
            ultimoFichaje.value = response._data.fichaje
            timeAgo.value = useTimeAgoEs(response._data.momento)
            ultimaAccion.value = response._data.accion
            ultimoLugar.value = response._data.lugar.x +','+ response._data.lugar.y
            mylink.value = myMap.value + ultimoLugar.value
            fichajeOk.value = true
        }else{
          //alert('Upps...la sesión ha terminado, inténtalo de nuevo')
          navigateTo('/')
        }
      },
      onResponseError({request, response, options}){
        console.log('response error de fichar:',response._data);
    }
  });  
}

onMounted(() => {
    console.log(`the component is now mounted.`)
    console.log('ultimo fichaje:',ultimoFichaje.value)
    if(!ultimoFichaje.value){
    //refresh()
    }
})
</script>

<template>
  <div class="container mx-auto">
    <div class="card">
      <figure><NuxtImg src="/images/fichar.png" alt="fichar"/></figure>
      <div class="card-body">
        <h2 class="card-title flex justify-center py-5 gap-8">Mi control horario <span @click="navigateTo('/empleados/micalendar')">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z" />
          </svg>
        </span>
        <span @click="navigateTo('/empleados/misfichajes')">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </span></h2>
        <div class="flex gap-8 py-2">
          Estado: {{ (ultimaAccion=='E')? 'TRABAJANDO 💪' : 'LIBRE 🌈'  }}  
          
        </div> 
        <div class="flex gap-4 py-2">Momento: {{ ultimoFichaje }} ({{ timeAgo }})</div>
        <div class="flex gap-4 py-2">Lugar:
        <NuxtLink :to="`${mylink}`" class="link link-primary" target="_blank">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
        </NuxtLink>
        </div>

        
        <div  class="card-actions justify-center">
          <div class="py-10">
            <FormKit v-if="locatedAt"
              type="button" 
              id="myButton"
              :style=buttonColor
              :ignore="false"
              @click="fichar">
              {{ultimaAccion == 'E' ? 'Salir' : 'Entrar'}}
            </FormKit>
          </div>
        </div>
      </div>
    </div>
    
    <div  class="toast toast-center toast-bottom">
      <div v-if="fichajeOk" class="alert alert-success" @click="navigateTo('/')">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>¡Has fichado!</span>
      </div>
    </div>
  </div>

</template>

<style scoped></style> 
