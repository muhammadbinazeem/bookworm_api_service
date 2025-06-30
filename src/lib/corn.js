import { CronJob } from 'cron';
import http from 'http';
import https from 'https';
import { URL } from 'url';

const job = new CronJob("0 0 * * *", function () {
    try {
        const url = new URL(process.env.API_URL);
        url.pathname = "/health";
        const lib = url.protocol === 'https:' ? https : http;

        lib.get(url, (res) => {
            if (res.statusCode === 200) {
                console.log("GET request sent successfully");
            } else {
                console.log("health check failed", res.statusCode);
            }
        }).on("error", (e) => {
            console.log("Error while sending request", e);
        });

    } catch (err) {
        console.error("Invalid URL or error in request setup:", err);
    }
});

export default job;