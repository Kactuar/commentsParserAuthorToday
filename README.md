# Описание скрипта

Данный скрипт на **Node.js** с использованием **Puppeteer** предназначен для автоматизированного сбора комментариев со страниц произведения на сайте [Author.today](https://author.today).

Скрипт выполняет следующие действия:

1. Открывает стартовую страницу произведения.
2. Извлекает комментарии со страницы, включая:
   - Имя автора комментария
   - Дату/время публикации комментария (по атрибуту `data-time`)
   - Текст комментария
3. Переходит по ссылкам пагинации на следующую страницу (если таковые имеются), пока не достигнет последней.
4. Собирает все комментарии в один массив.
5. Записывает итоговые комментарии в файл `comments.txt` в удобочитаемом виде.

## Требования

- Node.js (версия 14.x и выше)
- npm (обычно идет вместе с Node.js)

## Установка

1. Клонируйте репозиторий или скопируйте файл скрипта в желаемую директорию.
2. Установите необходимые зависимости с помощью команды (обратите внимание на отступы для оформления кода):
   
       npm install puppeteer

## Использование

1. В файле скрипта замените значение `const startUrl = 'https://author.today/work/324592';` на желаемую стартовую страницу с комментариями. По умолчанию скрипт настроен на конкретную работу с ID `324592`.
2. Запустите скрипт:
   
       node main.js

   Если ваш файл называется иначе, замените `main.js` на нужное имя файла.

3. Дождитесь завершения работы скрипта. В результате будет создан файл `comments.txt` в той же директории, где находится скрипт, содержащий все собранные комментарии.

## Настройки и параметры

- В скрипте установлено `headless: true`, что означает, что браузер будет запущен в фоновом режиме без графического интерфейса. При необходимости вы можете установить `headless: false`, чтобы видеть процессы браузера в реальном времени.
- Установлен увеличенный таймаут навигации `page.setDefaultNavigationTimeout(6000000)` для предотвращения прерывания длительной загрузки или масштабного сбора комментариев.
- Структура извлечения комментариев и селекторы могут быть изменены под другие сайты или типы данных. Если структура верстки на сайте будет отличаться, возможно, придется скорректировать CSS-селекторы.
- По умолчанию результат сохраняется в файл `comments.txt`. Если вы хотите изменить имя файла или формат сохранения, отредактируйте соответствующую часть кода (см. строки записи в файл в самом скрипте).

## Примечания

- При большом количестве комментариев сбор информации может занять продолжительное время.
- Убедитесь, что сайт, с которого вы собираете данные, разрешает подобные действия. Изучайте правила и политику использования.
- Если на сайте реализованы меры защиты от парсинга (капча, блокировки), скрипт может не сработать без дополнительных настроек или обходных методов.
