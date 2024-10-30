import { BadRequestException, Injectable} from '@nestjs/common';
import { existsSync, readFile} from 'fs';
import * as path from 'path';

@Injectable()
export class FileService {

  async getContractFile(filename:string): Promise<Buffer> {
      const codpachet = filename.split('-')[0].trim()
      const filePath = path.resolve(`./files/`, codpachet ,filename);
      console.log(filePath)
      if (!existsSync(filePath)) {
        throw new BadRequestException('PDF file not found');
      }
  
      return new Promise<Buffer>((resolve, reject) => {
        readFile(filePath, (err, data) => {
          if (err) {
            reject(new BadRequestException('Error reading the PDF file'));
          } else {
            resolve(data);
          }
        });
      });
  }
}
