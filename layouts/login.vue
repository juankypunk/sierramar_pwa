<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
    //import {jwtDecode} from "jwt-decode"
    const accessToken = useAccessToken()
    const { isAuthenticated } = useAuth()
    //const user_data = ref(jwtDecode(useAccessToken().value))
    const remember_me = useCookie('remember_me')
    const colorMode = useColorMode()
    const themes = ['light','dark']
    colorMode.preference='light'
    const nightMode = useCookie('nightMode',{
    })
    console.log('nightmode:',nightMode.value)
    console.log('remember_me:',remember_me.value)
    console.log('accessToken:',accessToken.value)
    console.log('colorMode:',colorMode.value)
    console.log('isAuthenticated:',isAuthenticated.value)
    //console.log('user_data:',user_data.value)

    watch(nightMode,()=>{
        if(nightMode.value){
            colorMode.preference='dark'
        }else{
            colorMode.preference='light'
    }
    })

    if(accessToken.value){
        console.log('Token (default layout):',accessToken.value)
        //const decoded = jwtDecode(accessToken.value)
        //console.log('decoded en layout:',decoded)
    }
    
    
</script>
<template>
    <slot></slot>
    <footer class="footer footer-center p-4 bg-base-200 text-base-content">
    <aside>
        <p>Copyright © 2023 - Hecho con ❤️ en Sierramar</p>
    </aside>
    </footer>
</template>