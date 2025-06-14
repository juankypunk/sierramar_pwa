<script setup lang="ts">
import { Line } from "vue-chartjs";
import type { ChartData } from "chart.js";
definePageMeta({
        middleware: ["auth"],
  });
const weatherData = ref();
fetch(
  "https://api.open-meteo.com/v1/forecast?latitude=39.309613824033086&longitude=-0.4832432456001327&current=temperature_2m,precipitation,rain,relativehumidity_2m,windspeed_10m,cloud_cover&hourly=temperature_2m,precipitation,rain,relativehumidity_2m,windspeed_10m"
)
  .then(async (res) => (weatherData.value = await res.json()))
  .catch((error) => alert(error.message));

  const chartData = computed((): ChartData<"line"> => {
  return {
    labels: weatherData.value.hourly.time.map(
      (timestamp: string) => useDateFormat(timestamp, "dddd h aa").value
    ),
    datasets: [
      {
        label: "Temperatura (ºC)",
        backgroundColor: "orange",
        data: weatherData.value.hourly.temperature_2m,
      },
      {
        label: "Viento (Km/h)",
        backgroundColor: "lightgray",
        data: weatherData.value.hourly.windspeed_10m,
      },
      {
        label: "Lluvia (mm)",
        backgroundColor: "lightblue",
        data: weatherData.value.hourly.rain,
      },
    ],
  };
});
</script>
<template>
  <div class="container mx-auto">
    <h1>El tiempo en Sierramar</h1>
    <ul v-if="weatherData">
      <li>Temperatura: {{ weatherData.current.temperature_2m }} ºC</li>
      <li>Viento: {{ weatherData.current.windspeed_10m }} Km/h</li>
      <li>Humedad relativa: {{ weatherData.current.relativehumidity_2m }} %</li>

    </ul>
    
    <p>Previsión 7d</p>
    <div style="height: 600px; width:auto">
      <Line v-if="weatherData" :data="chartData" />   
    </div>
  </div>
</template>

<style>
</style>