
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '@/components/ui/sidebar';
import { useNotifications } from '@/hooks/useNotifications';

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
        {rightAction && <div>{rightAction}</div>}
      </div>
    </div>
  );
};
