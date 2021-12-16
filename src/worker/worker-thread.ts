import { ReplaySubject } from "rxjs";
import { Queue } from "../queues";
import { IWorkerDependency } from "./worker-dependency.interface";
import { IWorkerThread } from "./worker-thread.interface";

export class WorkerThread<T = any> implements IWorkerThread {

	public worker: Worker;

	public url: string;
	
	public stream: ReplaySubject<T>;

	constructor(
		public name: string,
		main: Function | string,
		dependencies: (Function | IWorkerDependency)[] = []
	) {
		const _dependencies: IWorkerDependency[] = dependencies.map(_dependency => {
			if (typeof _dependency === "function")
				return { name: _dependency.name, fn: _dependency.toString() };
			return _dependency;
		});
		const _code: string = this._generateCode(main, _dependencies);
		if (typeof main === "string")
			this.url = main;
		else
			this.url = URL.createObjectURL(new Blob([_code], { type: "text/javascript" }));
		this.worker = new Worker(this.url);
		this.stream = new ReplaySubject<T>(1);
		this.worker.addEventListener("message", e => {
			this.stream.next(e.data)
		});
		this.worker.addEventListener("error", e => {
			this.stream.error(e)
		});
	}

	private _generateCode(_main: Function | string, _dependencies: IWorkerDependency[]): string {
		// init worker with a task queue
		let _code: string = `const Queue = ${Queue.toString()};\n\n`;
		_code += `const tasks = new Queue();\n`;
		_code += `let busy = false;\n\n`;
		_dependencies.forEach(_dependency =>
			_code += `const ${_dependency.name} = ${_dependency.fn};\n\n`
		)
		_code += `const main = ${_main.toString()};\n\n`;
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

}