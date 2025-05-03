import { useState, useEffect } from 'react';

/**
 * Hook pour créer une valeur 'debounced' qui ne change qu'après un délai
 * Utile pour les recherches pour ne pas déclencher une requête à chaque frappe
 * 
 * @param value - La valeur à debouncer
 * @param delay - Le délai en millisecondes
 * @returns La valeur debounced
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Configurer un timeout après lequel la valeur sera mise à jour
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Nettoyer le timeout si la valeur change ou si le composant est démonté
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Ne re-exécuter l'effet que si value ou delay change

    return debouncedValue;
}