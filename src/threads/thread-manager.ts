import { BatchJob } from "./batch-job";
import { IJob } from "./job.interface";
import { IWorkerDependency } from "./worker-dependency.interface";
import { WorkerThread } from "./worker-thread";

export class ThreadManager {

	public supported: boolean;

	private _maxThreads: number;

	private _threads = new Map<string, WorkerThread>();

	constructor() {
		this.supported = typeof Worker !== "undefined";
		if (!this.supported)
			console.warn("Web Worker is not supported in this browser. All operations will take place on the main thread.")
		this._maxThreads = navigator.hardwareConcurrency || 4;
	}

	get threadCount(): number {
		return navigator.hardwareConcurrency;
	}

	get availableThreads(): number {
		return Math.max(0, navigator.hardwareConcurrency - this._threads.size);
	}

	get hasAvailableThreads(): boolean {
		return this._threads.size < this._maxThreads;
	}

	public setMaxWorkers(max: number): void {
		this._maxThreads = max;
	}

	public createBatch<N>(job: IJob): BatchJob<N> {
		return new BatchJob<N>(job, this.threadCount);
	}

	public createThread<N>(job: IJob): WorkerThread<N> {
		if (!this.hasAvailableThreads) {
			console.warn("[WorkerService.createThread] No available threads. Terminating oldest worker...");
			this._terminateOldestWorker();
		}
		const _thread = new WorkerThread(job);
		this._threads.set(job.name, _thread);
		return _thread;
	}

	private _terminateThread(_name: string): void {
		if (!this._threads.has(_name))
			return;
		const _thread: WorkerThread | undefined = this._threads.get(_name);
		if (_thread?.stream)
			_thread.terminate();
		this._threads.delete(_name);
	}

	private _terminateOldestWorker(): void {
		if (this._threads.size > 0) {
			const _oldestWorkerName: string = Array.from(this._threads)[0][0];
			this._terminateThread(_oldestWorkerName);
		}
	}

}