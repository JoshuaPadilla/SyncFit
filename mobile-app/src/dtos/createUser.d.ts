export type CreateUserDto = {
	firstName: string;
	lastName: string;
	phoneNumber: string; // nullable: true in TypeORM
};
