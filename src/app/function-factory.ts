import { injectable } from "tsyringe";
import type { Message } from "./request-parser-interface";
import type { Subscriber } from "./subscriber";

@injectable()
class DependencyContext {
	constructor(
		//public dep1: Dependency1,
		//public dep2: Dependency2,
		//public dep3: Dependency3,
	) {}
}

@injectable()
class FunctionFactory {
	constructor(private context: DependencyContext) {}

	createFunction(
		logic: (
			context: DependencyContext,
			message: Message,
			subscriberObject: Subscriber,
		) => void,
	): (message: Message, subscriberObject: Subscriber) => void {
		return (message, subscriberObject) => {
			logic(this.context, message, subscriberObject);
		};
	}
}
