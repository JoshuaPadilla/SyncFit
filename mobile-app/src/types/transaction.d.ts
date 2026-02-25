export type Transaction = {
	id: string;

	/** * In a .d.ts, we usually represent relations as the object itself
	 * OR just the ID string if the relation isn't loaded.
	 */
	member?: any; // Replace 'any' with IMember if you have that interface
	memberId?: string;

	/** Optional link to a payment */
	payment?: any; // Replace 'any' with IPayment if you have that interface
	paymentId?: string | null;

	/** * Note: Decimals from DB often come as strings in JS
	 * to maintain precision. Using 'string | number' is safest.
	 */
	amount: number;

	type: TransactionType;

	description: string;

	/** The member balance immediately after this transaction */
	runningBalance: number;

	createdAt: Date;
};
