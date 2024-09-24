import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Instrument } from "./Instrument";

@Entity("marketdata")
export class MarketData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "instrumentId" })
  instrumentId: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  high: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  low: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  open: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  close: number;

  @Column({ type: "decimal", precision: 10, scale: 2, name: "previousClose" })
  previousClose: number;

  @Column({ type: "date" })
  date: Date;

  @ManyToOne(() => Instrument, (instrument) => instrument.marketData)
  @JoinColumn({ name: "instrumentId" })
  instrument: Instrument;
}
