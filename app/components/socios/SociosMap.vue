<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup >
import { createFetch } from '@vueuse/core';
    const config = useRuntimeConfig();
    const accessToken=useAccessToken();
    const map = ref(null);
    const zoom = ref(16);
    const latitude=ref('39.3097680588126');
    const longitude=ref('-0.48328931458732544');
    const locations=ref([]);

    const url = computed(() => {
      return `${config.public.api}/residents/location`;
    });
    
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
      locations.value=data.value;
      //latitude.value=data.value.geolocation.x.toString();
      //longitude.value=data.value.geolocation.y.toString();
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

    onMounted(() => {
        console.log(`the component is now mounted.`)
    })

</script>

<template>
  <div class="container mx-auto">
    <div class="px-1">
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
                <LMarker v-for="item in locations"
                    :lat-lng="[item.geolocation.x,item.geolocation.y]"
                    :draggable="false"
                >
                  <LPopup
                    :content="item.titular"
                  />
                  <LTooltip 
                    :content="item.id_parcela"
                  />
                </LMarker>    
            </LMap>
        </div>
    </div>
  </div>
</template>