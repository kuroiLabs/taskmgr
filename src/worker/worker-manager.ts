import { IWorkerDependency } from "./worker-dependency.interface";
import { WorkerThread } from "./worker-thread";

export class WorkerManager {

	public supported: boolean;

	private _maxWorkers: number;

	private _workers = new Map<string, WorkerThread>();

	constructor() {
		this.supported = typeof Worker !== "undefined";
		if (!this.supported)
			console.warn("Web Worker is not supported in this browser. All operations will be happen on the main thread.")
		this._maxWorkers = navigator.hardwareConcurrency || 4;
	}

	get hasAvailableThreads(): boolean {
		return this._workers.size < this._maxWorkers;
	}

	public setMaxWorkers(max: number): void {
		this._maxWorkers = max;
	}

	public createThread<N>(name: string, main: Function | string, dependencies: IWorkerDependency[] = []): WorkerThread<N> {
		if (!this.hasAvailableThreads) {
			console.warn("[WorkerService.createThread] No available threads. Terminating oldest worker...");
			this._terminateOldestWorker();
		}
		const _thread = new WorkerThread(name, main, dependencies);
		this._workers.set(name, _thread);
		return _thread;
	}

	private _terminateThread(_name: string): void {
		if (!this._workers.has(_name))
			return;
		const _thread: WorkerThread | undefined = this._workers.get(_name);
		if (_thread?.stream)
			_thread.terminate();
		this._workers.delete(_name);
	}

	private _terminateOldestWorker(): void {
		if (this._workers.size > 0) {
			const _oldestWorkerName: string = Array.from(this._workers)[0][0];
			this._terminateThread(_oldestWorkerName);
		}
	}

}