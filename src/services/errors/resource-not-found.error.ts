export class ResourceNotFoundError extends Error {
  constructor(resourceName?: string) {
    super(
      resourceName ? `Resource ${resourceName} not found` : "Resource not found"
    );
    this.name = "ResourceNotFoundError";
  }
}
