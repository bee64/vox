<template>
    <section :key="`refresh-${trackNum}-${refreshKey}`" class="container">
        <button v-if="recorder?.state === 'recording'" @click="stop">stop</button>
        <button v-else @click="start">mic</button>

        <TrackVisualizer :active="isLastActive" />

        <button @click="play">replay</button>
        <!-- TODO -->
        <!-- <button @click="download">download</button> -->
        <!-- <button @click="delete">download</button> -->
    </section>
</template>

<script setup lang="ts">
const props = defineProps({
    trackNum: { type: Number, required: true },
    autoRecord: { type: Boolean, required: true },
})
// MediaRecorder is not deeply reactive, this key is used to force reactivity updates
const refreshKey = ref(0)
const { activeTrackNum } = useActiveTrack()
const updateRefreshKey = () => {
    activeTrackNum.value = props.trackNum
    refreshKey.value++
}
const isLastActive = computed(() => activeTrackNum.value === props.trackNum)

const { micAccess, getMic } = useMic()
const recorder = ref()
const audioContext = ref<AudioContext>()
const setupAudio = async () => {
    recorder.value = new MediaRecorder(await getMic())
    recorder.value.ondataavailable = (e: any) => processChunks(e.data)
    audioContext.value = new window.AudioContext()
}

const buffers = ref<AudioBuffer[]>([])
const concatAudio = (buffers: AudioBuffer[]): AudioBuffer => {
    if (!audioContext.value) throw Error("concatAudio error: no AudioContext")
    const combinedAudio = audioContext.value.createBuffer(
        Math.max(...buffers.map(b => b.numberOfChannels)),     // max # of channels
        buffers.reduce((prev, curr) => prev + curr.length, 0), // total length of buffers
        buffers[0].sampleRate
    )

    let currentOffset = 0;
    buffers.forEach((buffer) => {
        for (let currChannel = 0; currChannel < buffer.numberOfChannels; currChannel++) {
            combinedAudio.getChannelData(currChannel).set(buffer.getChannelData(currChannel), currentOffset);
        }
        currentOffset += buffer.length;
    });
    return combinedAudio
}

const audioSource = ref<AudioBufferSourceNode>()
const play = () => {
    if (!audioContext.value || buffers.value.length === 0) return
    audioSource.value = audioContext.value.createBufferSource()
    audioSource.value.connect(audioContext.value.destination)
    audioSource.value.buffer = concatAudio(buffers.value)
    audioSource.value.start()
}

const start = async () => {
    if (!recorder.value) await setupAudio() 
    recorder.value.start()
    updateRefreshKey()
}

const stop = () => {
    recorder.value.stop()
    updateRefreshKey()
}

const loadingPlayback = ref(false)
const processChunks = async (chunk: any) => {
    loadingPlayback.value = true

    const blob = new Blob([chunk], { type: "audio/webm; codecs=opus" }) // TODO: look into codecs
    audioContext.value?.decodeAudioData(await blob.arrayBuffer(), (buffer: AudioBuffer) => {
        buffers.value.push(buffer)
        play() // TODO: make this configurable? so that "stop recording" is more like a pause
    })
    
    loadingPlayback.value = false
}

const download = () => {}

const { createHotkey } = useHotkeys(isLastActive)
createHotkey(
    "toggle record",
    ['k', 'K', ' '],
    () => recorder.value?.state === 'recording' ? stop() : start()
)
createHotkey(
    "playback",
    ['p', 'P'],
    play
)

// TODO
// createHotkey(
//     "seek left",
//     ['j', 'J', 'ArrowLeft'],
//     () => {}
// )
// createHotkey(
//     "seek right",
//     ['l', 'L', 'ArrowRight'],
//     () => {}
// )
</script>

<style scoped lang="scss">
.container {
    display: flex;
    justify-content: space-between;
    max-width: 750px;
}
</style>