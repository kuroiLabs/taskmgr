import { IQueueEntry } from "./queue-entry.interface";
import { IQueue } from "./queue.interface";

export class Queue<T> implements IQueue<T> {

	public count: number = 0;

	private _first?: IQueueEntry<T>

	private _last?: IQueueEntry<T>

	constructor(public max: number = 0) {
		if (this.max < 0)
			this.max = 0;
	}

	public dequeue(): T | null {
		if (this._first) {
			const _value = this._first.value;
			this._first = this._first.next;
			this.count--;
			return _value;
		}
		return null;
	}

	public enqueue(value: T): void {
		if (this.max && this.count >= this.max) {
			console.error("Queue is full!");
			return;
		}
		const _entry: IQueueEntry<T> = { value };
		this._last = this._first ?
			this._last.next = _entry : this._first = _entry;
		
		this.count++;
	}

	public peek(): T | null {
		return this._first?.value || null;
	}

}