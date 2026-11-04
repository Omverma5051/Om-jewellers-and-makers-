(() => {
  const section = document.getElementById('rates');
  const status = document.getElementById('rates-status');
  const fields = ['rate-gold-24k', 'rate-gold-22k', 'rate-silver-kg', 'rate-silver-10g'].map(id => document.getElementById(id));
  const priceFormat = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
  const timeFormat = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Asia/Kolkata' });
  let exchange = null;
  let exchangeFetchedAt = 0;
  let lastUpdate = '';

  async function getJson(url, signal) {
    const response = await fetch(url, { signal, cache: 'no-cache' });
    if (!response.ok) throw new Error('Rate request failed');
    return response.json();
  }
  const validNumber = value => Number.isFinite(value) && value > 0;
  const time = value => `${timeFormat.format(value)} IST`;

  async function updateRates() {
    if (document.hidden) { setTimeout(updateRates, 1000); return; }
    const startedAt = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const fxRequest = !exchange || Date.now() - exchangeFetchedAt >= 3600000
        ? getJson('https://open.er-api.com/v6/latest/USD', controller.signal)
        : Promise.resolve(exchange);
      const [gold, silver, fx] = await Promise.all([
        getJson('https://api.gold-api.com/price/XAU', controller.signal),
        getJson('https://api.gold-api.com/price/XAG', controller.signal), fxRequest
      ]);
      const goldTime = Date.parse(gold.updatedAt), silverTime = Date.parse(silver.updatedAt);
      const fxTime = fx.time_last_update_unix * 1000, inr = fx.rates?.INR;
      if (gold.symbol !== 'XAU' || silver.symbol !== 'XAG' || gold.currency !== 'USD' || silver.currency !== 'USD' || fx.result !== 'success' || fx.base_code !== 'USD' || ![gold.price, silver.price, inr, goldTime, silverTime, fxTime].every(validNumber)) throw new Error('Invalid rate data');
      if (fx !== exchange) { exchange = fx; exchangeFetchedAt = Date.now(); }
      // USD spot prices per troy ounce are estimates, converted to INR and include 3% GST.
      const goldGram = gold.price * inr / 31.1034768 * 1.03;
      const silverGram = silver.price * inr / 31.1034768 * 1.03;
      [goldGram * 10, goldGram * 10 * 22 / 24, silverGram * 1000, silverGram * 10].forEach((value, index) => { fields[index].textContent = priceFormat.format(value); });
      lastUpdate = `Gold: ${time(goldTime)} · Silver: ${time(silverTime)} · USD/INR: ${time(fxTime)}`;
      status.textContent = lastUpdate;
      section.dataset.state = 'ready';
    } catch (error) {
      controller.abort();
      section.dataset.state = 'error';
      status.textContent = lastUpdate ? `Unable to refresh. Last available rates — ${lastUpdate}` : 'Rates are currently unavailable. Retrying shortly.';
    } finally {
      clearTimeout(timeout);
      setTimeout(updateRates, Math.max(0, 1000 - (Date.now() - startedAt)));
    }
  }
  updateRates();
})();
