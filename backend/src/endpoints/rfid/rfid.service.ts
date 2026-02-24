import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RfidService implements OnModuleInit {
  private registrationMode = false;
  private registrationUserId: string | null = null;
  private registrationTimeout: NodeJS.Timeout | null = null;

  constructor(@Inject('MQTT_SERVICE') private client: ClientProxy) {}

  async onModuleInit() {
    await this.client.connect();
  }

  async handleRfidTap(uid: string) {
    // ✅ If we are in registration mode
    if (this.registrationUserId) {
      await this.saveRfid(uid, this.registrationUserId);
      this.client.emit(`rfid/registration/${this.registrationUserId}`, {
        uid: uid,
        status: 'registered',
      });
      // Clear timeout
      if (this.registrationTimeout) {
        clearTimeout(this.registrationTimeout);
        this.registrationTimeout = null;
      }

      this.registrationUserId = null;

      return { status: 'RFID Registered' };
    }

    // Normal access check
    const isAllowed = true;

    if (isAllowed) {
      this.client.emit('gym/door/command', 'unlock');
      return { status: 'Access Granted' };
    }

    return { status: 'Access Denied' };
  }

  async startRegistration(userId: string) {
    // Cancel existing registration if any
    if (this.registrationTimeout) {
      clearTimeout(this.registrationTimeout);
    }

    this.registrationMode = true;
    this.registrationUserId = userId;

    // Set 30s timeout
    this.registrationTimeout = setTimeout(() => {
      this.registrationUserId = null;
      this.registrationTimeout = null;
      console.log('Registration mode expired');
    }, 30000);

    return { status: 'Waiting for RFID tap...' };
  }

  private async saveRfid(uid: string, userId: string) {
    console.log(`Saving UID ${uid} to user ${userId}`);
    // Save to DB here
  }

  private async checkAccess(uid: string) {
    // Query DB and verify membership
    return true;
  }
}
