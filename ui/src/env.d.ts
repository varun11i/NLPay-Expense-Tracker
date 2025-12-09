// Let TS understand Vue single-file components
declare module "*.vue" {
  const component: any;
  export default component;
}

// Let TS know about import.meta.env (for BASE_URL etc.)
interface ImportMeta {
  readonly env: {
    readonly BASE_URL: string;
    // Allow other env vars too if needed
    [key: string]: any;
  };
}
