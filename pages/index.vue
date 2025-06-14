<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
  import { jwtDecode } from "jwt-decode"
  definePageMeta({
    middleware: 'auth',
  })
  const config = useRuntimeConfig()
  const accessToken = useAccessToken()
  const remember_me = useCookie('remember_me')
  const { isAuthenticated } = useAuth()
  console.log('isAuthenticated at home:',isAuthenticated.value)
  const user_data = ref('')


  if(accessToken.value){
    console.log('accessToken (home):',accessToken.value)
    const decoded = jwtDecode(accessToken.value)
    console.log('decoded (home):',decoded)
    user_data.value = decoded
  }
  const userParcel = useHasParcel()
  //console.log('refreshToken (home):',refreshToken.value)
  //const userParcel = useHasParcel();
 
  const weatherData = ref()
  fetch(
    "https://api.open-meteo.com/v1/forecast?latitude=39.309613824033086&longitude=-0.4832432456001327&current=is_day,temperature_2m&hourly=temperature_2m,relativehumidity_2m,windspeed_10m"
  )
  .then(async (res) => (weatherData.value = await res.json()))
  .catch((error) => alert(error.message));

  //console.log('temperatura actual: ',weatherData.value.current_weather.temperature)

  function convertUTCDateToLocalDate(date) {
    var newDate = new Date(date);
    newDate.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return newDate;
  }

  /*
  console.log('el nombre es:',user_data.name)
  console.log('roles:',user_data.roles)
  if(user_data.roles.includes('admin')){
    console.log('es admin')
  }
*/  
  //const online = useOnline();
  //const now=useDateFormat(useNow());
  //const iat = convertUTCDateToLocalDate(new Date(user_data.iat * 1000));
  //const exp = convertUTCDateToLocalDate(new Date(user_data.exp * 1000));
  //console.log('IAT:',iat.toISOString());
  //console.log('EXP:',exp.toISOString());
  //console.log('token:',token.value);

  const img = useImage()
  const backgroundStyles = computed(() => {
    const imgUrl = img('/images/pozoSM1.png', { width: 800 })
    return { backgroundImage: `url('${imgUrl}')` }  
  })

onMounted(() => {
  console.log('mounted')
  if (!isAuthenticated.value) {
    navigateTo('/login')
  } 
})
</script>

<template>
<div class="hero min-h-screen" :style=backgroundStyles>
  <div class="hero-overlay bg-opacity-30"></div>
  <div class="hero-content text-center text-neutral-content">
    <div class="max-w-md">
      <h1 v-if="user_data" class="mb-5 text-3xl font-bold">Hola, {{ user_data.name.split(" ")[0] }}</h1>   
      <div>
        <h2 v-if="weatherData">{{ weatherData.current.temperature_2m }}ºC</h2>
      </div>
    </div>    
  </div>
</div>
<!--
<div class="hero bg-base-200 min-h-screen">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 class="text-5xl font-bold">Parcelario</h1>
      <p class="py-6">
        (en pruebas)
      </p>
      <SociosMap/>
    </div>
  </div>
</div>
-->
</template>
