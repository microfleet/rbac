export interface IRBACStorage {
  read(id: string): Promise<any>;
}
