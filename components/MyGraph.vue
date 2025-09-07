<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup >
    import { Bar } from 'vue-chartjs';
    const props = defineProps({
        id_parcela: String
    });
    let { id_parcela } = props;
    const config = useRuntimeConfig();
    const accessToken=useAccessToken();
    const years = ref(2);
    const myDates = ref([]);
    const myConsumption = ref([]);
    const neighborsConsumption = ref([]);
   
    const url = computed(() => {
        return config.public.api + `/water/statistics/${id_parcela}/${years.value}`;    
    });
    
    const {data } = await useFetch(url,{
      headers: {
        'Authorization': 'Bearer ' + accessToken.value,
      },
      key: 'agua_parcela',
      onResponse({response}){
        console.log(response);
        const fechas = response._data.map(item => item.fecha_f);
        const consumption = response._data.map(item => item.m3);
        const neighbors = response._data.map(item => item.mediana);
        console.log('fechas:',fechas);
        console.log('consumo:',consumption);
        console.log('vecinos:',neighbors);
        myDates.value = fechas;
        myConsumption.value = consumption;
        neighborsConsumption.value = neighbors
      },
  }); 

  const chartData = computed(()=>{
    return {
      labels: myDates.value,
      datasets: [
        {
            label: 'Mi consumo',
            backgroundColor: 'lightblue',
            data: myConsumption.value,
        },
        {
            label: 'Mis vecinos',
            backgroundColor: '#9b9c9d',
            data: neighborsConsumption.value,
        },
      ]
    }
  })

  const chartOptions = computed(()=>{
    return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'x',
      scales: {
        x: {
          beginAtZero: true,
          stacked: false,
        },
        y: {
          beginAtZero: true,
          stacked: false,
        }
      }
    }
  })
  
</script>

<template>
  <div class="container mx-auto">
    <div class="px-1">
        <div>
          <div v-if="myConsumption.length" style="height:400px; width:auto" >
            <Bar :data="chartData" :options="chartOptions" />
          </div>
          <div style="padding-left: 10px">
              <FormKit
              v-model="years"
              type="range"
              number
              label=""  
              min="1"
              max="10"
              help="Usa el deslizador para ver más años de lecturas"
              />
              <pre wrap>Años de lecturas: {{ years }}</pre>
          </div>
        </div>
    </div>
  </div>
    
</template>