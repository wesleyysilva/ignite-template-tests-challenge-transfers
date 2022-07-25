import { getRepository, Repository } from "typeorm";

import { Statement } from "../entities/Statement";
import { ICreateStatementDTO, ICreateStatementTransferDTO } from "../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "./IStatementsRepository";


function getBalance(statement: Statement[]) {
  const balance = statement.reduce((acc, operation) => {

    if (operation.type === 'transfer') {
      if (operation.sender_id) {
        return acc - Number(operation.amount);
      } else {
        return acc + Number(operation.amount);
      }
    } else {

      if (operation.type === 'deposit') {
        return acc + Number(operation.amount);
      } else {
        return acc - Number(operation.amount);
      }
    }
  }, 0);

  return (balance);
}

export class StatementsRepository implements IStatementsRepository {
  private repository: Repository<Statement>;

  constructor() {
    this.repository = getRepository(Statement);
  }
  async createTransfer({
    user_id,
    amount,
    description,
    type,
    sender_id }: ICreateStatementTransferDTO): Promise<Statement> {

    const statement = this.repository.create({
      user_id,
      amount,
      description,
      type,
      sender_id
    });

    return this.repository.save(statement);
  }

  async create({
    user_id,
    amount,
    description,
    type
  }: ICreateStatementDTO): Promise<Statement> {
    const statement = this.repository.create({
      user_id,
      amount,
      description,
      type
    });

    return this.repository.save(statement);
  }

  async findStatementOperation({ statement_id, user_id }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.repository.findOne(statement_id, {
      where: { user_id }
    });
  }

  async getUserBalance({ user_id, with_statement = false }: IGetBalanceDTO):
    Promise<
      { balance: number; } | { balance: number, statement: Statement[]; }
    > {
    const statement = await this.repository.find({
      where: [
        { user_id },
        { sender_id: user_id }
      ]
    });

    // const balance = getBalance(statement);

    const balance = statement.reduce((acc, operation) => {

      if (operation.type === 'transfer') {
        if (operation.sender_id) {
          return acc - Number(operation.amount);
        } else {
          return acc + Number(operation.amount);
        }
      } else {

        if (operation.type === 'deposit') {
          return acc + Number(operation.amount);
        } else {
          return acc - Number(operation.amount);
        }
      }
    }, 0);

    if (with_statement) {
      return {
        statement,
        balance
      };
    }

    return { balance };
  }



}
