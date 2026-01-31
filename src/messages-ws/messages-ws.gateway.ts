import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-messages.dto';
import type { JwtPayload } from '../auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.resgisterClient(client, payload.id);
    } catch (error) {
      console.log(error);
      client.disconnect();
      return;
    }

    this.server.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }
  handleDisconnect(client: Socket) {
    //console.log('Cliente desconectado: ', client.id);
    this.messagesWsService.removeClient(client.id);
    this.server.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  @SubscribeMessage('message-from-client')
  handleMessage(client: Socket, payload: NewMessageDto): void {
    //!emitir mensaje a un solo cliente
    // client.emit('message-from-server', {
    //   fullName: 'Fulanito',
    //   message: payload.message || 'No message',
    // });

    //!emitir mensaje a todos menos el que envio
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Fulanito',
    //   message: payload.message || 'No message',
    // });

    this.server.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullNameById(client.id),
      message: payload.message || 'No message',
    });
  }
}
