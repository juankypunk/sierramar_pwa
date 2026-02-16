<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->
<script setup>

</script>
<template>
    <div class="navbar bg-base-100">
        <div class="navbar-start">
            <div class="px-5 flex gap-4">
                <span @click="navigateTo('/empleados')">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                </span>
                <span>Empleados</span>
            </div>
        </div>
        <div class="navbar-center">
            <button class="btn btn-ghost btn-circle" @click="navigateTo('/refresh')" >
                <div class="w-10 rounded-full" >
                    <img src="/images/logo_sierramar.png" />
                </div>
            </button>      
        </div>
        <div class="navbar-end"></div>
        </div>

        <div class="flex justify-center">
                <h1 class="py-5">LISTADO MENSUAL DE REGISTRO DE JORNADAS</h1>
        </div>
    <slot></slot>
    <footer class="footer footer-center p-4 bg-base-200 text-base-content">
    <aside>
        <p>Registro realizado en cumplimiento del Real Decreto-ley 8/2019, de 8 de marzo, de medidas urgentes de protección social y lucha contra la precariedad laboral en la jornada de trabajo (“RDL
8/2019”), publicado en el BOE el 12 de marzo.</p>
    </aside>
    </footer>
</template>