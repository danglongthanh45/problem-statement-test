import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import * as through2 from 'through2';
import { ImportTransaction } from 'src/db/transaction-import.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ImportHistory } from 'src/db/history-import.entity';
import { Repository } from 'typeorm';
import { ImportStatus } from 'src/constant/type';
import { S3 } from 'aws-sdk';
import { MessageQueue } from 'src/constant/message-queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const excel = require('xlsx-parse-stream')

@Injectable()
export class ImportTransactionService {

  private readonly BUCKET_NAME = process.env.BUCKET_NAME;
  private historyId: number;
  private readonly excel_file = ['xlsx', 'xls'];
  private readonly csv_file = ['csv'];
  private s3Services;

  constructor(
    @InjectRepository(ImportHistory) private readonly importHistoryRepo: Repository<ImportHistory>,
    @InjectRepository(ImportTransaction) private readonly importTransactionRepo: Repository<ImportTransaction>,
  ) {
    this.s3Services = this.getS3Services();
  }

  getS3Services() {
    const s3 = new S3({
        endpoint: process.env.ENDPOINT,
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
        region: process.env.RIGION
    })
    return s3;
  }

  async importCsvTransaction(data: MessageQueue) {
    this.historyId = data.historyId; 
    await new Promise<void>(resolve => {
      this.s3Services.getObject({ Bucket: this.BUCKET_NAME, Key: data.keyfile})
      .createReadStream()
      .pipe(parse({delimiter: ',', from: 2}))
      .pipe(through2({ objectMode: true }, async (row, enc, cb) => {
        try {
            const record = new ImportTransaction();
            record.date = row[0];
            record.content = row[1];
            record.amount = row[2];
            record.type = row[3];
            await this.importTransactionRepo.save(record);
            cb(null, true);
        } catch(err) {
          await this.updateHistory(ImportStatus.FAIL);
          await this.s3Services.deleteObject({ Bucket: this.BUCKET_NAME, Key: data.keyfile}).promise();
          cb(err, true);
          resolve();
        }            
      }))
      .on('data', async function() {
            // do something 
      })
      .on('end', async () => {
        await this.updateHistory(ImportStatus.SUCCESS);
        await this.s3Services.deleteObject({ Bucket: this.BUCKET_NAME, Key: data.keyfile}).promise();
        console.log('File imported');
        resolve();
      })
      .on('close', async function() {
        resolve();
      })
      .on('error', err => {
        console.error(err);
        resolve();
      });
    }) 
  }
  
  async importExcelTransaction(data: MessageQueue) {
    this.historyId = data.historyId;
    await new Promise<void>(resolve => { 
      this.s3Services.getObject({ Bucket: this.BUCKET_NAME, Key: data.keyfile})
        .createReadStream()    
        .pipe(excel())  
        .pipe(through2({ objectMode: true }, async (row, enc, cb) => {
          try {
              const record = new ImportTransaction();
              record.date = row.date;
              record.content = row.content;
              record.amount = row.amount;
              record.type = row.type;
              await this.importTransactionRepo.save(record);
              cb(null, true);
          } catch(err) {
            await this.updateHistory(ImportStatus.FAIL);
            await this.s3Services.deleteObject({ Bucket: this.BUCKET_NAME, Key: data.keyfile}).promise();
            cb(err, true);
            resolve();
          }            
        }))
        .on('data', async () => {
          // do something
        }) 
        .on('end', async () => {
          await this.updateHistory(ImportStatus.SUCCESS);
          await this.s3Services.deleteObject({ Bucket: this.BUCKET_NAME, Key: data.keyfile}).promise();
          console.log('File imported');
          resolve();
        })
        .on('close', async function() {
          resolve();
        })
        .on('error', err => {
          console.error(err);
          resolve();
        });
    });
  }

  async updateHistory(status: ImportStatus) {
    const historyUpdate = await this.importHistoryRepo.findOneBy({
      id: this.historyId
    });
    historyUpdate.status = status;
    await this.importHistoryRepo.save(historyUpdate);
  }


  async processImportTransaction(data: MessageQueue): Promise<void> {
    const historyUpdate = await this.importHistoryRepo.findOneBy({
      id: data.historyId
    });
    historyUpdate.status = ImportStatus.PROCESSING;
    await this.importHistoryRepo.save(historyUpdate);
    /** CSV FILE **/
    if(this.csv_file.includes(data.typeFile)) {
      await this.importCsvTransaction(data);
    }   
    /** EXCEL FILE **/
    if(this.excel_file.includes(data.typeFile)) {
      await this.importExcelTransaction(data);
    }   
  }
}



