import { useEffect, useState, type FormEvent } from 'react'
import type { Season } from '../seasons/types'
import { getMyAttendance, setMyAttendance } from './dinnersService'
import type { Dinner, DinnerAttendee } from './types'

export function DinnerAttendanceSection({
  season,
  dinner,
  memberId,
  onSaved,
}: {
  season: Season
  dinner: Dinner
  memberId: string
  onSaved: () => void
}) {
  const [attendance, setAttendance] = useState<DinnerAttendee | null>(null)
  const [attending, setAttending] = useState(false)
  const [guestCount, setGuestCount] = useState('0')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const existing = await getMyAttendance(season.id, dinner.id, memberId)
      setAttendance(existing)
      setAttending(existing?.attending ?? false)
      setGuestCount(String(existing?.guestCount ?? 0))
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dinner.id])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await setMyAttendance(season.id, dinner.id, memberId, attending, Number(guestCount) || 0)
      onSaved()
    } catch {
      setError('No se ha podido guardar tu asistencia.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Cargando tu asistencia...</p>

  if (dinner.status !== 'OPEN') {
    if (!attendance) return <p>No te inscribiste en esta cena.</p>
    return (
      <p>
        Tu asistencia: {attendance.attending ? 'Sí' : 'No'} · Invitados: {attendance.guestCount}
        {attendance.guestPaymentStatus && ` · Pago: ${attendance.guestPaymentStatus}`}
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Asisto
        <input type="checkbox" checked={attending} onChange={(event) => setAttending(event.target.checked)} />
      </label>
      <label>
        Invitados
        <input type="number" min="0" value={guestCount} onChange={(event) => setGuestCount(event.target.value)} />
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
