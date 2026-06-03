/**
 * JS media-query strings aligned with `src/styles/breakpoints.css` (`--weg-md` = 768px).
 */
export const WEG_DESKTOP_MEDIA_QUERY = '(width >= 768px)' as const;

/** Primary input can hover (excludes most touch-only profiles). */
export const WEG_HOVER_CAPABLE_MEDIA_QUERY = '(hover: hover)' as const;
