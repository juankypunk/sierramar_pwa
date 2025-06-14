<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
    import {jwtDecode} from "jwt-decode"
    const { logout, isAuthenticated } = useAuth()
    const user_data = ref(jwtDecode(useAccessToken().value))
    const remember_me = useCookie('remember_me')
    const colorMode = useColorMode()
    const themes = ['light','dark']
    colorMode.preference='light'
    const nightMode = useCookie('nightMode',{
    })
    console.log('nightmode:',nightMode.value)
    console.log('remember_me:',remember_me.value)
    console.log('colorMode:',colorMode.value)
    console.log('isAuthenticated:',isAuthenticated.value)
    console.log('user_data:',user_data.value)

    watch(nightMode,()=>{
        if(nightMode.value){
            colorMode.preference='dark'
        }else{
            colorMode.preference='light'
    }
    })

    
    async function handleLogout() {
        await logout()
    }

    function closeDrawer() {
        const drawer = document.getElementById('my-drawer-3')
        if (drawer) drawer.checked = false
    }

    
</script>

<template>
    <div class="drawer">
        <input id="my-drawer-3" type="checkbox" class="drawer-toggle" /> 
        <div class="drawer-content flex flex-col">
            <!-- Navbar -->
            <div class="navbar bg-base-100">
                <div class="navbar-start">
                    <label for="my-drawer-3" aria-label="open sidebar" class="btn btn-square btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </label>
                </div>
                <div class="navbar-center">
                    <button class="btn btn-ghost btn-circle" @click="navigateTo('/')" >
                        <div class="w-10 rounded-full" >
                            <NuxtImg src="/images/logo_sierramar.png" />
                        </div>
                    </button>
                </div>
                <div class="navbar-end">
                    <div class="dropdown dropdown-end">
                            <div tabindex="0"   class="m-1 btn btn-ghost">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                            </div>
                            <ul tabindex="0" class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
                                <div class="divider">Usuario</div>
                            <li>
                                <span @click="navigateTo('/changepasswd')">
                                    Cambiar contraseña
                                </span>
                            </li>
                            <li>
                                <span 
                                    @click="handleLogout"
                                    class="text-gray-600 hover:text-gray-900"
                                >
                                    Cerrar sesión
                                </span>
                            </li>
                                <div class="divider">Preferencias</div>
                            <div class="form-control">
                                <label class="label cursor-pointer">
                                <span class="label-text">Modo noche:</span> 
                                    <input type="checkbox" id="myNightNodeCheck" name="nightMode"  v-model="nightMode" class="toggle"/>
                                </label>
                            </div>               
                            <div class="form-control">
                                <label class="label cursor-pointer">
                                <span class="label-text">Recuérdame:</span> 
                                    <input name="remember_me" type="checkbox" v-model="remember_me" class="checkbox" />
                                </label>
                            </div>
                            
                        </ul>
                    </div>
                </div>
    </div>
            <!-- Page content here -->
            <slot/>
        </div> 
  
        <div class="drawer-side">
            <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay"></label> 
            <ul class="menu p-4 w-80 min-h-full bg-base-200">
                <!-- Sidebar content here -->
                <button class="btn btn-ghost btn-circle">
                    <div class="w-10 rounded-full" >
                        <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay">
                            <NuxtImg src="/images/logo_sierramar.png" />
                        </label>
                    </div>
                </button>

                <div v-if="user_data.roles.includes('socio')">
                    <div class="divider"><span>Agua</span></div>
                    <div class="flex justify-start px-4 gap-2">
                        <span>💧</span>
                        <div v-for="parcela_agua in user_data.agua" class="badge badge-info badge-outline">
                            <NuxtLink :to="{ name: 'agua-consumo-id', params: { id: parcela_agua } }" @click="closeDrawer">
                                    {{ parcela_agua }}
                            </NuxtLink>
                        </div>    
                    </div>  
                    <div class="divider">
                        <span>Cuotas</span>
                    </div> 
                    <div class="flex justify-start px-4 gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819" />
                        </svg>
                        <div v-for="parcela in user_data.parcela" class="badge badge-success badge-outline">  
                            <NuxtLink :to="{ name: 'cuotas-id', params: { id: parcela } }" @click="closeDrawer">
                                {{ parcela }}
                            </NuxtLink>
                        </div>
                    </div>
                </div>

                <div v-if="user_data.roles.includes('junta')">
                    <div class="divider">Junta</div>
                     <li>
                        <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay" >
                        <div class="flex justify-start gap-2">
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z" />
                                </svg>
                            </span>
                            <span class="badge" @click="navigateTo('/empleados/calendar')">Conserjes</span>
                        </div>
                        </label>
                    </li>
                </div>
               
                <div v-if="user_data.roles.includes('admin')">
                    <div class="divider">Admin</div>
                    <li class="flex justify-start">
                        <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay" >
                            <div class="flex justify-start gap-2">
                                <span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                                    </svg>
                                </span>
                                <span class="badge" @click="navigateTo('/socios')">Socios</span>
                                <span class="badge" @click="navigateTo('/empleados')">Empleados</span>
                            </div>
                        </label>
                    </li>
                    <li>
                        <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay" >
                            <div class="flex justify-start gap-2">       
                                <span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                                    </svg>
                                </span>
                                <span class="badge" @click="navigateTo('/agua')">Agua</span>
                                <span class="badge" @click="navigateTo('/cuotas')">Cuotas</span>
                                <span class="badge" @click="navigateTo('/socios/remesas')">Remesas</span>
                            </div>
                        </label>
                    </li>
                </div>
                
                <div v-if="user_data.roles.includes('emp')">
                    <div class="divider">Empleado</div>  
                    <li>
                        <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay" @click="navigateTo('/empleados/fichar')">
                            <div class="flex justify-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            </svg>
                            <span class="badge" @click="navigateTo('/empleados/fichar')">Fichar</span>
                            </div>
                        </label>
                    </li>
                    <li>
                        <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay" @click="navigateTo('/empleados/misfichajes')">
                            <div class="flex justify-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <span class="badge" @click="navigateTo('/empleados/misfichajes')">Fichajes</span>
                            </div>   
                        </label>
                    </li>
                    <li>
                        <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay" @click="navigateTo('/empleados/micalendar')">
                          <div class="flex justify-start gap-2">
                           <span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z" />
                                </svg>
                            </span>
                            <span class="badge" @click="navigateTo('/empleados/micalendar')">Cuadrante</span>
                          </div>
                        </label>
                    </li>
                    <li>
                        <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                            </svg>
                           <NuxtLink to="https://docs.google.com/forms/d/e/1FAIpQLSdE4XM2MxZyoiUt4WkNw-cMNO5RPA5ceDv0lF0yWhNA9kLC7A/viewform?usp=sharing" target="_blank">
                                Incidencia de seguridad
                           </NuxtLink>
                        </label>
                    </li>
                </div>
                
                <div v-if="user_data.roles.includes('dev')">
                    <div class="divider">ToDo</div>
                    <li>
                        <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay" @click="navigateTo('/agua/calculadora')">
                            Calculadora de agua
                        </label>
                    </li>
  
                    <li>
                        <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay" @click="navigateTo('/empleados/geoloc')">
                            GeoLoc
                        </label>
                    </li>
         
                    <li>
                        <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay" @click="navigateTo('/tests/test_worker')">
                            Test worker
                        </label>
                    </li>
                    <li>
                        <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay" @click="navigateTo('/tests/weather')">
                            El tiempo
                        </label>
                    </li>
                </div>
            </ul>
        </div>
    </div>
    
    <div class="dock" v-if="user_data.roles.includes('emp') && !user_data.roles.includes('admin')">
        <button>
            <NuxtLink  to="/empleados/micalendar" >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 005.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                </svg>
            </NuxtLink>
        </button>
        <button >
            <NuxtLink to="/empleados/fichar" >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
            </NuxtLink>
        </button>
        <button>
            <NuxtLink  to="/empleados/misfichajes" >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122" />
                </svg>
            </NuxtLink>
        </button>
    </div> 
</template>