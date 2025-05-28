declare module 'flake-idgen' {
  class FlakeId {
    constructor(options?: {
      datacenter?: number;
      worker?: number;
      id?: number;
      epoch?: number;
    });
    next(): Buffer;
  }
  export = FlakeId;
}
