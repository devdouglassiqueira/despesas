import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Hasher } from '../../../common/interfaces/criptography/hasher.interface';

@Injectable()
export class BcryptAdapter implements Hasher {
  async hash(value: string): Promise<string> {
    const hash = await bcrypt.hash(value, 12);
    return hash;
  }

  async compare(value: string, hash: string): Promise<boolean> {
    const isValid = await bcrypt.compare(value, hash);
    return isValid;
  }
}
