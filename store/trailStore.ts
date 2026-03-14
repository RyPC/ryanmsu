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
  setActiveSideTrail: (
    id: string | null,
    options?: {
      progress?: number
      side?: ClickedSide
      checkpointId?: string
      endpoint?: SelectedSideTrailEndpoint
      branchLength?: number
    }
  ) => void
  setBranchEndScreenPosition: (pos: BranchEndPosition | null) => void
}

export const useTrailStore = create<TrailState>((set) => ({
  activeSideTrailId: null,
  branchProgress: null,
  clickedSide: null,
  selectedEndpoint: null,
  activeBranchLength: 1.0,
  branchEndScreenPosition: null,
  returnScrollProgress: null,
  setActiveSideTrail: (id, options) =>
    set((state) => ({
      activeSideTrailId: id,
      branchProgress:
        id != null && typeof options?.progress === 'number' ? options.progress : null,
      clickedSide: id != null && options?.side ? options.side : null,
      selectedEndpoint: id != null ? options?.endpoint ?? null : null,
      activeBranchLength: id != null ? (options?.branchLength ?? 1.0) : 1.0,
      branchEndScreenPosition: null,
      returnScrollProgress:
        id != null && typeof options?.progress === 'number'
          ? options.progress
          : id == null && typeof options?.progress === 'number'
            ? options.progress
            : state.returnScrollProgress,
    })),
  setBranchEndScreenPosition: (pos) =>
    set({ branchEndScreenPosition: pos }),
}))
