import { ThreadManager } from "../src/threads";

export const UnqueuedExample = (workerManager: ThreadManager) => {
	const Incrementor = () => {
		let accumulator = 0;
		return {
			increment() {
				return accumulator++;
			}
		}
	}

	const thread2 = workerManager.createThread({
		name: "worker2",
		process: (additive: number) => Incrementor["increment"](),
		dependencies: [{
			name: Incrementor.name,
			fn: `(${Incrementor.toString()})()`
		}],
		queueTasks: false
	});

	thread2.stream.subscribe({
		next: response => console.log("Incremental response from worker2", response)
	})

	thread2.enqueueMessage("suh")
	thread2.enqueueMessage("bruh")
	thread2.enqueueMessage("cuh")
}