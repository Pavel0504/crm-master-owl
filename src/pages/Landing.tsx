import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Users, Package, TrendingUp, ShoppingBag, Calendar } from 'lucide-react';
import { Button } from '../components/ui';

export default function Landing() {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: <Package className="h-12 w-12" />,
      title: 'Управление инвентарём',
      description: 'Контролируйте материалы и запасы в режиме реального времени'
    },
    {
      icon: <ChefHat className="h-12 w-12" />,
      title: 'Рецепты и изделия',
      description: 'Создавайте рецепты и отслеживайте производство изделий'
    },
    {
      icon: <TrendingUp className="h-12 w-12" />,
      title: 'Аналитика продаж',
      description: 'Подробная статистика доходов, расходов и прибыли'
    },
    {
      icon: <ShoppingBag className="h-12 w-12" />,
      title: 'Заказы клиентов',
      description: 'Управляйте заказами от начала до завершения'
    },
    {
      icon: <Users className="h-12 w-12" />,
      title: 'Команда и сотрудники',
      description: 'Координируйте работу команды и назначайте задачи'
    },
    {
      icon: <Calendar className="h-12 w-12" />,
      title: 'Планировщик задач',
      description: 'Организуйте рабочий процесс с помощью календаря'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-burgundy-50 to-orange-100 dark:from-gray-900 dark:via-burgundy-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-burgundy-500 to-orange-500 rounded-full flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Craft Manager
            </h1>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/login')}>
              Войти
            </Button>
            <Button variant="primary" onClick={() => navigate('/register')}>
              Регистрация
            </Button>
          </div>
        </nav>

        <section className="text-center mb-20 animate-fade-in">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-burgundy-500 to-orange-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative w-32 h-32 bg-gradient-to-br from-burgundy-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                <ChefHat className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Управляйте своим
            <br />
            <span className="bg-gradient-to-r from-burgundy-600 to-orange-600 bg-clip-text text-transparent">
              ремесленным бизнесом
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Полнофункциональная система управления для мастеров и творческих предпринимателей
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/register')}
            className="text-lg px-8 py-4"
          >
            Начать бесплатно
          </Button>
        </section>

        <section className="mb-20">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Возможности платформы
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`
                  bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl
                  transition-all duration-300 transform
                  ${hoveredFeature === index ? 'scale-105 shadow-2xl' : ''}
                  cursor-pointer
                `}
              >
                <div className={`
                  text-burgundy-600 dark:text-burgundy-400 mb-4
                  transition-transform duration-300
                  ${hoveredFeature === index ? 'scale-110' : ''}
                `}>
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20 bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Для кого эта платформа?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-burgundy-100 to-orange-100 dark:from-burgundy-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center">
                <ChefHat className="h-10 w-10 text-burgundy-600 dark:text-burgundy-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Кондитеры
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Управление рецептами, заказами тортов и десертов
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-burgundy-100 to-orange-100 dark:from-burgundy-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center">
                <Package className="h-10 w-10 text-burgundy-600 dark:text-burgundy-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Ремесленники
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Контроль материалов и производства изделий ручной работы
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-burgundy-100 to-orange-100 dark:from-burgundy-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center">
                <Users className="h-10 w-10 text-burgundy-600 dark:text-burgundy-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Малый бизнес
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Полный цикл управления от производства до продажи
              </p>
            </div>
          </div>
        </section>

        <section className="text-center bg-gradient-to-r from-burgundy-600 to-orange-600 rounded-3xl p-12 shadow-2xl">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Готовы начать?
          </h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к сообществу мастеров и развивайте свой бизнес вместе с нами
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-burgundy-600 hover:bg-gray-100"
            >
              Создать аккаунт
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate('/about')}
              className="text-white border-2 border-white hover:bg-white/10"
            >
              Узнать больше
            </Button>
          </div>
        </section>

        <footer className="mt-20 text-center text-gray-600 dark:text-gray-400">
          <p>© 2024 Craft Manager. Создано для творческих предпринимателей.</p>
        </footer>
      </div>
    </div>
  );
}
