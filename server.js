import express from 'express';
import cors from 'cors';
import chalk from 'chalk';
import unirest from 'unirest';
import cheerio from 'cheerio';

console.log(chalk.blue('Program start'));

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.get('/api/employes', async (req, res) => {
    try {
        const hhURL = req.query.urlHH;
        console.log("api get called with string:", hhURL);
        res.send(await getData(hhURL));
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});


export const LAUNCH_PUPPETEER_OPTS = {
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
    ],
};

export const PAGE_PUPPETEER_OPTS = {
    networkIdle2Timeout: 5000,
    waitUntil: 'networkidle2',
    timeout: 3000000,
};


async function getData(str) {
    try {
        console.log(chalk.blue('getData started'));
        const response = await unirest.get(str);
        const $ = cheerio.load(response.body);
        const employes = [];
        $('span.title--iPxTj4waPRTG9LgoOG4t > a').each((i, innerA) => {
            const vacancy_url = `https://hh.ru/` + $(innerA).attr('href');
            const job_name = $(innerA).find('span').text();
            employes.push({ // тут содержатся ссылки на все должности
                vacancy_url,
                job_name,
            });
        });

        let saveData = await parseProfile(employes);
        console.log(chalk.yellowBright('getData ended'));
        return saveData;
    }
    catch (e) {
        throw e;
    }
}

async function parseProfile(data) {
    try {
        console.log(chalk.blue('parseProfile started'));
        let allData = [];
        for (const it of data) {
            //console.log(chalk.redBright(`Parsing url: `) + chalk.blue.bold(it.vacancy_url));
            const $ = await getBody(it.vacancy_url);
            // НАЗВАНИЕ(у меня уже есть) console.log($('.resume-block-position > .resume-block__title-text-wrapper > .bloko-header-2').text());
            const ageElement = $('.resume-header-title > p > span:nth-of-type(2)');
            const age = ageElement ? ageElement.text() : null;
            const salaryElement = $('.resume-block__salary');
            const salary = salaryElement ? parseInt(salaryElement.text().split('₽')[0].replace(/\D/g, '')) : null;
            const genderElement = $('.resume-header-title > p > span:nth-of-type(1)');
            const gender = genderElement ? (genderElement.text() === 'Male' ? 'Мужчина' : genderElement.text()) : null;
            const skillArray = [];
            const cityElement = $('.bloko-translate-guard > p > span:nth-of-type(1)');
            const city = cityElement ? cityElement.text() : null;
            let experience = ``;
            $('.resume-block-container > .bloko-tag-list > .bloko-tag.bloko-tag_inline').each((i, skill) => {
                if (i <= 8) {
                    skillArray.push($(skill).text());
                }
            });
            $('.resume-block__title-text.resume-block__title-text_sub').each((i, element) => {
                if (i === 0) {
                    experience = $(element).text();
                }
            });
            allData.push({
                ...it,
                age,
                salary,
                gender,
                city,
                experience,
                skillArray,
            });
        }
        return allData;
    } catch (error) {
        throw error;
    }
}

async function getBody(siteUrl) {
    // try {
    //     const browser = await puppeteer.launch();
    //     const page = await browser.newPage();
    //     await page.goto(siteUrl);
    //     const content = await page.content();
    //     browser.close();
    //     const $ = cheerio.load(content);
    //     console.log($);
    //     return $;
    // } catch (error) {
    //     throw error;
    // }
    try {
        console.log(chalk.blue('getBody started'));
        const response = await unirest.get(siteUrl);
        const $ = cheerio.load(response.body);
        return $;
    } catch (error) {
        throw error
    }
}