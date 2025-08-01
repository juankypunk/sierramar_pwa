<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
  import { createFetch } from '@vueuse/core';
    const props = defineProps({
        id_parcela: String
    })
    let { id_parcela } = props;
    const config = useRuntimeConfig();
    const accessToken=useAccessToken();
    const url = computed(() => {
      return `${config.public.api}/residents/${id_parcela}/bank`
    })
    const originalBankForm = ref({});
    const bankForm = ref({});
    const mandato = ref({});
    const responded = ref(false);
    const success = ref(false);
    
    const useMyFetch = createFetch({
      baseUrl: url.value,
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
    
    const { onFetchResponse, error, data } = useMyFetch('').get().json();
    onFetchResponse((response)=>{
      console.log('desde onFetchResponse',response);
      console.log('bank_data:',data.value);
      if(response.status===200){
        console.log('Datos cargados correctamente');
        bankForm.value=data.value.bank ;
        mandato.value=data.value.mandatos;
        originalBankForm.value = JSON.parse(JSON.stringify(data.value.bank)); // copia profunda
      }else{
        console.log('Error al cargar los datos');
        responded.value = true;
        success.value = false;
      }
    })

    function handleSubmit(myData){
      if (!isFormModified()) {
        console.log('No hay cambios en el formulario');
        return;
      }
      console.log('Formulario modificado, enviando datos...');
      const { onFetchResponse, error, data } = useMyFetch('').post(bankForm.value);
      onFetchResponse((response)=>{
        console.log('desde onFetchResponse',response.status);
        if(response.status===200){
          responded.value = true;
          success.value = true;
          const myTimeout = setTimeout(clearMessage, 2000);
        } else if(response.status===401){
          navigateTo('/');
        } else {
          responded.value = true;
          success.value = false;
          const myTimeout = setTimeout(clearMessage, 2000);
        }
      })
    }

    // Función para comprobar si hay cambios
    function isFormModified() {
      return JSON.stringify(bankForm.value) !== JSON.stringify(originalBankForm.value);
    }

    function getModifiedFields() {
      const modified = [];
      const current = bankForm.value;
      const original = originalBankForm.value;
      for (const key in current) {
        if (current[key] !== original[key]) {
          modified.push(key);
        }
      }
      return modified;
    }

    function clearMessage(){
      responded.value = false
      success.value = false
    }

    function showConfirmDialog() {
      if (!isFormModified()) {
        console.log('No hay cambios en el formulario, no se muestra el diálogo de confirmación');
        return;
      }
      // Mostrar el diálogo de confirmación
      const dialog = document.getElementById('confirm-update-dialog');
      if (dialog) {
        dialog.showModal();
      } else {
        console.error('Dialog not found');
      }
    }
    
    function hideConfirmDialog() {
      const dialog = document.getElementById('confirm-update-dialog');
      if (dialog) {
        dialog.close();
      } else {
        console.error('Dialog not found');
      }
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

    
    function isValidNif(node){
      var nif = node.value
      console.log('Validando NIF desde isValidNif:', nif);
      return isNif(nif)
    }
    

    function isNif(nif) {
      if (!nif) return false;
      nif = nif.toUpperCase().trim();

      // NIF: 8 dígitos + letra
      if (/^[0-9]{8}[A-Z]$/.test(nif)) {
        const nifLetters = "TRWAGMYFPDXBNJZSQVHLCKE";
        const number = nif.substring(0, 8);
        const letter = nif.charAt(8);
        const expectedLetter = nifLetters.charAt(parseInt(number) % 23);
        return letter === expectedLetter;
      }

      // NIE: X, Y o Z seguido de 7 dígitos y una letra
      if (/^[XYZ][0-9]{7}[A-Z]$/.test(nif)) {
        const nifLetters = "TRWAGMYFPDXBNJZSQVHLCKE";
        const niePrefix = { X: '0', Y: '1', Z: '2' }[nif.charAt(0)];
        const number = niePrefix + nif.substring(1, 8);
        const letter = nif.charAt(8);
        const expectedLetter = nifLetters.charAt(parseInt(number) % 23);
        return letter === expectedLetter;
      }

      // CIF: Letra, 7 dígitos y un dígito/letra de control
      if (/^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-J]$/.test(nif)) {
        const control = nif.charAt(8);
        const digits = nif.substring(1, 8);
        let sumA = 0, sumB = 0;
        for (let i = 0; i < 7; i++) {
          let n = parseInt(nif.charAt(i + 1));
          if (i % 2 === 0) {
            let prod = n * 2;
            sumA += Math.floor(prod / 10) + (prod % 10);
          } else {
            sumB += n;
          }
        }
        const total = sumA + sumB;
        const unit = total % 10;
        const controlDigit = (unit === 0) ? 0 : 10 - unit;
        const controlLetters = "JABCDEFGHI";
        if ("PQRSNW".includes(nif[0])) {
          // Control debe ser letra
          return control === controlLetters[controlDigit];
        } else if ("ABEH".includes(nif[0])) {
          // Control debe ser dígito
          return control === String(controlDigit);
        } else {
          // Puede ser ambos
          return control === String(controlDigit) || control === controlLetters[controlDigit];
        }
      }

      return false;
    }
</script>

<template>
    <div class="container mx-auto px-5">
    <!-- name of each tab group should be unique -->
    <div class="tabs tabs-border">
      <input type="radio" name="my_tabs_2" class="tab" aria-label="Cuotas" checked="checked" />
      <div class="tab-content border-base-300 bg-base-100 p-10">
          <FormKit 
            type="form" 
            @submit="showConfirmDialog" 
            v-model="bankForm"
            submit-label="Actualizar"
            :submit-attrs="{
              help: ''
            }"
            >
            <FormKit 
              type="text" 
              label="Titular cuota" 
              name="titular_cc_cuota" 
              validation=""
            />
            <FormKit 
              type="text" 
              label="BIC cuota" 
              name="bic_cuota" 
              validation=""
            />
            <FormKit 
              type="text" 
              label="IBAN cuota" 
              name="iban_cuota" 
              validation="length:24|isValidIban"
              :validation-rules="{isValidIban}"
              validation-visibility="live"
              :validation-messages="{
                isValidIban: 'IBAN incorrecto...'
              }" 
            />

            <div class="flex justify-start gap-5 py-5">
              <h3 class="font-bold">Mandato:</h3>  
              <div v-if="mandato[0] && mandato[0].estado === 'cancelado'">
                <div class="px-5 badge badge-error">Cancelado</div>
                <div class="tooltip" data-tip="Último cobro">
                  <div v-if="mandato[0] && mandato[0].estado === 'cancelado'" class="badge badge-soft badge-info px-5">{{ mandato[0].ultimo_cobro }}</div>
                </div>
              </div>
              <div v-else >
                <div v-if="mandato[0] && mandato[0].estado === 'activo'" class="badge badge-success px-5">Activo</div>
                <div class="tooltip" data-tip="Último cobro">
                  <div v-if="mandato[0] && mandato[0].estado === 'activo'" class="badge badge-soft badge-info px-5">{{ mandato[0].ultimo_cobro }}</div>
                </div>
              </div>
            </div>

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
              help="Esta referencia ha sido generada automáticamente."
              readonly
            />
          </FormKit>
      </div>

      <input type="radio" name="my_tabs_2" class="tab" aria-label="Agua" />
      <div class="tab-content border-base-300 bg-base-100 p-10">
        <FormKit 
            type="form" 
            @submit="showConfirmDialog" 
            v-model="bankForm"
            submit-label="Actualizar"
            :submit-attrs="{
              help: ''
            }"
            >
            <FormKit 
              type="text" 
              label="Titular agua" 
              name="titular_cc_agua" 
              validation=""
            />
            <FormKit 
              type="text" 
              label="NIF/NIE/CIF titular agua" 
              name="nif_titular_cc_agua"
              validation="length:9|isValidNif"
              :validation-rules="{ isValidNif }"
              validation-visibility="live"
              :validation-messages="{
                isValidNif: 'Documento incorrecto'
              }"
            />
            <FormKit 
              type="text" 
              label="BIC agua" 
              name="bic_agua" 
              validation=""
            />
            <FormKit 
              type="text" 
              label="IBAN agua" 
              name="iban_agua" 
              validation="length:24|isValidIban"
              :validation-rules="{isValidIban}"
              validation-visibility="live"
              :validation-messages="{
                isValidIban: 'IBAN incorrecto...'
              }"
            />

            <div class="flex justify-start gap-5 py-5">
              <h3 class="font-bold">Mandato:</h3>  
              <div v-if="mandato[0] && mandato[0].estado === 'cancelado'">
                <div class="px-5 badge badge-error">Cancelado</div>
                <div class="tooltip" data-tip="Último cobro">
                  <div v-if="mandato[0] && mandato[0].estado === 'cancelado'" class="badge badge-soft badge-info px-5">{{ mandato[0].ultimo_cobro }}</div>
                </div>
              </div>
              <div v-else >
                <div v-if="mandato[0] && mandato[0].estado === 'activo'" class="badge badge-success px-5">Activo</div>
                <div class="tooltip" data-tip="Último cobro">
                  <div v-if="mandato[0] && mandato[0].estado === 'activo'" class="badge badge-soft badge-info px-5">{{ mandato[0].ultimo_cobro }}</div>
                </div>
              </div>
            </div>

            <FormKit
              type="date"
              name="fecha_mandato_agua"
              label="Fecha del mandato"
              help=""
              validation=""
            />
            <FormKit
              type="text"
              name="referencia_mandato_agua"
              label="Referencia del mandato"
              help="Esta referencia ha sido generada automáticamente."
              readonly
            />
          </FormKit>
      </div>
    </div>

    <dialog id="confirm-update-dialog" class="modal modal-bottom sm:modal-middle">
      <form method="dialog" class="modal-box">
        <h3 class="font-bold text-lg">Confirmar actualización</h3>
        <p class="py-4">Los siguientes campos han sido modificados:</p>
        <ul class="list-disc pl-5">
          <li v-for="field in getModifiedFields()" :key="field">{{ field }}</li>
        </ul>
        <p class="py-2 ">Si continuas, se actualizarán los datos bancarios y también se cancelará el mandato actual.</p>
        <p class="py-2">¿Estás seguro de que quieres actualizar estos datos bancarios?</p>
        <div class="modal-action">
          <button type="submit" class="btn btn-primary" @click="handleSubmit(bankForm)">Actualizar</button>
          <button type="button" class="btn" @click="hideConfirmDialog">Cancelar</button>
        </div>
      </form>
      <form method="dialog" class="modal-backdrop">
        <button>✕</button>
      </form>
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