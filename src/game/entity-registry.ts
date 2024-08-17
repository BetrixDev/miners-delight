type RarityData = {
  color: `#${string}`;
  name: string;
};

export const RARITIES = {
  common: {
    color: "#c2d9ff",
    name: "Common",
  },
} as const satisfies Record<string, RarityData>;

type Rarity = keyof typeof RARITIES;

export type EntityCreationSchema = {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  price: number;
  component: () => JSX.Element;
  imagePath: string;
  boundingBox: [x: number, y: number, z: number];
  canSell: boolean;
};

const registeredEntities: Record<string, EntityCreationSchema> = {};

export async function fetchEntityRegistry() {
  await import("./entities/furnaces/basic-furnace");
  await import("./entities/mines/basic-iron-mine");

  return registeredEntities;
}

export function createEntity(schema: EntityCreationSchema) {
  registeredEntities[schema.id] = schema;
}
