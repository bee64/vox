<template>
    <div class="layout">
        <!-- TODO: Options? Optional lol -->
        <!-- TODO: "Mic access" Modal -->
        <AudioTrack 
            v-for="count of trackCount"
            :key="`track-${count}`"
            :trackNum="count"
            :autoRecord="autoRecord"
        />
        <button @click="addNew">plus</button>
        <!-- TODO -->
        <!-- <button @click="downloadAll">dl all</button> -->
        <!-- <button @click="deleteAll">delete all</button> -->
    </div>
</template>

<script setup lang="ts">
// TODO: get devices list to switch between mics?
const { micAccess, getMic } = useMic()
onMounted(getMic)

const trackCount = ref(1)
const autoRecord = ref(false)
const addNew = () => {
    autoRecord.value = true
    trackCount.value++
}
</script>

<style scoped lang="scss">
.layout {
    padding-top: 2rem;
}
</style>