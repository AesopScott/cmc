/**
 * Privacy detection utilities
 * Respects user privacy preferences set at browser/device level
 */

/**
 * Check if user has enabled Do Not Track (DNT)
 */
export function hasDoNotTrack() {
  // Check navigator.doNotTrack
  if (typeof navigator !== 'undefined') {
    const dnt = navigator.doNotTrack;
    if (dnt === '1' || dnt === 'yes' || dnt === true) {
      return true;
    }
  }
  return false;
}

/**
 * Check if user has enabled Global Privacy Control (GPC)
 * https://globalprivacycontrol.org/
 */
export function hasGlobalPrivacyControl() {
  if (typeof navigator !== 'undefined' && navigator.globalPrivacyControl === true) {
    return true;
  }
  return false;
}

/**
 * Check if user has requested privacy via Sec-GPC header
 * (This would be set by the server from request headers)
 */
export function shouldRespectPrivacy(gpcHeaderValue = null) {
  if (gpcHeaderValue === '1' || gpcHeaderValue === true) {
    return true;
  }
  return hasDoNotTrack() || hasGlobalPrivacyControl();
}

/**
 * Determine if tracking scripts should be loaded
 * Returns false if user has explicitly opted out via DNT/GPC
 */
export function canLoadTracking(gpcHeaderValue = null) {
  return !shouldRespectPrivacy(gpcHeaderValue);
}
