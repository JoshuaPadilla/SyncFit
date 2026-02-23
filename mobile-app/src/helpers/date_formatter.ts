export function dateFormatter(date?: Date | null | string) {
	// 1. Handle null, undefined, or empty values immediately
	if (!date) return "";

	let converted: Date;

	// 2. Correct the type check: check if the variable 'date' is a string
	if (typeof date === "string") {
		converted = new Date(date);
	} else {
		converted = date as Date;
	}

	// 3. Safety check: Ensure the date is actually valid before formatting
	// (e.g., in case an invalid string was passed in)
	if (isNaN(converted.getTime())) {
		return "Invalid Date";
	}

	return new Intl.DateTimeFormat("en-US", {
		dateStyle: "long",
		timeStyle: "short",
	}).format(converted);
}
