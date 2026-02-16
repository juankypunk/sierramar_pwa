<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
import { warning } from '@formkit/icons';
import { createFetch } from '@vueuse/core';

const props = defineProps({
        checkedIds: Array,
});

const id_parcela = ref('');
const rowdata = ref({});
const config = useRuntimeConfig();
const accessToken = useAccessToken();
const remittances = ref([]);
const responded = ref(false);
const success = ref(false);
const failed = ref(false);
const checkedIds = ref([]);
const fecha_cobro = ref('');
const bankForm = ref({});
const cuentaDomiciliacion= ref('');
const newRemittance=ref({});

const url_residents_bank = computed(() => {
      return `${config.public.api}/residents/${newRemittance.value.id_parcela}/bank`
    })

const url_remittances = computed(() => {
        return config.public.api + `/residents/specialremittances`;
});

const url_remesa = computed(() => {
        return config.public.api + `/residents/specialremittances/bankremittance`;
    });


const searchQuery = ref('');
const gridColumns = ["id_parcela","concepto","importe"];


const useMyFetch = createFetch({
      baseUrl: url_remittances.value,
      options: {
      async beforeFetch({ options }) {
        options.headers.Authorization = `Bearer ${accessToken.value}`
        return { options }
        },
      },
      fetchOptions: {
        mode: 'cors',
      },
})
  
const getRemittances = () => {
  // listado de remesas especiales
  const { onFetchResponse, error, data } = useMyFetch('').get().json();
      onFetchResponse((response)=>{
        console.log('desde onFetchResponse',response);
        remittances.value=data.value;
  })
}  

function updateRemittance(myData){
    console.log('Submit:',myData);
    const { onFetchResponse, error, data } = useMyFetch(`modify/${rowdata.value.id_parcela}`).post(rowdata.value);   
    onFetchResponse((response)=>{
        console.log('desde onFetchResponse',response.status);
        if(response.status===200){
          responded.value = true;
          success.value = true;
          const myTimeout = setTimeout(clearMessage, 2000);
          getRemittances();
        }
      })
    }

function insertRemittance(){
  console.log('remittance:',newRemittance.value);
  const { onFetchResponse, error, data } = useMyFetch('new').post(newRemittance.value);   
  onFetchResponse((response)=>{
    console.log('desde onFetchResponse',response.status);
    if(response.status===200){
      responded.value = true;
      success.value = true;
      const myTimeout = setTimeout(clearMessage, 2000);
      getRemittances();
      // Cerrar el modal
      document.getElementById('remittance')?.close();
    }
  })
}

function deleteRemittances() {
  console.log('desde deleteRemittances:',checkedIds.value.length);
  if(checkedIds.value.length > 0){
    confirm('¿Está seguro de eliminar las remesas seleccionadas?') ? '' : (alert('Operación cancelada'), checkedIds.value = []);
    console.log('checkids:',checkedIds.value);
    const { onFetchResponse, error, data } = useMyFetch('delete').post({
      "selected_ids": checkedIds.value
    });
    onFetchResponse((response)=>{
      // Process the response data
      console.log('response:', response.status);
      if(response.status === 200){
          console.log('remesas eliminadas:',data.value[0]);
          getRemittances();
          responded.value = true;
          success.value = true;
      }else if(response.status==403){
          // token caducado
          navigateTo('/');
      }else{
          console.log('todo mal');
          responded.value = true;
          failed.value = true;
      }
    })
  }else{
    alert('no hay ninguna remesa seleccionada');
  }
}
 

function clearMessage(){
      responded.value = false
      success.value = false
}

function showDialogCurrentRemittance(){
    console.log('data current remittance:',rowdata.value);
    current_remittance.showModal();
}

function showDialogNewRemittance(){
    newRemittance.value={};
    remittance.showModal();
}

const manageRemittances = () => {
  console.log('desde manageRemittances:',checkedIds.value.length);
  if(checkedIds.value.length > 0){
    dialog_fecha_cobro.showModal();
  }else{
    alert('no hay ninguna remesa seleccionada');
  }
}

