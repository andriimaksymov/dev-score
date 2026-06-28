/**
 * DOM-based quote highlighter.
 *
 * Given a container that holds rendered text (a PDF.js text layer or a plain
 * <pre> block) and a list of improvements, it locates each improvement's
 * `quote` inside the container — even when the phrase is split across many
 * separate text nodes (which is always the case for a PDF text layer) — and
 * wraps every matching run in a clickable <mark data-cv-highlight="{index}">.
 *
 * Matching is whitespace- and case-insensitive so the AI-supplied quote (taken
 * from a separate text-extraction pass) still lines up with the glyph spans
 * PDF.js produces.
 */

export interface HighlightImprovement {
  index: number;
  quote: string;
  category: string;
}

const MARK_SELECTOR = 'mark[data-cv-highlight]';

/** Remove any marks a previous run added so re-highlighting is idempotent. */
function unwrapExisting(container: HTMLElement): void {
  container.querySelectorAll<HTMLElement>(MARK_SELECTOR).forEach((mark) => {
    const parent = mark.parentNode;
    if (!parent) return;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
  });
}

interface CharRef {
  node: Text;
  local: number;
}

interface NodeInterval {
  start: number;
  end: number;
  index: number;
  category: string;
}

/** Collect the container's text nodes, skipping empty ones. */
function collectTextNodes(container: HTMLElement): Text[] {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    if (current.textContent && current.textContent.length > 0) {
      nodes.push(current as Text);
    }
    current = walker.nextNode();
  }
  return nodes;
}

function normalizeQuote(quote: string): string {
  return quote.replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * Highlight every improvement quote found in `container`.
 * Returns the set of improvement indices that were successfully located.
 */
export function highlightQuotes(
  container: HTMLElement,
  improvements: HighlightImprovement[]
): Set<number> {
  unwrapExisting(container);

  const matched = new Set<number>();
  const nodes = collectTextNodes(container);
  if (nodes.length === 0) return matched;

  // Build a single concatenated raw string with a per-character map back to the
  // owning text node. A separator space is inserted between nodes so phrases
  // never accidentally merge across span boundaries.
  let raw = '';
  const refs: (CharRef | null)[] = [];
  for (const node of nodes) {
    const text = node.textContent ?? '';
    for (let k = 0; k < text.length; k += 1) {
      raw += text[k];
      refs.push({ node, local: k });
    }
    raw += ' ';
    refs.push(null);
  }

  // Build a normalized (collapsed-whitespace, lower-cased) projection of `raw`
  // plus an index map back to raw positions, so a match in normalized space can
  // be translated to exact node offsets.
  let norm = '';
  const normToRaw: number[] = [];
  let prevSpace = true; // leading whitespace is dropped
  for (let i = 0; i < raw.length; i += 1) {
    const c = raw[i];
    if (/\s/.test(c)) {
      if (!prevSpace) {
        norm += ' ';
        normToRaw.push(i);
      }
      prevSpace = true;
    } else {
      norm += c.toLowerCase();
      normToRaw.push(i);
      prevSpace = false;
    }
  }

  // Group wrap intervals per text node so each node is rebuilt in one pass.
  const tasksByNode = new Map<Text, NodeInterval[]>();

  for (const improvement of improvements) {
    const needle = normalizeQuote(improvement.quote);
    if (needle.length < 3) continue;

    let from = 0;
    let found = false;
    // Highlight every occurrence of the quote.
    for (;;) {
      const pos = norm.indexOf(needle, from);
      if (pos === -1) break;
      found = true;
      const rawStart = normToRaw[pos];
      const rawEnd = normToRaw[pos + needle.length - 1] + 1;

      // Split the raw range into contiguous per-node intervals.
      let i = rawStart;
      while (i < rawEnd) {
        const ref = refs[i];
        if (!ref) {
          i += 1;
          continue;
        }
        const node = ref.node;
        const localStart = ref.local;
        let localEnd = localStart + 1;
        i += 1;
        while (i < rawEnd) {
          const next = refs[i];
          if (next && next.node === node && next.local === localEnd) {
            localEnd += 1;
            i += 1;
          } else {
            break;
          }
        }
        const list = tasksByNode.get(node) ?? [];
        list.push({
          start: localStart,
          end: localEnd,
          index: improvement.index,
          category: improvement.category,
        });
        tasksByNode.set(node, list);
      }

      from = pos + needle.length;
    }

    if (found) matched.add(improvement.index);
  }

  // Rebuild each affected text node, wrapping the matched runs in <mark>.
  for (const [node, intervals] of tasksByNode) {
    intervals.sort((a, b) => a.start - b.start);
    const text = node.textContent ?? '';
    const frag = document.createDocumentFragment();
    let cursor = 0;
    for (const iv of intervals) {
      if (iv.start < cursor) continue; // skip overlapping match
      if (iv.start > cursor) frag.append(text.slice(cursor, iv.start));
      const mark = document.createElement('mark');
      mark.className = 'cv-mark';
      mark.dataset.cvHighlight = String(iv.index);
      mark.dataset.category = iv.category;
      mark.textContent = text.slice(iv.start, iv.end);
      frag.append(mark);
      cursor = iv.end;
    }
    if (cursor < text.length) frag.append(text.slice(cursor));
    node.parentNode?.replaceChild(frag, node);
  }

  return matched;
}

/**
 * Pure check (no DOM) of which improvement quotes occur in `text`. Used to flag
 * which suggestions are anchored to a real passage. The extracted resume text is
 * the same source the PDF text layer is built from, so this mirrors what gets
 * highlighted without depending on render timing.
 */
export function findMatchedIndices(
  text: string,
  improvements: HighlightImprovement[]
): Set<number> {
  const haystack = normalizeQuote(text);
  const matched = new Set<number>();
  for (const improvement of improvements) {
    const needle = normalizeQuote(improvement.quote);
    if (needle.length >= 3 && haystack.includes(needle)) matched.add(improvement.index);
  }
  return matched;
}

/** Toggle the active visual state on marks matching `activeIndex`. */
export function setActiveHighlight(container: HTMLElement, activeIndex: number | null): void {
  container.querySelectorAll<HTMLElement>(MARK_SELECTOR).forEach((mark) => {
    const isActive = activeIndex !== null && mark.dataset.cvHighlight === String(activeIndex);
    mark.classList.toggle('cv-mark-active', isActive);
  });
}

/** Find the first mark element for a given improvement index. */
export function findHighlight(container: HTMLElement, index: number): HTMLElement | null {
  return container.querySelector<HTMLElement>(
    `mark[data-cv-highlight="${CSS.escape(String(index))}"]`
  );
}
