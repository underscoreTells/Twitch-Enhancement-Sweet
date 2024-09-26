export abstract class FileIO {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	protected data: any;

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	public receiveData(data: any): void {
		this.data = data;
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	public getData(): any {
		return this.data;
	}
}
