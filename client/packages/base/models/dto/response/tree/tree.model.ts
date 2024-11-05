interface TreeModel {
  key: string;
  label?: string;
  icon?: string;
  data?: string;
  children?: Array<TreeModel>;
}

export type { TreeModel };
