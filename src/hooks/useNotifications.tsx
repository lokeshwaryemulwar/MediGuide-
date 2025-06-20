
import { useState, useEffect, useCallback } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'appointment' | 'general';
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const checkAppointmentReminders = useCallback(() => {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const now = new Date();
    
    appointments.forEach((appointment: any) => {
      const appointmentDate = new Date(`${appointment.date} ${appointment.timeSlot}`);
      const reminderTime = new Date(appointmentDate.getTime() - 10 * 60 * 1000); // 10 minutes before
      
      // Check if we should send reminder
      if (now >= reminderTime && now < appointmentDate) {
        const existingReminder = notifications.find(n => 
          n.message.includes(appointment.hospitalName) && 
          n.message.includes(appointment.timeSlot)
        );
        
        if (!existingReminder) {
          addNotification({
            title: 'Appointment Reminder',
            message: `Your appointment at ${appointment.hospitalName} is in 10 minutes (${appointment.timeSlot})`,
            type: 'appointment'
          });
        }
      }
    });
  }, [notifications, addNotification]);

  useEffect(() => {
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Check for appointment reminders every minute
    const interval = setInterval(checkAppointmentReminders, 60000);
    
    return () => clearInterval(interval);
  }, [checkAppointmentReminders]);

  return {
    notifications,
    addNotification,
    markAsRead,
  };
};
