import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Order } from "./Order";
import { MarketData } from "./MarketData";

@Entity("instruments")
export class Instrument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 10 })
  ticker: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 10 })
  type: string;

  @OneToMany(() => Order, (order) => order.instrument)
  orders: Order[];

  @OneToMany(() => MarketData, (marketData) => marketData.instrument)
  marketData: MarketData[];
}
