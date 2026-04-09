import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
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
            Условия использования сервиса Master Owl
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Дата вступления в силу: 1 января 2025 г.
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">1. Общие положения</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              1.1. Настоящие Условия использования (далее — «Условия») регулируют отношения между
              администрацией веб-сервиса Master Owl (далее — «Сервис», «Администрация») и
              физическим или юридическим лицом (далее — «Пользователь»), использующим Сервис.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              1.2. Использование Сервиса означает полное и безоговорочное принятие Пользователем
              настоящих Условий в соответствии со статьёй 438 Гражданского кодекса Российской Федерации
              (акцепт оферты).
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              1.3. Администрация оставляет за собой право вносить изменения в настоящие Условия.
              Продолжение использования Сервиса после внесения изменений означает согласие
              с новой редакцией Условий.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. Предмет соглашения</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              2.1. Сервис Master Owl представляет собой CRM-систему для мастеров ручной работы и
              творческих предпринимателей, предоставляющую инструменты для учёта материалов,
              инвентаря, изделий, заказов, клиентов и иных бизнес-процессов.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              2.2. Сервис предоставляется на условиях «как есть» (as is). Администрация не гарантирует,
              что Сервис будет соответствовать всем требованиям Пользователя.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. Регистрация и учётная запись</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              3.1. Для использования Сервиса Пользователь обязан пройти процедуру регистрации,
              указав достоверные данные (адрес электронной почты и пароль).
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              3.2. Пользователь несёт ответственность за сохранность своих учётных данных и за все
              действия, совершённые под его учётной записью.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              3.3. Пользователь обязуется незамедлительно уведомить Администрацию о любом
              несанкционированном доступе к своей учётной записи.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">4. Права и обязанности сторон</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              4.1. Пользователь обязуется:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
              <li>Не использовать Сервис в целях, противоречащих законодательству Российской Федерации;</li>
              <li>Не предпринимать действий, направленных на нарушение работы Сервиса;</li>
              <li>Не пытаться получить несанкционированный доступ к данным других пользователей;</li>
              <li>Не распространять вредоносное программное обеспечение через Сервис;</li>
              <li>Соблюдать права интеллектуальной собственности Администрации и третьих лиц.</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              4.2. Администрация обязуется:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
              <li>Обеспечивать работоспособность Сервиса в пределах технических возможностей;</li>
              <li>Обеспечивать защиту персональных данных Пользователя в соответствии с Федеральным
                законом от 27.07.2006 № 152-ФЗ «О персональных данных»;</li>
              <li>Уведомлять Пользователей об изменениях в Условиях использования.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">5. Интеллектуальная собственность</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              5.1. Исключительные права на Сервис, включая его дизайн, программный код, логотипы и
              товарные знаки, принадлежат Администрации и охраняются законодательством Российской
              Федерации об интеллектуальной собственности (часть четвёртая Гражданского кодекса РФ).
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              5.2. Данные, внесённые Пользователем в Сервис (информация о материалах, изделиях,
              клиентах и т.д.), являются собственностью Пользователя.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">6. Ограничение ответственности</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              6.1. Администрация не несёт ответственности за:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
              <li>Убытки, понесённые Пользователем вследствие использования или невозможности
                использования Сервиса;</li>
              <li>Утрату данных Пользователя вследствие действий третьих лиц;</li>
              <li>Кратковременные перебои в работе Сервиса, связанные с техническим обслуживанием;</li>
              <li>Действия третьих лиц, нарушающие права Пользователя.</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              6.2. Совокупная ответственность Администрации перед Пользователем по любым основаниям
              ограничивается суммой, фактически уплаченной Пользователем за использование Сервиса.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">7. Блокировка и удаление учётной записи</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              7.1. Администрация вправе заблокировать или удалить учётную запись Пользователя
              в случае нарушения настоящих Условий.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              7.2. Пользователь вправе в любое время удалить свою учётную запись, обратившись
              в службу поддержки. При удалении учётной записи данные Пользователя удаляются
              безвозвратно.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">8. Порядок разрешения споров</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              8.1. Все споры и разногласия, возникающие между сторонами, разрешаются путём переговоров.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              8.2. В случае невозможности урегулирования спора путём переговоров, спор подлежит
              рассмотрению в суде по месту нахождения Администрации в соответствии с действующим
              законодательством Российской Федерации.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">9. Применимое право</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              9.1. Настоящие Условия регулируются и толкуются в соответствии с законодательством
              Российской Федерации, включая, но не ограничиваясь: Гражданский кодекс РФ,
              Федеральный закон от 27.07.2006 № 149-ФЗ «Об информации, информационных технологиях
              и о защите информации», Закон РФ от 07.02.1992 № 2300-1 «О защите прав потребителей».
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">10. Контактная информация</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              10.1. По всем вопросам, связанным с использованием Сервиса, Пользователь может
              обратиться в службу поддержки через Telegram:{' '}
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

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Также ознакомьтесь с нашей{' '}
              <Link to="/privacy" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline">
                Политикой конфиденциальности
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
