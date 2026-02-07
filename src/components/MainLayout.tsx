import { ReactNode, useEffect, useState } from 'react';
import Navigation from './Navigation';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getOrCreateBackground, Background } from '../services/backgroundService';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [background, setBackground] = useState<Background | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleSidebarToggle = (e: CustomEvent) => {
      setIsSidebarCollapsed(e.detail.isCollapsed);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);

    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    };
  }, []);

  useEffect(() => {
    if (user) {
      loadBackground();
    }
  }, [user]);

  const loadBackground = async () => {
    if (!user) return;

    const { data } = await getOrCreateBackground(user.id);
    if (data) {
      setBackground(data);
    }
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    if (!background) {
      return {};
    }

    let bgImage = '';

    if (isMobile) {
      bgImage = theme === 'light' ? background.mobile_light_bg : background.mobile_dark_bg;
    } else {
      bgImage = theme === 'light' ? background.desktop_light_bg : background.desktop_dark_bg;
    }

    if (bgImage && bgImage.trim() !== '') {
      return {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      };
    }

    return {};
  };

  const backgroundStyle = getBackgroundStyle();
  const hasCustomBackground = Object.keys(backgroundStyle).length > 0;

  return (
    <div
      className={`min-h-screen ${
        !hasCustomBackground
          ? 'bg-gradient-to-br from-orange-50 via-peach-50 to-rose-50 dark:from-gray-900 dark:via-burgundy-950 dark:to-gray-900'
          : ''
      }`}
      style={backgroundStyle}
    >
      <Navigation />
      <main 
        className={`min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-0' : 'lg:ml-[21rem]'
        }`}
      >
        <div className="p-4 lg:p-8 pt-20 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
