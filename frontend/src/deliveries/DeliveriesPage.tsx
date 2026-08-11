import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import type { Member } from '../auth/types'
import { listMembers } from '../members/membersService'
import { listProducts } from '../products/productsService'
import type { Product } from '../products/types'
import { getActiveSeason } from '../seasons/seasonsService'
import type { Season } from '../seasons/types'
import { MemberDeliveryView } from './MemberDeliveryView'

export function DeliveriesPage() {
  const { member } = useAuth()
  const canManage = member?.roles.includes('BOARD') || member?.roles.includes('ADMIN')

  const [season, setSeason] = useState<Season | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const activeSeason = await getActiveSeason()
        setSeason(activeSeason)
        if (canManage && activeSeason) {
          setMembers(await listMembers())
          setProducts(await listProducts(activeSeason.id))
        }
      } catch {
        setError('No se ha podido cargar la información.')
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <p>Cargando...</p>
  if (!season) return <p>No hay ninguna temporada activa.</p>

  return (
    <main>
      <h1>Entregas — {season.name}</h1>
      {error && <p role="alert">{error}</p>}

      {!canManage && member && (
        <MemberDeliveryView season={season} memberId={member.id} isSelf products={[]} />
      )}

      {canManage && (
        <>
          <label>
            Miembro
            <select value={selectedMemberId} onChange={(event) => setSelectedMemberId(event.target.value)}>
              <option value="">Selecciona...</option>
              {members.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.fullName}
                </option>
              ))}
            </select>
          </label>

          {selectedMemberId && (
            <MemberDeliveryView
              season={season}
              memberId={selectedMemberId}
              isSelf={false}
              products={products}
            />
          )}
        </>
      )}
    </main>
  )
}
