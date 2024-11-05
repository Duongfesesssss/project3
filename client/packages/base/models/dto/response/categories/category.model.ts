class BaseCategoryModel {
  id?: number;
  mo_ta?: string;

  constructor(id?: number, mo_ta?: string) {
    this.id = id;
    this.mo_ta = mo_ta;
  }
}

export { BaseCategoryModel };
