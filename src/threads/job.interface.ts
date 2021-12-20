import { IWorkerDependency } from "./worker-dependency.interface";

export interface IJob {
	name: string;
	process: Function | string;
	dependencies?: (IWorkerDependency | Function)[];
	queueTasks?: boolean;
	terminal?: boolean;
}