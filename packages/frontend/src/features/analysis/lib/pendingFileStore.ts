/**
 * Holds the file the user picked on the home page while we navigate to the
 * analysis route. A `File` cannot be serialized into the URL or storage, so
 * this in-memory hand-off replaces the previous `location.state` approach and
 * has one honest limitation: a hard refresh clears it (module state resets to
 * `null` on reload). Pages handle that case with a re-upload prompt instead of
 * silently redirecting home.
 *
 * The read is intentionally NON-destructive. React StrictMode mounts a
 * component, immediately unmounts it, then remounts it with fresh state/refs; a
 * "clear on read" store would be emptied by the throwaway first mount, leaving
 * the real second mount with `null`. Keeping the value until it is overwritten
 * (next selection) or the page reloads makes the hand-off survive that remount.
 */
let pendingFile: File | null = null;

export const setPendingFile = (file: File) => {
  pendingFile = file;
};

/** Returns the pending file without clearing it (see module note on StrictMode). */
export const readPendingFile = (): File | null => pendingFile;
