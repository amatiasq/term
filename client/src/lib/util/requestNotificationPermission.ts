export function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return;
  }

  if (Notification.permission === 'granted') {
    return Promise.resolve(true);
  }

  if (Notification.permission === 'denied') {
    return;
  }

  return Notification.requestPermission().then(x => x === 'granted');
}
