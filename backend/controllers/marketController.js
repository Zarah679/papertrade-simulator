// server.js makes the shared prices object available on app.locals.
import 'dotenv/config'

const base_url = process.env.COINGECKO_BASE_URL
const api_key = process.env.COINGECKO_API_KEY

// access the prices through the app.locals and send it as a response to frontend as an array
export function getMarkets(req, res) {
  const prices = req.app.locals.prices;
  res.json({ assets: Object.values(prices) });
}

export async function getMarketData(req, res) {
  try {
    const response = await fetch(
      `${base_url}/coins/markets` +
        "?vs_currency=usd&ids=bitcoin,ethereum,solana" +
        "&price_change_percentage=7d",
      {
        headers: {
          "x-cg-demo-api-key": api_key,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Coingecko returned: ${response.status}`);
    }

    const coins = await response.json();

    console.log(coins);

    //choose the fields the frontend needs
    const assets = coins.map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      image: coin.image,
      marketCapUsd: coin.market_cap,
      volume24hUsd: coin.total_volume,
      change7dPercent: coin.price_change_percentage_7d_in_currency,
    }));

    res.json({assets})
  } catch (error) {
    console.error("Market data request failed:", error.message);

    res.status(502).json({
      message: "Unable to load market data",
    });
  }
}
