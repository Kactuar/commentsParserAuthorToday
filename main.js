const puppeteer = require('puppeteer');
const fs = require('fs').promises;

(async () => {
    // Начальный URL или локальный файл:
    const startUrl = 'https://author.today/work/324592';

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(6000000); // увеличен таймаут, т.к. несколько тысяч комментариев долго сохранять

    let currentUrl = startUrl;
    let allComments = [];

    while (currentUrl) {
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
                    text: commentText
                };
            });
        });

        allComments = allComments.concat(comments);

        // Поиск ссылки на следующую страницу
        let nextLink = await page.$eval('.pagination .next a[rel="next"]', el => el.href).catch(() => null);

        if (!nextLink || nextLink === currentUrl) {
            currentUrl = null;
        } else {
            currentUrl = nextLink;
        }
    }

    console.log(`Всего комментариев: ${allComments.length}`);

    // Формируем текст для записи: каждый комментарий с разделением
    let fileContent = '';
    allComments.forEach((c, i) => {
        fileContent += `Комментарий #${i+1}\n`;
        fileContent += `Автор: ${c.userName}\n`;
        fileContent += `Дата: ${c.time}\n`;
        fileContent += `Текст:\n${c.text}\n`;
        fileContent += '------------------------------------\n\n';
    });

    // Записываем в файл
    await fs.writeFile('comments.txt', fileContent, 'utf8');
    console.log('Комментарии успешно сохранены в файл comments.txt');

    await browser.close();
})();
