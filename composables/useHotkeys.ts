import type { Ref } from "vue"

type Hotkey = {
    name: string
    keys: string[]
}
const useHotkeyStore = createGlobalState(() => ({
    allHotkeys: ref<Hotkey[]>([])
}))

export const useHotkeys = (active?: Ref<boolean>) => {
    const { allHotkeys } = useHotkeyStore()

    // create global state "is input active"
    // hotkeys shouldn't run if an input is active
    const hotkey = (event: KeyboardEvent, action: () => any) => {
        if (active && !active.value) return // hotkey deactivated
        event.preventDefault()
        action()
    }
    const createHotkey = (name: string, keys: string[], action: () => any) => {
        onKeyStroke(keys, (e) => hotkey(e, action))
        allHotkeys.value.push({ name, keys })
    }

    return { createHotkey, }
}