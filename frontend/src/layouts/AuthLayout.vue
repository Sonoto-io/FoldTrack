<template>
  <div class="grid grid-rows-[auto_1fr] h-screen w-full">
    <header class="p-2 sticky top-0 left-0">
      <a href="/" class="flex items-center">
        <Image src="/favicon.png" alt="FoldTrack Logo" width="75" height="75" class="mr-4" />
        <h1 class="text-xl font-bold">FoldTrack</h1>
      </a>
    </header>

    <slot name="default">
      <div class="w-full flex items-center justify-center">
        <Toast />
        <slot name="form" />
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { Toast } from 'primevue'
import Image from 'primevue/image'
</script>
