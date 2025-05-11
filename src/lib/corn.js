import corn from 'corn';
import https from 'https';

const job = new corn.CornJob("*/14 * * * *", function() {
    https
        .get(process.env.API_URL, (res) => {
            if (res.statusCode === 200) console.log("GET request send successfully");
            else console.log("GET request failed", res.statusCode)
        })
        .on("error", (e) => console.log("Error while sending request", e));
});

export default job;