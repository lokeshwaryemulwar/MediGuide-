
import { ArrowLeft, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '@/components/ui/sidebar';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export const Header = ({ title, showBack = false, rightAction }: HeaderProps) => {
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const { notifications, markAsRead } = useNotifications();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
      <div className="flex items-center space-x-3">
        {showBack ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={toggleSidebar}
          >
            <div className="flex flex-col space-y-1">
              <div className="w-5 h-0.5 bg-current"></div>
              <div className="w-5 h-0.5 bg-current"></div>
              <div className="w-5 h-0.5 bg-current"></div>
            </div>
          </Button>
        )}
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white rounded-full text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b border-border/50">
              <h4 className="font-semibold">Notifications</h4>
            </div>
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No notifications
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${!notification.read ? 'bg-primary/5' : ''}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h5 className={`text-sm font-medium ${!notification.read ? 'text-primary' : 'text-foreground'}`}>
                          {notification.title}
                        </h5>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </div>
  );
};
