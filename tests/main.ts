import { WorkerManager, WorkerThread } from "../src/worker";

const workerManager = new WorkerManager();
const dynamic = false;
let thread: WorkerThread<number>;
let incrementor = 0;

if (dynamic) {
	thread = workerManager.createThread<number>("myworker", (delay: number) => {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				delay < 2000 ? reject(new Error("I don't like this number, idk")) : resolve(delay)
			}, delay)
		})
	});
} else {
	thread = workerManager.createThread<number>("myworker", "worker.js");
}

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