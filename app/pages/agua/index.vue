<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
import AguaEstadistica from '~/components/agua/AguaEstadistica.vue';

    definePageMeta({
        middleware: ["auth"],
    });
    const route = useRoute();
    useHead({
        title: 'Agua'
    });
</script>

<template>
    <div class="container mx-auto px-5">
        <div class="tabs tabs-border">
            <label class="tab">
                <input type="radio" name="water_tabs" role="tab" class="tab" aria-label="Lectura" checked />
                Lectura
            </label>
            <div class="tab-content py-10">
                <AguaListado />  
            </div>

            <label class="tab">
                <input type="radio" name="water_tabs" role="tab" class="tab" aria-label="Remesa" />
                Remesa
            </label>
            <div class="tab-content py-10">
                <AguaRemesa />
            </div>

            <label class="tab">
                <input type="radio" name="water_tabs" role="tab" class="tab" aria-label="Historial" />
                Historial
            </label>
            <div class="tab-content py-10">
                <AguaEstadistica />
            </div>

            <label class="tab">
                <input type="radio" name="water_tabs" role="tab" class="tab" aria-label="Riego" />            
                Riego
            </label>
            <div class="tab-content py-10">
                <AguaListadoRiego />
            </div>

            <label class="tab">
                <input type="radio" name="water_tabs" role="tab" class="tab" aria-label="Suministro" />
                Suministro
            </label>
            <div class="tab-content py-10">
                <AguaSuministroListado />
            </div>
        </div>    
    </div>
</template>

