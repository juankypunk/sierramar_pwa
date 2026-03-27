<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
    const props = defineProps({
        id: [String, Number],
        range_start: [Date, String],
        range_end: [Date, String],
        label: String
    })

    const inicio = ref('')
    const fin = ref('')
    const compensationhours = ref(0)
    const compensableDaysCount = ref(0)
    const holidayDates = ref([])
    const config = useRuntimeConfig()
    const accessToken=useAccessToken()
    
    const url_holidaycompensationhours = computed(() => {
        return `${config.public.api}/employees/${props.id}/getholidaycompensationhours`
  })

    // Formateador de fechas amigable
    const formatDate = (date) => {
        if (!date) return ''
        return new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long'
        })
    }

    // Computed para mostrar todas las fechas separadas por comas
    const formattedHolidayDates = computed(() => {
        return holidayDates.value.map(d => formatDate(d)).join(', ')
    })

    // Vigilar si cambian los rangos desde el padre para recargar datos
    watch(() => props.range_start, () => {
        getHolidayCompensationHours()
    })

const getHolidayCompensationHours = async () => {
    try {
        const data = await $fetch(url_holidaycompensationhours.value, {
            headers: {
                'Authorization': 'Bearer ' + accessToken.value,
            },
            method: 'POST',
            body: {
                range_start: props.range_start,
                range_end: props.range_end,
                label: props.label,
            },
        });
        // Nota: Asegúrate de usar las llaves exactas que devuelve tu API (camelCase)
        compensationhours.value = data.compensationHours;
        compensableDaysCount.value = data.compensableDaysCount;
        holidayDates.value = data.holidayDates;  
    } catch (error) {
        console.error('Error al obtener horas de compensación:', error);
    }
} 
    
    onMounted(() => {
        getHolidayCompensationHours()
    })          
    
</script>
<template>
    <div v-if="compensationhours && compensationhours !== '00:00'" class="alert shadow-lg bg-base-200 border-primary/20">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-primary shrink-0 w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
            <h3 class="font-bold">Compensación: {{ compensationhours }}h ({{ compensableDaysCount }} día)</h3>
            <div class="text-xs">
                por festivo(s) en descanso: 
                <span class="italic">{{ formattedHolidayDates }}</span>
            </div>
        </div>
    </div>
</template>