const creaRemesa = () => {
  if(fecha_cobro.value){
    const {data} = useFetch(url_remesa,{
    headers: {
        'Authorization': 'Bearer ' + accessToken.value,
        },
    method: 'POST',
    body: {
        "fecha_cobro": fecha_cobro.value,
        "selected_ids": checkedIds.value
    },
    onResponse({ response }) {
        // Process the response data
        if(response.status===200){
            console.log('desde response (remesa especial):',response._data);
            descargaRemesa();
        }else if(response.status===204) {
            console.log('no hay datos');
        }else{
            navigateTo('/');
        }
        }
    })
  }else{
    console.log('no hay fecha de cobro');
  }
}



const descargaRemesa = () => {
    fetch(url_remesa.value,{
        headers: {
        //"Content-Type": "application/json",
        'Authorization': 'Bearer ' + accessToken.value,
        },
        method: 'GET',
        //body: JSON.stringify(rowdata.value),
    })
    .then( res => res.blob() )
    .then( blob => {
      var file = window.URL.createObjectURL(blob);
        window.location.assign(file);
      });
    //return res.blob();
}

function isValidIban(node){
      var iban = node.value
      return isValidIBANNumber(iban)
    }
    
    /*
    * Returns 1 if the IBAN is valid 
    * Returns FALSE if the IBAN's length is not as should be (for CY the IBAN Should be 28 chars long starting with CY )
    * Returns any other number (checksum) when the IBAN is invalid (check digits do not match)
    */
    function isValidIBANNumber(input) {
        var CODE_LENGTHS = {
            AD: 24, AE: 23, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
            CH: 21, CR: 21, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, ES: 24,
            FI: 18, FO: 18, FR: 27, GB: 22, GI: 23, GL: 18, GR: 27, GT: 28, HR: 21,
            HU: 28, IE: 22, IL: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28,
            LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27,
            MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29,
            RO: 24, RS: 22, SA: 24, SE: 24, SI: 19, SK: 24, SM: 27, TN: 24, TR: 26,   
            AL: 28, BY: 28, CR: 22, EG: 29, GE: 22, IQ: 23, LC: 32, SC: 31, ST: 25,
            SV: 28, TL: 23, UA: 29, VA: 22, VG: 24, XK: 20
        };
        var iban = String(input).toUpperCase().replace(/[^A-Z0-9]/g, ''), // keep only alphanumeric characters
                code = iban.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/), // match and capture (1) the country code, (2) the check digits, and (3) the rest
                digits;
        // check syntax and length
        if (!code || iban.length !== CODE_LENGTHS[code[1]]) {
            return false;
        }
        // rearrange country code and check digits, and convert chars to ints
        digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, function (letter) {
            return letter.charCodeAt(0) - 55;
        });
        // final check
        return mod97(digits) === 1;
    }
    
    function mod97(string) {
      var checksum = string.slice(0, 2), fragment;
      for (var offset = 2; offset < string.length; offset += 7) {
          fragment = String(checksum) + string.substring(offset, offset + 7);
          checksum = parseInt(fragment, 10) % 97;
      }
      return checksum;
    }

    function isValidParcel(node){
      id_parcela.value = node.value;
      console.log('id_parcela:',newRemittance.value.id_parcela);
      const {data} = useFetch(url_residents_bank.value,{
      headers: {
         'Authorization': 'Bearer ' + accessToken.value,
      },
      method: 'GET',
      key: `bank_data_parcel_${newRemittance.value.id_parcela}`,
      onResponse({ response }) {
      // Process the response data
      if(response.status===200){
          console.log('desde response (domiciliación):',response._data.bank)
          bankForm.value=response._data.bank;
          if(bankForm.value.titular_cc_cuota && bankForm.value.titular_cc_agua){
            dialog_domiciliacion.showModal();
          }
          //rowdata.value.titular= bankForm.value.titular_cc_cuota;
        }else if(response.status===404) {
          console.log('no hay datos')
        }else{
          //navigateTo('/')
        }
      }
    })
      return true;
    }
    
    function completaDomiciliacion(){
      console.log('cuenta domiciliación:',cuentaDomiciliacion.value);
      if(cuentaDomiciliacion.value==='cuota'){
        console.log('ha elegido cuota');
        newRemittance.value.titular=bankForm.value.titular_cc_cuota;
        newRemittance.value.bic=bankForm.value.bic_cuota;
        newRemittance.value.iban=bankForm.value.iban_cuota;
        newRemittance.value.fecha_mandato=bankForm.value.fecha_mandato;
        newRemittance.value.referencia_mandato = bankForm.value.referencia_mandato;
      }else{
        console.log('ha elegido agua');
        newRemittance.value.titular=bankForm.value.titular_cc_agua;
        newRemittance.value.bic=bankForm.value.bic_agua;
        newRemittance.value.iban=bankForm.value.iban_agua;
        newRemittance.value.fecha_mandato=bankForm.value.fecha_mandato;
        newRemittance.value.referencia_mandato = bankForm.value.referencia_mandato_agua ? bankForm.value.referencia_mandato_agua : bankForm.value.referencia_mandato;
      }
    }
    

