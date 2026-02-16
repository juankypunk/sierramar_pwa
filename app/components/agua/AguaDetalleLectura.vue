<script setup>
    const props = defineProps({
        rowdata: Object
    });
</script>
<template>  
<div class="stats shadow w-full">
          <div class="stats stats-vertical shadow-xl">
            <div  class="stat w-auto">
              <div class="flex justify-center"><span class="badge">Fecha lectura: {{ props.rowdata.fecha }}</span></div>
              <div v-if="props.rowdata" class="stat-title flex justify-between">
                <div>
                  Anterior: {{ props.rowdata.l1 }} m3   
                </div>
                <div>
                  Actual: {{ props.rowdata.l2 }} m3
                </div>
              </div>
              <div class="stat-value flex justify-center py-5">
                <span class="px-3 text-4xl text-blue-600">{{ props.rowdata.m3 }} m3</span>
              </div>
              <div class="flex justify-center">
                <AguaIndicador v-if="props.rowdata.m3"
                  :m3="parseInt(props.rowdata.m3)"
                  :t1="parseInt(props.rowdata.t1)"
                  :t2="parseInt(props.rowdata.t2)"
                />
              </div>
              <div class="stat-desc py-5">
                <div class="flex justify-center gap-5">
                  <div>T1(0-125m3): {{ props.rowdata.m3_t1 }}m3 </div>
                  <div>T2(126-200m3): {{ props.rowdata.m3_t2 }}m3</div>
                  <div>T3(+200): {{ props.rowdata.m3_t3 }}m3</div>
                </div>
              </div>
            </div>
        </div>
    </div>
</template>