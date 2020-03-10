import builder from '../builder';

builder.interfaceType('Shape', {
  shape: t => ({
    name: t.exposeString('type', {
      permissionCheck: 'readName',
      nullable: true,
    }),
  }),
});

builder.interfaceType('OvalThing', {
  shape: t => ({
    ovalField: t.boolean({}),
  }),
});

builder.interfaceType('ThingWithCorners', {
  shape: t => ({
    hasCorners: t.boolean({ resolve: () => true }),
  }),
});

builder.objectType('Square', {
  implements: ['Shape'],
  isType: parent => parent.type === 'square',
  defaultPermissionCheck: 'readSquare',
  postResolveCheck: () => {
    return {
      readSquare: true,
      // Interface permissions are separate
      readName: true,
    };
  },
  shape: t => ({
    size: t.float({
      resolve: ({ edgeLength }) => edgeLength ** 2,
    }),
  }),
});

builder.objectType('Triangle', {
  implements: ['Shape'],
  isType: parent => parent.type === 'triangle',
  defaultPermissionCheck: 'readTriangle',
  shape: t => ({
    edges: t.int({
      nullable: true,
      resolve: () => 3,
    }),
  }),
});

builder.objectType('Circle', {
  implements: ['Shape'],
  isType: parent => parent.type === 'circle',
  defaultPermissionCheck: 'readCircle',
  shape: t => ({
    area: t.int({
      resolve: ({ radius }) => Math.PI * radius ** 2,
    }),
  }),
});

builder.objectType('Line', {
  implements: ['PreResolvePass', 'PostResolvePass', 'SkipImplementorPreResolve'],
  isType: parent => parent.type === 'line',
  preResolveCheck: () => ({ ranPreResolve: true }),
  defaultPermissionCheck: 'ranPreResolve',
  shape: t => ({
    length: t.exposeFloat('length', {
      nullable: true,
    }),
  }),
});

builder.objectType('LinePreResolveFail', {
  implements: ['PreResolveFail'],
  isType: parent => parent.type === 'line-pre-resolve-fail',
  preResolveCheck: () => ({ ranPreResolve: true }),
  defaultPermissionCheck: 'ranPreResolve',
  shape: t => ({
    length: t.exposeFloat('length', {
      nullable: true,
    }),
  }),
});

builder.objectType('LinePostResolveFail', {
  implements: ['PostResolveFail'],
  isType: parent => parent.type === 'line-post-resolve-fail',
  preResolveCheck: () => ({ ranPreResolve: true }),
  defaultPermissionCheck: 'ranPreResolve',
  shape: t => ({
    length: t.exposeFloat('length', {
      nullable: true,
    }),
  }),
});

builder.objectType('Oval', {
  implements: ['OvalThing'],
  isType: () => {
    throw new Error('Should not get here');
  },
  preResolveCheck() {
    return false;
  },
  shape: t => ({
    area: t.int({
      resolve: () => {
        throw new Error('Should not get here');
      },
    }),
  }),
});

builder.objectType('Rectangle', {
  implements: ['Shape', 'ThingWithCorners'],
  preResolveCheck: () => {
    return {
      preResolve: true,
    };
  },
  postResolveCheck: (rect, ctx, perms) => {
    if (rect.height < 0) {
      return false;
    }

    if (rect.height === 0) {
      perms.delete('preResolve');
    }

    if (rect.width === rect.height) {
      return {
        postResolve2: true,
      };
    }

    return {
      postResolve: true,
    };
  },
  permissions: {
    readRectangle: rect => rect.width > rect.height,
  },
  isType: parent => parent.type === 'rectangle',
  defaultPermissionCheck: ['readRectangle', 'preResolve', 'postResolve'],
  shape: t => ({
    area: t.int({
      nullable: true,
      resolve: ({ width, height }) => width * height,
    }),
  }),
});

