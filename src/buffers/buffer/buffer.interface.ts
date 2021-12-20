export interface IBuffer<T> {
	bufferSize: number;
	get(): T[];
	add(...args: any[]): void;
}