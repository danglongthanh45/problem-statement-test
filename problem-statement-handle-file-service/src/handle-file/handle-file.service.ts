/* eslint-disable @typescript-eslint/no-var-requires */
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices/client';
import { S3 } from 'aws-sdk';
import { ImportHistoryDto } from 'src/common/import-history.dto';
import { MessageQueue } from 'src/common/message-queue';

@Injectable()
export class HandleFileService {

  private readonly configAxios;
  private readonly URL_IMPORT_TRANSACTION_SERVICE = "http://localhost:3001/";
  private readonly ACCESS_KEY_ID='DO00DUZKB47X39NYN4HC'
  private readonly SECRET_ACCESS_KEY='4p1mOYoHQayWB67i7fLoRvFifLduDktEVTbiweP6D6s'
  private readonly RIGION='sgp1'
  private readonly BUCKET_NAME='file-max45'
  private readonly ENDPOINT='sgp1.digitaloceanspaces.com'
  private readonly array_of_allowed_files = ['csv', 'xlsx', 'xls'];
  private readonly array_of_allowed_file_types = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];

  constructor(
    @Inject('IMPORT_FILE_RMQ') private readonly rabbitClient: ClientProxy,
    // @Inject('IMPORT_TRANSACTION_SERVICE') private importTransactionClient: ClientProxy,
    private readonly httpService: HttpService
  ){
    this.configAxios = {
      headers: {
          'Content-Type': 'application/json'
      }
    }
  }

  getS3Services() {
    const s3 = new S3({
        endpoint: this.ENDPOINT,
        accessKeyId: this.ACCESS_KEY_ID,
        secretAccessKey: this.SECRET_ACCESS_KEY,
        // region: this.RIGION
    })
    return s3;
  }

  async handleUploadFile(file: Express.Multer.File, userId: number) {

    if(!file) {
      throw new HttpException(
        "Please choose a file", 
        HttpStatus.UNSUPPORTED_MEDIA_TYPE
      );
    }

    let keyfile = '';
    let historyId: number;

    const file_extension = file.originalname.slice(
        ((file.originalname.lastIndexOf('.') - 1) >>> 0) + 2
    );
    if (!this.array_of_allowed_files.includes(file_extension) || !this.array_of_allowed_file_types.includes(file.mimetype)) {
        throw new HttpException(
            "File type is not support, please upload file with csv or xlsx", 
            HttpStatus.UNSUPPORTED_MEDIA_TYPE
        );
    }

    /* upload to cloud storage */ 
    const s3Services = this.getS3Services();
    try {      
      const upload = await s3Services.upload(
        {
            Bucket: this.BUCKET_NAME,
            Key: Date.now().toString(),
            Body: file.buffer,
            ContentType: file.mimetype,
            // ACL: 'public-read'
      }).promise();
      keyfile = upload.Key;
    } catch(error) {
        throw new HttpException(
            "Cannot upload file into cloud, please try again later", 
            HttpStatus.FAILED_DEPENDENCY
        );
    }

    /* Create record */
    try {
      const newRecord = new ImportHistoryDto();
      newRecord.filename = file.originalname;
      newRecord.userid = userId;
      const response = await this.httpService.axiosRef.post(
        `${this.URL_IMPORT_TRANSACTION_SERVICE}api/import-history/create`, 
        newRecord, 
        this.configAxios
      );
      historyId = response.data.id;
    } catch (error) {
        throw new HttpException(
            "Cannot create history record, please try again later", 
            HttpStatus.BAD_GATEWAY
        );
    }  

    /* Push to queue */
    try {
        const content = new MessageQueue();
        content.keyfile = keyfile;
        content.historyId = historyId;
        content.typeFile = file.originalname.slice(((file.originalname.lastIndexOf('.') - 1) >>> 0) + 2);
        this.rabbitClient.emit('import-record', content);
    } catch(err) {
        throw new HttpException(
            "Cannot push message to queue, please try again later", 
            HttpStatus.FAILED_DEPENDENCY
        );
    }   
  }
}