onMounted(() => {
    console.log(`the component is now mounted.`);
    getRemittances();
})
</script>

<template>
<div class="container mx-auto">
  <div class="flex justify-end">
    <button class="btn" @click="showDialogNewRemittance">+</button>
  </div>
  <div class="px-5">
    <div v-if="remittances"> 
        <MyGrid
            :data="remittances"
            :columns="gridColumns"
            :filter-key="searchQuery"
            :multiSelect="true"
            table-size="table-xs"
            v-model:rowdata="rowdata"
            v-model:checkedIds="checkedIds"
            @update:rowdata="showDialogCurrentRemittance()"
            @selected:checkedIds="$event => (checkedIds = $event)"
        >
        </MyGrid>
    </div>
  </div>

  <div class="flex justify-center gap-20 py-10">
    <button class="btn" @click="deleteRemittances">Eliminar</button>
    <button class="btn" @click="manageRemittances">Generar</button>
  </div>

  <dialog id="dialog_fecha_cobro" class="modal">
          <div class="modal-box">
              <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
              <h3 class="font-bold text-lg">Remesa especial SEPA</h3>
              <p class="py-4"></p>
              <FormKit
                type="date"
                v-model="fecha_cobro"
                label="Fecha de cobro"
                help=""
                validation="required"
              />     
              <div class="modal-action">
                  <form method="dialog">
                      <!-- if there is a button in form, it will close the modal -->
                      <button @click="creaRemesa" class="btn btn-primary">Aceptar</button>
                  </form>
              </div>
          </div>
  </dialog>

  <dialog id="dialog_domiciliacion" class="modal">
          <div class="modal-box">
              <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
              <h3 class="font-bold text-lg">Domiciliación</h3>
              <p class="py-4"></p>
              <FormKit
              type="radio"
              v-model="cuentaDomiciliacion"
              label="Cuenta bancaria"
              placeholder="Selecciona una cuenta"
              :options="{cuota: 'Cuota', agua:'Agua'}"
              />
              <div class="modal-action">
                  <form method="dialog">
                      <!-- if there is a button in form, it will close the modal -->
                      <button @click="completaDomiciliacion" class="btn btn-primary">Aceptar</button>
                  </form>
              </div>
          </div>
  </dialog>
  

  <dialog id="current_remittance" class="modal">
    <div class="modal-box">
      <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg">Detalles del adeudo</h3>
      <div class="py-4">
        <FormKit 
        type="form" 
        @submit="updateRemittance" 
        v-model="rowdata"
        submit-label="Actualizar"
        :actions="true"
        ignore="false"
        :submit-attrs="{
          help: ''
        }"
        >
          <FormKit 
            type="text" 
            label="Id parcela" 
            name="id_parcela" 
            validation="required"
            validation-visibility="blur"
          />
          <FormKit 
            type="text" 
            label="Titular" 
            name="titular" 
            validation="required"
            validation-visibility="blur"
          />
          <FormKit 
            type="text" 
            label="BIC" 
            name="bic" 
            validation="required"
            validation-visibility="blur"
          />
          <FormKit 
            type="text" 
            label="IBAN" 
            name="iban" 
            validation="required|isValidIban"
            :validation-rules="{isValidIban}"
            validation-visibility="live"
            :validation-messages="{
              isValidIban: 'IBAN incorrecto...'
            }"
          />
          <FormKit
                type="date"
                name="fecha_mandato"
                label="Fecha del mandato"
                help=""
                validation="required"
          />
          <FormKit
          type="text"
          name="referencia_mandato"
          label="Referencia del mandato"
          help="Esta referencia es generada automáticamente y no debe ser modificada."
          readonly
          />
          <FormKit 
            type="number" 
            label="Importe" 
            name="importe" 
            number
            step="0.01"
            validation="required"
            validation-visibility="blur"
          />
          <FormKit 
            type="textarea" 
            label="Concepto" 
            name="concepto" 
            validation="required|length:1,140"
            validation-visibility="live"
          />
          <span v-if="rowdata.concepto" class="flex justify-end">{{ rowdata.concepto.length }}/140</span>
        </FormKit>    
      </div>
      <form method="dialog">
        <!-- if there is a button in form, it will close the modal
        <button class="btn" @click="updateRemittance">Actualizar</button>
        -->
      </form>
    </div>
  </dialog>
    
  <dialog id="remittance" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg">Nuevo adeudo</h3>
      <div class="py-4">
        <FormKit 
        type="form" 
        @submit="insertRemittance" 
        v-model="newRemittance"
        submit-label="Aceptar"
        :actions="true"
        ignore="false"
        :submit-attrs="{
          help: ''
        }"
        >
          <FormKit 
            type="text" 
            label="Id parcela" 
            name="id_parcela" 
            validation="required|isValidParcel"
            :validation-rules="{isValidParcel}"
            validation-visibility="blur"
            :validation-messages="{
              isValidParcel: 'Parcela no existe'
            }"
          />
          <FormKit 
            type="text" 
            label="Titular" 
            name="titular" 
            validation="required"
            validation-visibility="blur"
          />
          <FormKit 
            type="text" 
            label="BIC" 
            name="bic" 
            validation="required"
            validation-visibility="blur"
          />
          <FormKit 
            type="text" 
            label="IBAN" 
            name="iban" 
            validation="required|isValidIban"
            :validation-rules="{isValidIban}"
            validation-visibility="blur"
            :validation-messages="{
              isValidIban: 'IBAN incorrecto'
            }"
          />
          <FormKit
            type="date"
            name="fecha_mandato"
            label="Fecha del mandato"
            help=""
            validation="required"
          />
          <FormKit
            type="text"
            name="referencia_mandato"
            label="Referencia del mandato"
            help="Esta referencia es generada automáticamente y no debe ser modificada."
            readonly
          />
          <FormKit 
            type="number" 
            label="Importe" 
            name="importe" 
            number
            step="0.01"
            validation="required"
            validation-visibility="blur"
          />
          <FormKit 
            type="textarea" 
            label="Concepto" 
            name="concepto" 
            validation="required|length:1,140"
            validation-visibility="live"
          />
          <span v-if="newRemittance.concepto" class="flex justify-end">{{ newRemittance.concepto.length }}/140</span>
      </FormKit>    
      </div> 
      <form method="dialog">
        <!-- if there is a button in form, it will close the modal
        <button class="btn" @click="insertRemittance">Nuevo</button>
         -->
      </form>
    </div>
  </dialog>

  <div v-if="responded">
    <div v-if="success" class="alert alert-success">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>Datos actualizados!</span>
    </div>  
    <div v-else class="alert alert-warning">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <span>Lo siento, algo ha ido mal 😕</span>
    </div>
  </div>
  

</div>
</template>