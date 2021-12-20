import { EPriorityQueueOrder, PriorityQueue } from "../../queues";
import { IBuffer } from "../buffer";

export class PriorityBuffer<T> implements IBuffer<T> {

	private _queue: PriorityQueue<T>;
	
	constructor(order: EPriorityQueueOrder, public bufferSize: number = 1) {
		this._queue = new PriorityQueue(order);
	}

	public get(): T[] {
		const _items: T[] = [];
		if (this._queue.count === this.bufferSize) {
			const _value = this._queue.dequeue()
			if (_value)
				_items.push(_value)
		}

		else if (this._queue.count > this.bufferSize) {
			for (let i = 0, overflow = this._queue.count - this.bufferSize; i < overflow; i++) {
				const _value: T | null = this._queue.dequeue();
				if (_value)
					_items.push(_value)
			}
		}

		return _items;
	}

	public add(...items: { priority: number, value: T }[]): void {
		for (let i = 0; i < items.length; i++)
			this._queue.enqueue(items[i].priority, items[i].value);
	}

}