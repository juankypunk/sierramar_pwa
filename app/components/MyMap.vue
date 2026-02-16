<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup >
import { createFetch } from '@vueuse/core';
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

    const props = defineProps({
        id_parcela: String
    })
    let { id_parcela } = props;
    const config = useRuntimeConfig();
    const accessToken=useAccessToken();
    const map = ref(null);
    const zoom = ref(16);
    const latitude=ref('39.3097680588126');
    const longitude=ref('-0.48328931458732544');

    const url = computed(() => {
      return `${config.public.api}/residents/${id_parcela}/location`;
    })
    const url_set = computed(() => {
      return `${config.public.api}/residents/${id_parcela}/location`;
    })
    
    const locationForm = ref({});
    const responded = ref(false);
    const success = ref(false);
    const failed = ref(false);


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

    
    const { onFetchResponse, error, data } = useMyFetch('').get().json();
    onFetchResponse((response)=>{
      console.log('hola desde onFetchResponse',response.status);
      console.log('data:',data.value.notas);
      locationForm.value=data.value;
      latitude.value=data.value.geolocation.x.toString();
      longitude.value=data.value.geolocation.y.toString();
      locationForm.value.geolocation=data.value.geolocation.x.toString() + ',' + data.value.geolocation.y.toString();
    })

    // When the map is ready
    const mapInitialized = () => {
        console.log('Map is ready')
        console.log(map.value.maxZoom)
        console.log('map:',map.value)
    }

    function onMapClick(e) {
        console.log('has clicado:',e.latlng.lat.toString())
        console.log('el zoom del map:',map.value.zoom)
        locationForm.value.geolocation=e.latlng.lat.toString() + ',' + e.latlng.lng.toString()
        latitude.value=e.latlng.lat.toString();
        longitude.value=e.latlng.lng.toString();      
    }

    function handleSubmit(){
        console.log('location:',location.value);
        const { onFetchResponse, error, data } = useMyFetch('').post(locationForm.value).json();     
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
    onMounted(() => {
        console.log(`the component is now mounted. id_parcela:`,id_parcela)
    })

</script>

<template>
  <div class="container mx-auto">
    <div class="px-1">
        <h1>Parcela {{ id_parcela }}</h1>
        <div  style="height:400px; width:400px">
            <LMap
            ref="map"
            :zoom="zoom"
            :max-zoom="28"
            :center="[latitude,longitude]" 
            @ready="mapInitialized" 
            @click="onMapClick"
            >      
                <LTileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&amp;copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors"  
                    layer-type="base"
                    name="OpenStreetMap"
                />    
                <LMarker 
                    :lat-lng="[latitude,longitude]"
                    :draggable="false"
                >
                  <LPopup
                    :content="props.id_parcela"
                  />
                  <LTooltip 
                    :content="props.id_parcela"
                  />
                </LMarker>    
            </LMap>
        </div>
    </div>
    
    <div class="px-1 py-10">
        <FormKit 
        type="form" 
        @submit="handleSubmit" 
        v-model="locationForm"
        submit-label="Actualizar"
        :submit-attrs="{
          help: ''
        }"
        >
            <FormKit 
                type="text" 
                label="Coordenadas" 
                validation=""
                name="geolocation"
            />
            <FormKit 
                type="textarea" 
                label="Notas" 
                validation=""
                name="notas"
            />
        </FormKit>
    
    </div>
    <div v-if="responded"  class="toast toast-bottom toast-center">
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