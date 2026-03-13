import { create } from 'zustand'

export type ClickedSide = 'left' | 'right'

export interface BranchEndPosition {
  x: number
  y: number
}

interface TrailState {
  activeSideTrailId: string | null
  branchProgress: number | null // progress when user branched off (for marker position)
  clickedSide: ClickedSide | null // which side the clicked checkpoint was on (for blow-away direction)
  branchEndScreenPosition: BranchEndPosition | null // screen coords of branch end for modal placement
  returnScrollProgress: number | null // progress to restore when returning from side trail
  setActiveSideTrail: (id: string | null, progress?: number, side?: ClickedSide) => void
  setBranchEndScreenPosition: (pos: BranchEndPosition | null) => void
  clearReturnScrollProgress: () => void
}

export const useTrailStore = create<TrailState>((set) => ({
  activeSideTrailId: null,
  branchProgress: null,
  clickedSide: null,
  branchEndScreenPosition: null,
  returnScrollProgress: null,
  setActiveSideTrail: (id, progress, side) =>
    set((state) => ({
      activeSideTrailId: id,
      branchProgress:
        id != null && typeof progress === 'number' ? progress : null,
      clickedSide: id != null && side ? side : null,
      branchEndScreenPosition: null, // reset when switching trails
      returnScrollProgress:
        id != null && typeof progress === 'number'
          ? progress
          : state.returnScrollProgress,
    })),
  setBranchEndScreenPosition: (pos) =>
    set({ branchEndScreenPosition: pos }),
  clearReturnScrollProgress: () => set({ returnScrollProgress: null }),
}))
