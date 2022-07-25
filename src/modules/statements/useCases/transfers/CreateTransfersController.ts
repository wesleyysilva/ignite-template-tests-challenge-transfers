import { Request, Response } from 'express';
import { container } from "tsyringe";
import { CreateTransfersUseCase } from './CreateTransfersUseCase';


class CreateTransfersController {

  async handle(request: Request, response: Response): Promise<Response> {

    const { amount, description } = request.body;

    const sender_id = request.user.id;
    const user_id = request.params.user_id;

    const createTransfer = container.resolve(CreateTransfersUseCase);

    const statement = await createTransfer.execute({
      user_id,
      sender_id,
      amount,
      description
    });




    return response.status(201).json(statement);
  }

}

export { CreateTransfersController };