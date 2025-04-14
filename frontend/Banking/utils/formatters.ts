
/**
 * Formate un montant en format monétaire selon la devise
 * @param amount Montant à formater
 * @param currency Code de la devise (USD, EUR, etc.)
 * @returns Chaîne formatée avec symbole de devise
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    try {
      const formatter = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      
      return formatter.format(amount);
    } catch (error) {
      const currencySymbol = getCurrencySymbol(currency);
      return `${currencySymbol}${amount.toFixed(2)}`;
    }
  };
  
  /**
   * Obtient le symbole de devise correspondant au code de devise
   * @param currencyCode Code de la devise (USD, EUR, etc.)
   * @returns Symbole de la devise
   */
  export const getCurrencySymbol = (currencyCode: string): string => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CNY: '¥',
      INR: '₹',
      RUB: '₽',
      BRL: 'R$',
      XOF: 'CFA',
      ZAR: 'R',
      // Ajoutez d'autres devises selon vos besoins
    };
    
    return symbols[currencyCode] || currencyCode;
  };
  
  /**
   * Formate une date au format local
   * @param dateString Chaîne de date ISO ou objet Date
   * @param options Options de formatage
   * @returns Date formatée
   */
  export const formatDate = (
    dateString: string | Date,
    options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
  ): string => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return new Intl.DateTimeFormat(undefined, options).format(date);
    } catch (error) {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return date.toLocaleDateString();
    }
  };