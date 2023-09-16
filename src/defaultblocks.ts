export class Block {
    sprite: boolean;
    top: number;
    side: number;
    bottom: number;
    drawtype: number;
    fullbright: boolean;
    minX: number;
    minY: number;
    minZ: number;
    maxX: number;
    maxY: number;
    maxZ: number;
    name: string;

    constructor(
        sprite: boolean,
        top: number,
        side: number,
        bottom: number,
        drawtype: number,
        fullbright: boolean,
        minX: number,
        minY: number,
        minZ: number,
        maxX: number,
        maxY: number,
        maxZ: number,
        name: string
    ) {
        this.sprite = sprite;
        this.top = top;
        this.side = side;
        this.bottom = bottom;
        this.drawtype = drawtype;
        this.fullbright = fullbright;
        this.minX = minX;
        this.minY = minY;
        this.minZ = minZ;
        this.maxX = maxX;
        this.maxY = maxY;
        this.maxZ = maxZ;
        this.name = name;
    }
}

export const defaultBlocks: Record<number, Block> = {
    //           sprite, top, side, btm, draw, bright,   minXYZ,   maxXYZ, name
     0: new Block(false,   0,    0,   0,    4,  false,  0, 0, 0, 16,16,16, 'Air'),
     1: new Block(false,   1,    1,   1,    0,  false,  0, 0, 0, 16,16,16, 'Stone'),
     2: new Block(false,   0,    3,   2,    0,  false,  0, 0, 0, 16,16,16, 'Grass'),
     3: new Block(false,   2,    2,   2,    0,  false,  0, 0, 0, 16,16,16, 'Dirt'),
     4: new Block(false,  16,   16,  16,    0,  false,  0, 0, 0, 16,16,16, 'Cobblestone'),
     5: new Block(false,   4,    4,   4,    0,  false,  0, 0, 0, 16,16,16, 'Wood'),
     6: new Block( true,  15,   15,  15,    1,  false,  0, 0, 0, 16,16,16, 'Sapling'),
     7: new Block(false,  17,   17,  17,    0,  false,  0, 0, 0, 16,16,16, 'Bedrock'),
     8: new Block(false,  14,   14,  14,    3,  false,  0, 0, 0, 16,15,16, 'Water'),
     9: new Block(false,  14,   14,  14,    3,  false,  0, 0, 0, 16,15,16, 'Still Water'),
    10: new Block(false,  30,   30,  30,    0,   true,  0, 0, 0, 16,15,16, 'Lava'),
    11: new Block(false,  30,   30,  30,    0,   true,  0, 0, 0, 16,15,16, 'Still Lava'),
    12: new Block(false,  18,   18,  18,    0,  false,  0, 0, 0, 16,16,16, 'Sand'),
    13: new Block(false,  19,   19,  19,    0,  false,  0, 0, 0, 16,16,16, 'Gravel'),
    14: new Block(false,  32,   32,  32,    0,  false,  0, 0, 0, 16,16,16, 'Gold Ore'),
    15: new Block(false,  33,   33,  33,    0,  false,  0, 0, 0, 16,16,16, 'Iron Ore'),
    16: new Block(false,  34,   34,  34,    0,  false,  0, 0, 0, 16,16,16, 'Coal Ore'),
    17: new Block(false,  21,   20,  21,    0,  false,  0, 0, 0, 16,16,16, 'Log'),
    18: new Block(false,  22,   22,  22,    2,  false,  0, 0, 0, 16,16,16, 'Leaves'),
    19: new Block(false,  48,   48,  48,    0,  false,  0, 0, 0, 16,16,16, 'Sponge'),
    20: new Block(false,  49,   49,  49,    1,  false,  0, 0, 0, 16,16,16, 'Glass'),
    21: new Block(false,  64,   64,  64,    0,  false,  0, 0, 0, 16,16,16, 'Red'),
    22: new Block(false,  65,   65,  65,    0,  false,  0, 0, 0, 16,16,16, 'Orange'),
    23: new Block(false,  66,   66,  66,    0,  false,  0, 0, 0, 16,16,16, 'Yellow'),
    24: new Block(false,  67,   67,  67,    0,  false,  0, 0, 0, 16,16,16, 'Lime'),
    25: new Block(false,  68,   68,  68,    0,  false,  0, 0, 0, 16,16,16, 'Green'),
    26: new Block(false,  69,   69,  69,    0,  false,  0, 0, 0, 16,16,16, 'Teal'),
    27: new Block(false,  70,   70,  70,    0,  false,  0, 0, 0, 16,16,16, 'Aqua'),
    28: new Block(false,  71,   71,  71,    0,  false,  0, 0, 0, 16,16,16, 'Cyan'),
    29: new Block(false,  72,   72,  72,    0,  false,  0, 0, 0, 16,16,16, 'Blue'),
    30: new Block(false,  73,   73,  73,    0,  false,  0, 0, 0, 16,16,16, 'Indigo'),
    31: new Block(false,  74,   74,  74,    0,  false,  0, 0, 0, 16,16,16, 'Violet'),
    32: new Block(false,  75,   75,  75,    0,  false,  0, 0, 0, 16,16,16, 'Magenta'),
    33: new Block(false,  76,   76,  76,    0,  false,  0, 0, 0, 16,16,16, 'Pink'),
    34: new Block(false,  77,   77,  77,    0,  false,  0, 0, 0, 16,16,16, 'Black'),
    35: new Block(false,  78,   78,  78,    0,  false,  0, 0, 0, 16,16,16, 'Gray'),
    36: new Block(false,  79,   79,  79,    0,  false,  0, 0, 0, 16,16,16, 'White'),
    37: new Block( true,  13,   13,  13,    1,  false,  0, 0, 0, 16,16,16, 'Dandelion'),
    38: new Block( true,  12,   12,  12,    1,  false,  0, 0, 0, 16,16,16, 'Rose'),
    39: new Block( true,  29,   29,  29,    1,  false,  0, 0, 0, 16,16,16, 'Brown Mushroom'),
    40: new Block( true,  28,   28,  28,    1,  false,  0, 0, 0, 16,16,16, 'Red Mushroom'),
    41: new Block(false,  24,   40,  56,    0,  false,  0, 0, 0, 16,16,16, 'Gold'),
    42: new Block(false,  23,   39,  55,    0,  false,  0, 0, 0, 16,16,16, 'Iron'),
    43: new Block(false,   6,    5,   6,    0,  false,  0, 0, 0, 16,16,16, 'Double Slab'),
    44: new Block(false,   6,    5,   6,    0,  false,  0, 0, 0, 16, 8,16, 'Slab'),
    45: new Block(false,   7,    7,   7,    0,  false,  0, 0, 0, 16,16,16, 'Brick'),
    46: new Block(false,   9,    8,  10,    0,  false,  0, 0, 0, 16,16,16, 'TNT'),
    47: new Block(false,   4,   35,   4,    0,  false,  0, 0, 0, 16,16,16, 'Bookshelf'),
    48: new Block(false,  36,   36,  36,    0,  false,  0, 0, 0, 16,16,16, 'Mossy Rocks'),
    49: new Block(false,  37,   37,  37,    0,  false,  0, 0, 0, 16,16,16, 'Obsidian'),
    50: new Block(false,  16,   16,  16,    0,  false,  0, 0, 0, 16, 8,16, 'Cobblestone Slab'),
    51: new Block( true,  11,   11,  11,    1,  false,  0, 0, 0, 16,16,16, 'Rope'),
    52: new Block(false,  25,   41,  57,    0,  false,  0, 0, 0, 16,16,16, 'Sandstone'),
    53: new Block(false,  50,   50,  50,    0,  false,  0, 0, 0, 16, 2,16, 'Snow'),
    54: new Block( true,  38,   38,  38,    1,  false,  0, 0, 0, 16,16,16, 'Fire'),
    55: new Block(false,  80,   80,  80,    0,  false,  0, 0, 0, 16,16,16, 'Light Pink'),
    56: new Block(false,  81,   81,  81,    0,  false,  0, 0, 0, 16,16,16, 'Forest Green'),
    57: new Block(false,  82,   82,  82,    0,  false,  0, 0, 0, 16,16,16, 'Brown'),
    58: new Block(false,  83,   83,  83,    0,  false,  0, 0, 0, 16,16,16, 'Deep Blue'),
    59: new Block(false,  84,   84,  84,    0,  false,  0, 0, 0, 16,16,16, 'Turquoise'),
    60: new Block(false,  51,   51,  51,    3,  false,  0, 0, 0, 16,16,16, 'Ice'),
    61: new Block(false,  54,   54,  54,    0,  false,  0, 0, 0, 16,16,16, 'Ceramic Tile'),
    62: new Block(false,  86,   86,  86,    0,   true,  0, 0, 0, 16,16,16, 'Magma'),
    63: new Block(false,  26,   42,  58,    0,  false,  0, 0, 0, 16,16,16, 'Pillar'),
    64: new Block(false,  53,   53,  53,    0,  false,  0, 0, 0, 16,16,16, 'Crate'),
    65: new Block(false,  52,   52,  52,    0,  false,  0, 0, 0, 16,16,16, 'Stone Brick')
}