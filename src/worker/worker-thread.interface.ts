import { ReplaySubject } from "rxjs";

export interface IWorkerThread<T = any> {
	name: string;
	worker: Worker;
	url: string;
	stream: ReplaySubject<T>
}