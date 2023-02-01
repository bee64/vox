<template>
    <div :class="{'red': active}">
        track line thingy
    </div>
</template>

<script setup lang="ts">
defineProps({
    active: { type: Boolean, required: true },
})
</script>

<style lang="scss">
.red {
    color: red
}
</style>