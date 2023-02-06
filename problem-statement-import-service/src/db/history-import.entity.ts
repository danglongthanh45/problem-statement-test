import { ImportStatus } from 'src/constant/type';
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class ImportHistory extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column(
    {
      type: "enum",
      enum: ImportStatus,
      default: ImportStatus.PROCESSING
    }
  )
  status: ImportStatus;

  @Column()
  userid: number;
}