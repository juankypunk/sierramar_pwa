<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
import CuotasHistorial from '~/components/cuotas/CuotasHistorial.vue';

    definePageMeta({
        middleware: ["auth"],
    });
    const route = useRoute();
    useHead({
        title: 'Cuotas SM'
    });
</script>

<template>
    <div class="container mx-auto px-5">
        <div role="tablist" class="tabs tabs-bordered tabs-md">
            <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="Cuotas" checked />
            <div role="tabpanel" class="tab-content py-10">
                <CuotasListado />  
            </div>

            <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="Remesa" />
            <div role="tabpanel" class="tab-content py-10">
                <CuotasRemesa />
            </div>
            <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="Historial" />
           
            <div role="tabpanel" class="tab-content py-10">
                <CuotasHistorial />
            </div>
        
        </div>    
    </div>
</template>

