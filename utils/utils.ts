import { config } from "dotenv";
config();

export async function getData(url : string) {
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    return res.json();
}

export async function getNews(ticker: string, limit: number = 10) {
    ticker = ticker.toUpperCase()
    
    let tick = await getData(`https://api.polygon.io/v2/reference/news?ticker=${ticker}&limit=${limit}&sort=published_utc&apiKey=${process.env.API_KEY}`)
    if (tick.status != 'OK') {
        return 404
    } else {
        console.log(tick)
        return tick.results
    }
}