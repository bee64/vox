<template>
    <div class="layout">
        <!-- TODO: Options? Optional lol -->
        <!-- TODO: more tracks -->
        <AudioTrack :trackNum="1"/>
        <!-- TODO: add new recorder, download, global controls -->
        <!-- TODO: "Mic access" Modal-->
    </div>
</template>

<script setup lang="ts">
// TODO: get devices list to switch between mics?
const { micAccess, getMic } = useMic()
onMounted(getMic)
</script>

<style scoped lang="scss">
.layout {
    padding-top: 2rem;
}
</style>