const puppeteer = require('puppeteer');
const fs = require('fs').promises;

(async () => {
    // URL или локальный файл начальной страницы
    const startUrl = 'https://author.today/work/324592?page=1'; // Начальная страница

    // Формируем уникальное имя файла на основе startUrl
    const urlIdentifier = encodeURIComponent(startUrl).replace(/%/g, '_'); // Преобразуем URL в безопасную строку
    const outputFile = `comments_${urlIdentifier}.txt`; // Уникальное имя файла

    console.log(`Комментарии будут сохранены в файл: ${outputFile}`);

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(6000000); // Увеличен таймаут

    let currentUrl = startUrl;
    let pageIndex = 0;

    // Удаляем старый файл перед записью
    try {
        await fs.unlink(outputFile);
    } catch (err) {
        // Файл может не существовать, это нормально
    }

    while (currentUrl) {
        pageIndex++;
        console.log(`Обрабатывается страница: ${pageIndex}, URL: ${currentUrl}`);

        try {
            await page.goto(currentUrl, {
                waitUntil: 'networkidle0',
            });

            // Извлекаем комментарии
            const comments = await page.$$eval('.comment.c-view', nodes => {
                return nodes.map(node => {
                    const userEl = node.querySelector('.comment-user-name');
                    const userName = userEl ? userEl.innerText.trim() : '';

                    const timeEl = node.querySelector('time span[data-time]');
                    const timeText = timeEl ? timeEl.getAttribute('data-time') : '';

                    const textContainer = node.querySelector('article .rich-content');
                    let commentText = '';
                    if (textContainer) {
                        const paragraphs = textContainer.querySelectorAll('p');
                        commentText = Array.from(paragraphs).map(p => p.innerText.trim()).join('\n');
                    }

                    return {
                        userName,
                        time: timeText,
                        text: commentText,
                    };
                });
            });

            console.log(`Комментариев на странице: ${comments.length}`);

            // Формируем текст для записи
            let fileContent = '';
            comments.forEach((c, i) => {
                fileContent += `Комментарий #${(pageIndex - 1) * 100 + i + 1}\n`; // Нумерация глобальная
                fileContent += `Автор: ${c.userName}\n`;
                fileContent += `Дата: ${c.time}\n`;
                fileContent += `Текст:\n${c.text}\n`;
                fileContent += '------------------------------------\n\n';
            });

            // Постраничная запись в файл
            await fs.appendFile(outputFile, fileContent, 'utf8');
            console.log(`Комментарии страницы ${pageIndex} успешно добавлены в файл.`);

            // Поиск ссылки на следующую страницу
            let nextLink = await page.$eval('.pagination .next a[rel="next"]', el => el.href).catch(() => null);

            if (!nextLink || nextLink === currentUrl) {
                currentUrl = null;
            } else {
                currentUrl = nextLink;
            }
        } catch (error) {
            console.error(`Ошибка при обработке страницы ${pageIndex}:`, error.message);
            currentUrl = null; // Прекращаем обработку при ошибке
        }
    }

    console.log('Обработка завершена.');
    await browser.close();
})();
