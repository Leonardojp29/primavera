/** Shown only when WebGL is unavailable. The words still arrive. */
export function Fallback() {
  const lines = [
    'Para Brissa 🌻',
    'Un pequeño detalle para ti.',
    'Porque una flor normal era demasiado fácil… así que mejor hice la mía.',
    'Para ti, en esta primavera. 🌻',
    'Solo quería tener un detalle contigo y recordarte lo mucho  para toda mi vida.',
    'Te amo, Brissa. ❤️',
  ]
  return (
    <div className="fallback">
      <div className="fallback__glow" />
      {lines.map((l, i) => (
        <p key={l} style={{ animationDelay: `${0.8 + i * 1.6}s` }}>
          {l}
        </p>
      ))}
    </div>
  )
}
