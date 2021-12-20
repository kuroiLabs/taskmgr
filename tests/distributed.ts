import { Queue } from "../src/queues";
import { ThreadManager, WorkerThread } from "../src/threads";

export function DistributedExample() {
	const _threadManager = new ThreadManager();
	const _batch = _threadManager.createBatch({
		name: "betch",
		process: ([_input, _thread]: number[]): number => {
			_input = _input * _input;
			for (let i = 0; i < 100000; i++) {
				_input = _input
			}
			return _input
		}
	})
}

// export function DistributedExample() {



// 	const taskQueue = new Queue<number>();
// 	taskQueue.enqueue(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// 	const threadManager = new ThreadManager();

// 	let i = 0;
// 	let accumulator = 0;
// 	let threads = new Array<WorkerThread<number>>(threadManager.threadCount);
// 	while (taskQueue.count > 0) {
// 		let slot = i % threadManager.threadCount;
// 		const task = taskQueue.dequeue();
// 		console.log(`Deploying task ${task} to thread [${slot}]`)
// 		if (!threads[slot]) {
// 			threads[slot] = threadManager.createThread(`thread_${slot}`, ([_input, _slot]: number[]): number => {
// 				console.log(`Received task [${_input}] on thread [${_slot}]`)
// 				_input = _input * _input;
// 				for (let i = 0; i < 100000; i++) {
// 					_input = _input
// 				}
// 				return _input
// 			})
// 			threads[slot].stream.subscribe({
// 				next: result => {
// 					accumulator += result
// 					console.log(`Thread [${slot}] updating accumulator +${result}: ${accumulator}`)
// 				}
// 			})
// 			threads[slot].enqueueMessage<number[]>([task, slot])
// 		}
// 		else
// 			threads[slot].enqueueMessage<number[]>([task, slot])

// 		i++;
// 	}
// 	console.log("THREADS:::", threads)
// }
