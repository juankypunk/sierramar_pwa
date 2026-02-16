<script  setup >
    const numToSum = ref(1000000000)
    const countingMsg = ref([])
    
    const cal = async (type) => {
        let sum = 0;
        const start = performance.now();
        sum = await sumNumWorkerPublic()
        const end = performance.now();
        countingMsg.value.push(`The sum of 0 to ${numToSum.value} is  ${sum}  (time spent: ${end - start} ms)`)
    }

    // calculate the answer with web worker create from /public/worker.js
    const sumNumWorkerPublic = () => {
        return new Promise((resolve, reject) => {
            const worker = new Worker('/worker.js')
            worker.postMessage(numToSum.value);
            worker.addEventListener('message', (e) => {
                if (e.data) {
                    resolve(e.data)
                    worker.terminate()
                }
            }, false);
        })
    }

</script>

<template lang="">
    <div>
        <button class="btn" @click="cal('workerPublic')">Sum 0 to {{ numToSum }} (Worker Public)</button>
        <div v-for="(val, index) in countingMsg">{{val}}</div>
    </div>
</template>
