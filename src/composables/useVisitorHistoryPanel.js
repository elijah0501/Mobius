import { ref } from 'vue'

const open = ref(false)

export function useVisitorHistoryPanel() {
  function toggle() {
    open.value = !open.value
  }

  return { open, toggle }
}
