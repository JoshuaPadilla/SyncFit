export const getRemainingDays = (
	expirationDate?: Date | string | null,
): number => {
	if (!expirationDate) return 0;
	const diff = new Date(expirationDate).getTime() - new Date().getTime();
	return Math.ceil(diff / (1000 * 3600 * 24));
};
