import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../../statements/repositories/IStatementsRepository";
import { CreateTransfersError } from "./CreateTransfersError";
import { Statement } from "../../entities/Statement";
import { BalanceMap } from "../../mappers/BalanceMap";

interface IRequest {
	user_id: string;
	sender_id: string;
	amount: number;
	description: string;
}

interface IResponse {
	statement: Statement[];
	balance: number;
}

enum OperationType {
	DEPOSIT = 'deposit',
	WITHDRAW = 'withdraw',
	TRANSFER = 'transfer'
}


@injectable()
class CreateTransfersUseCase {
	constructor(
		@inject('StatementsRepository')
		private statementsRepository: IStatementsRepository,

		@inject('UsersRepository')
		private usersRepository: IUsersRepository
	) { }

	async execute({ user_id, sender_id, amount, description }: IRequest) {

		const userSource = await this.usersRepository.findById(sender_id);
		const useTarget = await this.usersRepository.findById(user_id);

		if (!userSource) {
			throw new CreateTransfersError.UserSourceNotFound();
		}
		if (!useTarget) {
			throw new CreateTransfersError.UserTagetNotFound();
		}

		const { balance } = await this.statementsRepository.getUserBalance({
			user_id: String(userSource.id),
			with_statement: false
		});

		if ((balance - amount) < 0) {
			throw new CreateTransfersError.UserSourceNotFunds();
		}

		const statement = await this.statementsRepository.createTransfer({
			user_id: String(useTarget.id),
			type: OperationType.TRANSFER,
			amount,
			description,
			sender_id: String(userSource.id)
		});

		return statement;
	}
}

export { CreateTransfersUseCase };