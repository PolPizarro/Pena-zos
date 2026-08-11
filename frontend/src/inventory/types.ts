export type InventoryCategory = 'DRINKS' | 'FOOD' | 'DECORATION' | 'EQUIPMENT' | 'SUPPLIES' | 'OTHER'
export type InventoryUnit = 'UNITS' | 'BOXES' | 'BOTTLES' | 'LITERS' | 'KILOGRAMS' | 'PACKS' | 'OTHER'
export type InventoryStatus = 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DISCARDED'

export interface InventoryItem {
  id: string
  name: string
  description: string
  category: InventoryCategory
  quantity: number
  unit: InventoryUnit
  status: InventoryStatus
  notes: string
}
