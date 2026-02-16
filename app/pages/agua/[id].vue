<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
    import { Bar } from 'vue-chartjs';
    definePageMeta({
        middleware: ["auth"],
    });
    useHead({
        title: 'Agua'
    });
    const route= useRoute();
    const config = useRuntimeConfig();
    const accessToken=useAccessToken();
    
  </script>

<template>
  <div class="container mx-auto">
    <div class="px-5">
        <span @click="navigateTo('/socios')">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
        </span>
        <div class="flex px-5 justify-center">
            <div class="">
                <span class="px-5">
                    Parcela: {{ route.params.id }}
                </span>
            </div>
        </div>
    </div>
    <div class="tabs tabs-border">
        <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="Consumo" checked />
        <div role="tabpanel" class="tab-content py-0">
          <AguaLectura 
            :id_parcela="route.params.id"
            :m3_input="true"
            :domicilia_bco_input="true" 
            :navegable="false" 
          />
        </div>

        <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="Historial" />
        <div role="tabpanel" class="tab-content py-10">
          <div>
            <MyGraph :id_parcela="route.params.id"/>
          </div>
          <div>
            <details class="collapse collapse-arrow">
                <summary class="collapse-title text-xl font-medium">Historial de consumo (click para ver)</summary>
                <div v-if="route.params.id" class="collapse-content"> 
                  <AguaHistorial 
                    :id_parcela="route.params.id"
                    :show_notes="true"
                  />
                </div>
            </details>
          </div>          
        </div>
    </div>
  </div>
  </template>

<style> 
 
</style>