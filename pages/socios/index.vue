<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
//import SociosContact from '~/components/socios/SociosContact.vue';

    definePageMeta({middleware: ["auth"],});
    const route = useRoute();
    const config = useRuntimeConfig();
    const accessToken = useAccessToken();
    useHead({title: 'Socios'})
    const base_url = ref('https://www.google.com/maps/place/Urbanizacion+Sierramar,+')
    const urlParcela = computed(()=>{
        return base_url.value + id_parcela.value;
    })
    
    const url_residents_contact_csv = computed(() => {
        return config.public.api + `/residents/contact/csv`;
    });

    const descargaCSV = () => {
    fetch(url_residents_contact_csv.value,{
        headers: {
        "Content-Type": "application/json",
        'Authorization': 'Bearer ' + accessToken.value,
        },
        method: 'GET',
    })
    .then( res => res.blob() )
    .then( blob => {
      var file = window.URL.createObjectURL(blob);
        window.location.assign(file);
        return //res.blob();
      });
}


</script>
<template>
    <div class="container mx-auto px-5">
        <div class="flex justify-between">
            <div>
                <span class="badge badge-md">Socios</span>          
            </div>
            <div class="flex gap-8">
                <span @click="descargaCSV()" class="tooltip" data-tip="descargar CSV">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                </span>
            </div>    
        </div>
        <div>
            <SociosSearch/>    
        </div>
    </div>
</template>