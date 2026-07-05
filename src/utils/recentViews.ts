/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const STORAGE_KEY = 'estatex_recent_views';
const MAX_RECENT_ITEMS = 6;

/**
 * Adds a property ID to the recently viewed list in localStorage.
 * Moves it to the front if it's already in the list.
 */
export function addRecentlyViewed(propertyId: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let list: string[] = stored ? JSON.parse(stored) : [];

    if (!Array.isArray(list)) {
      list = [];
    }

    // Filter out existing occurrence to re-insert at the front
    list = list.filter((id) => id !== propertyId);
    
    // Insert at beginning
    list.unshift(propertyId);

    // Slice to maximum length
    list = list.slice(0, MAX_RECENT_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save recently viewed property:', err);
  }
}

/**
 * Retrieves the ordered list of recently viewed property IDs.
 */
export function getRecentlyViewed(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const list = JSON.parse(stored);
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.error('Failed to retrieve recently viewed properties:', err);
    return [];
  }
}

/**
 * Clears the recently viewed properties from localStorage.
 */
export function clearRecentlyViewed(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear recently viewed properties:', err);
  }
}
