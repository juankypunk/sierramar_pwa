<script setup>
    useHead({
        title: 'Usuarios'
    });
    definePageMeta({
        middleware: ["auth"],
    })
    const route= useRoute();
    const router = useRouter();
</script>

<template>
<div class="container mx-auto">
    <div class="px-5">
        <span @click="router.back()" class="cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
        </span>
        <div class="flex px-5 justify-center">
            <div class="">
                <span class="px-5">
                    Usuario: {{ route.params.id }}
                </span>
            </div>
        </div>
    </div>

    <div class="tabs tabs-border">
        <label class="tab">
            <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="Datos del usuario" checked />
                Datos del usuario
        </label>
        <div class="tab-content py-10">
                <UserData :id="+route.params.id" />
        </div>
    </div>
</div>    

</template>