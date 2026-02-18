import { UserRole } from "@/enums/user_role.enums";
import { Member } from "./member";

export type User = {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	phoneNumber?: string | null; // nullable: true in TypeORM
	role: UserRole;
	member?: Member; // One-to-One relationship
	createdAt: string | Date;
	updatedAt: string | Date;
};
