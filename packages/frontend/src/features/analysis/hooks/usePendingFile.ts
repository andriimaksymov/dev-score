import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { readPendingFile } from '@/features/analysis/lib/pendingFileStore';

/**
 * Seeds component state with the one-shot pending file (see `pendingFileStore`)
 * handed over from the home page. The store read is non-destructive, so both of
 * StrictMode's mounts (mount → unmount → remount) observe the same file and the
 * analysis fires reliably; a genuine page reload resets the store to `null`,
 * which the pages surface as a re-upload prompt.
 */
export function usePendingFile(): [File | null, Dispatch<SetStateAction<File | null>>] {
  return useState<File | null>(() => readPendingFile());
}
