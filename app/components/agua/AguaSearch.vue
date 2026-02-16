<script setup>
    const config = useRuntimeConfig();
    const accessToken=useAccessToken();
    const url = config.public.api;
    //console.log(url);
    const query = ref("");
    const socios = ref([]);
    async function search(){
        const {data} = await $fetch(`${url}/residentsbyname/${query.value}`,{
            headers: {
                'Authorization': 'Bearer ' + accessToken.value,
            },
        });
        socios.value = data;
    }
</script>

<template>
    <div>
        <form @submit.prevent="search">
            <input type="text" v-model="query">
             <button>Search</button>
        </form>
        <ul style="display: flex; flex-wrap: wrap; gap: 10px; list-style: none">
            <li v-for="e in socios" :key="socios.id">
                <NuxtLink :to="{ name: 'agua-id', params: { id: e.id_parcela } }">
                    {{ e.name }}
                </NuxtLink>
            </li>
        </ul>
        <pre>
        </pre>
    </div>
</template>