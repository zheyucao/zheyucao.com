/**
 * Type-safe DOM query utilities.
 */

/**
 * Type-safe querySelector wrapper.
 * Returns the element typed correctly or null if not found.
 */
export function querySelector<T extends Element>(
  selector: string,
  parent: ParentNode = document
): T | null {
  return parent.querySelector<T>(selector);
}

/**
 * Query selector that throws if element is not found.
 * Use when the element is required for the component to function.
 *
 * @throws Error if element is not found
 */
export function requireElement<T extends Element>(
  selector: string,
  parent: ParentNode = document
): T {
  const el = parent.querySelector<T>(selector);
  if (!el) {
    throw new Error(`Required element not found: ${selector}`);
  }
  return el;
}

/**
 * Type-safe querySelectorAll wrapper.
 * Returns a properly typed NodeList.
 */
export function querySelectorAll<T extends Element>(
  selector: string,
  parent: ParentNode = document
): NodeListOf<T> {
  return parent.querySelectorAll<T>(selector);
}
