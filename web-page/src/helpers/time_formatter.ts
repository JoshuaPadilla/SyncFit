export const formatTime = (date: Date | string): string => {
	const dateObj = typeof date === "string" ? new Date(date) : date;

	if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
		return "Invalid Date";
	}

	return dateObj.toLocaleTimeString("en-PH", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
		// Set this to 'UTC' to stop the +8 hour shift
		timeZone: "UTC",
	});
};
