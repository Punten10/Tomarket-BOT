const axios = require('axios');
const fs = require('fs');
const moment = require('moment');
const { createLogger, format, transports } = require('winston');
const chalk = require('chalk');

// Filter log khusus untuk mengecualikan pesan tertentu
const excludeMessagesFilter = format((info) => {
    const excludedMessages = [
        'Getting access token..',
    ];
    if (excludedMessages.some(message => info.message.includes(message))) {
        return false;
    }
    return info;
});

// Konfigurasi logger Winston
const logger = createLogger({
    level: 'info',
    format: format.combine(
        excludeMessagesFilter(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ level, message, timestamp }) => {
            if (message.includes('===== [ ') && message.endsWith(' ] =====')) {
                return message;
            } else if (message === '     ') {
                return message;
            }

            // Warnai log berdasarkan level log
            let formattedMessage = `${chalk.green(timestamp)} [${level.toUpperCase()}]: ${message}`;
            switch (level) {
                case 'info':
                    formattedMessage = chalk.gray(formattedMessage);
                    break;
                case 'eror':
                    formattedMessage = chalk.gray(formattedMessage);
                    break;
                default:
                    formattedMessage = chalk.white(formattedMessage);
                    break;
            }
            return formattedMessage;
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'combined.log' })
    ]
});

// Definisikan headers untuk permintaan menggunakan let (variable yang dapat berubah)
let headers = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en,en-US;q=0.9',
    'cache-control': 'no-cache',
    'content-type': 'application/json',
    'origin': 'https://mini-app.tomarket.ai',
    'pragma': 'no-cache',
    'priority': 'u=1, i',
    'referer': 'https://mini-app.tomarket.ai/',
    'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Android WebView";v="126"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': 'Android',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent': 'Mozilla/5.0 (Linux; Android 13; M2012K11AG Build/TKQ1.220829.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.6478.134 Mobile Safari/537.36',
    'x-requested-with': 'org.telegram.messenger.web'
};

// Mendapatkan token akses
async function getAccessToken(queryData) {
    const url = 'https://api-web.tomarket.ai/tomarket-game/v1/user/login';
    try {
        const response = await axios.post(url, {
            init_data: queryData,
            invite_code: ""
        }, { headers });
        return response.data;
    } catch (error) {
        logger.error(`Request Error: ${error.message}`);
        return null;
    }
}

// Mendapatkan saldo
async function getBalance(token) {
    const url = 'https://api-web.tomarket.ai/tomarket-game/v1/user/balance';
    headers['Authorization'] = token; // Perbarui headers di sini
    try {
        const response = await axios.post(url, {}, { headers });
        return response.data;
    } catch (error) {
        logger.error(`Request Error: ${error.message}`);
        return null;
    }
}

// Klaim hadiah harian
async function claimDaily(token) {
    const url = 'https://api-web.tomarket.ai/tomarket-game/v1/daily/claim';
    headers['Authorization'] = token; // Perbarui headers di sini
    const payload = { game_id: "fa873d13-d831-4d6f-8aee-9cff7a1d0db1" };
    try {
        const response = await axios.post(url, payload, { headers });
        return response.data;
    } catch (error) {
        logger.error(`Request Error: ${error.message}`);
        return null;
    }
}

// Mulai Farming
async function startFarming(token) {
    const url = 'https://api-web.tomarket.ai/tomarket-game/v1/farm/start';
    headers['Authorization'] = token; // Perbarui headers di sini
    const payload = { game_id: "53b22103-c7ff-413d-bc63-20f6fb806a07" };
    try {
        const response = await axios.post(url, payload, { headers });
        return response.data;
    } catch (error) {
        logger.error(`Request Error: ${error.message}`);
        return null;
    }
}

// Klaim hasil pertanian
async function claimFarming(token) {
    const url = 'https://api-web.tomarket.ai/tomarket-game/v1/farm/claim';
    headers['Authorization'] = token; // Perbarui headers di sini
    const payload = { game_id: "53b22103-c7ff-413d-bc63-20f6fb806a07" };
    try {
        const response = await axios.post(url, payload, { headers });
        return response.data;
    } catch (error) {
        logger.error(`Request Error: ${error.message}`);
        return null;
    }
}

// Mainkan game
async function playGame(token) {
    const url = 'https://api-web.tomarket.ai/tomarket-game/v1/game/play';
    headers['Authorization'] = token; // Perbarui headers di sini
    const payload = { game_id: "59bcd12e-04e2-404c-a172-311a0084587d" };
    try {
        const response = await axios.post(url, payload, { headers });
        return response.data;
    } catch (error) {
        logger.error(`Request Error: ${error.message}`);
        return null;
    }
}

