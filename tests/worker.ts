import { Queue } from "../src/queues";
type Task = () => Promise<number>;
const tasks = new Queue<Task>();
let busy = false;

const main = (delay: number) => {
	return new Promise<number>((resolve, reject) => {
		setTimeout(() => {
			delay < 2000 ? reject(new Error("I don't like this number, idk")) : resolve(delay)
		}, delay)
	})
}

self.addEventListener("message", async e => {
	tasks.enqueue(() => new Promise((resolve, reject) => {
		try { resolve(main(e.data)); } catch (err) { console.error(err); reject(err); }
	}));
	_next();
});

async function _next() {
	if (busy) return;
	while (tasks.count > 0) {
		if (tasks.peek() === null) {
			busy = false; return;
		}
		const task = tasks.dequeue();
		busy = true;
		const next = await task().catch(err => { throw new Error(err) });
		postMessage(next);
		busy = false;
	}
}