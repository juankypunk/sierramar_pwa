<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup >
    import { useFetch } from '@vueuse/core';
    import 'leaflet/dist/leaflet.css';
    import L from 'leaflet';
    import { jwtDecode } from 'jwt-decode';
    const config = useRuntimeConfig();
    const accessToken=useAccessToken();
    const refreshToken = useCookie('refreshToken');
    const user_data = jwtDecode(accessToken.value);
    const { coords, locatedAt, error} = useGeolocation();
    const interval = ref(30000);
    const counter = ref(0);
    const lastPosition = ref({});
    const lastLocatedAt = ref('');
    const map = ref(null);
    const zoom = ref(16);
    const myContent=ref('hola');
    const url_tracking = computed(() => {
        return config.public.api + '/employees/location';    
    });

    const { pause, resume, isActive } = useIntervalFn(() => {
        if(locatedAt){
            saveLocation();
        }
    }, interval)

    // saveLocation
    const saveLocation = (e) => {
        const locatedAtFormated = locatedAt.value.toString().slice(0,10);
        console.log('id_usuario:',user_data.id);
        console.log('latitud:',coords.value.latitude);
        console.log('longitud:',coords.value.longitude);
        console.log('locatedAt:',locatedAtFormated)
        console.log('direccion:',coords.value.heading)
        const { onFetchResponse, data } = useFetch(url_tracking.value,{headers: {'Authorization': 'Bearer ' + accessToken.value,}})
            .post({
                "id": user_data.id,
                "latitud": coords.value.latitude,
                "longitud": coords.value.longitude,
                "locatedAt": locatedAtFormated,
                "direccion": coords.value.heading,
                "refreshToken": refreshToken.value,    
                  }).json();
        onFetchResponse((response)=>{
            console.log('respuesta:',data.value);
            lastPosition.value=data.value.lugar;
            lastLocatedAt.value=data.value.locatedat;
            counter.value++;
        })

        /*
        const {data} = useFetch(url,{
            headers: {
                'Authorization': 'Bearer ' + accessToken.value,
            },
            method: 'POST',
            body: {
                "id": user_data.id,
                "latitud": coords.value.latitude,
                "longitud": coords.value.longitude,
                "locatedAt": locatedAtFormated,
                "direccion": coords.value.heading,
                "refreshToken": refreshToken.value,
            },
            onResponse({ request, response, options }) {
                // Process the response data
                console.log('nueva ubicacion:',response._data[0].lugar);
                if(response.status===201){
                    console.log('respuesta:',response._data)
                    lastPosition.value=response._data[0].lugar
                    lastLocatedAt.value=response._data[0].locatedat
                    counter.value++
                    //accessToken.value=response._data.accessToken
                    //console.log('token refrescado:',accessToken.value)
                    //navigateTo('/')
                }else{
                    console.log('token caducado')
                    navigateTo('/')
                }
            },
            onResponseError({request, response, options}){
                console.log('response error:',response._data);
            }
        })  
        */
    }


onMounted(() => {
    console.log(`the component is now mounted.`)
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

}

</script>

<template>
  <div class="container mx-auto">
    <div v-if="locatedAt" style="height:400px; width:600px">
    <LMap 
      ref="map"
      :zoom="zoom"
      :max-zoom="28"
      :center="[coords.latitude,coords.longitude]" 
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
        :lat-lng="[coords.latitude,coords.longitude]"
      >
        <LPopup
          :content="coords.latitude.toString()+','+coords.longitude.toString()"
        />
        <LTooltip 
        :content="coords.latitude.toString()+','+coords.longitude.toString()"
        />
      </LMarker>    
    </LMap>
  </div>
  </div>
  

  <div class="flex justify-center py-10 px-5">
    <div class="px-5">
      <button class="btn btn-secondary px-10" @click="pause">
        Pause
      </button>
    </div>
    <div class="px-5">
      <button class="btn btn-primary px-10" @click="resume">
        Resume
      </button>
      </div>
  </div>

  <p>Tracking: {{ isActive }} </p>
  <p>Last position: {{ lastPosition }} </p>
  <p>Velocidad: {{ coords.speed }}</p>
  <p>LocatedAt: {{ lastLocatedAt }}</p>
  <p>Zoom: {{ zoom }}</p>
  <p>Counter: {{ counter }} </p>
  <p>interval: <input v-model="interval" type="number" placeholder="interval"></p>
  <div>
    <pre lang="json">{{
    JSON.stringify(
      {
        coords: {
          accuracy: coords.accuracy,
          latitude: coords.latitude,
          longitude: coords.longitude,
          altitude: coords.altitude,
          altitudeAccuracy: coords.altitudeAccuracy,
          heading: coords.heading,
          speed: coords.speed,
        },
        locatedAt,
        error: error ? error.message : error,
      },
      null,
      2,
    )
  }}</pre>
    </div>
  
</template>