export interface BaseQuery {
	page: number | 1;
	limit: number | 5;
	search?: string;
}