const Polygon = builder.unionType('Polygon', {
  members: ['Square', 'Triangle', 'Rectangle'],
  resolveType: parent => {
    switch (parent.type) {
      case 'square':
        return 'Square';
      case 'triangle':
        return 'Triangle';
      case 'rectangle':
        return 'Rectangle';
      default:
        throw new Error(`Unknown Polygon ${(parent as any).type}`);
    }
  },
});

const RoundThings = builder.unionType('RoundThings', {
  members: ['Oval', 'Circle'],
  resolveType: parent => {
    switch (parent.type) {
      case 'circle':
        return 'Circle';
      case 'oval':
        return 'Oval';
      default:
        throw new Error(`Unknown Polygon ${(parent as any).type}`);
    }
  },
});

const CornerUnion = builder.unionType('CornerUnion', {
  members: ['Rectangle', 'Square'],
  resolveType: parent => {
    switch (parent.type) {
      case 'rectangle':
        return 'Rectangle';
      case 'square':
        return 'Square';
      default:
        throw new Error(`Unknown Polygon ${(parent as any).type}`);
    }
  },
});

builder.interfaceType('PreResolvePass', {
  preResolveCheck: () => true,
  shape: t => ({
    name: t.exposeString('type', {}),
  }),
});
builder.interfaceType('PreResolveFail', {
  preResolveCheck: () => false,
  shape: t => ({
    name: t.exposeString('type', {}),
  }),
});
builder.interfaceType('PostResolvePass', {
  postResolveCheck: () => true,
  shape: t => ({
    name: t.exposeString('type', {}),
  }),
});
builder.interfaceType('PostResolveFail', {
  postResolveCheck: () => false,
  shape: t => ({
    name: t.exposeString('type', {}),
  }),
});

builder.interfaceType('SkipImplementorPreResolve', {
  skipImplementorPreResolveChecks: true,
  shape: t => ({
    name: t.exposeString('type', {}),
  }),
});

const PreResolvePassUnion = builder.unionType('PreResolvePassUnion', {
  resolveType: () => 'Line',
  preResolveCheck: () => true,
  members: ['Line'],
});
const PreResolveFailUnion = builder.unionType('PreResolveFailUnion', {
  resolveType: () => 'Line',
  preResolveCheck: () => false,
  members: ['Line'],
});
const PostResolvePassUnion = builder.unionType('PostResolvePassUnion', {
  resolveType: () => 'Line',
  postResolveCheck: () => true,
  members: ['Line'],
});
const PostResolveFailUnion = builder.unionType('PostResolveFailUnion', {
  resolveType: () => 'Line',
  postResolveCheck: () => false,
  members: ['Line'],
});
const SkipImplementorPreResolveUnion = builder.unionType('SkipImplementorPreResolveUnion', {
  resolveType: () => 'Line',
  skipMemberPreResolveChecks: true,
  members: ['Oval', 'Line'],
});

