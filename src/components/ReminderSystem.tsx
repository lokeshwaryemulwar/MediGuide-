
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useNotifications } from '@/contexts/NotificationContext';

interface MedicationItem {
    id: string;
    name: string;
    dosage: string;
    time: string;
    taken: boolean;
    lastReminded?: number; // Timestamp of last reminder
    preReminded?: number; // Timestamp of 5-min before reminder
}

export const ReminderSystem = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { addNotification } = useNotifications();

    useEffect(() => {
        // Initialize audio
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Simple beep sound
        audioRef.current.loop = true;

        // Safely request notification permission
        const requestPermission = async () => {
            try {
                if ("Notification" in window && window.isSecureContext) {
                    const permission = await Notification.requestPermission();
                    if (permission !== 'granted') {
                        console.log("Notification permission denied or ignored.");
                    }
                } else {
                    console.log("Notifications not supported or insecure context. Using in-app alerts.");
                }
            } catch (error) {
                console.warn("Notification API error:", error);
            }
        };

        requestPermission();

        const checkReminders = () => {
            const now = new Date();
            const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

            const saved = localStorage.getItem('medications');
            if (!saved) return;

            const medications: MedicationItem[] = JSON.parse(saved);
            let updated = false;

            medications.forEach(med => {
                if (med.taken) return;

                const [hours, minutes] = med.time.split(':').map(Number);
                const medDate = new Date();
                medDate.setHours(hours, minutes, 0, 0);

                // Calculate difference in minutes
                const diffMinutes = Math.floor((medDate.getTime() - now.getTime()) / 60000);

                // 1. Pre-Reminder (5 mins before)
                if (diffMinutes === 5) {
                    const lastPreReminded = med.preReminded || 0;
                    if (Date.now() - lastPreReminded > 60000) {
                        triggerPreReminder(med);
                        med.preReminded = Date.now();
                        updated = true;
                    }
                }

                // 2. Exact Time Alarm
                if (med.time === currentTime) {
                    const lastReminded = med.lastReminded || 0;
                    if (Date.now() - lastReminded > 60000) {
                        triggerAlarm(med);
                        med.lastReminded = Date.now();
                        updated = true;
                    }
                }

                // 3. Post-Reminder / Nag (5 mins after)
                // Note: diffMinutes will be negative if time has passed
                if (diffMinutes === -5) {
                    const lastReminded = med.lastReminded || 0;
                    // Ensure we don't trigger if we just triggered the main alarm (though 5 mins have passed, so it's fine)
                    // We use a separate check or just reuse lastReminded with a larger threshold if needed,
                    // but here we just check if we haven't nagged recently.
                    // Actually, let's use a separate flag or just rely on the fact that lastReminded was set 5 mins ago.
                    // To be safe, let's just check if we haven't reminded in the last minute.
                    if (Date.now() - lastReminded > 60000) {
                        triggerNag(med);
                        med.lastReminded = Date.now();
                        updated = true;
                    }
                }
            });

            if (updated) {
                localStorage.setItem('medications', JSON.stringify(medications));
            }
        };

        const triggerPreReminder = (med: MedicationItem) => {
            // Add to Notification Center
            addNotification({
                title: 'Upcoming Medication',
                message: `Take ${med.name} (${med.dosage}) in 5 minutes`,
                type: 'medication'
            });

            // Browser Notification
            try {
                if ("Notification" in window && Notification.permission === "granted") {
                    new Notification("Upcoming Medicine", {
                        body: `5 minutes until ${med.name} (${med.dosage})`,
                        icon: "/favicon.ico"
                    });
                }
            } catch (e) { console.warn(e); }

            toast.info(`Upcoming: ${med.name}`, {
                description: `Take in 5 minutes (${med.time})`,
                duration: 5000,
                position: 'top-center'
            });
        };

        const triggerAlarm = (med: MedicationItem) => {
            // Add to Notification Center
            addNotification({
                title: 'Medicine Time!',
                message: `It's time to take ${med.name} (${med.dosage})`,
                type: 'medication'
            });

            // 2. Browser Notification
            try {
                if ("Notification" in window && Notification.permission === "granted") {
                    new Notification("Medicine Time!", {
                        body: `It's time to take ${med.name} (${med.dosage})`,
                        icon: "/favicon.ico"
                    });
                }
            } catch (e) { console.warn(e); }

            // 3. In-App Toast
            toast.warning(`Time to take ${med.name}`, {
                description: `Dosage: ${med.dosage}. Click to stop alarm.`,
                duration: 10000,
                position: 'top-center',
                action: {
                    label: "Stop Alarm",
                    onClick: () => stopAlarm()
                },
                onDismiss: () => stopAlarm(),
                onAutoClose: () => stopAlarm()
            });

            // 4. Play Sound
            playAlarm();
        };

        const triggerNag = (med: MedicationItem) => {
            // Add to Notification Center
            addNotification({
                title: 'Missed Medicine',
                message: `You haven't marked ${med.name} as taken yet!`,
                type: 'medication'
            });

            try {
                if ("Notification" in window && Notification.permission === "granted") {
                    new Notification("Missed Medicine!", {
                        body: `You haven't marked ${med.name} as taken yet!`,
                        icon: "/favicon.ico"
                    });
                }
            } catch (e) { console.warn(e); }

            toast.error(`Reminder: You missed ${med.name}`, {
                description: "Please take it now!",
                duration: 5000,
                position: 'top-center'
            });

            playAlarm();
        };

        const playAlarm = () => {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                const playPromise = audioRef.current.play();

                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log("Audio play failed:", error);
                        toast.info("Alarm triggered (Audio blocked by browser)", { position: 'top-center' });
                    });
                }
            }
        };

        const stopAlarm = () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };

        // Check every 10 seconds
        const interval = setInterval(checkReminders, 10000);

        return () => {
            clearInterval(interval);
            stopAlarm();
        };
    }, [addNotification]);

    return null;
};
