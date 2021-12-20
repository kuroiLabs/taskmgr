import { ReplaySubject, take, tap } from "rxjs";
import { Queue } from "../queues";
import { IJob } from "./job.interface";
import { IWorkerDependency } from "./worker-dependency.interface";
import { IWorkerThread } from "./worker-thread.interface";

export class WorkerThread<T = any> implements IWorkerThread {

	public name: string;

	public worker: Worker;

	public url: string;

	public stream: ReplaySubject<T>;

	public queueTasks: boolean = true;

	public terminal: boolean = false;

	constructor(job: IJob) {
		this.name = job.name;
		this.queueTasks = typeof job.queueTasks === "boolean" ? job.queueTasks : true;
		this.terminal = typeof job.terminal === "boolean" ? job.terminal : true;
		const _dependencies: IWorkerDependency[] = (job.dependencies || []).map(_dependency => {
			if (typeof _dependency === "function")
				return { name: _dependency.name, fn: _dependency.toString() };
			return _dependency;
		});
		const _code: string = this._generateCode(job.process, _dependencies);
		this.url = typeof job.process === "string" ? job.process : URL.createObjectURL(new Blob([_code], {
			type: "text/javascript"
		}));
		this.worker = new Worker(this.url);
		this.stream = new ReplaySubject<T>(1);
		if (this.terminal) {
			this.stream.pipe(take(1)).subscribe({ next: () => this.terminate() })
		}
		this.worker.addEventListener("message", e => {
			this.stream.next(e.data)
		});
		this.worker.addEventListener("error", e => {
			this.stream.error(e)
		});
	}

	public enqueueMessage<M = any>(message: M): void {
		this.worker.postMessage(message);
	}

	public terminate(): void {
		this.stream.complete();
		if (this.worker.onmessage)
			this.worker.removeEventListener("message", this.worker.onmessage);
		if (this.worker.onerror)
			this.worker.removeEventListener("error", this.worker.onerror);
		this.worker.terminate();
	}

	private _generateCode(_main: Function | string, _dependencies: IWorkerDependency[]): string {
		let _code: string = ``;
		if (this.queueTasks) {
			_code += this._addQueue();
		}
		_code += `let busy = false;\n\n`;
		_dependencies.forEach(_dependency =>
			_code += `const ${_dependency.name} = ${_dependency.fn};\n\n`
		)
		_code += `const main = ${_main.toString()};\n\n`;
		if (this.queueTasks)
			_code += this._writeQueuedProcess();
		else
			_code += this._writeUnqueuedProcess();

		return _code;
	}

	private _addQueue(): string {
		let _code: string = ``;
		_code += `const Queue = ${Queue.toString()};\n\n`;
		_code += `const tasks = new Queue();\n`;
		return _code;
	}

	private _writeQueuedProcess(): string {
		let _code: string = ``;
		_code += `self.addEventListener("message", async e => {\n`;
		_code += `\ttasks.enqueue(() => new Promise((resolve, reject) => {\n`
		_code += `\t\ttry { resolve(main(e.data)); } catch (err) { console.error(err); reject(err); }\n`;
		_code += `\t}));\n`
		_code += `\_next();\n`;
		_code += `});\n`;
		_code += `async function _next() {\n`;
		_code += `\tif (busy) return;\n`;
		_code += `\twhile (tasks.count > 0) {\n`;
		_code += `\t\tif (tasks.peek() === null) {\n`;
		_code += `\t\t\tbusy = false; return;\n`
		_code += `\t\t}\n`;
		_code += `\t\tconst task = tasks.dequeue();\n`;
		_code += `\t\tbusy = true;\n`;
		_code += `\t\tconst next = await task().catch(err => { throw new Error(err) });\n`;
		_code += `\t\tpostMessage(next);\n`;
		_code += `\t\tbusy = false;\n`;
		_code += `\t}\n`;
		_code += `}`;
		return _code;
	}

	private _writeUnqueuedProcess(): string {
		let _code: string = ``;
		_code += `self.addEventListener("message", e => {\n`;
		_code += `\tpostMessage(main(e.data));\n`
		_code += `});\n`
		return _code;
	}

}