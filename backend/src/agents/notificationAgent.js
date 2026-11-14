export class NotificationAgent {
  constructor() {
    this.history = [];
  }

  /**
   * Dispatches a notification while enforcing deduplication within a cooldown window
   */
  async dispatch({ userId, type, title, message, data = {}, cooldownMinutes = 60 }) {
    const now = Date.now();
    const cooldownMs = cooldownMinutes * 60 * 1000;

    // Check for duplicate recent notification
    const isDuplicate = this.history.some(n => 
      n.userId === userId &&
      n.type === type &&
      n.title === title &&
      (now - new Date(n.timestamp).getTime()) < cooldownMs
    );

    if (isDuplicate) {
      return {
        dispatched: false,
        reason: 'duplicate_suppressed',
        message: 'Notification suppressed to avoid student alert fatigue'
      };
    }

    const notificationRecord = {
      id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      userId,
      type,
      title,
      message,
      data,
      isRead: false,
      timestamp: new Date().toISOString()
    };

    this.history.unshift(notificationRecord);

    return {
      dispatched: true,
      notification: notificationRecord,
      deliveryStatus: 'delivered'
    };
  }

  getUserNotifications(userId) {
    return this.history.filter(n => n.userId === userId);
  }

  markAsRead(notificationId) {
    const item = this.history.find(n => n.id === notificationId);
    if (item) item.isRead = true;
    return item;
  }
}

export const notificationAgent = new NotificationAgent();

