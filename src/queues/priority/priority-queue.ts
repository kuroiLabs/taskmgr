import { IQueue } from "../queue";
import { IPriorityQueueEntry } from "./priority-queue-entry.interface";
import { EPriorityQueueOrder } from "./priority-queue-order.enum";

export class PriorityQueue<T> implements IQueue<T> {

	public static readonly Order = EPriorityQueueOrder;

	public count: number = 0;

	protected _top: IPriorityQueueEntry<T>;

	protected _bottom: IPriorityQueueEntry<T>;

	constructor(
		public order: EPriorityQueueOrder = EPriorityQueueOrder.DESCENDING,
		public maxSize: number = 0	
	) {

	}

	public dequeue(): T | null {
		let _result: T | null = null;
		if (this.order === EPriorityQueueOrder.DESCENDING && this._top) {
			_result = this._top.value;
			this._top = this._top.next;
			if (this._top)
				this._top.previous = undefined;
		} else if (this.order === EPriorityQueueOrder.ASCENDING && this._bottom) {
			_result = this._bottom.value;
			this._bottom = this._bottom.previous;
			if (this._bottom)
				this._bottom.next = undefined;
		}
		if (this.count && _result)
			this.count--;
		return _result;
	}

	public enqueue(priority: number, value: T): boolean {
		if (this.maxSize > 0 && this.count >= this.maxSize)
			return false;

		const _entry: IPriorityQueueEntry<T> = { priority, value };
		if (!this._top) {
			this._top = _entry;
		} else if (!this._bottom) {
			if (priority < this._top.priority) {
				this._bottom = _entry;
				this._top.next = this._bottom;
				this._bottom.previous = this._top;
			} else {
				this._bottom = this._top;
				this._top = _entry;
				this._top.next = this._bottom;
				this._bottom.previous = this._top;
			}
		} else if (priority > this._top.priority) {
			const _top: IPriorityQueueEntry<T> = this._top;
			this._top = _entry;
			_top.previous = this._top;
			this._top.next = _top;
		} else if (priority < this._bottom.priority) {
			const _bottom: IPriorityQueueEntry<T> = this._bottom;
			this._bottom = _entry;
			_bottom.next = this._bottom;
			this._bottom.previous = _bottom;
		} else {
			let _target: IPriorityQueueEntry<T> = this._top;
			while (priority < _target.priority && _target.next)
				_target = _target.next;
			if (_target.priority === priority)
				this._insertInPlace(_target, _entry)
			else
				this._insertBefore(_target, _entry);
		}
		this.count++;
		return true;
	}

	public peek(): T | null {
		let _entry: IPriorityQueueEntry<T> = this.order === EPriorityQueueOrder.DESCENDING ?
			this._top : this._bottom;
		return _entry?.value || null;
	}

	private _insertBefore(_target: IPriorityQueueEntry<T>, _entry: IPriorityQueueEntry<T>): void {
		const _previous: IPriorityQueueEntry<T> = _target.previous;
		_entry.next = _target;
		_target.previous = _entry;
		if (_previous) {
			_previous.next = _entry;
			_entry.previous = _previous;
		}
	}

	private _insertInPlace(_target: IPriorityQueueEntry<T>, _entry: IPriorityQueueEntry<T>): void {
		const _previous: IPriorityQueueEntry<T> = _target.previous;
		const _next: IPriorityQueueEntry<T> = _target.next;
		_entry.previous = _previous;
		_entry.next = _next;
		if (_previous)
			_previous.next = _entry;
		if (_next)
			_next.previous = _entry;
	}

}