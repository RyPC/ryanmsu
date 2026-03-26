import { create } from 'zustand'

export type ClickedSide = 'left' | 'right'

export interface BranchEndPosition {
  x: number
  y: number
}

export interface SelectedSideTrailEndpoint {
  xOffset?: number
  yOffset?: number
}

interface TrailState {
  activeSideTrailId: string | null
  branchProgress: number | null
  clickedSide: ClickedSide | null
  selectedEndpoint: SelectedSideTrailEndpoint | null
  activeBranchLength: number
  branchEndScreenPosition: BranchEndPosition | null
  returnScrollProgress: number | null
  isReturning: boolean
  setActiveSideTrail: (
    id: string | null,
    options?: {
      branchProgress?: number
      returnScrollProgress?: number
      side?: ClickedSide
      checkpointId?: string
      endpoint?: SelectedSideTrailEndpoint
      branchLength?: number
    }
  ) => void
  beginReturnToTrail: () => void
  setBranchEndScreenPosition: (pos: BranchEndPosition | null) => void
  clearReturnScrollProgress: () => void
}

export const useTrailStore = create<TrailState>((set) => ({
  activeSideTrailId: null,
  branchProgress: null,
  clickedSide: null,
  selectedEndpoint: null,
  activeBranchLength: 1.0,
  branchEndScreenPosition: null,
  returnScrollProgress: null,
  isReturning: false,
  setActiveSideTrail: (id, options) =>
    set((state) => ({
      activeSideTrailId: id,
      isReturning: false,
      branchProgress:
        id != null && typeof options?.branchProgress === 'number'
          ? options.branchProgress
          : null,
      clickedSide: id != null && options?.side ? options.side : null,
      selectedEndpoint: id != null ? options?.endpoint ?? null : null,
      activeBranchLength: id != null ? (options?.branchLength ?? 1.0) : 1.0,
      branchEndScreenPosition: null,
      returnScrollProgress:
        typeof options?.returnScrollProgress === 'number'
          ? options.returnScrollProgress
          : state.returnScrollProgress,
    })),
  beginReturnToTrail: () => set({ isReturning: true }),
  setBranchEndScreenPosition: (pos) =>
    set({ branchEndScreenPosition: pos }),
  clearReturnScrollProgress: () => set({ returnScrollProgress: null }),
}))
