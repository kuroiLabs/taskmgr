import { concatMap, finalize, Observable, Subject, take } from "rxjs";
import { IQueue } from "./queue.interface";

export class ObservableQueue<T> implements IQueue<Observable<T>> {

	public busy: boolean = false;

	public count: number = 0;

	public max?: number | undefined;

	private _tasks$ = new Subject<Observable<T>>();

	private _queue$!: Observable<T>;

	private _currentTask$!: Observable<T>;

	public dequeue(): Observable<T> {
		if (!this._queue$) {
			this._queue$ = this._tasks$.pipe(
				concatMap(_task$ => {
					this.busy = true;
					this._currentTask$ = _task$;
					return _task$.pipe(finalize(() => {
						this.count--;
						if (!this.count)
							this.busy = false;
					}))
				})
			)
		}
		return this._queue$;
	}

	public enqueue(task: Observable<T>): void {
		if (this.max && this.count >= this.max) {
			console.error("ObservableQueue full!");
			return;
		}
		this._tasks$.next(task);
		this.count++;
	}

	public peek(): Observable<T> {
		return this._currentTask$.pipe(take(1));
	}

}