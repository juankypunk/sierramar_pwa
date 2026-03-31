<script setup>
import { jwtDecode } from "jwt-decode";
definePageMeta({
  middleware: ["auth"],
});
const accessToken = useAccessToken();
const user_data = jwtDecode(accessToken.value);
console.log("empleado: ", user_data.id);
const router = useRouter();
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

    <EmpleadosViewSignings :id="user_data.id.toString()" />
  </div>
</template>
