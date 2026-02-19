import { CreateUserDto } from "@/dtos/createUser";

export const validateOnboardingStep = (
	form: CreateUserDto,
	step: number,
): string[] => {
	const errors: string[] = [];

	// Safety Check: Ensure form strings aren't undefined
	const firstName = form.firstName?.trim() || "";
	const lastName = form.lastName?.trim() || "";
	const phoneNumber = form.phoneNumber?.trim() || "";

	if (step === 1) {
		if (!firstName) errors.push("First name is required.");
		else if (firstName.length < 2) errors.push("First name is too short.");

		if (!lastName) errors.push("Last name is required.");

		// Updated Regex for international format (+ prefix required)
		const phoneRegex = /^\+[1-9]\d{10,14}$/;

		if (!phoneNumber) {
			errors.push("Phone number is required.");
		} else if (!phoneNumber.startsWith("+")) {
			errors.push("Include country code (e.g., +63).");
		} else if (!phoneRegex.test(phoneNumber)) {
			errors.push("Invalid format. Use +639XXXXXXXXX.");
		}
	}

	if (step === 2) {
		// Double check if your state uses 'selectedPlan' or 'membershipPlanId'
		if (!form.membershipPlanId) {
			errors.push("Please select a membership plan.");
		}
	}

	return errors;
};
