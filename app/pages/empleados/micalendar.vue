<script setup>
import MyCalendar from "~/components/MyCalendar.vue";
import { jwtDecode } from "jwt-decode";
const accessToken = useAccessToken();
const user_data = jwtDecode(accessToken.value);
const router = useRouter();

useHead({
  title: "Calendar",
});
definePageMeta({
  middleware: ["auth"],
});
</script>

<template>
  <div class="container mx-auto">
    <div class="px-5 py-5">
      <span @click="router.back()" class="cursor-pointer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
      </span>
    </div>
    <div class="px-5">
      <MyCalendar :id="user_data.id" />
    </div>
  </div>
</template>
