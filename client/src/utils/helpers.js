/**
 * Shared UI helper utilities used across all pages.
 */

/**
 * Format a date value into a readable string.
 * @param {string|Date} date
 * @returns {string}  e.g. "Jan 15, 2024"
 */
export const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-US', {
        year:  'numeric',
        month: 'short',
        day:   'numeric'
      })
    : '—';

/**
 * Return a CSS class name for a leave status badge.
 * Classes are defined in index.css.
 * @param {'pending'|'approved'|'rejected'|'cancelled'} status
 * @returns {string}
 */
export const statusBadgeClass = (status) => `badge badge-${status}`;

/**
 * Capitalise the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export const capitalise = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

/**
 * Return a human-readable leave-type label.
 * @param {string} type
 * @returns {string}
 */
export const leaveTypeLabel = (type) => {
  const labels = {
    casual:  'Casual Leave',
    medical: 'Medical Leave',
    earned:  'Earned Leave',
    unpaid:  'Unpaid Leave'
  };
  return labels[type] || capitalise(type);
};

/**
 * Return the number of calendar days between two dates (inclusive).
 * @param {string|Date} start
 * @param {string|Date} end
 * @returns {number}
 */
export const daysBetween = (start, end) => {
  const ms = new Date(end) - new Date(start);
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
};
