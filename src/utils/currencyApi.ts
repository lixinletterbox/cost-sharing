export const fetchExchangeRate = async (baseCurrency: string, targetCurrency: string): Promise<number | null> => {
  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data && data.rates && data.rates[targetCurrency]) {
      return data.rates[targetCurrency];
    }
    return null;
  } catch (err) {
    console.error('Error fetching exchange rate:', err);
    return null;
  }
};
