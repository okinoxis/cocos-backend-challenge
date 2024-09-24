import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Order } from "./Order";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  email: string;

  @Column({ type: "varchar", length: 20, name: "accountNumber" })
  accountNumber: string;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
