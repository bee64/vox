export function useMic() {
    const getMic = () => navigator.mediaDevices.getUserMedia({ audio: true })
    return {
        micAccess: usePermission('microphone'),
        getMic,
    }
}