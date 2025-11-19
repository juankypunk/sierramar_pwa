<!--
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<script setup>
    const props = defineProps({
        m3: Number,
        t1: Number,
        t2: Number
    });

    const m3 = computed(()=>{
        return props.m3;
    })

    const t1 = computed(()=>{
        return props.t1;
    })

    const t2 = computed(()=>{
        return props.t2;
    })

    const m3_a = ref(0);
    const m3_b = ref(0);
    const m3_c = ref(0);

    watch(m3, (newm3) => {
        console.log(`m3 is ${newm3}`);
        calcula_tramos();
    })


    const calcula_tramos = () => {
        m3_a.value = 0
        m3_b.value = 0
        m3_c.value = 0
        if (m3.value <= t1.value) {
            console.log('m3 <= t1:')
            m3_a.value = m3.value
            m3_b.value = 0
            m3_c.value = 0
        }else if (m3.value > t1.value && m3.value <= (t1.value + t2.value)){
            console.log('m3 > t2 && m3 <= (t1 + t2)')
            m3_a.value = t1.value
            m3_b.value = m3.value - t1.value     
        }else{
            console.log('m3 > (t1 + t2)')
            m3_a.value = t1.value
            m3_b.value = t2.value
            m3_c.value = m3.value - (t1.value + t2.value)
        }
    
    }
        

    onMounted(()=>{
        console.log('montado, t1:',t1.value,'t2:',t2.value,'m3:',m3.value); 
        calcula_tramos();
    })

</script>

<template>
    <div class="flex justify-center py-2">

    </div>

    <div class="py-2">
        <div class="tooltip" :data-tip="m3_a + ' m3'">
            <progress class="progress progress-success w-24" :value="m3_a" :max="t1"></progress>
        </div>
        <div class="tooltip" :data-tip="m3_b + ' m3'">
            <progress class="progress progress-warning w-24" :value="m3_b" :max="t2"></progress>
        </div>
        <div class="tooltip" :data-tip="m3_c + ' m3'">
            <progress class="progress progress-error w-24" :value="m3_c" max="100"></progress>
        </div>
        <div class="flex justify-center stat-desc py-5 gap-16">
            <div>
            {{ m3_a }} m3
            </div>
            <div>
            {{ m3_b }} m3
            </div>
            <div>
            {{ m3_c }} m3
            </div>
        </div>
    </div>
    
</template>