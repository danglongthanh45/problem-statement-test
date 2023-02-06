import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImportStatus } from 'src/constant/type';
import { ImportHistory } from 'src/db/history-import.entity';
import { Repository } from 'typeorm';
import { ImportHistoryDto } from './dto/import-history.dto';

@Injectable()
export class ImportHistoryService {
  constructor(
    @InjectRepository(ImportHistory) private readonly importHistoryRepo: Repository<ImportHistory>,
  ) {
  }

  async create(importHistoryDto: ImportHistoryDto): Promise<ImportHistory> {
    const history = new ImportHistory();
    history.filename = importHistoryDto.filename;
    history.status = ImportStatus.PENDING;
    history.userid = importHistoryDto.userid;
    return await this.importHistoryRepo.save(history);
  }

  async update(id: string, status: ImportStatus): Promise<ImportHistory> {
    const historyUpdate = await this.importHistoryRepo.findOneBy({
      id: parseInt(id)
    });
    historyUpdate.status = status;
    return await this.importHistoryRepo.save(historyUpdate);
  }

  async getAllHistoryByUser(userId: number): Promise<ImportHistory[]> {
    return await this.importHistoryRepo
    .createQueryBuilder('query')
    .where('query.userid = :userid', {userid : userId})
    .getMany();
  }
}



