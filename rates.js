(() => {
  const section = document.getElementById('rates');
  const status = document.getElementById('rates-status');
  const fields = {
    gold24: document.getElementById('rate-gold-24k'),
    gold22: document.getElementById('rate-gold-22k'),
    silverKg: document.getElementById('rate-silver-kg'),
    silver10: document.getElementById('rate-silver-10g')
  };
  const formatPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 2
  });
  const formatTime = date => new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata'
  }).format(date) + ' IST';
  let lastUpdate = null;

  async function getJson(url, signal) {
    const response = await fetch(url, { signal, cache: 'no-cache' });
    if (!response.ok) throw new Error('Rate request failed');
    return response.json();
  }

  async function updateRates() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const [gold, silver, exchange] = await Promise.all([
        getJson('https://api.gold-api.com/price/XAU', controller.signal),
        getJson('https://api.gold-api.com/price/XAG', controller.signal),
        getJson('https://open.er-api.com/v6/latest/USD', controller.signal)
      ]);
      const goldTime = Date.parse(gold.updatedAt);
      const silverTime = Date.parse(silver.updatedAt);
      const fxTime = exchange.time_last_update_unix * 1000;
      const inr = exchange.rates?.INR;
      if (gold.symbol !== 'XAU' || silver.symbol !== 'XAG' || gold.currency !== 'USD' || silver.currency !== 'USD' || exchange.result !== 'success' || exchange.base_code !== 'USD' ||
          ![gold.price, silver.price, inr, goldTime, silverTime, fxTime].every(value => Number.isFinite(value) && value > 0)) {
        throw new Error('Invalid rate data');
      }
      // The metal feed quotes USD per troy ounce (31.1034768 grams).
      const goldPerGram = gold.price * inr / 31.1034768;
      const silverPerGram = silver.price * inr / 31.1034768;
      fields.gold24.textContent = formatPrice.format(goldPerGram * 10);
      fields.gold22.textContent = formatPrice.format(goldPerGram * 10 * 22 / 24);
      fields.silverKg.textContent = formatPrice.format(silverPerGram * 1000);
      fields.silver10.textContent = formatPrice.format(silverPerGram * 10);
      lastUpdate = `Gold: ${formatTime(goldTime)} · Silver: ${formatTime(silverTime)} · USD/INR: ${formatTime(fxTime)}`;
      status.textContent = lastUpdate;
      section.dataset.state = 'ready';
    } catch (error) {
      controller.abort();
      section.dataset.state = 'error';
      status.textContent = lastUpdate
        ? `Unable to refresh. Last available rates — ${lastUpdate}`
        : 'Rates are currently unavailable. Retrying shortly.';
    } finally {
      clearTimeout(timeout);
      setTimeout(updateRates, 60000);
    }
  }

  updateRates();
})();
