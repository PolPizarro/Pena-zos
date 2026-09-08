import { useEffect, useMemo, useRef, useState } from 'react'

export interface SearchableSelectOption {
  value: string
  label: string
}

// Reusable searchable/autocomplete dropdown, used app-wide in place of
// plain <select> elements (member pickers, product pickers, status/type
// pickers) per user feedback during initial testing.
export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Buscar...',
  disabled = false,
}: {
  options: SearchableSelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedLabel = options.find((option) => option.value === value)?.label ?? ''

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return options
    return options.filter((option) => option.label.toLowerCase().includes(normalized))
  }, [options, query])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectOption(option: SearchableSelectOption) {
    onChange(option.value)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="searchable-select" ref={containerRef}>
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        value={open ? query : selectedLabel}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => {
          setOpen(true)
          setQuery('')
        }}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
      />
      {open && (
        <ul className="searchable-select__options">
          {filtered.length === 0 && <li className="searchable-select__empty">Sin resultados</li>}
          {filtered.map((option) => (
            <li key={option.value}>
              <button type="button" onClick={() => selectOption(option)}>
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
