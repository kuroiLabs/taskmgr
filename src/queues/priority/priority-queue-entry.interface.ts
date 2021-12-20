import { IQueueEntry } from "../queue";

export interface IPriorityQueueEntry<T> extends IQueueEntry<T> {
	priority: number;
	next?: IPriorityQueueEntry<T>;
	previous?: IPriorityQueueEntry<T>;
}