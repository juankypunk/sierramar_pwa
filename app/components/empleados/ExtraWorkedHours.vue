<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
    const props = defineProps({
        id: String,
        range_start: Date,
        range_end: Date
    })

    let { id, range_start, range_end } = props

    console.log('desde workedhours, range_start',range_start)
    const inicio = ref('')
    const fin = ref('')
    const extraworkedhours = ref(0)
    const config = useRuntimeConfig()
    const accessToken=useAccessToken()
    const url = computed(() => {
      return `${config.public.api}/employees/${id}/getextraworkedhours`
    })

    inicio.value = range_start
    fin.value = range_end

    watch(inicio, (new_start) => {
        console.log('he cambiado',new_start)  
        //inicio.value=new_start
    })


    function getExtraWorkedHours(){
        const {data} = useFetch(url.value,{
        headers: {
             'Authorization': 'Bearer ' + accessToken.value,
        },
        method: 'POST',
        body: {
            range_start: inicio.value,
            range_end: fin.value
        },
        key: `extraworkedhours_${id}`,
        onResponse({ response }) {
            // Process the response data
            if(response.status===200){
                console.log('desde workedhours:',response._data)
                extraworkedhours.value = response._data[0].horas_trabajadas         
            }else if(response.status===204) {
                console.log('no hay datos')
            }else{
                navigateTo('/')
            }
        }
        })
    }
    
    onMounted(() => {
        console.log(`workedhours is now mounted: ${inicio.value}`)
        getExtraWorkedHours()
    })

    console.log('desde mi componente:',inicio.value)
    
</script>
<template>
    <div v-if="extraworkedhours">
        <span>{{ extraworkedhours }}</span>  
    </div>
</template>