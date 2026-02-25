export const formatCurrency = (amount: any): string => {
	// 1. Convert whatever we got into a real number (or NaN)
	const numericAmount = Number(amount);

	// 2. Check if the conversion failed or if it's null/undefined
	if (amount === undefined || amount === null || isNaN(numericAmount)) {
		return "0.00";
	}

	// 3. Now it's safe to use toFixed
	return numericAmount.toFixed(2);
};
