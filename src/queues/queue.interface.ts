export interface IQueue<T> {
	count: number;
	max?: number;
	dequeue(): T | null;
	enqueue(value: T): void;
	peek(): T | null;
}