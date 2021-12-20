import { PriorityQueue } from "../src/queues"
import { PriorityBuffer } from "../src/buffers";

export const PriorityQueueExample = async () => {
	const buffer = new PriorityBuffer<string>(PriorityQueue.Order.ASCENDING, 3);

	function add(priority: number, value: string, delay: number): Promise<void> {
		return new Promise(resolve => {
			setTimeout(() => {
				buffer.add({ priority, value })
				resolve()
			}, delay)
		})
	}

	function read(): void {
		setInterval(() => {
			const values = buffer.get();
			if (values.length) values.forEach(val => console.log(val))
		}, 500)
	}
	
	read();
	await add(1, "hello!", 500)
	await add(0, "Jerry", 500)
	await add(3, "me", 200)
	await add(2, "It's", 300)
	await add(2, "It's", 100)
	await add(4, "Uncle", 750)
	await add(5, "Leo", 200)
	await add(6, null, 500)
	await add(7, null, 500)
}