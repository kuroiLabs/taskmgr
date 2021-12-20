import { Subject, Subscriber, takeUntil } from "rxjs";
import { Queue } from "../queues";
import { IJob } from "./job.interface";
import { WorkerThread } from "./worker-thread";

export class BatchJob<T> {
	
	public queue = new Queue();

	public threads: WorkerThread<T>[];

	private _done$ = new Subject<boolean>();

	constructor(private job: IJob, private threadCount: number) {
		this.threads = new Array<WorkerThread<T>>(threadCount);
	}

	public destroy(): void {
		this._done$.next(true);
		this._done$.complete();
		this.threads.forEach(_thread => {
			_thread.terminate();
		});
		this.threads = [];
	}

	public run<U>(queue: Queue<U> | U[], subscriber: Subscriber<T>): void {
		if (queue instanceof Array) {
			queue.forEach((task: U, i) => this._runTask(task, i % this.threadCount, subscriber));
		} else if (queue instanceof Queue) {
			let i = 0;
			while (queue.count) {
				const _task = queue.dequeue();
				this._runTask(_task, i % this.threadCount, subscriber);
				i++;
			}
		}
	}

	private _runTask<U>(_task: U, _threadIndex: number, _subscriber: Subscriber<T>): void {
		if (!this.threads[_threadIndex]) {
			const _thread = new WorkerThread<T>(this.job)
			this.threads[_threadIndex] = _thread;
			_thread.stream.pipe(
				takeUntil(this._done$)
			).subscribe(_subscriber);
			_thread.enqueueMessage(_task);
		} else {
			this.threads[_threadIndex].enqueueMessage(_task);
		}
	}

}