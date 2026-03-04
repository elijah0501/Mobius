/**
 * Glass card mouse-tracking light effect.
 * Use as event delegation on a container: @mousemove="handleGlassMove"
 */
export function handleGlassMove(event) {
  const card = event.target.closest('.glass-card')
  if (!card) return
  const rect = card.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  card.style.setProperty('--mouse-x', `${x}%`)
  card.style.setProperty('--mouse-y', `${y}%`)
}
