export interface IQueue<T> {
	count: number;
	max?: number;
	dequeue(): T | null;
	enqueue(...args: any[]): boolean;
	peek(): T | null;
}