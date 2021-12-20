import { IJob, ThreadManager, WorkerThread } from "../src/threads";

export const QueuedExample = (workerManager: ThreadManager, dynamic: boolean) => {
	let thread: WorkerThread<number>;
	let incrementor = 0;

	if (dynamic) {
		const job: IJob = {
			name: "myworker",
			process: (delay: number) => {
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						delay < 2000 ? reject(new Error("I don't like this number, idk")) : resolve(delay)
					}, delay)
				})
			}
		}
		thread = workerManager.createThread<number>(job)
	}
	else
		thread = workerManager.createThread<number>({ name: "myworker", process: "worker.js" });

	thread.stream.subscribe({
		next: result => {
			incrementor += result;
			console.log("Updated result from worker:::", incrementor)
		},
		error: err => {
			console.error(err)
		}
	})

	thread.enqueueMessage(2000);
	thread.enqueueMessage(5000);
	thread.enqueueMessage(2000);
	thread.enqueueMessage(1000);
}