builder.queryFields(t => ({
  square: t.field({
    type: 'Square',
    nullable: true,
    permissionCheck: () => true,
    resolve: () => {
      return { type: 'square' as const, edgeLength: 4 };
    },
  }),
  squareWithoutCheck: t.field({
    type: 'Square',
    nullable: true,
    resolve: () => {
      return { type: 'square' as const, edgeLength: 4 };
    },
  }),
  rectangle: t.field({
    type: 'Rectangle',
    nullable: true,
    args: {
      width: t.arg.int({ required: true }),
      height: t.arg.int({ required: true }),
    },
    resolve: (root, { width, height }) => ({ type: 'rectangle' as const, width, height }),
  }),
  oval: t.field({
    type: 'Oval',
    nullable: true,
    resolve: () => {
      throw new Error('Should not get here');
    },
  }),
  shapes: t.field({
    type: ['Shape'],
    nullable: { items: true, list: false },
    permissionCheck: () => true,
    grantPermissions: () => ({
      readName: true,
    }),
    resolve: () => {
      return [
        { type: 'circle', radius: 3 },
        { type: 'square', edgeLength: 4 },
        { type: 'triangle', edgeLength: 5 },
      ];
    },
  }),
  polygons: t.field({
    type: [Polygon],
    nullable: { items: true, list: false },
    permissionCheck: () => true,
    grantPermissions: () => ({
      readName: true,
    }),
    resolve: () => {
      return [
        { type: 'square' as const, edgeLength: 4 },
        { type: 'triangle' as const, edgeLength: 5 },
      ];
    },
  }),
  roundThing: t.field({
    type: RoundThings,
    args: { oval: t.arg.bool() },
    nullable: true,
    permissionCheck: () => true,
    resolve: (parent, args) => {
      // pre resolve checks from members run first (oval does not pass)
      throw new Error('Should not get here');
    },
  }),
  ovalThing: t.field({
    type: RoundThings,
    args: { oval: t.arg.bool() },
    nullable: true,
    permissionCheck: () => true,
    resolve: (parent, args) => {
      // pre resolve checks from implementers run first (oval does not pass)
      throw new Error('Should not get here');
    },
  }),
  thingWithCorners: t.field({
    type: 'ThingWithCorners',
    nullable: true,
    permissionCheck: () => true,
    args: {
      width: t.arg.int({ required: true }),
      height: t.arg.int({ required: true }),
    },
    resolve: (root, { width, height }) => {
      return { type: 'rectangle' as const, height, width };
    },
  }),
  cornerUnion: t.field({
    type: CornerUnion,
    nullable: true,
    permissionCheck: () => true,
    args: {
      width: t.arg.int({ required: true }),
      height: t.arg.int({ required: true }),
    },
    resolve: (root, { width, height }) => {
      return { type: 'rectangle' as const, height, width };
    },
  }),
  interfacePreResolvePass: t.field({
    type: 'PreResolvePass',
    nullable: true,
    resolve: () => {
      return { type: 'line', length: 3 };
    },
  }),
  interfacePreResolveFail: t.field({
    type: 'PreResolveFail',
    nullable: true,
    resolve: () => {
      return { type: 'line-pre-resolve-fail', length: 3 };
    },
  }),
  interfacePostResolvePass: t.field({
    type: 'PostResolvePass',
    nullable: true,
    permissionCheck: () => true,
    resolve: () => {
      return { type: 'line', length: 3 };
    },
  }),
  interfacePostResolveFail: t.field({
    type: 'PostResolveFail',
    nullable: true,
    permissionCheck: () => true,
    resolve: () => {
      return { type: 'line-post-resolve-fail', length: 3 };
    },
  }),
  skipImplementorPreResolveChecks: t.field({
    type: 'SkipImplementorPreResolve',
    nullable: true,
    permissionCheck: () => true,
    resolve: () => {
      return { type: 'line', length: 3 };
    },
  }),
  preResolvePassUnion: t.field({
    type: PreResolvePassUnion,
    nullable: true,
    resolve: () => ({ type: 'line' as const, length: 3 }),
  }),
  preResolveFailUnion: t.field({
    type: PreResolveFailUnion,
    nullable: true,
    resolve: () => ({ type: 'line' as const, length: 3 }),
  }),
  postResolvePassUnion: t.field({
    type: PostResolvePassUnion,
    nullable: true,
    permissionCheck: () => true,
    resolve: () => ({ type: 'line' as const, length: 3 }),
  }),
  postResolveFailUnion: t.field({
    type: PostResolveFailUnion,
    nullable: true,
    permissionCheck: () => true,
    resolve: () => ({ type: 'line' as const, length: 3 }),
  }),
  skipMemberPreResolveUnion: t.field({
    type: SkipImplementorPreResolveUnion,
    nullable: true,
    permissionCheck: () => true,
    resolve: () => ({ type: 'line' as const, length: 3 }),
  }),
  line: t.field({
    type: 'Line',
    resolve: () => {
      return { type: 'line' as const, length: 3 };
    },
  }),
}));
