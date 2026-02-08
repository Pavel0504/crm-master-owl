import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, TrendingUp, ShoppingBag, Calendar, Moon, Sun, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui';
import { useTheme } from '../contexts/ThemeContext';

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [floatingElements, setFloatingElements] = useState<Array<{ id: number; left: string; delay: string; duration: string }>>([]);

  useEffect(() => {
    const elements = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${12 + Math.random() * 8}s`,
    }));
    setFloatingElements(elements);
  }, []);

  const features = [
    {
      icon: <Package className="h-12 w-12" />,
      title: 'Управление материалами',
      description: 'Забудьте о бумажных списках и таблицах! Вся информация о ваших материалах, остатках и поставщиках — в одном месте. Система автоматически предупредит, когда запасы заканчиваются, и поможет вовремя заказать нужное.'
    },
    {
      icon: <ShoppingBag className="h-12 w-12" />,
      title: 'Рецепты ваших шедевров',
      description: 'Храните все ваши секретные рецепты и технологии в безопасности. Добавляйте пошаговые инструкции, фотографии и заметки. Больше никаких потерянных записей — всё всегда под рукой!'
    },
    {
      icon: <TrendingUp className="h-12 w-12" />,
      title: 'Финансовая мудрость',
      description: 'Понятная аналитика без сложных терминов. Узнайте, сколько вы зарабатываете на каждом изделии, какие материалы самые выгодные, и куда уходят деньги. Простые графики расскажут всю правду о вашем бизнесе.'
    },
    {
      icon: <Calendar className="h-12 w-12" />,
      title: 'Заказы без путаницы',
      description: 'Принимайте заказы, отслеживайте их статус и сроки выполнения. Система напомнит о важных датах и поможет не забыть ни об одном клиенте. Каждый заказ будет выполнен вовремя!'
    },
    {
      icon: <Package className="h-12 w-12" />,
      title: 'Учёт готовых изделий',
      description: 'Знайте точно, сколько и каких изделий у вас есть. Система автоматически рассчитает себестоимость каждой работы, учитывая все материалы и время. Вы всегда будете знать реальную цену своего творчества.'
    },
    {
      icon: <Calendar className="h-12 w-12" />,
      title: 'Планировщик для команды',
      description: 'Координируйте работу, распределяйте задачи между мастерами и следите за прогрессом. Если вы работаете с помощниками или партнёрами — теперь все будут в курсе, кто и что делает.'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
      {floatingElements.map((element) => (
        <div
          key={element.id}
          className="absolute animate-float text-2xl opacity-60 pointer-events-none"
          style={{
            left: element.left,
            animationDelay: element.delay,
            animationDuration: element.duration,
            top: '-50px'
          }}
        >
          {theme === 'dark' ? '✨' : '🌸'}
        </div>
      ))}

      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute bottom-0 left-0 w-64 h-96 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAwLDMwMCBRMTAwLDI1MCAxMjAsMjAwIFExNDAsMTUwIDEwMCwxMDAgUTYwLDE1MCA4MCwyMDAgUTEwMCwyNTAgMTAwLDMwMCIgZmlsbD0iIzY0MzgyMCIvPjwvc3ZnPg==')] bg-no-repeat bg-bottom"></div>
        <div className="absolute bottom-0 right-0 w-64 h-96 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAwLDMwMCBRMTAwLDI1MCAxMjAsMjAwIFExNDAsMTUwIDEwMCwxMDAgUTYwLDE1MCA4MCwyMDAgUTEwMCwyNTAgMTAwLDMwMCIgZmlsbD0iIzY0MzgyMCIvPjwvc3ZnPg==')] bg-no-repeat bg-bottom transform scale-x-[-1]"></div>
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        <nav className="flex justify-between items-center mb-12 md:mb-16">
          <div className="flex items-center gap-3">
            <img
              src="/chatgpt_image_2_февр._2026_г.,_14_30_32.png"
              alt="Master Owl Logo"
              className="w-12 h-12 md:w-16 md:h-16 object-contain"
            />
            <h1 className="hidden md:block text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Master Owl
            </h1>
          </div>
          <div className="flex gap-2 md:gap-3 items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-lg"
              aria-label="Переключить тему"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </button>
            <Button variant="secondary" onClick={() => navigate('/login')} size="sm" className="md:text-base">
              Войти
            </Button>
            <Button variant="primary" onClick={() => navigate('/register')} size="sm" className="md:text-base">
              Регистрация
            </Button>
          </div>
        </nav>

        <section className="text-center mb-16 md:mb-24">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <img
                src="/chatgpt_image_2_февр._2026_г.,_14_30_32.png"
                alt="Master Owl"
                className="relative w-32 h-32 md:w-48 md:h-48 object-contain drop-shadow-2xl"
              />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 px-4">
            Ваш добрый помощник в
            <br />
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              творческом бизнесе
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 px-4 leading-relaxed">
            Master Owl — это тёплая и дружелюбная система, которая помогает мастерам ручной работы,
            кондитерам и творческим предпринимателям организовать свою работу. Больше никаких забытых
            заказов, потерянных рецептов и запутанных расчётов. Всё просто, понятно и с заботой о вас! 🦉
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/register')}
            className="text-lg px-10 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            Начать бесплатно ✨
          </Button>
        </section>

        <section className="mb-20">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Что умеет Master Owl?
          </h3>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto px-4">
            Мы создали систему, которая берёт на себя рутину, чтобы вы могли заниматься любимым делом
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            {features.map((feature, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`
                  bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl
                  transition-all duration-300 transform hover:shadow-2xl border-2 border-transparent
                  ${hoveredFeature === index ? 'scale-105 border-orange-300 dark:border-orange-700' : ''}
                  cursor-pointer
                `}
              >
                <div className={`
                  text-orange-600 dark:text-orange-400 mb-4
                  transition-transform duration-300
                  ${hoveredFeature === index ? 'scale-110' : ''}
                `}>
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl mx-4">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Кому подойдёт Master Owl?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-full flex items-center justify-center text-4xl shadow-lg">
                🧁
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Кондитерам
              </h4>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Сохраняйте рецепты тортов и десертов, отслеживайте заказы на праздники,
                рассчитывайте стоимость каждого лакомства с учётом всех ингредиентов
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-full flex items-center justify-center text-4xl shadow-lg">
                🎨
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Мастерам ручной работы
              </h4>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Ведите учёт материалов для рукоделия, вязания, шитья или любого другого творчества.
                Знайте точную себестоимость каждого изделия
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-full flex items-center justify-center text-4xl shadow-lg">
                ✨
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Творческим предпринимателям
              </h4>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Управляйте всем циклом — от закупки материалов до продажи готовых изделий.
                Анализируйте продажи и развивайте своё дело с умом
              </p>
            </div>
          </div>
        </section>

        <section className="text-center bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-8 md:p-12 shadow-2xl mb-12 mx-4">
          <div className="text-6xl mb-6">🦉</div>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Готовы начать?
          </h3>
          <p className="text-xl text-white/95 mb-8 max-w-2xl mx-auto leading-relaxed">
            Присоединяйтесь к сообществу мастеров, которые уже доверили нам заботу о своём бизнесе.
            Master Owl всегда рядом, чтобы помочь вам творить чудеса! ✨
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/register')}
            className="bg-white text-orange-600 hover:bg-gray-50 text-lg px-10 py-4 shadow-xl"
          >
            Создать бесплатный аккаунт
          </Button>
        </section>

        <footer className="mt-16 pb-8 text-center text-gray-600 dark:text-gray-400 space-y-6">
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 max-w-3xl mx-auto shadow-lg">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Создано с любовью при поддержке
            </h4>

            <div className="space-y-4">
              <div>
                <p className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  Творческая мастерская AUNTIE OWL
                </p>
                <div className="flex justify-center gap-4 flex-wrap">
                  <a
                    href="https://vk.com/ayntieowl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                  >
                    ВКонтакте <ExternalLink className="h-4 w-4" />
                  </a>
                  <a
                    href="https://t.me/Auntie_Owl_moon"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                  >
                    Telegram <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-300 dark:border-gray-600">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">
                  Разработчик
                </p>
                <a
                  href="https://t.me/code_engineer010"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                >
                  Code Engineer <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          <p className="text-sm">© 2024 Master Owl. С заботой о вашем творчестве 🦉</p>
        </footer>
      </div>

      <style>{`
        @keyframes float {
          0% {
            transform: translateY(-100px) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          5% {
            opacity: 0.7;
          }
          95% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(calc(100vh + 100px)) rotate(360deg) scale(1.2);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float 12s linear infinite;
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  );
}
