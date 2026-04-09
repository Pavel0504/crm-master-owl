import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          На главную
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-10 space-y-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Политика конфиденциальности
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Дата вступления в силу: 1 января 2025 г.
          </p>

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Настоящая Политика конфиденциальности (далее — «Политика») разработана в соответствии
            с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных» и определяет
            порядок обработки и защиты персональных данных пользователей сервиса Master Owl.
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">1. Оператор персональных данных</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              1.1. Оператором персональных данных является Администрация сервиса Master Owl
              (далее — «Оператор»).
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              1.2. Связаться с Оператором можно через Telegram:{' '}
              <a
                href="https://t.me/code_engineer010"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline"
              >
                @code_engineer010
              </a>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. Собираемые данные</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              2.1. При использовании Сервиса Оператор может обрабатывать следующие персональные данные:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
              <li>Адрес электронной почты (при регистрации);</li>
              <li>Пароль в зашифрованном виде;</li>
              <li>Данные, добавленные Пользователем в Сервис (информация о клиентах, заказах,
                материалах, поставщиках и т.д.);</li>
              <li>Техническая информация: IP-адрес, тип браузера, время доступа, файлы cookie.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. Цели обработки персональных данных</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              3.1. Персональные данные обрабатываются в следующих целях (ст. 5 152-ФЗ):
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
              <li>Предоставление доступа к функциональности Сервиса;</li>
              <li>Идентификация и аутентификация Пользователя;</li>
              <li>Обеспечение работы CRM-системы и хранение бизнес-данных Пользователя;</li>
              <li>Техническая поддержка и связь с Пользователем;</li>
              <li>Улучшение качества Сервиса и анализ его использования;</li>
              <li>Выполнение требований законодательства Российской Федерации.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">4. Правовые основания обработки</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              4.1. Обработка персональных данных осуществляется на следующих правовых основаниях
              (ст. 6 152-ФЗ):
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
              <li>Согласие субъекта персональных данных — регистрация в Сервисе рассматривается
                как согласие на обработку данных в объёме, указанном в настоящей Политике;</li>
              <li>Исполнение договора (Условий использования), стороной которого является
                Пользователь;</li>
              <li>Исполнение обязанностей, возложенных на Оператора законодательством РФ.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">5. Порядок обработки и хранения данных</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              5.1. Персональные данные обрабатываются автоматизированным способом с использованием
              средств вычислительной техники.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              5.2. Данные хранятся на серверах с использованием платформы Supabase,
              обеспечивающей шифрование данных при передаче (TLS) и хранении.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              5.3. Пароли хранятся исключительно в хешированном виде и не могут быть восстановлены
              в исходной форме.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              5.4. Оператор применяет организационные и технические меры для защиты персональных
              данных от неправомерного доступа, уничтожения, изменения, блокирования, копирования,
              распространения, а также от иных неправомерных действий третьих лиц (ст. 19 152-ФЗ).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">6. Права субъекта персональных данных</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              6.1. В соответствии со статьями 14–17 Федерального закона № 152-ФЗ, Пользователь имеет право:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
              <li>Получать информацию об обработке своих персональных данных;</li>
              <li>Требовать уточнения, блокирования или уничтожения персональных данных, если они
                являются неполными, устаревшими, неточными или незаконно полученными;</li>
              <li>Отозвать согласие на обработку персональных данных, направив соответствующее
                уведомление Оператору;</li>
              <li>Обжаловать действия или бездействие Оператора в уполномоченный орган по защите
                прав субъектов персональных данных (Роскомнадзор) или в судебном порядке;</li>
              <li>Требовать удаления своей учётной записи и всех связанных данных.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">7. Использование файлов cookie</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              7.1. Сервис использует файлы cookie и технологии локального хранилища браузера для:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
              <li>Поддержания сессии аутентификации Пользователя;</li>
              <li>Сохранения пользовательских настроек (тема оформления и др.);</li>
              <li>Обеспечения корректной работы Сервиса.</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              7.2. Пользователь может управлять файлами cookie через настройки своего браузера.
              Отключение cookie может привести к ограничению функциональности Сервиса.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">8. Передача данных третьим лицам</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              8.1. Оператор не продаёт, не передаёт и не раскрывает персональные данные
              Пользователей третьим лицам, за исключением случаев:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
              <li>Получения явного согласия Пользователя;</li>
              <li>Требования в соответствии с законодательством Российской Федерации
                (по запросу уполномоченных государственных органов);</li>
              <li>Использования сторонних сервисов для обеспечения работы Сервиса (хостинг,
                аутентификация), при условии обеспечения ими надлежащего уровня защиты данных.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">9. Сроки обработки данных</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              9.1. Персональные данные обрабатываются до момента удаления учётной записи
              Пользователем или до отзыва согласия на обработку.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              9.2. При удалении учётной записи все персональные данные Пользователя уничтожаются
              в срок, не превышающий 30 (тридцать) рабочих дней, за исключением данных, хранение
              которых предусмотрено законодательством РФ.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">10. Изменения в Политике</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              10.1. Оператор оставляет за собой право вносить изменения в настоящую Политику.
              Актуальная версия Политики размещается на данной странице с указанием даты последнего обновления.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              10.2. Продолжение использования Сервиса после внесения изменений означает согласие
              Пользователя с обновлённой Политикой.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">11. Контактная информация</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              11.1. Для реализации прав субъекта персональных данных, а также по любым вопросам,
              связанным с обработкой персональных данных, Пользователь может обратиться к Оператору
              через Telegram:{' '}
              <a
                href="https://t.me/code_engineer010"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline"
              >
                @code_engineer010
              </a>
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              11.2. Уполномоченный орган по защите прав субъектов персональных данных —
              Федеральная служба по надзору в сфере связи, информационных технологий и массовых
              коммуникаций (Роскомнадзор):{' '}
              <a
                href="https://rkn.gov.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline"
              >
                rkn.gov.ru
              </a>
            </p>
          </section>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Также ознакомьтесь с нашими{' '}
              <Link to="/terms" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline">
                Условиями использования
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
