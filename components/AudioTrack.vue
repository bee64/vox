<template>
    <section :key="`${trackNum}-${refreshKey}`" class="container">
        <button v-if="recorder?.state === 'recording'" @click="stop">stop</button>
        <button v-else @click="start">mic</button>

        <div v-if="loadingPlayback">loading playback</div>
        <div v-else-if="recorder?.state === 'recording'">recording</div>
        <div>track line thingy</div>

        <button @click="play">replay</button>
        <button @click="download">download</button>
    </section>
</template>

<script setup lang="ts">
const props = defineProps({ trackNum: { type: Number, required: true }})
// MediaRecorder is not deeply reactive, this key is used to force reactivity updates
const refreshKey = ref(0)

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
    if (!micAccess.value) return // TODO: pop a modal?
    if (!recorder.value) await setupAudio() 
    recorder.value.start()
    refreshKey.value++
}

const stop = () => {
    if (!recorder.value || recorder.value.state === 'inactive') return
    recorder.value.stop()
    refreshKey.value++
}

const loadingPlayback = ref(false)
const chunks = ref<any[]>([])
const processChunks = async (chunk: any) => {
    loadingPlayback.value = true

    chunks.value.push(chunk)
    const options = { type: "audio/webm; codecs=opus" }
    const blob = new Blob(chunks.value, options) // TODO: look into type
    audioContext.value?.decodeAudioData(await blob.arrayBuffer(), (buffer: AudioBuffer) => {
        buffers.value.push(buffer)
        play() // TODO: make this configurable? so that "stop recording" is more like a pause
    })
    
    loadingPlayback.value = false
}

const download = () => {}
</script>

<style scoped lang="scss">
.container {
    display: flex;
    width: 100%;
    justify-content: space-between;
}
</style>