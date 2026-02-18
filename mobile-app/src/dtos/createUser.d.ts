export type CreateUserDto = {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	phoneNumber?: string | null; // nullable: true in TypeORM
	membeShipId: string; // One-to-One relationship
};
