import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RfidService {
  constructor(
    @Inject('MQTT_SERVICE') private client: ClientProxy, // Inject the client
  ) {}

  async handleRfidTap(uid: string) {
    // 1. Perform your database logic here (e.g., check if UID exists)
    const isAllowed = true; // Replace with actual DB check

    if (isAllowed) {
      // 2. Publish the unlock command to the ESP32
      // .emit('topic', 'message')
      this.client.emit('gym/door/command', 'unlock');

      return { status: 'Access Granted' };
    }

    return { status: 'Access Denied' };
  }
}
