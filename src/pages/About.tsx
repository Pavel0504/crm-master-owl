import { Mail, MessageCircle, Heart, Sparkles, CheckCircle, Coffee, ExternalLink } from 'lucide-react';
import { PageHeader } from '../components/ui';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8">
        <PageHeader
          icon={<Sparkles className="h-6 w-6 text-white" />}
          title="О программе Master Owl"
          subtitle="Ваш надежный помощник в рукоделии"
        />

        <div className="mt-8 space-y-8">
          <section>
            <div className="bg-gradient-to-r from-orange-50 to-rose-50 dark:from-burgundy-900/20 dark:to-burgundy-800/20 rounded-xl p-6 border border-orange-200 dark:border-burgundy-700">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-400 dark:from-burgundy-600 dark:to-burgundy-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Создано с любовью для мастеров
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Master Owl - это ваш личный помощник в управлении творческим бизнесом. 
                    Мы понимаем, как важно для мастера рукоделия сосредоточиться на творчестве, 
                    поэтому создали удобную систему, которая берет на себя всю рутину: 
                    учет материалов, расчет себестоимости, управление заказами и многое другое.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              Возможности программы
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                title="Учет материалов"
                description="Следите за остатками материалов, получайте уведомления о низких запасах и планируйте закупки заранее."
              />
              <FeatureCard
                title="Управление инвентарем"
                description="Контролируйте износ инструментов и оборудования, планируйте замену вовремя."
              />
              <FeatureCard
                title="Каталог изделий"
                description="Создавайте карточки готовых изделий с автоматическим расчетом себестоимости."
              />
              <FeatureCard
                title="База клиентов"
                description="Храните информацию о клиентах, отслеживайте историю заказов и сумму покупок."
              />
              <FeatureCard
                title="Управление заказами"
                description="Создавайте заказы, следите за сроками выполнения и рассчитывайте стоимость со скидками."
              />
              <FeatureCard
                title="Планировщик задач"
                description="Планируйте свои задачи с чек-листами, получайте напоминания о дедлайнах."
              />
              <FeatureCard
                title="Аналитика и статистика"
                description="Отслеживайте доходы, расходы и прибыль с помощью наглядных графиков."
              />
              <FeatureCard
                title="Экспорт данных"
                description="Выгружайте все данные в Excel для отчетности или анализа."
              />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Как начать работу
            </h2>
            <div className="space-y-6">
              <Step
                number={1}
                title="Настройте магазин"
                description="Перейдите в раздел 'Магазин' и заполните основную информацию: название, категорию товаров, контакты."
              />
              <Step
                number={2}
                title="Создайте категории"
                description="В разделе 'Категории' создайте категории для материалов, инвентаря, изделий и поставщиков. Это поможет организовать данные."
              />
              <Step
                number={3}
                title="Добавьте поставщиков"
                description="Зайдите в 'Поставщики' и добавьте информацию о ваших поставщиках: название, способ доставки, цену доставки."
              />
              <Step
                number={4}
                title="Внесите материалы"
                description="В разделе 'Материалы' добавьте все ваши материалы: название, цену, объем, единицу измерения. Система будет отслеживать остатки автоматически."
              />
              <Step
                number={5}
                title="Добавьте инвентарь"
                description="В 'Инвентарь' внесите все инструменты и оборудование. Выберите тип учета: по проценту износа или по количеству использований."
              />
              <Step
                number={6}
                title="Создайте изделия"
                description="В разделе 'Изделия' создавайте карточки готовых работ. Укажите, какие материалы используются, сколько часов затрачивается. Система сама рассчитает себестоимость!"
              />
              <Step
                number={7}
                title="Добавьте клиентов"
                description="В 'Клиенты' сохраняйте контакты ваших покупателей. Можно добавить телефон, соцсети, адрес, дату рождения."
              />
              <Step
                number={8}
                title="Оформляйте заказы"
                description="В разделе 'Заказы' создавайте заказы для клиентов. Выбирайте изделия, указывайте срок, применяйте скидки. Система автически рассчитает цену и уменьшит остатки."
              />
              <Step
                number={9}
                title="Планируйте задачи"
                description="Используйте 'Планировщик' для создания задач с дедлайнами и чек-листами. Получайте уведомления о приближающихся сроках."
              />
              <Step
                number={10}
                title="Анализируйте результаты"
                description="Заходите в 'Дашборд', чтобы видеть графики продаж, расходов и прибыли. Экспортируйте данные для детального анализа."
              />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Полезные советы
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-600 rounded-xl p-6 space-y-3">
              <TipItem text="Регулярно обновляйте остатки материалов после создания изделий - система делает это автоматически при оформлении заказа." />
              <TipItem text="Используйте метки (теги) для клиентов, чтобы быстро находить VIP-клиентов или постоянных покупателей." />
              <TipItem text="Включите уведомления, чтобы не пропустить низкие остатки материалов и приближающиеся дедлайны." />
              <TipItem text="Создавайте категории изделий с указанием энергозатрат и инвентаря - это упростит расчет себестоимости." />
              <TipItem text="Экспортируйте данные регулярно для резервного копирования и анализа в других программах." />
              <TipItem text="Используйте планировщик не только для заказов, но и для личных задач - это поможет организовать ваш день." />
            </div>
          </section>

          <section className="bg-gradient-to-r from-orange-50 to-rose-50 dark:from-burgundy-900/20 dark:to-burgundy-800/20 rounded-xl p-6 sm:p-8 border border-orange-200 dark:border-burgundy-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Связь с разработчиком
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
              Есть вопросы, предложения или нашли ошибку? Свяжитесь со мной любым удобным способом!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="https://t.me/code_engineer010"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-burgundy-600"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Telegram</p>
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    @code_engineer010
                  </p>
                </div>
              </a>

              <a
                href="mailto:zudinpavel99@gmail.com"
                className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-burgundy-600"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-400 dark:from-burgundy-600 dark:to-burgundy-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    zudinpavel99@gmail.com
                  </p>
                </div>
              </a>
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
              Буду рад помочь вам работать с программой и услышать ваши идеи по улучшению!
            </p>
          </section>

          <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-900/20 dark:via-burgundy-900/20 dark:to-rose-900/20 rounded-2xl border-2 border-orange-200 dark:border-burgundy-600">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-rose-400/20 dark:from-burgundy-500/20 dark:to-rose-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-amber-400/20 to-orange-400/20 dark:from-amber-500/20 dark:to-burgundy-500/20 rounded-full blur-3xl"></div>

            <div className="relative p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-rose-500 dark:from-burgundy-600 dark:to-burgundy-800 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
                  <Coffee className="h-8 w-8 text-white" />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Поддержать разработку
              </h2>

              <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
                Если Master Owl помогает вам в работе и вы хотите поддержать развитие проекта,
                буду очень благодарен за вашу помощь! Все средства идут на улучшение системы и добавление новых функций.
              </p>

              <a
                href="https://yoomoney.ru/fundraise/1FQ6TDHJVR4.260208"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-rose-500 dark:from-burgundy-600 dark:to-burgundy-700 hover:from-orange-600 hover:to-rose-600 dark:hover:from-burgundy-700 dark:hover:to-burgundy-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <Heart className="h-5 w-5 animate-pulse" />
                Поддержать проект
                <ExternalLink className="h-4 w-4" />
              </a>

              <p className="text-sm text-gray-600 dark:text-gray-400 mt-6">
                Спасибо за вашу поддержку! Вместе мы делаем Master Owl еще лучше.
              </p>
            </div>
          </section>

          <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">
              Master Owl CRM - создано с заботой о мастерах рукоделия
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Версия 1.0.0 • 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
}

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-orange-300 dark:hover:border-burgundy-600 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

interface StepProps {
  number: number;
  title: string;
  description: string;
}

function Step({ number, title, description }: StepProps) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-400 dark:from-burgundy-600 dark:to-burgundy-700 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">{number}</span>
        </div>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

interface TipItemProps {
  text: string;
}

function TipItem({ text }: TipItemProps) {
  return (
    <div className="flex gap-3">
      <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
      <p className="text-gray-700 dark:text-gray-300 text-sm">{text}</p>
    </div>
  );
}
