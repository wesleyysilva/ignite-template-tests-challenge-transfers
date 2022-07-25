import { AppError } from "../../../../shared/errors/AppError";

export namespace CreateTransfersError {
	export class UserSourceNotFound extends AppError {
		constructor() {
			super('User Source not found', 404);
		}
	}

	export class UserTagetNotFound extends AppError {
		constructor() {
			super('User Target not found', 404);
		}
	}
	export class UserSourceNotFunds extends AppError {
		constructor() {
			super('User Source not funds', 404);
		}
	}

}
