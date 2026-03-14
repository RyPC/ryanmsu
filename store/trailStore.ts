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
  activeCheckpointId: string | null
  branchProgress: number | null // progress when user branched off (for marker position)
  clickedSide: ClickedSide | null // which side the clicked checkpoint was on (for blow-away direction)
  selectedEndpoint: SelectedSideTrailEndpoint | null
  activeBranchLength: number // branch path length multiplier (default 1.0)
  branchEndScreenPosition: BranchEndPosition | null // screen coords of branch end for modal placement
  returnScrollProgress: number | null // progress to restore when returning from side trail
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
  clearReturnScrollProgress: () => void
}

export const useTrailStore = create<TrailState>((set) => ({
  activeSideTrailId: null,
  activeCheckpointId: null,
  branchProgress: null,
  clickedSide: null,
  selectedEndpoint: null,
  activeBranchLength: 1.0,
  branchEndScreenPosition: null,
  returnScrollProgress: null,
  setActiveSideTrail: (id, options) =>
    set((state) => ({
      activeSideTrailId: id,
      activeCheckpointId: id != null ? options?.checkpointId ?? null : null,
      branchProgress:
        id != null && typeof options?.progress === 'number' ? options.progress : null,
      clickedSide: id != null && options?.side ? options.side : null,
      selectedEndpoint: id != null ? options?.endpoint ?? null : null,
      activeBranchLength: id != null ? (options?.branchLength ?? 1.0) : 1.0,
      branchEndScreenPosition: null, // reset when switching trails
      returnScrollProgress:
        id != null && typeof options?.progress === 'number'
          ? options.progress
          : id == null && typeof options?.progress === 'number'
            ? options.progress // close with scroll target
            : state.returnScrollProgress,
    })),
  setBranchEndScreenPosition: (pos) =>
    set({ branchEndScreenPosition: pos }),
  clearReturnScrollProgress: () => set({ returnScrollProgress: null }),
}))
