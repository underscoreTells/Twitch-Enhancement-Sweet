export abstract class FileIO {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	protected data: any;

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	receiveData(data: any): void {
		this.data = data;
	}
}
