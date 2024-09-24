import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Instrument } from "./Instrument";
import { User } from "./User";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "instrumentId" })
  instrumentId: number;

  @Column({ name: "userId" })
  userId: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;
  
  @Column()
  size: number;

  @Column({ type: "varchar", length: 10 })
  type: string;

  @Column({ type: "varchar", length: 10 })
  side: string;

  @Column({ type: "varchar", length: 20 })
  status: string;

  @Column({ type: "timestamp" })
  datetime: Date;

  @ManyToOne(() => Instrument, (instrument) => instrument.orders)
  @JoinColumn({ name: "instrumentId" })
  instrument: Instrument;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: "userId" })
  user: User;

  cancel() {
    if (this.status !== "NEW") {
      throw new Error("Only orders with status NEW can be cancelled");
    }
    this.status = "CANCELLED";
  }
}
