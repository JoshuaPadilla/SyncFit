export const formatTime = (date: Date | string) => {
	// If it's a string, convert it to a Date object
	if (typeof date === "string") {
		date = new Date(date);
	}

	// Defensive check: Ensure the date is valid before formatting
	if (isNaN(date.getTime())) {
		return "Invalid Date"; // Or return an empty string/null
	}

	return date.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
};
