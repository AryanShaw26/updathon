import { Notification } from 'electron'

export function sendTestNotification(): void {
  if (!Notification.isSupported()) {
    throw new Error('Desktop notifications are not supported on this system.')
  }

  new Notification({
    title: 'Updathon',
    body: 'Hackathon notification test.',
  }).show()
}
