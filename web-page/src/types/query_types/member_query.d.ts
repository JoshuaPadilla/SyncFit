import { MembershipStatus } from "@/enums/membership_status.enum";
import { MembershipType } from "@/enums/membership_type.enum";
import type { BaseQuery } from "./api_base_query";

export type UserQuery = BaseQuery & {
	search?: string;
	status?: MembershipStatus;
	membershipType?: MembershipType;
	isExpired?: boolean;
	minBalance?: number;
	maxBalance?: number;
};
