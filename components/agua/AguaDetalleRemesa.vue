<script setup>
    const props = defineProps({
        rowdata: Object
    });
</script>
<template>  
    <div class="container mx-auto">
        <h3 class="font-bold text-lg">Detalles remesa agua</h3>
        <div v-if="props.rowdata.id_parcela">
          <div class="flex justify-start gap-4">
            <div>Parcela: {{ props.rowdata.id_parcela }} </div> 
            <div>Titular: {{ props.rowdata.titular }}</div>
          </div>          
          <div class="flex justify-start gap-4">
            <div>Fecha: {{ props.rowdata.fecha }} </div> 
            <div>Lect. ant.: {{ props.rowdata.l1 }}</div>
            <div>Lect. act.: {{ props.rowdata.l2 }}</div>
          </div>
          <div class="py-2 flex flex-col">
            <div>
              Consumo de agua: {{ props.rowdata.m3 }}m3
            </div>
            <div class="flex justify-center">
              <AguaIndicador
              :m3="parseInt(props.rowdata.m3)"
              :t1="parseInt(props.rowdata.t1)"
              :t2="parseInt(props.rowdata.t2)"
            />
            </div>
          </div>
          <div class="flex justify-center gap-4">
            <div>T1: {{ props.rowdata.m3_t1 }}m3 </div>
            <div>T2: {{ props.rowdata.m3_t2 }}m3</div>
            <div>T3: {{ props.rowdata.m3_t3 }}m3</div>
          </div>
          <div class="py-2">
            Precio del m3 por tramo:
          </div>
          <div class="flex justify-start gap-6">
            <div>T1: {{ props.rowdata.pvpm3 }}€ </div>
            <div>T2: {{ parseFloat((props.rowdata.pvpm3 * props.rowdata.f_b).toFixed(3)) }}€</div>
            <div>T3: {{ parseFloat((props.rowdata.pvpm3 * props.rowdata.f_c).toFixed(3)) }}€</div>
          </div>
          <div class="py-2">
            Desglose del consumo:
          </div>
        
        <table class="table table-md table-zebra w-full">
          <thead>
            <tr>
              <th>Tramo</th>
              <th>m3</th>
              <th>Precio</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>T1 (0-125m3):</td>
              <td>{{ props.rowdata.m3_t1 }} m3</td>
              <td>{{ parseFloat((props.rowdata.pvpm3 * props.rowdata.f_a)).toFixed(3) }}€</td>
              <td align="right">{{ parseFloat((props.rowdata.p_m3_a)).toFixed(2) }}€</td>
            </tr>
            <tr v-if="props.rowdata.m3_t2 > 0">
              <td>T2 (126-200m3):</td>
              <td>{{ props.rowdata.m3_t2 }} m3</td>
              <td>{{ parseFloat((props.rowdata.pvpm3 * props.rowdata.f_b)).toFixed(3) }}€</td>
              <td align="right">{{ parseFloat((props.rowdata.p_m3_b)).toFixed(2) }}€</td>
            </tr>
            <tr v-if="props.rowdata.m3_t3 > 0">
              <td>T3 (>200m3):</td>
              <td>{{ props.rowdata.m3_t3 }} m3</td>
              <td>{{ parseFloat((props.rowdata.pvpm3 * props.rowdata.f_c)).toFixed(3) }}€</td>
              <td align="right">{{ parseFloat((props.rowdata.p_m3_c)).toFixed(2) }}€</td>
            </tr>
          </tbody>
        </table>
        <div class="divider"></div>
            <div class="flex justify-end gap-2 py-2">
                <div>Subtotal: {{props.rowdata.subtotal }}</div>
            </div>
            <div class="flex justify-end gap-2 py-2">
                <div>IVA ({{ props.rowdata.iva }}%): {{props.rowdata.impuesto }}</div>
            </div>
            <div class="flex justify-end gap-2">
                <div>Total: {{props.rowdata.importe }}</div>
            </div> 
            <div class="divider"></div>
          <div class="py-2">
            Domiciliado en cuenta:
          </div>
          <div class="flex justify-start gap-4">
            <div>BIC: {{props.rowdata.bic}}</div>
            <div>IBAN: {{props.rowdata.iban}}</div>
          </div>
          <div class="py-5">
            <p>Editado por: {{ props.rowdata.user_modif }}</p>
            <p>Último cambio: {{ props.rowdata.ult_modif }}</p>
          </div>
    </div>
</div>
</template>