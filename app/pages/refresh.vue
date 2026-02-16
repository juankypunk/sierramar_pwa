<script setup>
  definePageMeta({
      layout: "loader"
  })
  /*
  import {jwtDecode} from "jwt-decode"
  const config = useRuntimeConfig()
  const refreshToken = useCookie('refreshToken')
  console.log('desde refresh:',refreshToken.value)
  const remember_me = useCookie('remember_me')
  console.log('desde refresh, remember_me:',remember_me.value)

  if(refreshToken.value && remember_me.value){
    const user_data = jwtDecode(refreshToken.value)
    console.log('decoded in refresh:',user_data.id)
    const url = config.public.api + '/auth/refresh'
    const {data}  = useFetch(url,{
    method: 'POST',
    credentials: 'include',
    body: {
        id_user : user_data.id,
        remember_me: remember_me.value,
    },
    key: `refresh_${user_data.id}`,
    onResponse({ request, response, options }) {
      // Process the response data
      const refreshResponse= response._data
      if(refreshResponse){
        //accessToken.value=response._data.accessToken
        navigateTo('/')
      }
    },
    onResponseError({request, response, options}){
      console.log('Uups:',response._data);
      //errorsLogin.value.push('Identificación incorrecta');
      //console.log('en errorsLogin:',errorsLogin.length)
      //console.log('errorsLogin:',errorsLogin.value);
    }
  })
  }else{
    navigateTo('/login')
  }
  */

</script>
<template>
</template>