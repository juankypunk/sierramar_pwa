<script setup>
import MyCalendar from '~/components/MyCalendar.vue';
import {jwtDecode} from "jwt-decode";
const accessToken = useAccessToken();
const user_data = jwtDecode(accessToken.value);

useHead({
    title: 'Calendar'
})
definePageMeta({
    middleware: ["auth"],
})

</script>

<template>
    <div class="container mx-auto">
          <MyCalendar 
            :id="user_data.id"
          />
    </div>
</template>
