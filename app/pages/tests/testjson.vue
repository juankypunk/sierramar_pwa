<script setup >
import {useFetch} from '@vueuse/core';
const accessToken=useAccessToken();

const chunk = ref('');
const url = computed(() => {
    return `http://localhost:3030/usersbyname/${chunk.value}`;
});
const { isFetching, data, error } = useFetch(
    url,{
      headers: {
        'Authorization': 'Bearer ' + accessToken.value,
      },
      method: 'GET'},
    { refetch: true});
</script>

<template>
  <input type="text" v-model="chunk" />
  <div v-if="error" style="color: red">Error: {{ error }}</div>
  <div v-else-if="isFetching" style="color: blue">loading...</div>
  <pre v-else>{{ data }}</pre>

</template>