// Klaim poin game
async function claimGame(token, points) {
    const url = 'https://api-web.tomarket.ai/tomarket-game/v1/game/claim';
    headers['Authorization'] = token; // Perbarui headers di sini
    const payload = { game_id: "59bcd12e-04e2-404c-a172-311a0084587d", points };
    try {
        const response = await axios.post(url, payload, { headers });
        return response.data;
    } catch (error) {
        logger.error(`Request Error: ${error.message}`);
        return null;
    }
}

// Fungsi utama
async function main() {
    while (true) {
        try {
            const queries = fs.readFileSync('query.txt', 'utf-8').split('\n').filter(Boolean);
            for (const queryLine of queries) {
                const queryDataArray = queryLine.split(',').map(query => query.trim());
                for (const queryData of queryDataArray) {
                    const authResponse = await getAccessToken(queryData);
                    if (authResponse) {
                        const token = authResponse.data.access_token;
                        const firstname = authResponse.data.fn;
                        const lastname = authResponse.data.ln;
                        logger.info(`===== [ ${firstname} ${lastname} ] =====`);

                        logger.info(chalk.yellow('Mendapatkan Data Pengguna..'));
                        const balanceResponse = await getBalance(token);
                        if (balanceResponse) {
                            const balance = parseInt(balanceResponse.data.available_balance);
                            let tiket = balanceResponse.data.play_passes;
                            logger.info(chalk.yellow(`Saldo : ${balance}`));
                            logger.info(chalk.yellow(`Tiket : ${tiket}`));

                            logger.info(chalk.yellow('Mencoba Mengclaim Daily Reward..'));
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            const dailyResponse = await claimDaily(token);
                            if (dailyResponse) {
                                const day = dailyResponse.data.check_counter;
                                const point = dailyResponse.data.today_points;
                                logger.info(chalk.yellow(`Daily Reward Diclaim, Hari Ke ${day} Amount : ${point} Poin`));
                            } else {
                                logger.error(chalk.red('Gagal Claim Daily Reward..'));
                            }

                            logger.info(chalk.yellow('Memeriksa Farming..'));
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            const farmingResponse = await startFarming(token);
                            if (farmingResponse) {
                                const endTime = moment.unix(farmingResponse.data.end_at);
                                const remainingTime = moment.duration(endTime.diff(moment()));
                                const hours = remainingTime.hours();
                                const minutes = remainingTime.minutes();
                                logger.info(chalk.yellow(`Farming Dimulai. Claim dalam: ${hours} jam ${minutes} menit`));

                                if (moment().isAfter(endTime)) {
                                    logger.info(chalk.yellow('Mencoba Mengclaim Farming..'));
                                    const claimResponse = await claimFarming(token);
                                    if (claimResponse) {
                                        const points = claimResponse.data.claim_this_time;
                                        logger.info(chalk.yellow(`Berhasil Mengclaim Hasil Farming! Total: ${points}`));
                                    } else {
                                        logger.error(chalk.red('Gagal Mengclaim hasil Farming'));
                                    }
                                }
                            } else {
                                logger.error(chalk.red('Gagal memulai Farming'));
                            }

                            while (tiket > 0) {
                                logger.info(chalk.yellow('Memulai Game..'));
                                const playResponse = await playGame(token);
                                if (!playResponse) {
                                    logger.error(chalk.red('Gagal memulai game!'));
                                } else {
                                    logger.info(chalk.greenBright('Game Dimulai!'));
                                    for (let i = 0; i < 30; i++) {
                                        await new Promise(resolve => setTimeout(resolve, 1000));
                                    }
                                    logger.info(chalk.cyanBright('Game Telah Selesai! Mengclaim..'));
                                    const points = Math.floor(Math.random() * (600 - 400 + 1)) + 400;
                                    const claimResponse = await claimGame(token, points);
                                    if (claimResponse) {
                                        logger.info(chalk.greenBright(`Game Telah Berhasil. Mendapatkan ${points} Poin`));
                                    } else {
                                        logger.error(chalk.red('Gagal mengklaim poin game'));
                                    }
                                    tiket -= 1;
                                }
                            }
                        } else {
                            logger.error(chalk.red('Gagal mendapatkan saldo'));
                        }
                    } else {
                        logger.error(chalk.red('Login Gagal'));
                    }
                    logger.info('     ');
                }
            }
            logger.info(chalk.yellow('SEMUA AKUN TELAH DIPROSES'));
            await countdownSleep(1800);
        } catch (error) {
            logger.error(chalk.red(`Terjadi kesalahan: ${error.message}`));
        }
    }
}

// Fungsi utilitas untuk tidur dengan tampilan hitungan mundur
async function countdownSleep(seconds) {
    for (let i = seconds; i > 0; i--) {
        const minutes = Math.floor(i / 60);
        const remainingSeconds = i % 60;
        process.stdout.write(chalk.blueBright(`Menunggu ${minutes} menit ${remainingSeconds} detik sebelum menjalankan tugas berikutnya... \r`));
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    process.stdout.write(' '.repeat(process.stdout.columns) + '\r');
}

// Mulai fungsi utama
main();