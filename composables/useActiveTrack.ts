import { ref } from 'vue'
import { createGlobalState } from '@vueuse/core'

export const useActiveTrack = createGlobalState(() => {
    return { activeTrackNum: ref(1) } 
})